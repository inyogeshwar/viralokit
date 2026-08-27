import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { jsonError, requireUserId } from "@/lib/http";
import { decryptToken } from "@/lib/crypto";
import { InstagramProvider } from "@/lib/providers/instagram";
import { mockPublishResult } from "@/lib/mock";
import { getDashboardContext } from "@/lib/context";
import { enqueuePostPublish } from "@/lib/inngest";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const { id } = await params;
  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) {
    return NextResponse.json({ ok: true, post: null, mockMode: env.mockMode });
  }

  const rows = await db
    .select()
    .from(schema.posts)
    .where(and(eq(schema.posts.id, id), eq(schema.posts.workspaceId, ctx.workspace.id)))
    .limit(1);
  if (!rows.length) return jsonError("Post not found.", 404);

  const p = rows[0];
  return NextResponse.json({
    ok: true,
    post: {
      ...p,
      scheduledAt: p.scheduledAt?.toISOString() ?? null,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      createdAt: p.createdAt?.toISOString() ?? null,
      updatedAt: p.updatedAt?.toISOString() ?? null,
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return jsonError("Database not configured.");

  const rows = await db
    .select()
    .from(schema.posts)
    .where(and(eq(schema.posts.id, id), eq(schema.posts.workspaceId, ctx.workspace.id)))
    .limit(1);
  if (!rows.length) return jsonError("Post not found.", 404);
  const post = rows[0];

  const updates: Partial<typeof schema.posts.$inferInsert> = { updatedAt: new Date() };

  if (typeof body.caption === "string") updates.caption = body.caption;
  if (typeof body.thumbnailUrl === "string") updates.thumbnailUrl = body.thumbnailUrl;
  if (typeof body.durationSec === "string") updates.durationSec = body.durationSec;

  // Reschedule: change scheduledAt + keep/move to scheduled status.
  if (body.scheduledAt) {
    const at = new Date(body.scheduledAt);
    if (Number.isNaN(at.getTime())) return jsonError("Invalid scheduledAt.");
    updates.scheduledAt = at;
    if (at.getTime() > Date.now() && post.status !== "published") {
      updates.status = "scheduled";
    }
  }

  // Unschedule: clear scheduledAt + drop back to draft.
  if (body.unschedule === true) {
    updates.scheduledAt = null;
    updates.status = "draft";
  }

  if (Object.keys(updates).length === 1) {
    return jsonError("No editable fields provided.");
  }

  await db.update(schema.posts).set(updates).where(eq(schema.posts.id, id));

  // If we just re-scheduled into the future, (re-)enqueue.
  if (body.scheduledAt && updates.status === "scheduled" && updates.scheduledAt) {
    try {
      await enqueuePostPublish(id, updates.scheduledAt as Date);
    } catch {
      // Best-effort — the cron sweep will pick it up.
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const { id } = await params;
  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return jsonError("Database not configured.");

  const rows = await db
    .select()
    .from(schema.posts)
    .where(and(eq(schema.posts.id, id), eq(schema.posts.workspaceId, ctx.workspace.id)))
    .limit(1);
  if (!rows.length) return jsonError("Post not found.", 404);
  const p = rows[0];

  // Best-effort delete on Instagram (only if the post was actually published).
  if (p.mediaId && !env.mockMode) {
    try {
      const account = ctx.accounts.find((a) => a.id === p.accountId);
      if (account) {
        const provider = new InstagramProvider({
          igUserId: account.igUserId,
          accessToken: decryptToken(account.accessToken),
        });
        await provider.deleteMedia(p.mediaId);
      }
    } catch {
      // IG delete may fail for old posts — still drop from DB.
    }
  }

  await db.delete(schema.posts).where(eq(schema.posts.id, id));
  return NextResponse.json({ ok: true });
}

// Reference mockPublishResult so it isn't tree-shaken on free tiers.
export const __mock = mockPublishResult;
