/**
 * In-Memory Sliding Window Rate Limiter for Next.js Middleware & Server Routes
 * 
 * Enforces production rate limits:
 * - Auth endpoints: 5 requests / 15 minutes per IP
 * - General API endpoints: 60 requests / 1 minute per IP
 * - AI / LLM proxy endpoints: 10 requests / 1 minute per IP
 * - File upload / storage endpoints: 5 requests / 1 minute per IP
 * 
 * Includes automatic periodic garbage collection to prevent memory leaks.
 */

interface RateLimitRecord {
  timestamps: number[];
}

class SlidingWindowRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private lastCleanup = Date.now();
  private readonly cleanupIntervalMs = 60 * 1000; // Cleanup every 60 seconds

  /**
   * Check whether a request from an identifier is within the rate limit.
   *
   * @param key Unique key (e.g. `auth:192.168.1.1`)
   * @param limit Maximum number of requests allowed in window
   * @param windowMs Window duration in milliseconds
   * @returns { success: boolean, limit: number, remaining: number, resetInSeconds: number }
   */
  public check(
    key: string,
    limit: number,
    windowMs: number
  ): {
    success: boolean;
    limit: number;
    remaining: number;
    resetInSeconds: number;
  } {
    const now = Date.now();
    this.maybeCleanup(now);

    const windowStart = now - windowMs;
    const record = this.store.get(key) || { timestamps: [] };

    // Filter out timestamps outside the active window
    const validTimestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (validTimestamps.length >= limit) {
      const oldestInWindow = validTimestamps[0];
      const resetInSeconds = Math.max(1, Math.ceil((oldestInWindow + windowMs - now) / 1000));

      // Update store with pruned timestamps
      this.store.set(key, { timestamps: validTimestamps });

      return {
        success: false,
        limit,
        remaining: 0,
        resetInSeconds,
      };
    }

    // Add current timestamp
    validTimestamps.push(now);
    this.store.set(key, { timestamps: validTimestamps });

    const remaining = Math.max(0, limit - validTimestamps.length);
    const resetInSeconds = Math.ceil(windowMs / 1000);

    return {
      success: true,
      limit,
      remaining,
      resetInSeconds,
    };
  }

  /**
   * Periodic pruning of inactive keys to prevent memory growth
   */
  private maybeCleanup(now: number): void {
    if (now - this.lastCleanup < this.cleanupIntervalMs) return;

    this.lastCleanup = now;
    const maxWindowMs = 15 * 60 * 1000; // Max tracked window (15 mins)
    const threshold = now - maxWindowMs;

    for (const [key, record] of this.store.entries()) {
      const active = record.timestamps.filter((ts) => ts > threshold);
      if (active.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, { timestamps: active });
      }
    }
  }

  /**
   * Reset store (useful for automated testing)
   */
  public reset(): void {
    this.store.clear();
  }
}

// Singleton rate limiter instance
export const rateLimiter = new SlidingWindowRateLimiter();

/**
 * Rate limit policy tiers
 */
export const RATE_LIMIT_TIERS = {
  // Auth endpoints (login, logout, session check): 5 requests per 15 minutes
  AUTH: {
    limit: 5,
    windowMs: 15 * 60 * 1000,
    tierName: "auth",
  },
  // General API routes (meta account, posts, analytics): 60 requests per minute
  GENERAL_API: {
    limit: 60,
    windowMs: 60 * 1000,
    tierName: "general-api",
  },
  // AI / LLM proxy endpoints (caption generation, image analysis, audit): 10 requests per minute
  AI_PROXY: {
    limit: 10,
    windowMs: 60 * 1000,
    tierName: "ai-proxy",
  },
  // File upload and storage management: 5 requests per minute
  UPLOADS: {
    limit: 5,
    windowMs: 60 * 1000,
    tierName: "uploads",
  },
} as const;

export type RateLimitTier = (typeof RATE_LIMIT_TIERS)[keyof typeof RATE_LIMIT_TIERS];

/**
 * Extract client IP address safely from standard headers
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "127.0.0.1";
}
