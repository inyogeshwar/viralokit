import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { jsonError, requireUserId } from "@/lib/http";
import { enqueuePostPublish } from "@/lib/inngest";
import { getDashboardContext } from "@/lib/context";

export const dynamic = "force-dynamic";

/**
 * POST /api/posts/:id/retry
 *
 * Resets a failed post to "scheduled" with a short delay and re-enqueues
 * it through Inngest. Used by the per-day "Retry" button in the calendar.
 */
export async function POST(
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

  // Move it back to scheduled, clear the error, and re-enqueue.
  const at = post.scheduledAt && post.scheduledAt.getTime() > Date.now()
    ? post.scheduledAt
    : new Date(Date.now() + 5_000);

  await db
    .update(schema.posts)
    .set({ status: "scheduled", scheduledAt: at, error: null, updatedAt: new Date() })
    .where(eq(schema.posts.id, id));

  try {
    await enqueuePostPublish(id, at);
  } catch (err) {
    return jsonError(`Queue failed: ${err instanceof Error ? err.message : String(err)}`, 502);
  }

  return NextResponse.json({ ok: true, scheduledAt: at.toISOString() });
}
