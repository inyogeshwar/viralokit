/**
 * Sentry error reporting helper.
 *
 * Wraps `Sentry.captureException` with structured tags (workspace,
 * account, error category) so we can group/filter errors in the
 * Sentry dashboard by feature area.
 *
 * Sentry is a soft dependency — if it's not initialized (e.g. dev
 * mode or DSN missing), this becomes a no-op. We dynamically import
 * @sentry/nextjs so the route bundle doesn't break if it's missing.
 */

import type { InstagramError } from "@/lib/providers/instagram";

export interface ReportContext {
  workspaceId?: string;
  accountId?: string;
  feature?: string;
}

interface SentryLike {
  captureException: (err: unknown, ctx?: unknown) => void;
  withScope?: (cb: (scope: unknown) => void) => void;
  setTag?: (key: string, value: string) => void;
}

let sentryRef: SentryLike | null = null;
let initTried = false;

async function getSentry(): Promise<SentryLike | null> {
  if (initTried) return sentryRef;
  initTried = true;
  try {
    const mod = await import("@sentry/nextjs");
    sentryRef = mod as unknown as SentryLike;
  } catch {
    sentryRef = null;
  }
  return sentryRef;
}

/**
 * Report an error to Sentry with consistent tags. Non-Instagram errors
 * get a category of "unknown" so they still surface in the dashboard.
 */
export async function reportError(
  err: unknown,
  context: ReportContext = {},
): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    // Keep the dev console readable; production-only reporting.
    return;
  }
  const Sentry = await getSentry();
  if (!Sentry?.captureException) return;

  // Best-effort classification; never throws.
  let category = "unknown";
  let code: number | string | undefined;
  if (err && typeof err === "object" && "category" in err) {
    const e = err as InstagramError;
    category = e.category ?? "unknown";
    code = e.code;
  }

  try {
    if (Sentry.withScope) {
      Sentry.withScope((scope) => {
        const s = scope as { setTag?: (k: string, v: string) => void };
        s.setTag?.("error.category", category);
        if (code !== undefined) s.setTag?.("meta.error_code", String(code));
        if (context.workspaceId) s.setTag?.("workspace.id", context.workspaceId);
        if (context.accountId) s.setTag?.("account.id", context.accountId);
        if (context.feature) s.setTag?.("feature", context.feature);
        Sentry.captureException(err);
      });
    } else {
      Sentry.captureException(err);
    }
  } catch {
    // Sentry must never throw into user code.
  }
}
