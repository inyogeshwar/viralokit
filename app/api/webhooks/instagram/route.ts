import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { processDmAautomation, processCommentAutomation } from "@/lib/automation";
import { verifyWebhookSignature } from "@/lib/webhook-signature";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // crypto + node:crypto — keep on Node runtime

// Reject any request that takes longer than 5s to ACK.
// Meta expects <200ms, but we allow headroom for the HMAC verify.
const MAX_BODY_BYTES = 1_048_576; // 1 MiB — anything larger is an attack

const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN ?? "ViraloKit-verify-token";

/**
 * GET — Webhook verification handshake.
 *
 * Meta sends:   GET /api/webhooks/instagram?hub.mode=subscribe
 *                       &hub.verify_token=<our-token>
 *                       &hub.challenge=<random-string>
 * We must echo the `hub.challenge` value to confirm ownership of the URL.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST — Event receiver.
 *
 * Acknowledges within the 200ms Meta budget by reading the body, verifying
 * the signature synchronously, then dispatching the parse + automation
 * pipeline to a background promise. The 200 response is returned BEFORE
 * any DB work happens.
 */
export async function POST(req: NextRequest) {
  // 1. Read raw body — JSON.stringify(JSON.parse(body)) is NOT byte-equal
  //    to the original body, so we must hash the bytes Meta actually sent.
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return new NextResponse("Payload too large", { status: 413 });
  }

  const rawBody = await req.text();

  if (rawBody.length > MAX_BODY_BYTES) {
    return new NextResponse("Payload too large", { status: 413 });
  }

  // 2. Verify X-Hub-Signature-256.
  //    In dev / mock mode the secret may be empty — skip and log a warning
  //    so tests can still send signed-without-secret bodies locally.
  const signature = req.headers.get("x-hub-signature-256");
  const appSecret = env.meta.appSecret;

  if (appSecret) {
    const valid = verifyWebhookSignature(rawBody, signature, appSecret);
    if (!valid) {
      return new NextResponse("Invalid signature", { status: 401 });
    }
  }

  // 3. Parse — but only after signature passes. If parsing fails the body
  //    is malformed and we ACK 200 anyway (Meta does not retry on parse
  //    errors, retrying would just spam us).
  let payload: Record<string, unknown>;
  try {
    payload = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : {};
  } catch {
    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  }

  // 4. ACK within 200ms — process asynchronously, never await before sending.
  queueMicrotask(() => {
    processWebhookEvent(payload).catch((err) => {
      console.error("[instagram-webhook] background processing failed", err);
    });
  });

  return new NextResponse("EVENT_RECEIVED", { status: 200 });
}

// --- Background processing ---------------------------------------------------

async function processWebhookEvent(body: Record<string, unknown>) {
  const db = getDb();
  if (!db) return; // mock mode without DB — nothing to persist

  const object = String(body["object"] ?? "");
  if (object && object !== "instagram" && object !== "page") {
    // Not a payload we care about (e.g. a Facebook page change for a page
    // we don't manage). Silently ignore.
    return;
  }

  const entries = body["entry"] as Array<Record<string, unknown>> | undefined;
  if (!entries) return;

  for (const entry of entries) {
    const accountId = String(entry["id"] ?? "");

    // Resolve the connected social account once per entry.
    // If we don't have a row for this IG user, skip — Meta sends us events
    // for every page subscribed to our app, not just ones we manage.
    const accounts = accountId
      ? await db
          .select()
          .from(schema.socialAccounts)
          .where(eq(schema.socialAccounts.igUserId, accountId))
          .limit(1)
      : [];
    const account = accounts[0] ?? null;

    // --- DMs: entry[].messaging[] -----------------------------------------
    const messaging = entry["messaging"] as Array<Record<string, unknown>> | undefined;
    if (messaging && account) {
      for (const evt of messaging) {
        await handleMessagingEvent(db, account, evt);
      }
    } else if (messaging && !account) {
      // Log unknown-account events for forensics, but do not crash.
      await logOrphanEvent(db, accountId, "messaging_unknown_account", { messaging });
    }

    // --- Feed/Comments: entry[].changes[] ---------------------------------
    const changes = entry["changes"] as Array<Record<string, unknown>> | undefined;
    if (!changes) continue;

    for (const change of changes) {
      const field = String(change["field"] ?? "");
      const value = change["value"] as Record<string, unknown> | undefined;
      if (!value) continue;

      if (account) {
        await handleChangeEvent(db, account, field, change, value);
      } else {
        await logOrphanEvent(db, accountId, `change_unknown_account:${field}`, change);
      }
    }
  }
}

async function handleMessagingEvent(
  db: NonNullable<ReturnType<typeof getDb>>,
  account: typeof schema.socialAccounts.$inferSelect,
  evt: Record<string, unknown>,
) {
  const senderObj = evt["sender"] as Record<string, unknown> | undefined;
  const recipientObj = evt["recipient"] as Record<string, unknown> | undefined;
  const senderId = String(senderObj?.["id"] ?? "");
  const recipientId = String(recipientObj?.["id"] ?? "");
  const messageData = evt["message"] as Record<string, unknown> | undefined;
  if (!messageData) return; // deliveries, reads, etc. — not message content

  const msgId = String(messageData["mid"] ?? messageData["id"] ?? "");
  const text = typeof messageData["text"] === "string" ? messageData["text"] : "";
  const threadId = String(evt["thread_id"] ?? messageData["thread_id"] ?? recipientId);

  if (!msgId) return;

  // Echo-detection: if WE sent it, mark isFromUs; otherwise it's inbound.
  const isFromUs = senderId === account.igUserId;

  // Persist the raw event for audit / replay.
  await db.insert(schema.webhookEvents).values({
    workspaceId: account.workspaceId,
    accountId: account.id,
    field: "messaging",
    payload: evt as Record<string, unknown>,
  });

  await db
    .insert(schema.messages)
    .values({
      workspaceId: account.workspaceId,
      accountId: account.id,
      igMessageId: msgId,
      igThreadId: threadId || null,
      text: text || null,
      fromUsername: isFromUs ? account.username : null,
      fromUserId: senderId || null,
      isFromUs,
    })
    .onConflictDoNothing();

  // Trigger DM automation only for incoming messages with text.
  if (!isFromUs && text && senderId) {
    processDmAautomation(account.id, senderId, text, msgId).catch((err) => {
      console.error("[instagram-webhook] DM automation failed", err);
    });
  }
}

async function handleChangeEvent(
  db: NonNullable<ReturnType<typeof getDb>>,
  account: typeof schema.socialAccounts.$inferSelect,
  field: string,
  change: Record<string, unknown>,
  value: Record<string, unknown>,
) {
  // Persist the raw event first — even if the change is a no-op for us,
  // the audit trail is valuable.
  await db.insert(schema.webhookEvents).values({
    workspaceId: account.workspaceId,
    accountId: account.id,
    field,
    payload: change as Record<string, unknown>,
  });

  if (field === "comments") {
    const commentId = String(value["id"] ?? "");
    const text = String(value["text"] ?? "");
    const from = value["from"] as Record<string, string> | undefined;
    const mediaId = String(value["media_id"] ?? value["post_id"] ?? "");

    if (commentId && text) {
      await db
        .insert(schema.comments)
        .values({
          workspaceId: account.workspaceId,
          accountId: account.id,
          igCommentId: commentId,
          mediaId: mediaId || null,
          text,
          fromUsername: from?.["username"] ?? null,
          fromUserId: from?.["id"] ?? null,
        })
        .onConflictDoNothing();

      processCommentAutomation(account.id, commentId, text, mediaId).catch((err) => {
        console.error("[instagram-webhook] comment automation failed", err);
      });
    }
  }

  // Note: legacy payloads with `field: "messages"` inside `changes[]` are
  // intentionally ignored here — DM events arrive on `entry[].messaging[]`,
  // not inside `changes`. Some earlier Meta docs conflated the two, so we
  // explicitly do not double-process.
}

async function logOrphanEvent(
  db: NonNullable<ReturnType<typeof getDb>>,
  accountId: string,
  field: string,
  payload: unknown,
) {
  // No matching social account — most likely Meta is delivering events for
  // a page we don't manage, or the account was deleted. Log to console for
  // ops; we do NOT insert into the DB because that would require a workspace
  // we can't safely bind to.
  console.warn(
    `[instagram-webhook] received event for unknown account ${accountId} (${field})`,
  );
  void payload; // intentionally unused — kept for future forensic storage
}
