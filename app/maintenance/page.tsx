import Link from "next/link";
import { Wrench, RefreshCw, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Under maintenance — ViraloKit",
  description: "ViraloKit is currently under maintenance. We will be back shortly.",
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <div className="max-w-xl text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
          <Wrench className="size-8" />
        </div>
        <p className="text-sm font-medium uppercase tracking-wider text-amber-600">
          Scheduled maintenance
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          We&apos;ll be back shortly
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We&apos;re performing some quick maintenance to make ViraloKit faster and more
          reliable. Your scheduled posts are safe and will publish as soon as we&apos;re back.
        </p>

        {env.maintenanceMode ? (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Maintenance mode is active
          </div>
        ) : (
          <p className="mt-6 text-xs text-muted-foreground">
            (Maintenance mode is currently <strong>off</strong>. This page renders for anyone
            who hits <code>/maintenance</code> while it&apos;s on.)
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <a href="javascript:location.reload()">
              <RefreshCw className="mr-2 size-4" />
              Retry
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">
              <Mail className="mr-2 size-4" />
              Contact support
            </Link>
          </Button>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          Status: <Link href="/api/status" className="underline">/api/status</Link>
        </p>
      </div>
    </div>
  );
}
