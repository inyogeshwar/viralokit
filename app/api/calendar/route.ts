import { NextResponse } from "next/server";
import { and, asc, eq, gte, isNotNull, lt, or } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { requireUserId } from "@/lib/http";
import { getDashboardContext } from "@/lib/context";
import { mockPosts } from "@/lib/mock";
import { enqueuePostPublish } from "@/lib/inngest";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const monthParam = url.searchParams.get("month"); // YYYY-MM
  const range = monthParam ? monthBounds(monthParam) : currentMonthBounds();

  const ctx = await getDashboardContext();
  const db = getDb();

  if (!db) {
    // Mock mode — fabricate a calendar-friendly view.
    const mock = mockPosts(20).map((p) => ({
      id: p.id,
      caption: p.caption,
      mediaType: p.mediaType,
      status: p.status,
      scheduledAt: p.scheduledAt?.toISOString() ?? null,
      accountUsername: p.accountUsername,
      thumbnailUrl: null,
      durationSec: null,
    }));
    return NextResponse.json({ ok: true, posts: mock, mockMode: env.mockMode, range });
  }

  const rows = await db
    .select()
    .from(schema.posts)
    .where(
      and(
        eq(schema.posts.workspaceId, ctx.workspace.id),
        or(
          // Posts scheduled within the requested month.
          and(
            isNotNull(schema.posts.scheduledAt),
            gte(schema.posts.scheduledAt, range.start),
            lt(schema.posts.scheduledAt, range.end),
          ),
          // Recent published posts (so the calendar has context).
          and(
            eq(schema.posts.status, "published"),
            gte(schema.posts.publishedAt, range.start),
            lt(schema.posts.publishedAt, range.end),
          ),
          // Drafts (no scheduled date) so they can be dragged onto a day.
          and(eq(schema.posts.status, "draft")),
        ),
      ),
    )
    .orderBy(asc(schema.posts.scheduledAt))
    .limit(300);

  const accounts = ctx.accounts;
  const posts = rows.map((r) => ({
    id: r.id,
    caption: r.caption,
    mediaType: r.mediaType,
    status: r.status,
    scheduledAt: r.scheduledAt?.toISOString() ?? null,
    accountUsername: accounts.find((a) => a.id === r.accountId)?.username ?? null,
    thumbnailUrl: r.thumbnailUrl,
    durationSec: r.durationSec,
  }));

  return NextResponse.json({ ok: true, posts, range, mockMode: env.mockMode });
}

export async function PATCH(req: Request) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return NextResponse.json({ ok: true, mock: true });

  const body = await req.json();
  const { postId, scheduledAt } = body;

  if (!postId || !scheduledAt) {
    return NextResponse.json({ ok: false, error: "Missing postId or scheduledAt" }, { status: 400 });
  }

  const at = new Date(scheduledAt);
  if (Number.isNaN(at.getTime())) {
    return NextResponse.json({ ok: false, error: "Invalid date" }, { status: 400 });
  }

  await db
    .update(schema.posts)
    .set({
      scheduledAt: at,
      status: at.getTime() > Date.now() ? "scheduled" : "draft",
      updatedAt: new Date(),
    })
    .where(and(eq(schema.posts.id, postId), eq(schema.posts.workspaceId, ctx.workspace.id)));

  // Enqueue for the new time so the scheduler picks it up.
  if (at.getTime() > Date.now()) {
    try {
      await enqueuePostPublish(postId, at);
    } catch {
      // Cron sweep is the safety net.
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return NextResponse.json({ ok: true, mock: true });

  const body = await req.json();
  const { postId } = body;

  if (!postId) {
    return NextResponse.json({ ok: false, error: "Missing postId" }, { status: 400 });
  }

  await db
    .update(schema.posts)
    .set({ status: "draft", scheduledAt: null, updatedAt: new Date() })
    .where(and(eq(schema.posts.id, postId), eq(schema.posts.workspaceId, ctx.workspace.id)));

  return NextResponse.json({ ok: true });
}

function monthBounds(yyyymm: string) {
  const [y, m] = yyyymm.split("-").map(Number);
  const start = new Date(Date.UTC(y, (m ?? 1) - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, (m ?? 1), 1, 0, 0, 0));
  return { start, end };
}

function currentMonthBounds() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  return { start, end };
}
