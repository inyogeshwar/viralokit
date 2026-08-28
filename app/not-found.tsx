import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="max-w-lg text-center">
        <p className="text-7xl font-extrabold tracking-tight text-rose-500">404</p>
        <div className="mx-auto mt-4 flex size-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
          <Compass className="size-7" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist or has been moved. If you followed
          a link from an email or another app, the destination may be outdated.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 size-4" />
              Go home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Search className="mr-2 size-4" />
              Open dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
