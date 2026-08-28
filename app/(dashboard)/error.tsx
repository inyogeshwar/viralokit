"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw, Home, LifeBuoy } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Per-route error boundary for the authenticated dashboard.
 * Shows a correlation / digest id if Next.js provided one.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof console !== "undefined") {
      console.error("[dashboard-error]", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Couldn&apos;t load this page</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An error occurred while loading the dashboard. Your scheduled posts, automations,
          and saved data are unaffected.
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
            <Link href="/dashboard">
              <Home className="mr-2 size-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/contact">
              <LifeBuoy className="mr-2 size-4" />
              Get help
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
