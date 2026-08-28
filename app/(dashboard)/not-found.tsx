import Link from "next/link";
import { Compass, LayoutDashboard, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg text-center">
        <p className="text-6xl font-extrabold tracking-tight text-rose-500">404</p>
        <div className="mx-auto mt-3 flex size-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
          <Compass className="size-7" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          This dashboard page doesn&apos;t exist
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The link may be outdated or the resource may have been deleted. Your data is safe.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 size-4" />
              Open dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/calendar">
              <ArrowLeft className="mr-2 size-4" />
              Go to calendar
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
