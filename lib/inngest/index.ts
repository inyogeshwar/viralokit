import { inngest } from "./client";
import { publishScheduledPost, checkScheduledPosts } from "./functions";

export const inngestFunctions = [publishScheduledPost, checkScheduledPosts] as const;

export type PostScheduleEvent = {
  name: "post/scheduled.publish";
  data: { postId: string; force?: boolean };
};

/**
 * Enqueue a scheduled post for publish. If `scheduledAt` is in the future, the
 * function will wait via `step.sleepUntil` before publishing. The cron sweep
 * (`checkScheduledPosts`) is the safety net for posts that were missed.
 */
export async function enqueuePostPublish(postId: string, scheduledAt: Date) {
  // We send the event with the postId; the function will sleep until the
  // scheduled time when it runs. Using `ts` (epoch ms) is also fine, but
  // sleepUntil inside the function is more reliable because the event is
  // delivered immediately and we honor the latest schedule.
  return inngest.send({
    name: "post/scheduled.publish",
    data: { postId, force: false },
    ts: scheduledAt.getTime(),
  });
}

export { inngest };
