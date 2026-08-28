import Link from "next/link";
import { Lock, ArrowLeft, LifeBuoy } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Access denied — ViraloKit",
  description: "You do not have permission to access this page.",
};

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <p className="text-6xl font-extrabold tracking-tight text-amber-500">403</p>
        <div className="mx-auto mt-3 flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
          <Lock className="size-7" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don&apos;t have permission to view this page. If you think this is a mistake,
          ask the workspace owner for access or contact support.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 size-4" />
              Back to dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
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
