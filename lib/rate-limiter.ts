interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

function getBucket(key: string, maxTokens: number, refillMs: number): Bucket {
  let bucket = buckets.get(key);
  const now = Date.now();
  if (!bucket) {
    bucket = { tokens: maxTokens, lastRefill: now };
    buckets.set(key, bucket);
    return bucket;
  }
  const elapsed = now - bucket.lastRefill;
  const refill = Math.floor(elapsed / refillMs);
  if (refill > 0) {
    bucket.tokens = Math.min(maxTokens, bucket.tokens + refill);
    bucket.lastRefill = now;
  }
  return bucket;
}

export async function acquireRateLimit(
  accountId: string,
  type: "text" | "video" | "conversations" | "private_reply",
): Promise<boolean> {
  const limits: Record<string, { max: number; refillMs: number }> = {
    text: { max: 100, refillMs: 1000 },
    video: { max: 10, refillMs: 1000 },
    conversations: { max: 2, refillMs: 1000 },
    private_reply: { max: 750, refillMs: 3600000 },
  };
  const cfg = limits[type] ?? limits.text;
  const bucket = getBucket(`${accountId}:${type}`, cfg.max, cfg.refillMs);
  if (bucket.tokens > 0) {
    bucket.tokens--;
    return true;
  }
  return false;
}

export function getRateLimitStatus(
  accountId: string,
  type: "text" | "video" | "conversations" | "private_reply",
) {
  const limits: Record<string, { max: number; refillMs: number }> = {
    text: { max: 100, refillMs: 1000 },
    video: { max: 10, refillMs: 1000 },
    conversations: { max: 2, refillMs: 1000 },
    private_reply: { max: 750, refillMs: 3600000 },
  };
  const cfg = limits[type] ?? limits.text;
  const bucket = getBucket(`${accountId}:${type}`, cfg.max, cfg.refillMs);
  return { remaining: bucket.tokens, max: cfg.max };
}

export type RateLimitResult = { allowed: boolean; remaining: number; resetMs: number };

/**
 * Generic fixed-window-style rate limit keyed on an arbitrary string.
 * Used by non-Instagram API routes (contact form, etc.).
 */
export function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  // Token bucket: allow `limit` burst, then refill evenly across the window.
  const refillMs = Math.max(1, Math.ceil(opts.windowMs / opts.limit));
  const bucket = getBucket(`generic:${opts.key}`, opts.limit, refillMs);
  if (bucket.tokens > 0) {
    bucket.tokens--;
    return {
      allowed: true,
      remaining: bucket.tokens,
      resetMs: refillMs,
    };
  }

  const elapsed = Date.now() - bucket.lastRefill;
  return {
    allowed: false,
    remaining: 0,
    resetMs: Math.max(0, refillMs - elapsed),
  };
}

// --- Per-post (anti-viral) rate limit ----------------------------------------
//
// A single post going viral can produce thousands of comments in minutes.
// Meta flags accounts that send a sudden burst of private replies. We cap
// the number of private replies per (account, media) pair to a safe burst
// size. Meta's documented hourly cap is 250/hour, so 100/hour is comfortable
// headroom and 25/min handles the 5-minute viral burst.

const PER_POST_PRIVATE_REPLY = {
  perHour: { max: 100, refillMs: 3600000 },
  perMinute: { max: 25, refillMs: 60000 },
} as const;

/**
 * Per-post private-reply guard. Returns true if we may send ONE more
 * private reply for this (account, media) pair, false if the per-post
 * caps are exhausted. Both the hourly AND the per-minute caps are checked;
 * the request must satisfy both to proceed.
 *
 * Safe to call concurrently — the underlying token bucket is in-memory and
 * single-process. For multi-process / serverless deployments replace this
 * with a Redis-backed counter.
 */
export function acquirePerPostPrivateReply(
  accountId: string,
  mediaId: string,
): boolean {
  if (!mediaId) return false; // a missing mediaId would bypass the guard — fail closed
  const safeMedia = mediaId.replace(/[^a-zA-Z0-9_:-]/g, "_").slice(0, 128);
  const baseKey = `${accountId}:post:${safeMedia}`;

  const hourBucket = getBucket(
    `${baseKey}:hour`,
    PER_POST_PRIVATE_REPLY.perHour.max,
    PER_POST_PRIVATE_REPLY.perHour.refillMs,
  );
  const minuteBucket = getBucket(
    `${baseKey}:minute`,
    PER_POST_PRIVATE_REPLY.perMinute.max,
    PER_POST_PRIVATE_REPLY.perMinute.refillMs,
  );

  if (hourBucket.tokens <= 0 || minuteBucket.tokens <= 0) {
    return false;
  }

  hourBucket.tokens--;
  minuteBucket.tokens--;
  return true;
}

export function getPerPostPrivateReplyStatus(accountId: string, mediaId: string) {
  const safeMedia = mediaId.replace(/[^a-zA-Z0-9_:-]/g, "_").slice(0, 128);
  const baseKey = `${accountId}:post:${safeMedia}`;
  const hourBucket = getBucket(
    `${baseKey}:hour`,
    PER_POST_PRIVATE_REPLY.perHour.max,
    PER_POST_PRIVATE_REPLY.perHour.refillMs,
  );
  const minuteBucket = getBucket(
    `${baseKey}:minute`,
    PER_POST_PRIVATE_REPLY.perMinute.max,
    PER_POST_PRIVATE_REPLY.perMinute.refillMs,
  );
  return {
    remainingHour: hourBucket.tokens,
    maxHour: PER_POST_PRIVATE_REPLY.perHour.max,
    remainingMinute: minuteBucket.tokens,
    maxMinute: PER_POST_PRIVATE_REPLY.perMinute.max,
  };
}

// Internal — exposed for tests so a fresh process can start with empty buckets.
export function _resetRateLimitBuckets() {
  buckets.clear();
}
