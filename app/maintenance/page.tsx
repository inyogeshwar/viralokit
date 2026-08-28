import Link from "next/link";
import { Wrench, RefreshCw, Mail, Clock } from "lucide-react";

import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { LEGAL_CONTACTS, PRODUCT_NAME } from "@/lib/legal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Maintenance · ${PRODUCT_NAME}`,
  description:
    "We are performing scheduled maintenance. Service will be back shortly. Your data is safe.",
};

export default function MaintenancePage() {
  const isOn = env.maintenanceMode;

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <div className="max-w-lg text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
          <Wrench className="size-8" />
        </div>
        <p className="text-sm font-medium uppercase tracking-wider text-amber-600">
          Scheduled maintenance
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          {isOn ? "We&apos;re upgrading things" : "Service is back online"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {isOn
            ? `${PRODUCT_NAME} is briefly offline while we ship an update. Your scheduled posts, automations, and data are safe and will resume as soon as we&apos;re done.`
            : "Maintenance is complete. If you still see issues, a hard refresh (Ctrl/Cmd + Shift + R) usually clears them."}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {isOn
            ? "Check back in a moment — you can retry below."
            : "Maintenance is complete — you can head back to the app."}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href={isOn ? "/maintenance" : "/dashboard"}>
              <RefreshCw className="mr-2 size-4" />
              {isOn ? "Retry" : "Open dashboard"}
            </Link>
          </Button>
          <Button variant="outline" asChild>
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
