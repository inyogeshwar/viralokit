import { inngest } from "@/lib/inngest/client";

/**
 * Step-based publish. Uses `step.sleepUntil` to wait until the scheduled
 * time, then publishes via the Instagram provider (or a mock).
 */
export const publishScheduledPost = inngest.createFunction(
  {
    id: "publish-scheduled-post",
    name: "Publish scheduled post",
    concurrency: { limit: 5, key: "event.data.postId" },
    triggers: [{ event: "post/scheduled.publish" }],
  },
  async ({ event, step }) => {
    const { postId, force } = event.data as { postId: string; force?: boolean };

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

    if (!post) {
      return { ok: false, reason: "post_not_found" };
    }

    if (post.status === "published" && !force) {
      return { ok: true, alreadyPublished: true };
    }
    if (post.status === "failed" && !force) {
      return { ok: false, reason: "post_in_failed_state" };
    }

    if (post.scheduledAt) {
      await step.sleepUntil("wait-until-scheduled", new Date(post.scheduledAt));
    }

    const result = await step.run("publish", async () => {
      const { env } = await import("@/lib/env");
      const { mockPublishResult } = await import("@/lib/mock");
      const { getDb, schema } = await import("@/lib/db");
      const { eq } = await import("drizzle-orm");
      const { listAccounts } = await import("@/lib/workspace");
      const { decryptToken } = await import("@/lib/crypto");
      const { InstagramError, InstagramProvider } = await import("@/lib/providers/instagram");

      const db = getDb();
      if (!db) {
        return { ok: false, error: "db_unavailable" as const };
      }

      // Mock mode short-circuit: pretend it worked.
      if (env.mockMode) {
        const fake = mockPublishResult(post.mediaType as "image" | "carousel" | "reel", post.mediaUrls ?? []);
        await db
          .update(schema.posts)
          .set({
            status: "published",
            publishedAt: new Date(),
            containerId: (fake.containerId as string) ?? null,
            mediaId: (fake.mediaId as string) ?? null,
            permalink: (fake.permalink as string) ?? null,
            error: null,
            updatedAt: new Date(),
          })
          .where(eq(schema.posts.id, postId));
        return { ok: true, mock: true, ...fake };
      }

      // Real publish.
      const accounts = await listAccounts(post.workspaceId);
      const account = accounts.find((a) => a.id === post.accountId);
      if (!account) return { ok: false, error: "account_missing" as const };

      try {
        const token = decryptToken(account.accessToken);
        const provider = new InstagramProvider({
          igUserId: account.igUserId,
          accessToken: token,
        });
        const caption = post.caption ?? "";
        const urls = post.mediaUrls ?? [];
        let result: Record<string, unknown> = {};
        if (post.mediaType === "reel") {
          result = (await provider.publishReel(urls[0], caption)) as unknown as Record<string, unknown>;
        } else if (post.mediaType === "image") {
          result = (await provider.publishImage(urls[0], caption)) as unknown as Record<string, unknown>;
        } else {
          result = (await provider.publishCarousel(urls, caption)) as unknown as Record<string, unknown>;
        }
        await db
          .update(schema.posts)
          .set({
            status: "published",
            publishedAt: new Date(),
            containerId: (result.containerId as string) ?? null,
            mediaId: (result.mediaId as string) ?? null,
            permalink: (result.permalink as string) ?? null,
            error: null,
            updatedAt: new Date(),
          })
          .where(eq(schema.posts.id, postId));
        return { ok: true, ...result };
      } catch (err) {
        const message = err instanceof InstagramError ? err.message : String(err);
        await db
          .update(schema.posts)
          .set({ status: "failed", error: message, updatedAt: new Date() })
          .where(eq(schema.posts.id, postId));
        return { ok: false, error: message };
      }
    });

    return result;
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
    name: "Check scheduled posts (cron)",
    triggers: [{ cron: "*/1 * * * *" }],
  },
  async ({ step }) => {
    const due = await step.run("find-due-posts", async () => {
      const { getDb, schema } = await import("@/lib/db");
      const { and, eq, lte } = await import("drizzle-orm");
      const db = getDb();
      if (!db) return [] as string[];
      const rows = await db
        .select({ id: schema.posts.id, scheduledAt: schema.posts.scheduledAt })
        .from(schema.posts)
        .where(
          and(
            eq(schema.posts.status, "scheduled"),
            lte(schema.posts.scheduledAt, new Date()),
          ),
        )
        .limit(50);
      return rows.map((r) => r.id);
    });

    if (!due.length) return { ok: true, processed: 0 };

    await Promise.all(
      due.map((postId) =>
        inngest.send({
          name: "post/scheduled.publish",
          data: { postId, force: false },
        }),
      ),
    );

    return { ok: true, processed: due.length };
  },
);
