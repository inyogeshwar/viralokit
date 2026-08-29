/**
 * Follow-Gate state machine.
 *
 * Implements the conversation flow described in Phase 3 of the DM automation
 * plan: a user DMs a trigger keyword → we check follower status → either
 * deliver the resource (button template) or ask them to follow first.
 *
 * State machine:
 *
 *   [no state]
 *      │ user DMs trigger keyword
 *      ▼
 *   awaiting_follow  ◀────────────────┐
 *      │ user replies "DONE"           │
 *      ├────── follower? ───┐          │
 *      │  yes                │  no     │
 *      ▼                    │         │
 *   delivered               └──── ask them to follow (stay in awaiting_follow)
 *      │ user DMs trigger again (after 24h)
 *      ▼
 *   awaiting_follow  (re-armed)
 *
 * A user who has already received the resource is treated as `delivered`
 * and won't be re-prompted for the same resource within 24h.
 */

import { and, eq, gt, or, sql } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { InstagramProvider } from "@/lib/providers/instagram";
import { decryptToken } from "@/lib/crypto";
import { checkFollowerStatus } from "@/lib/follower-check";

const DEFAULT_STATE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const DEFAULT_DONE_KEYWORDS = ["done", "followed", "i followed", "i did it", "ok"];
const CONFIRM_FOLLOW = /^(done|followed|i\s*followed|already\s*follow|subscribed)/i;

export interface DmResource {
  id: string;
  name: string;
  triggerKeywords: string;
  matchType: string;
  resourceUrl: string;
  buttonLabel: string;
  teaserText: string;
  followPrompt: string;
  deliverText: string;
  isActive: boolean;
}

export interface FollowGateResult {
  /** True if the user took an action that consumed a state transition. */
  handled: boolean;
  /** True if we sent the user a message (so the caller shouldn't also reply). */
  sentMessage: boolean;
  /** Diagnostic for logs / metrics. */
  action:
    | "delivered"
    | "teaser_sent"
    | "follow_prompt_sent"
    | "no_match"
    | "not_active"
    | "api_error"
    | "no_db"
    | "no_account";
  /** Optional error message. */
  error?: string;
}

interface FollowGateDeps {
  /** Override DB handle for tests. */
  db?: ReturnType<typeof getDb> | null;
  /** Override the Instagram provider constructor (e.g. for mocking). */
  providerFor?: (account: { igUserId: string; accessToken: string }) => InstagramProvider;
  /** Override the follower check function (for tests / preview mode). */
  followerCheck?: typeof checkFollowerStatus;
  /** State TTL in ms. Defaults to 24h. */
  stateTtlMs?: number;
  /** Bot disclosure enabled. */
  withDisclosure?: boolean;
  /** Custom DONE keywords (lowercased). */
  doneKeywords?: string[];
}

// --- Keyword matching (DB-resource trigger) ---------------------------------

function keywordsMatch(
  text: string,
  triggerValue: string,
  matchType: string,
): boolean {
  const lower = text.toLowerCase().trim();
  const keywords = triggerValue
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
  if (keywords.length === 0) return false;

  for (const kw of keywords) {
    let matched = false;
    switch (matchType) {
      case "exact":
        matched = lower === kw;
        break;
      case "starts_with":
        matched = lower.startsWith(kw);
        break;
      case "regex":
        try {
          matched = new RegExp(kw, "i").test(text);
        } catch {
          matched = lower.includes(kw);
        }
        break;
      default:
        matched = lower.includes(kw);
    }
    if (matched) return true;
  }
  return false;
}

// --- State helpers ----------------------------------------------------------

async function loadActiveState(
  db: NonNullable<ReturnType<typeof getDb>>,
  accountId: string,
  senderIgsid: string,
) {
  return db.query.dmConversationStates.findFirst({
    where: and(
      eq(schema.dmConversationStates.accountId, accountId),
      eq(schema.dmConversationStates.senderIgsid, senderIgsid),
      or(
        gt(schema.dmConversationStates.expiresAt, new Date()),
        eq(schema.dmConversationStates.state, "delivered"),
      )!,
    ),
  });
}

async function upsertState(
  db: NonNullable<ReturnType<typeof getDb>>,
  params: {
    workspaceId: string;
    accountId: string;
    senderIgsid: string;
    state: "awaiting_follow" | "delivered" | "expired";
    pendingResourceId?: string | null;
    pendingCommentId?: string | null;
    ttlMs: number;
  },
) {
  const expiresAt = new Date(Date.now() + params.ttlMs);
  // Try to find an existing row first to preserve id; otherwise insert.
  const existing = await db.query.dmConversationStates.findFirst({
    where: and(
      eq(schema.dmConversationStates.accountId, params.accountId),
      eq(schema.dmConversationStates.senderIgsid, params.senderIgsid),
    ),
  });
  if (existing) {
    await db
      .update(schema.dmConversationStates)
      .set({
        state: params.state,
        pendingResourceId: params.pendingResourceId ?? null,
        pendingCommentId: params.pendingCommentId ?? null,
        lastMessageAt: new Date(),
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(schema.dmConversationStates.id, existing.id));
    return existing.id;
  }
  const inserted = await db
    .insert(schema.dmConversationStates)
    .values({
      workspaceId: params.workspaceId,
      accountId: params.accountId,
      senderIgsid: params.senderIgsid,
      state: params.state,
      pendingResourceId: params.pendingResourceId ?? null,
      pendingCommentId: params.pendingCommentId ?? null,
      expiresAt,
    })
    .returning();
  return inserted[0]?.id ?? null;
}

// --- Main entry point -------------------------------------------------------

/**
 * Handles one inbound DM and routes it through the follow-gate state
 * machine. Returns a result describing what happened; never throws.
 *
 * @param accountId   The internal `socialAccounts.id` (UUID).
 * @param senderIgsid The Instagram Scoped User ID of the message sender.
 * @param messageText The user-visible message text (already de-echoed).
 * @param messageId   The IG message id, for the message log row.
 */
export async function handleFollowGate(
  accountId: string,
  senderIgsid: string,
  messageText: string,
  _messageId: string,
  deps: FollowGateDeps = {},
): Promise<FollowGateResult> {
  const db = deps.db !== undefined ? deps.db : getDb();
  if (!db) return { handled: false, sentMessage: false, action: "no_db" };

  const account = await db.query.socialAccounts.findFirst({
    where: eq(schema.socialAccounts.id, accountId),
  });
  if (!account) return { handled: false, sentMessage: false, action: "no_account" };

  const providerFactory =
    deps.providerFor ??
    ((a: { igUserId: string; accessToken: string }) =>
      new InstagramProvider({
        igUserId: a.igUserId,
        accessToken: decryptToken(a.accessToken),
      }));
  const provider = providerFactory(account);

  const followerCheck = deps.followerCheck ?? checkFollowerStatus;
  const stateTtl = deps.stateTtlMs ?? DEFAULT_STATE_TTL_MS;
  const doneKeywords = (deps.doneKeywords ?? DEFAULT_DONE_KEYWORDS).map((k) =>
    k.toLowerCase(),
  );

  // --- 1. Find all active DM resources for this account --------------------
  const resources = (await db.query.dmResources.findMany({
    where: and(
      eq(schema.dmResources.accountId, accountId),
      eq(schema.dmResources.isActive, true),
    ),
  })) as unknown as DmResource[];

  // --- 2. Find existing conversation state --------------------------------
  const state = await loadActiveState(db, accountId, senderIgsid);

  // --- 3. Branch: does the user say "DONE"? --------------------------------
  if (state && CONFIRM_FOLLOW.test(messageText.trim())) {
    const isDone = doneKeywords.some(
      (kw) => messageText.trim().toLowerCase() === kw,
    );
    if (isDone || CONFIRM_FOLLOW.test(messageText)) {
      // Re-check follower status.
      const result = await followerCheck(
        account.igUserId,
        senderIgsid,
        {
          apiCheck: () => provider.isUserFollowBusiness(senderIgsid),
          db,
        },
      );

      if (result.isFollower) {
        // Deliver the resource.
        const resourceId = state.pendingResourceId;
        const resource = resourceId
          ? resources.find((r) => r.id === resourceId)
          : resources[0];
        if (resource) {
          await provider.sendButtonTemplate(senderIgsid, resource.deliverText, [
            {
              type: "web_url",
              url: resource.resourceUrl,
              title: resource.buttonLabel,
            },
          ]);
          await upsertState(db, {
            workspaceId: account.workspaceId,
            accountId,
            senderIgsid,
            state: "delivered",
            pendingResourceId: resource.id,
            ttlMs: stateTtl,
          });
          // Bump delivery counter on the resource.
          const currentDeliveryCount =
            (resource as unknown as { deliveryCount?: number }).deliveryCount ?? 0;
          await db
            .update(schema.dmResources)
            .set({
              deliveryCount: currentDeliveryCount + 1,
              updatedAt: new Date(),
            })
            .where(eq(schema.dmResources.id, resource.id));
          return { handled: true, sentMessage: true, action: "delivered" };
        }
      } else {
        // Still not following — re-send the follow prompt.
        const resourceId = state.pendingResourceId;
        const resource = resourceId
          ? resources.find((r) => r.id === resourceId)
          : resources[0];
        if (resource) {
          await provider.sendTextMessage(senderIgsid, resource.followPrompt, {
            messagingType: "RESPONSE",
          });
          await upsertState(db, {
            workspaceId: account.workspaceId,
            accountId,
            senderIgsid,
            state: "awaiting_follow",
            pendingResourceId: resource.id,
            pendingCommentId: state.pendingCommentId ?? null,
            ttlMs: stateTtl,
          });
          return { handled: true, sentMessage: true, action: "follow_prompt_sent" };
        }
      }
    }
  }

  // --- 4. Otherwise: does the message match a resource trigger keyword? ---
  for (const resource of resources) {
    if (!keywordsMatch(messageText, resource.triggerKeywords, resource.matchType)) {
      continue;
    }

    // Check follower status.
    const result = await followerCheck(
      account.igUserId,
      senderIgsid,
      {
        apiCheck: () => provider.isUserFollowBusiness(senderIgsid),
        db,
      },
    );

    if (result.source === "api_error" && !result.isFollower) {
      return {
        handled: false,
        sentMessage: false,
        action: "api_error",
        error: result.error,
      };
    }

    if (result.isFollower) {
      // Already a follower — deliver immediately.
      await provider.sendButtonTemplate(senderIgsid, resource.deliverText, [
        {
          type: "web_url",
          url: resource.resourceUrl,
          title: resource.buttonLabel,
        },
      ]);
      await upsertState(db, {
        workspaceId: account.workspaceId,
        accountId,
        senderIgsid,
        state: "delivered",
        pendingResourceId: resource.id,
        ttlMs: stateTtl,
      });
      await db
        .update(schema.dmResources)
        .set({
          deliveryCount: sql`${schema.dmResources.deliveryCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(schema.dmResources.id, resource.id));
      return { handled: true, sentMessage: true, action: "delivered" };
    }

    // Not a follower — send the teaser and create state.
    await provider.sendTextMessage(senderIgsid, resource.teaserText, {
      messagingType: "RESPONSE",
    });
    await upsertState(db, {
      workspaceId: account.workspaceId,
      accountId,
      senderIgsid,
      state: "awaiting_follow",
      pendingResourceId: resource.id,
      ttlMs: stateTtl,
    });
    return { handled: true, sentMessage: true, action: "teaser_sent" };
  }

  return { handled: false, sentMessage: false, action: "no_match" };
}

// --- Public state predicates for the UI / metrics ---------------------------

export function isDoneKeyword(text: string, extras: string[] = []): boolean {
  const all = [...DEFAULT_DONE_KEYWORDS, ...extras];
  const lower = text.toLowerCase().trim();
  return all.some((k) => lower === k.toLowerCase()) || CONFIRM_FOLLOW.test(lower);
}
