"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

/**
 * Watches `navigator.onLine` and renders a non-blocking banner when the
 * browser is offline so users know why actions may fail.
 */
export function OfflineBanner() {
  const [online, setOnline] = useState<boolean>(true);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setOnline(navigator.onLine);
    update();

    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const onOnline = () => {
      setOnline(true);
      setShowReconnected(true);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => setShowReconnected(false), 4000);
    };
    const onOffline = () => {
      setOnline(false);
      setShowReconnected(false);
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (online && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        online
          ? "sticky top-14 z-30 flex items-center justify-center gap-2 border-b bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-700"
          : "sticky top-14 z-30 flex items-center justify-center gap-2 border-b bg-amber-500/10 px-4 py-1.5 text-xs text-amber-800"
      }
    >
      {online ? (
        <>
          <RefreshCw className="size-3.5" aria-hidden="true" />
          <span>You&apos;re back online.</span>
        </>
      ) : (
        <>
          <WifiOff className="size-3.5" aria-hidden="true" />
          <span>You&apos;re offline. Changes will sync when you reconnect.</span>
        </>
      )}
    </div>
  );
}
