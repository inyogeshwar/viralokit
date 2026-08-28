import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { jsonError, requireUserId } from "@/lib/http";
import { getDb, schema } from "@/lib/db";
import { enqueuePostPublish } from "@/lib/inngest";
import { ensureWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/posts/:id/retry
 * Resets a failed post back to "scheduled" and re-enqueues publication.
 * If scheduledAt is in the past, the publish is delayed by 5s so downstream
 * retries have a chance to succeed.
 */
export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const db = getDb();
  if (!db) return jsonError("Database is not configured.");
  const workspace = await ensureWorkspace(auth.userId, {});

  const rows = await db
    .select()
    .from(schema.posts)
    .where(and(eq(schema.posts.id, id), eq(schema.posts.workspaceId, workspace.id)))
    .limit(1);
  if (rows.length === 0) return jsonError("Not found", 404);
  const post = rows[0];

  if (post.status !== "failed" && post.status !== "scheduled") {
    return jsonError(`Cannot retry a post in status "${post.status}".`, 409);
  }

  const when = post.scheduledAt ?? new Date();
  const minStart = new Date(Date.now() + 5_000);
  const runAt = when.getTime() < minStart.getTime() ? minStart : when;

  await db
    .update(schema.posts)
    .set({ status: "scheduled", error: null, updatedAt: new Date() })
    .where(eq(schema.posts.id, id));

  try {
    await enqueuePostPublish(id, runAt);
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.error("[api/posts/retry] enqueue failed", err);
    }
  }

  return NextResponse.json({ ok: true, runAt });
}
