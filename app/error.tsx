"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw, Home, LifeBuoy } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Per-route error boundary for the public app (root + (legal) groups).
 * The dashboard group has its own `app/(dashboard)/error.tsx` for richer UI.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof console !== "undefined") {
      console.error("[public-error]", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not load this page. Please try again, or come back later.
        </p>
        {error.digest ? (
          <p className="mt-4 inline-block rounded-md bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => reset()}>
            <RotateCw className="mr-2 size-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 size-4" />
              Home
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/contact">
              <LifeBuoy className="mr-2 size-4" />
              Contact support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
