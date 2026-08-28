"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { LogIn, RefreshCw, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

// Read the current URL (search params) at render time on the client only.
function subscribeToLocation() {
  return () => {};
}

function getSnapshot(): string {
  if (typeof window === "undefined") return "";
  return window.location.search || "";
}

function getServerSnapshot(): string {
  return "";
}

export default function SessionExpiredPage() {
  const search = useSyncExternalStore(subscribeToLocation, getSnapshot, getServerSnapshot);
  const returnTo = (() => {
    if (!search) return null;
    try {
      return new URLSearchParams(search).get("return_to");
    } catch {
      return null;
    }
  })();

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="max-w-lg text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
          <LogIn className="size-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Your session has expired</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          For your security, we sign you out after a period of inactivity. Please sign in
          again to continue where you left off.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href={returnTo ? `/sign-in?return_to=${encodeURIComponent(returnTo)}` : "/sign-in"}>
              <LogIn className="mr-2 size-4" />
              Sign in again
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
          >
            <RefreshCw className="mr-2 size-4" />
            Retry
          </Button>
          {returnTo ? (
            <Button variant="ghost" asChild>
              <Link href={returnTo}>
                <ArrowLeft className="mr-2 size-4" />
                Go back
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
