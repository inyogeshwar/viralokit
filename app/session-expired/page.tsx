import Link from "next/link";
import { LogIn, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Session expired — ViraloKit",
  description: "Your sign-in session has expired. Please sign in again to continue.",
};

export default function SessionExpiredPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
          <LogIn className="size-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Your session has expired</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          For your security, we sign you out after a long period of inactivity. Please sign
          in again to continue where you left off.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/sign-in">
              <LogIn className="mr-2 size-4" />
              Sign in again
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="javascript:location.reload()">
              <RefreshCw className="mr-2 size-4" />
              Retry
            </a>
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Lost work? Drafts are saved automatically. Your scheduled posts are unaffected.
        </p>
      </div>
    </div>
  );
}
