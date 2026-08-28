"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw, Home } from "lucide-react";

/**
 * Top-level error boundary. Required by Next.js App Router at the root.
 * Renders when the root layout itself fails.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof console !== "undefined") {
      console.error("[global-error]", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The application hit an unexpected error and could not recover. Your data is safe.
          </p>
          {error.digest ? (
            <p className="mt-4 inline-block rounded-md bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          ) : null}
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <RotateCw className="size-4" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <Home className="size-4" />
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
