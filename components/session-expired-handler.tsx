"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Catches a global 401 from `fetch` and routes the user to
 * `/session-expired` with a safe return path. Whitelists
 * non-auth API endpoints and avoids redirect loops by tracking
 * the current path.
 */
export function SessionExpiredHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const lastRedirect = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const original = window.fetch.bind(window);
    window.fetch = async (...args) => {
      try {
        const res = await original(...args);
        if (res.status === 401 && pathname && !pathname.startsWith("/sign-") && !pathname.startsWith("/session-expired")) {
          // Throttle to once per 5s to avoid loops.
          if (Date.now() - lastRedirect.current > 5000) {
            lastRedirect.current = Date.now();
            const returnTo = encodeURIComponent(pathname);
            router.push(`/session-expired?return_to=${returnTo}`);
          }
        }
        return res;
      } catch (err) {
        throw err;
      }
    };

    return () => {
      window.fetch = original;
    };
  }, [pathname, router]);

  return null;
}
