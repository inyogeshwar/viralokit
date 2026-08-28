import Link from "next/link";
import { Lock, ArrowLeft, Mail, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LEGAL_CONTACTS, PRODUCT_NAME } from "@/lib/legal";

export const metadata = {
  title: `Access denied · ${PRODUCT_NAME}`,
  description: "You don&apos;t have permission to view this page.",
};

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="max-w-lg text-center">
        <p className="text-7xl font-extrabold tracking-tight text-amber-500">403</p>
        <div className="mx-auto mt-4 flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
          <Lock className="size-7" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don&apos;t have permission to view this page. If you believe this is a
          mistake, contact support and we&apos;ll help you out.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 size-4" />
              Back to dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/sign-in">
              <LogIn className="mr-2 size-4" />
              Sign in
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <a href={`mailto:${LEGAL_CONTACTS.general}`}>
              <Mail className="mr-2 size-4" />
              Contact support
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
