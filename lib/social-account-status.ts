/**
 * Account health detection.
 *
 * Walks the workspace's connected Instagram accounts and identifies
 * ones whose access token is expired, revoked, or otherwise unusable.
 * Used by the dashboard to surface a re-auth banner.
 *
 * Token expiry is checked two ways:
 *   1. `tokenExpiresAt` in the database (set when the long-lived token
 *      was exchanged; 60-day default)
 *   2. A live API call to `GET /me` — if it returns a 190/102, the
 *      token has been revoked or expired out-of-band
 *
 * The live check is rate-limited (1 check per account per 5 minutes)
 * via a simple in-memory map. The first call after a token is rotated
 * will refresh the status.
 */

import { eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { decryptToken } from "@/lib/crypto";
import { InstagramError, InstagramProvider } from "@/lib/providers/instagram";

export type AccountHealth =
  | "ok"
  | "expiring_soon"
  | "expired"
  | "revoked"
  | "unknown";

export interface AccountHealthInfo {
  accountId: string;
  igUserId: string;
  username: string | null;
  health: AccountHealth;
  /** Human-readable explanation. */
  reason?: string;
  /** Approximate expiry time, if known. */
  expiresAt?: Date;
}

const EXPIRY_SOON_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const LIVE_CHECK_COOLDOWN_MS = 5 * 60 * 1000; // 5 min

// In-memory cache so we don't re-query the Graph API on every render.
const liveCheckCache = new Map<
  string,
  { at: number; status: "ok" | "revoked" | "error" }
>();

/**
 * Determines the health of all connected accounts in the workspace.
 * Pure-DB check (expiry) runs synchronously; the live check is gated
 * by the cooldown map.
 */
export async function getAccountsHealth(
  workspaceId: string,
): Promise<AccountHealthInfo[]> {
  const db = getDb();
  if (!db) return [];

  const accounts = await db.query.socialAccounts.findMany({
    where: eq(schema.socialAccounts.workspaceId, workspaceId),
  });

  const out: AccountHealthInfo[] = [];
  for (const a of accounts) {
    const info: AccountHealthInfo = {
      accountId: a.id,
      igUserId: a.igUserId,
      username: a.username,
      health: "ok",
    };

    if (a.tokenExpiresAt) {
      info.expiresAt = a.tokenExpiresAt;
      const now = Date.now();
      const expiry = a.tokenExpiresAt.getTime();
      if (expiry < now) {
        info.health = "expired";
        info.reason = "Token expired. Please reconnect.";
      } else if (expiry - now < EXPIRY_SOON_MS) {
        info.health = "expiring_soon";
        info.reason = "Token expires within 7 days. Reconnect to avoid disruption.";
      }
    }

    // Live check (cooldown-gated) — confirms the token actually works.
    const cached = liveCheckCache.get(a.id);
    if (!cached || Date.now() - cached.at > LIVE_CHECK_COOLDOWN_MS) {
      try {
        const provider = new InstagramProvider({
          igUserId: a.igUserId,
          accessToken: decryptToken(a.accessToken),
        });
        await provider.getAccountInfo();
        liveCheckCache.set(a.id, { at: Date.now(), status: "ok" });
      } catch (err) {
        if (err instanceof InstagramError && err.isTokenExpired()) {
          liveCheckCache.set(a.id, { at: Date.now(), status: "revoked" });
          info.health = "revoked";
          info.reason = "Token revoked or expired. Please reconnect.";
        } else {
          liveCheckCache.set(a.id, { at: Date.now(), status: "error" });
          // Don't downgrade an "expiring_soon" to "unknown" — keep
          // the explicit reason if we have one.
          if (info.health === "ok") {
            info.health = "unknown";
            info.reason = "Could not verify token. Try again later.";
          }
        }
      }
    } else if (cached.status === "revoked") {
      info.health = "revoked";
      info.reason = "Token revoked. Please reconnect.";
    }

    out.push(info);
  }
  return out;
}

/** True if any account is not in a healthy "ok" state. */
export function hasUnhealthyAccount(infos: AccountHealthInfo[]): boolean {
  return infos.some((i) => i.health !== "ok");
}

/** Hook for tests — clears the in-memory cooldown map. */
export function _resetAccountHealthCache() {
  liveCheckCache.clear();
}
