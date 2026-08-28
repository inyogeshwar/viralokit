import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

import { jsonError, requireUserId } from "@/lib/http";
import { getDb, schema } from "@/lib/db";
import { enqueuePostPublish } from "@/lib/inngest";
import { env } from "@/lib/env";
import { ensureWorkspace } from "@/lib/workspace";
import { decryptToken } from "@/lib/crypto";
import { InstagramProvider } from "@/lib/providers/instagram";

export const dynamic = "force-dynamic";

const PatchSchema = z.object({
  caption: z.string().min(1).max(2200).optional(),
  scheduledAt: z.string().datetime().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const db = getDb();
  if (!db) return jsonError("Database is not configured.");

  const workspace = await ensureWorkspace(auth.userId, {});

  const rows = await db
    .select({ post: schema.posts, accountHandle: schema.socialAccounts.username })
    .from(schema.posts)
    .innerJoin(schema.socialAccounts, eq(schema.posts.accountId, schema.socialAccounts.id))
    .where(and(eq(schema.posts.id, id), eq(schema.posts.workspaceId, workspace.id)))
    .limit(1);

  if (rows.length === 0) return jsonError("Not found", 404);

  return NextResponse.json({
    ok: true,
    post: rows[0].post,
    accountHandle: rows[0].accountHandle,
  });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input");

  const db = getDb();
  if (!db) return jsonError("Database is not configured.");
  const workspace = await ensureWorkspace(auth.userId, {});

  const existing = await db
    .select()
    .from(schema.posts)
    .where(and(eq(schema.posts.id, id), eq(schema.posts.workspaceId, workspace.id)))
    .limit(1);
  if (existing.length === 0) return jsonError("Not found", 404);
  const current = existing[0];

  if (current.status === "published" && parsed.data.scheduledAt) {
    return jsonError("Cannot reschedule a post that has already been published.", 409);
  }

  const update: Partial<typeof schema.posts.$inferInsert> = {};
  if (parsed.data.caption !== undefined) update.caption = parsed.data.caption;
  if (parsed.data.scheduledAt !== undefined) {
    const when = new Date(parsed.data.scheduledAt);
    if (Number.isNaN(when.getTime())) return jsonError("Invalid scheduledAt");
    update.scheduledAt = when;
    if (current.status === "failed" || current.status === "draft") {
      update.status = "scheduled";
      update.error = null;
    }
  }

  if (Object.keys(update).length > 0) {
    await db.update(schema.posts).set(update).where(eq(schema.posts.id, id));
  }

  if (update.scheduledAt) {
    try {
      await enqueuePostPublish(id, update.scheduledAt as Date);
    } catch (err) {
      if (!env.mockMode) console.error("[api/posts/patch] enqueue failed", err);
    }
  }

  const after = await db.select().from(schema.posts).where(eq(schema.posts.id, id)).limit(1);
  return NextResponse.json({ ok: true, post: after[0] });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const db = getDb();
  if (!db) return jsonError("Database is not configured.");
  const workspace = await ensureWorkspace(auth.userId, {});

  const rows = await db
    .select({ post: schema.posts, account: schema.socialAccounts })
    .from(schema.posts)
    .innerJoin(schema.socialAccounts, eq(schema.posts.accountId, schema.socialAccounts.id))
    .where(and(eq(schema.posts.id, id), eq(schema.posts.workspaceId, workspace.id)))
    .limit(1);
  if (rows.length === 0) return jsonError("Not found", 404);
  const { post, account } = rows[0];

  if (post.status === "published" && post.mediaId) {
    try {
      const token = decryptToken(account.accessToken);
      const provider = new InstagramProvider({
        igUserId: account.igUserId,
        accessToken: token,
      });
      await provider.deleteMedia(post.mediaId);
    } catch (err) {
      if (!env.mockMode) console.warn("[api/posts/delete] IG media delete failed", err);
    }
  }

  // media_assets references posts via workspace but has no postId FK; nothing to
  // cascade from the post itself. The workspace cascade handles the rest.
  await db.delete(schema.posts).where(eq(schema.posts.id, id));

  return NextResponse.json({ ok: true });
}
