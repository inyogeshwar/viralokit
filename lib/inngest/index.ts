import { inngest } from "@/lib/inngest/client";
import { checkScheduledPosts, publishScheduledPost } from "@/lib/inngest/functions";

/**
 * Aggregator for Inngest functions. Imported by `/api/inngest/route.ts`
 * to register the background scheduler.
 */
export const inngestFunctions = [publishScheduledPost, checkScheduledPosts] as const;

/**
 * Enqueue a post for publishing at `scheduledAt`. Uses Inngest's `ts`
 * parameter so the function is invoked at (or shortly after) the time
 * the user asked for. The cron sweep (`checkScheduledPosts`) is a
 * safety net in case a job is missed.
 */
export async function enqueuePostPublish(postId: string, scheduledAt: Date) {
  return inngest.send({
    name: "post/scheduled.publish",
    data: { postId, force: false },
    ts: scheduledAt.getTime(),
  });
}

export { publishScheduledPost, checkScheduledPosts };
