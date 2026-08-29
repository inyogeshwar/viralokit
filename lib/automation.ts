import { and, eq, desc } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { decryptToken } from "@/lib/crypto";
import { InstagramProvider } from "@/lib/providers/instagram";
import {
  acquireRateLimit,
  acquirePerPostPrivateReply,
} from "@/lib/rate-limiter";
import { canReplyInWindow } from "@/lib/messaging-window";
import { withBotDisclosure } from "@/lib/bot-disclosure";
import { handleFollowGate } from "@/lib/follow-gate";

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  triggerValue: string | null;
  matchType: string;
  channel: string;
  responseType: string;
  responseText: string;
  responsePayload: unknown;
  delayMs: number;
  priority: number;
  triggerCount: number;
}

/**
 * Default copy for Comment-to-DM (Private Reply) flows. Per the DM automation
 * plan, we can't check follower status from a comment, so the first message
 * is a teaser that asks the user to reply to confirm before we deliver the
 * asset in a follow-up DM.
 *
 * This is exported so the UI can pre-fill the response text field when a
 * user creates a "Private Reply to Commenter" rule.
 */
export const DEFAULT_PRIVATE_REPLY_TEMPLATE =
  "Hey! I have the resource ready. Reply 'SEND' to this message to get it.";

export function matchTextAgainstRules(
  text: string,
  rules: AutomationRule[],
): AutomationRule[] {
  const lower = text.toLowerCase().trim();
  const matches: AutomationRule[] = [];

  for (const rule of rules) {
    if (rule.trigger === "all_dms" || rule.trigger === "all_comments") {
      matches.push(rule);
      continue;
    }

    if (rule.trigger === "keyword" && rule.triggerValue) {
      const keywords = rule.triggerValue.split(",").map((k) => k.trim().toLowerCase());
      let matched = false;

      for (const kw of keywords) {
        if (!kw) continue;
        switch (rule.matchType) {
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
          default: // contains
            matched = lower.includes(kw);
        }
        if (matched) break;
      }

      if (matched) matches.push(rule);
    }
  }

  return matches.sort((a, b) => b.priority - a.priority);
}

export async function processDmAautomation(
  accountId: string,
  senderIgsid: string,
  messageText: string,
  _messageId: string,
) {
  const db = getDb();
  if (!db) return;

  const account = await db.query.socialAccounts.findFirst({
    where: eq(schema.socialAccounts.id, accountId),
  });
  if (!account) return;

  // Rate limit check
  const canProceed = await acquireRateLimit(accountId, "text");
  if (!canProceed) return;

  // Check messaging window
  const windowStatus = await canReplyInWindow(accountId, senderIgsid);
  if (!windowStatus.canReply) return;

  // --- Follow-gate: check the state machine BEFORE the regular rule
  // matcher. If the user is in a follow-gate conversation (e.g. they said
  // "DONE" or they triggered a resource keyword), the state machine
  // handles the reply and we skip the keyword rules. This ordering
  // matters: keyword rules can match "DONE" or "send" by accident.
  try {
    const gateResult = await handleFollowGate(
      accountId,
      senderIgsid,
      messageText,
      _messageId,
    );
    if (gateResult.handled) {
      return; // follow-gate replied (or queued) — don't double-reply
    }
  } catch (err) {
    // Never let a follow-gate error break the regular flow.
    console.error("[automation] follow-gate error", err);
  }

  const rules = await db.query.autoReplyRules.findMany({
    where: and(
      eq(schema.autoReplyRules.accountId, accountId),
      eq(schema.autoReplyRules.isActive, true),
    ),
    orderBy: [desc(schema.autoReplyRules.priority)],
  });

  const dmRules = rules.filter((r) => r.channel === "dm");
  const matched = matchTextAgainstRules(messageText, dmRules);
  if (!matched.length) return;

  const bestMatch = matched[0];
  const token = decryptToken(account.accessToken);
  const provider = new InstagramProvider({ igUserId: account.igUserId, accessToken: token });

  if (bestMatch.delayMs > 0) {
    await provider.sendSenderAction(senderIgsid, "typing_on");
    await new Promise((r) => setTimeout(r, bestMatch.delayMs));
  }

  const disclosureEnabled = true;

  try {
    if (bestMatch.responseType === "quick_reply" && bestMatch.responsePayload) {
      const payload = bestMatch.responsePayload as {
        text?: string;
        replies?: Array<{ title: string; payload: string; imageUrl?: string }>;
      };
      const responseText = withBotDisclosure(
        payload.text ?? bestMatch.responseText,
        disclosureEnabled,
      );
      await provider.sendQuickReplies(
        senderIgsid,
        responseText,
        payload.replies ?? [],
      );
    } else if (bestMatch.responseType === "button_template" && bestMatch.responsePayload) {
      const payload = bestMatch.responsePayload as {
        text?: string;
        buttons?: Array<{ type: string; url?: string; title: string; payload?: string }>;
      };
      const responseText = withBotDisclosure(
        payload.text ?? bestMatch.responseText,
        disclosureEnabled,
      );
      await provider.sendButtonTemplate(
        senderIgsid,
        responseText,
        (payload.buttons ?? []) as Parameters<InstagramProvider["sendButtonTemplate"]>[2],
      );
    } else {
      const responseText = withBotDisclosure(bestMatch.responseText, disclosureEnabled);
      // Use human agent tag if outside 24h window but within 7 days
      if (windowStatus.needsHumanAgent) {
        await provider.sendTextMessageHumanAgent(senderIgsid, responseText);
      } else {
        await provider.sendTextMessage(senderIgsid, responseText, {
          messagingType: "RESPONSE",
        });
      }
    }

    await db
      .update(schema.autoReplyRules)
      .set({
        lastTriggeredAt: new Date(),
        triggerCount: (bestMatch as unknown as { triggerCount: number }).triggerCount + 1,
      })
      .where(eq(schema.autoReplyRules.id, bestMatch.id));
  } catch {
    // Silently fail — don't crash webhook
  }
}

export async function processCommentAutomation(
  accountId: string,
  commentId: string,
  commentText: string,
  mediaId: string,
) {
  const db = getDb();
  if (!db) return;

  const account = await db.query.socialAccounts.findFirst({
    where: eq(schema.socialAccounts.id, accountId),
  });
  if (!account) return;

  // --- Idempotency guard ---------------------------------------------------
  // Meta may deliver the same comment webhook more than once (retries). The
  // `comments.replied` flag is the source of truth — if we've already replied
  // to this comment in a prior delivery, skip.
  const existing = await db.query.comments.findFirst({
    where: and(
      eq(schema.comments.accountId, accountId),
      eq(schema.comments.igCommentId, commentId),
    ),
  });
  if (existing?.replied) return;

  const rules = await db.query.autoReplyRules.findMany({
    where: and(
      eq(schema.autoReplyRules.accountId, accountId),
      eq(schema.autoReplyRules.isActive, true),
    ),
    orderBy: [desc(schema.autoReplyRules.priority)],
  });

  const commentRules = rules.filter((r) => r.channel === "comment" || r.channel === "private_reply");
  const matched = matchTextAgainstRules(commentText, commentRules);
  if (!matched.length) return;

  const bestMatch = matched[0];
  const token = decryptToken(account.accessToken);
  const provider = new InstagramProvider({ igUserId: account.igUserId, accessToken: token });

  const disclosureEnabled = true;

  try {
    const responseText = withBotDisclosure(bestMatch.responseText, disclosureEnabled);
    if (bestMatch.channel === "private_reply") {
      // --- Per-account hourly cap (Meta's documented limit is 250/hour;
      // we stay well below at 750 tokens/hour as a generous burst budget,
      // and use a stricter per-post cap below to absorb viral storms).
      const canProceed = await acquireRateLimit(accountId, "private_reply");
      if (!canProceed) return;

      // --- Per-post (anti-viral) cap. A single post going viral can
      // generate thousands of comments in minutes — Meta flags accounts
      // that burst-send private replies. We cap each post at 25/min and
      // 100/hour. Bypasses are safe (we just don't reply) and visible
      // (the comment is logged but not marked replied).
      if (!acquirePerPostPrivateReply(accountId, mediaId)) return;

      await provider.sendPrivateReply(commentId, responseText);
    } else {
      await provider.replyToComment(commentId, responseText);
    }

    // Mark the comment as replied so duplicate webhook deliveries are no-ops.
    if (existing) {
      await db
        .update(schema.comments)
        .set({ replied: true })
        .where(eq(schema.comments.id, existing.id));
    } else {
      // Comment row wasn't pre-inserted by the webhook handler (shouldn't
      // happen in practice but the guard is cheap).
      await db
        .update(schema.comments)
        .set({ replied: true })
        .where(
          and(
            eq(schema.comments.accountId, accountId),
            eq(schema.comments.igCommentId, commentId),
          ),
        );
    }

    await db
      .update(schema.autoReplyRules)
      .set({
        lastTriggeredAt: new Date(),
        triggerCount: (bestMatch as unknown as { triggerCount: number }).triggerCount + 1,
      })
      .where(eq(schema.autoReplyRules.id, bestMatch.id));
  } catch (err) {
    // Silently fail — don't crash the webhook. Operators see this in
    // server logs and via Sentry. The comment stays `replied = false`
    // so a future delivery can retry the same rule.
    console.error("[automation] comment reply failed", err);
  }
}
