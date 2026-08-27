import { and, eq, lte } from "drizzle-orm";

import { inngest } from "@/lib/inngest/client";
import { getDb, schema } from "@/lib/db";
import { decryptToken } from "@/lib/crypto";
import { env } from "@/lib/env";
import { InstagramProvider } from "@/lib/providers/instagram";
import { mockPublishResult } from "@/lib/mock";

type PublishResult = {
  mediaType: "image" | "carousel" | "reel";
  containerId: string;
  mediaId: string;
  permalink?: string;
  childContainerIds?: string[];
  mediaUrls: string[];
};

function publishPost(post: {
  mediaType: string;
  mediaUrls: string[] | null;
  caption: string | null;
}): PublishResult | { error: string } {
  const caption = post.caption ?? "";
  const urls = post.mediaUrls ?? [];

  if (env.mockMode) {
    const mediaType = post.mediaType === "reel" ? "reel" : post.mediaType === "carousel" ? "carousel" : "image";
    return mockPublishResult(mediaType, urls) as PublishResult;
  }

  // Real Instagram publish happens via the caller (publishNow caller already uploaded + got the provider).
  // For scheduled jobs that we run later, the token + account must be loaded here:
  throw new Error("publishPost: real-provider call must be made via runWithAccount below");
}

async function runWithAccount<T>(
  accountId: string,
  fn: (provider: InstagramProvider) => Promise<T>,
): Promise<T> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");
  const account = await db.query.socialAccounts.findFirst({
    where: eq(schema.socialAccounts.id, accountId),
  });
  if (!account) throw new Error("Account not found");
  const token = decryptToken(account.accessToken);
  const provider = new InstagramProvider({ igUserId: account.igUserId, accessToken: token });
  return fn(provider);
}

export const publishScheduledPost = inngest.createFunction(
  {
    id: "publish-scheduled-post",
    triggers: [{ event: "post/scheduled.publish" }],
    // Each post gets its own concurrency slot to avoid one slow IG call blocking the queue.
    concurrency: { limit: 5, key: "event.data.postId" },
  },
  async ({ event, step }) => {
    const { postId } = event.data as { postId: string };

    const db = getDb();
    if (!db) return { skipped: true, reason: "Database not configured" };

    const post = await db.query.posts.findFirst({
      where: eq(schema.posts.id, postId),
    });
    if (!post) return { skipped: true, reason: "Post not found" };
    if (post.status === "published") return { skipped: true, reason: "Already published" };
    if (post.status === "failed") {
      // Allow manual retry by re-queueing; otherwise skip.
      const data = event.data as { force?: boolean };
      if (!data?.force) return { skipped: true, reason: "Previously failed" };
    }

    // If a future scheduledAt is set and we're being called early, wait until then.
    if (post.scheduledAt && post.scheduledAt.getTime() > Date.now()) {
      await step.sleepUntil("wait-until-scheduled", post.scheduledAt);
    }

    await step.run("mark-processing", async () => {
      await db!
        .update(schema.posts)
        .set({ status: "processing", updatedAt: new Date() })
        .where(eq(schema.posts.id, postId));
    });

    let result: PublishResult | null = null;
    let error: string | null = null;

    try {
      if (env.mockMode) {
        const out = publishPost(post);
        if ("error" in out) throw new Error(out.error);
        result = out;
      } else {
        const urls = post.mediaUrls ?? [];
        result = (await runWithAccount(post.accountId, async (provider) => {
          if (post.mediaType === "reel" && urls[0]) {
            return (await provider.publishReel(urls[0], post.caption ?? "")) as PublishResult;
          }
          if (post.mediaType === "carousel" && urls.length > 1) {
            return (await provider.publishCarousel(urls, post.caption ?? "")) as PublishResult;
          }
          if (urls[0]) {
            return (await provider.publishImage(urls[0], post.caption ?? "")) as PublishResult;
          }
          throw new Error("Post has no media to publish");
        })) as PublishResult;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }

    await step.run("update-post-status", async () => {
      await db!.update(schema.posts).set({
        status: error ? "failed" : "published",
        publishedAt: error ? null : new Date(),
        containerId: (result?.containerId as string) ?? null,
        mediaId: (result?.mediaId as string) ?? null,
        permalink: (result?.permalink as string) ?? null,
        error,
        updatedAt: new Date(),
      }).where(eq(schema.posts.id, postId));
    });

    return { postId, status: error ? "failed" : "published", error };
  },
);

// Cron-triggered sweep: every minute, pick up any scheduled posts whose time has passed
// and didn't get a direct event for some reason (e.g. server was down at scheduling time).
export const checkScheduledPosts = inngest.createFunction(
  {
    id: "check-scheduled-posts",
    triggers: [{ cron: "*/1 * * * *" }],
  },
  async ({ step }) => {
    const db = getDb();
    if (!db) return { triggered: 0, reason: "Database not configured" };

    const now = new Date();
    const due = await db
      .select({ id: schema.posts.id })
      .from(schema.posts)
      .where(
        and(
          eq(schema.posts.status, "scheduled"),
          lte(schema.posts.scheduledAt, now),
        ),
      )
      .limit(50);

    let count = 0;
    for (const row of due) {
      await step.sendEvent(`trigger-publish-${row.id}`, {
        name: "post/scheduled.publish",
        data: { postId: row.id, force: false },
      });
      count++;
    }

    return { triggered: count };
  },
);
