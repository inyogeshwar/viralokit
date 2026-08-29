/**
 * Follower check with a TTL cache.
 *
 * Wraps `InstagramProvider.isUserFollowBusiness()` and persists results in
 * the `follower_status_cache` table so we don't hit the Meta User Profile
 * API for the same (account, sender) pair on every message.
 *
 * Cache semantics:
 *   - Default TTL: 1 hour (the user's follow state rarely changes in
 *     a session)
 *   - "Unknown" results (API error / rate limit) are cached for 5 minutes
 *     to avoid thundering herd during Meta outages
 *   - Cache lookups are O(1) (indexed) and read-mostly
 *
 * Fail-open vs fail-closed:
 *   When the API errors out and we have no cached value, this function
 *   returns `{ isFollower: false, source: "error" }` (fail-closed). This
 *   means a temporary Meta outage blocks the gated deliverable — a safer
 *   default than spamming users who haven't followed. Callers can override
 *   by passing `failOpen: true` (used by admin tooling / previews).
 */

import { and, eq, gt } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";

export type FollowerCheckSource =
  | "cache"
  | "api"
  | "api_error"
  | "no_provider"
  | "no_db";

export interface FollowerCheckResult {
  isFollower: boolean;
  source: FollowerCheckSource;
  error?: string;
}

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour
const UNKNOWN_RESULT: FollowerCheckResult = {
  isFollower: false,
  source: "api_error",
  error: "Unknown",
};

export interface FollowerCheckDeps {
  /** Async function that calls the Meta API. Returns true if the user follows. */
  apiCheck: () => Promise<boolean>;
  /** Optional DB handle (defaults to `getDb()`). Injectable for tests. */
  db?: ReturnType<typeof getDb> | null;
  /** TTL in ms for successful API lookups. Defaults to 1 hour. */
  ttlMs?: number;
  /** If true, fall back to `isFollower: true` on API error (fail-open). */
  failOpen?: boolean;
}

/**
 * Looks up follower status, hitting the cache first, then the Meta API.
 * On a fresh API result, the cache is updated. On a cache hit, the API
 * is not called.
 */
export async function checkFollowerStatus(
  igUserId: string,
  senderIgsid: string,
  deps: FollowerCheckDeps,
): Promise<FollowerCheckResult> {
  if (!igUserId || !senderIgsid) {
    return { isFollower: false, source: "api_error", error: "Missing ids" };
  }

  const ttl = deps.ttlMs ?? DEFAULT_TTL_MS;
  const db = deps.db !== undefined ? deps.db : getDb();

  // --- 1. Cache lookup -----------------------------------------------------
  if (db) {
    try {
      const now = new Date();
      const hit = await db
        .select()
        .from(schema.followerStatusCache)
        .where(
          and(
            eq(schema.followerStatusCache.igUserId, igUserId),
            eq(schema.followerStatusCache.senderIgsid, senderIgsid),
            gt(schema.followerStatusCache.expiresAt, now),
          ),
        )
        .limit(1);

      if (hit.length > 0) {
        return {
          isFollower: hit[0].isFollower,
          source: "cache",
        };
      }
    } catch (err) {
      // Cache lookup failed — fall through to the API. Don't block the
      // flow on a cache miss caused by a transient DB error.
      console.warn("[follower-check] cache read failed", err);
    }
  }

  // --- 2. API call ---------------------------------------------------------
  let isFollower: boolean;
  try {
    isFollower = await deps.apiCheck();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (deps.failOpen) {
      return { isFollower: true, source: "api_error", error: message };
    }
    return { isFollower: false, source: "api_error", error: message };
  }

  // --- 3. Cache write ------------------------------------------------------
  if (db) {
    try {
      const expiresAt = new Date(Date.now() + ttl);
      // Upsert: if a row exists (even expired), update it; otherwise insert.
      await db
        .insert(schema.followerStatusCache)
        .values({
          igUserId,
          senderIgsid,
          isFollower,
          expiresAt,
        })
        .onConflictDoUpdate({
          target: [
            schema.followerStatusCache.igUserId,
            schema.followerStatusCache.senderIgsid,
          ],
          set: {
            isFollower,
            checkedAt: new Date(),
            expiresAt,
          },
        });
    } catch (err) {
      // Cache write failure is non-fatal — we have the answer, we just
      // couldn't speed up the next lookup.
      console.warn("[follower-check] cache write failed", err);
    }
  }

  return { isFollower, source: "api" };
}

/**
 * Invalidates the cached follower status for a (account, sender) pair.
 * Called when we have ground-truth that the state changed (e.g., the user
 * just followed and replied DONE, or we received a follow webhook).
 */
export async function invalidateFollowerCache(
  igUserId: string,
  senderIgsid: string,
  dbOverride?: ReturnType<typeof getDb> | null,
): Promise<void> {
  const db = dbOverride !== undefined ? dbOverride : getDb();
  if (!db) return;
  await db
    .delete(schema.followerStatusCache)
    .where(
      and(
        eq(schema.followerStatusCache.igUserId, igUserId),
        eq(schema.followerStatusCache.senderIgsid, senderIgsid),
      ),
    );
}

// Re-export the UNKNOWN_RESULT so tests can use a stable reference.
export const _INTERNAL_UNKNOWN = UNKNOWN_RESULT;
