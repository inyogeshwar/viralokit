"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";

import type { AccountHealthInfo } from "@/lib/social-account-status";

/**
 * Polls /api/accounts/health and renders a dismissable banner when
 * any connected account has an expired, expiring-soon, revoked, or
 * unreachable token. The banner links the user to the accounts page
 * to reconnect.
 *
 * Polling is paused when the tab is hidden to avoid burning API calls.
 */
export function AccountHealthBanner() {
  const [accounts, setAccounts] = useState<AccountHealthInfo[]>([]);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      try {
        const res = await fetch("/api/accounts/health", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { ok: boolean; accounts?: AccountHealthInfo[] };
        if (cancelled) return;
        if (data.ok && data.accounts) {
          setAccounts(data.accounts);
        }
      } catch {
        // silent — the banner is best-effort
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    function schedule() {
      if (document.hidden) {
        // Wait until the tab is visible again.
        const onVis = () => {
          if (!document.hidden) {
            document.removeEventListener("visibilitychange", onVis);
            poll();
            schedule();
          }
        };
        document.addEventListener("visibilitychange", onVis);
        return;
      }
      timer = setTimeout(() => {
        poll();
        schedule();
      }, 60_000); // re-check every minute
    }

    poll();
    schedule();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (loading || dismissed) return null;

  const problematic = accounts.filter((a) => a.health !== "ok");
  if (problematic.length === 0) return null;

  const worst = problematic.find((a) => a.health === "expired" || a.health === "revoked")
    ?? problematic[0];

  const tone =
    worst.health === "expired" || worst.health === "revoked"
      ? "destructive"
      : "warning";

  const label =
    worst.health === "expired"
      ? "Instagram token expired"
      : worst.health === "revoked"
        ? "Instagram token revoked"
        : worst.health === "expiring_soon"
          ? "Instagram token expiring soon"
          : "Instagram account needs attention";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={
        tone === "destructive"
          ? "sticky top-14 z-30 flex items-center justify-between gap-3 border-b bg-destructive/10 px-4 py-2 text-xs text-destructive"
          : "sticky top-14 z-30 flex items-center justify-between gap-3 border-b bg-amber-500/10 px-4 py-2 text-xs text-amber-800"
      }
    >
      <div className="flex min-w-0 items-center gap-2">
        <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">
          <strong>{label}</strong>
          {worst.username ? <> for @{worst.username}</> : null}
          {worst.reason ? <> — {worst.reason}</> : null}
          {problematic.length > 1 ? (
            <> (+{problematic.length - 1} more)</>
          ) : null}
        </span>
        <Link
          href="/accounts"
          className="ml-2 shrink-0 rounded-sm underline underline-offset-2 hover:no-underline"
        >
          Reconnect
        </Link>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-sm p-0.5 opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
