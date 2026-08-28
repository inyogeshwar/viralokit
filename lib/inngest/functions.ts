import { inngest } from "@/lib/inngest/client";
import { getDb, schema } from "@/lib/db";
import { decryptToken } from "@/lib/crypto";
import { InstagramProvider } from "@/lib/providers/instagram";
import { env } from "@/lib/env";

/**
 * Step-based publish. Uses `step.sleepUntil` to wait until the scheduled
 * time, then publishes via the Instagram provider (or a mock).
 */
export const publishScheduledPost = inngest.createFunction(
  {
    id: "publish-scheduled-post",
    triggers: [{ event: "post/scheduled.publish" }],
    concurrency: {
      limit: 5,
    },
  },
  async ({ event, step }) => {
    const { postId } = event.data as { postId: string };

    if (env.mockMode) {
      await step.run("mark-published-mock", async () => {
        const db = getDb();
        if (!db) return;
        await db
          .update(schema.posts)
          .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
          .where(eq(schema.posts.id, postId));
      });
      return { postId, status: "published", mock: true };
    }

    const post = await step.run("load-post", async () => {
      const { getDb, schema } = await import("@/lib/db");
      const { eq } = await import("drizzle-orm");
      const db = getDb();
      if (!db) return null;
      const rows = await db
        .select()
        .from(schema.posts)
        .where(eq(schema.posts.id, postId))
        .limit(1);
      return rows[0] ?? null;
    });

    if (!post) return { skipped: true, reason: "Post not found or not scheduled" };

    const account = await db.query.socialAccounts.findFirst({
      where: eq(schema.socialAccounts.id, post.accountId),
    });

    if (!account) throw new Error("Account not found");

    const token = decryptToken(account.accessToken);
    const provider = new InstagramProvider({
      igUserId: account.igUserId,
      accessToken: token,
    });

    await step.run("mark-processing", async () => {
      await db
        .update(schema.posts)
        .set({ status: "processing", updatedAt: new Date() })
        .where(eq(schema.posts.id, postId));
    });

    let result: Record<string, unknown> | null = null;
    let error: string | null = null;

    try {
      if (post.mediaType === "reel" && post.mediaUrls?.[0]) {
        result = await provider.publishReel(post.mediaUrls[0], post.caption ?? "");
      } else if (post.mediaType === "carousel" && post.mediaUrls && post.mediaUrls.length > 1) {
        result = await provider.publishCarousel(post.mediaUrls, post.caption ?? "");
      } else if (post.mediaUrls?.[0]) {
        result = await provider.publishImage(post.mediaUrls[0], post.caption ?? "");
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }

    await step.run("update-post-status", async () => {
      await db
        .update(schema.posts)
        .set({
          status: error ? "failed" : "published",
          publishedAt: error ? null : new Date(),
          mediaId: (result?.["mediaId"] as string) ?? null,
          permalink: (result?.["permalink"] as string) ?? null,
          error,
          updatedAt: new Date(),
        })
        .where(eq(schema.posts.id, postId));
    });

    return { postId, status: error ? "failed" : "published", error };
  },
);

/**
 * Every-minute sweep. Picks up any post that is still "scheduled" but
 * whose `scheduledAt` is in the past, and re-enqueues it. Acts as a
 * safety net for missed jobs.
 */
export const checkScheduledPosts = inngest.createFunction(
  {
    id: "check-scheduled-posts",
    triggers: [{ cron: "*/1 * * * *" }],
  },
  async ({ step }) => {
    if (env.mockMode) return { skipped: true, reason: "mock mode" };
    const db = getDb();
    if (!db) return;

    const now = new Date();
    const scheduledPosts = await db.query.posts.findMany({
      where: and(eq(schema.posts.status, "scheduled"), or(lte(schema.posts.scheduledAt, now))),
    });

    for (const post of scheduledPosts) {
      await step.sendEvent("trigger-publish", {
        name: "post/scheduled.publish",
        data: { postId: post.id, force: false },
      });
    }

    return { triggered: scheduledPosts.length };
  },
);
