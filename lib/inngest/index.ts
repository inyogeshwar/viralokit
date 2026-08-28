import { inngest } from "@/lib/inngest/client";
import { checkScheduledPosts, publishScheduledPost } from "@/lib/inngest/functions";

export const inngestFunctions = [publishScheduledPost, checkScheduledPosts] as const;

/**
 * Enqueue a post to be published at the given time.
 * Falls back to immediate dispatch if `runAt` is in the past.
 */
export async function enqueuePostPublish(postId: string, runAt: Date) {
  const ts = Math.max(runAt.getTime(), Date.now() + 1_000);
  return inngest.send({
    name: "post/scheduled.publish",
    data: { postId, force: false },
    ts,
  });
}

export { inngest };
