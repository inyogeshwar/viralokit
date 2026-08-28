import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { jsonError, requireUserId } from "@/lib/http";
import { getDashboardContext } from "@/lib/context";
import { enqueuePostPublish } from "@/lib/inngest";

export const dynamic = "force-dynamic";

/**
 * GET /api/posts/:id — returns a single post owned by the caller's workspace.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const { id } = await params;
  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return jsonError("Database not configured.", 503);

  const rows = await db
    .select()
    .from(schema.posts)
    .where(and(eq(schema.posts.id, id), eq(schema.posts.workspaceId, ctx.workspace.id)))
    .limit(1);

  if (!rows.length) return jsonError("Post not found.", 404);
  return NextResponse.json({ ok: true, post: rows[0] });
}

/**
 * PATCH /api/posts/:id — update caption and/or schedule.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const { id } = await params;
  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return jsonError("Database not configured.", 503);

  let body: { caption?: string; scheduledAt?: string | null };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.");
  }

  const updates: Partial<typeof schema.posts.$inferInsert> = { updatedAt: new Date() };
  if (typeof body.caption === "string") updates.caption = body.caption;

  if (body.scheduledAt !== undefined) {
    if (body.scheduledAt === null || body.scheduledAt === "") {
      updates.scheduledAt = null;
      updates.status = "draft";
    } else {
      const at = new Date(body.scheduledAt);
      if (Number.isNaN(at.getTime())) return jsonError("Invalid scheduledAt.");
      updates.scheduledAt = at;
      updates.status = at.getTime() > Date.now() ? "scheduled" : "draft";
    }
  }

  const result = await db
    .update(schema.posts)
    .set(updates)
    .where(and(eq(schema.posts.id, id), eq(schema.posts.workspaceId, ctx.workspace.id)))
    .returning();

  if (!result.length) return jsonError("Post not found.", 404);

  // If the post is now scheduled in the future, enqueue it.
  const updated = result[0];
  if (
    updated.scheduledAt &&
    updated.scheduledAt.getTime() > Date.now() &&
    updated.status === "scheduled"
  ) {
    try {
      await enqueuePostPublish(id, updated.scheduledAt);
    } catch {
      // The cron sweep is the safety net.
    }
  }

  return NextResponse.json({ ok: true, post: updated });
}

/**
 * DELETE /api/posts/:id — best-effort: tries to remove from Instagram first
 * (if a mediaId is stored) and then removes the local row.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const { id } = await params;
  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return jsonError("Database not configured.", 503);

  const rows = await db
    .select()
    .from(schema.posts)
    .where(and(eq(schema.posts.id, id), eq(schema.posts.workspaceId, ctx.workspace.id)))
    .limit(1);
  if (!rows.length) return jsonError("Post not found.", 404);
  const post = rows[0];

  // Best-effort: if a mediaId is stored, try to remove from Instagram. We
  // intentionally swallow errors here — the user wants the row gone.
  if (post.mediaId && process.env.META_CLIENT_SECRET) {
    try {
      const { InstagramProvider } = await import("@/lib/providers/instagram");
      const { decryptToken } = await import("@/lib/crypto");
      const { listAccounts } = await import("@/lib/workspace");
      const accounts = await listAccounts(ctx.workspace.id);
      const account = accounts.find((a) => a.id === post.accountId);
      if (account) {
        const provider = new InstagramProvider({
          igUserId: account.igUserId,
          accessToken: decryptToken(account.accessToken),
        });
        await provider.deleteMedia(post.mediaId).catch(() => null);
      }
    } catch {
      // ignore — the row is still removed locally
    }
  }

  await db
    .delete(schema.posts)
    .where(and(eq(schema.posts.id, id), eq(schema.posts.workspaceId, ctx.workspace.id)));

  return NextResponse.json({ ok: true });
}
