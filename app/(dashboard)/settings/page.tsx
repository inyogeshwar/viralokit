import { currentUser } from "@clerk/nextjs/server";
import { CheckCircle2, XCircle, Download } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardContext } from "@/lib/context";
import { isFullyConfigured } from "@/lib/env";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const ctx = await getDashboardContext();
  const user = await currentUser();
  const config = isFullyConfigured();

  const configRows = [
    { label: "Clerk (auth)", ok: config.clerk },
    { label: "Database (Neon)", ok: config.database },
    { label: "Cloudinary (media)", ok: config.cloudinary },
    { label: "Meta app (Instagram OAuth)", ok: config.meta },
    { label: "Gemini (AI)", ok: config.gemini },
  ];

  const ownerEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Profile, workspace, and configuration status.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account details (managed by Clerk).</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user?.fullName ?? "—"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{ownerEmail || "—"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">Owner</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Your personal workspace.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{ctx.workspace.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Slug</span>
              <span className="font-medium">{ctx.workspace.slug}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Plan</span>
              <Badge variant="secondary">{ctx.workspace.plan}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Connected accounts</span>
              <span className="font-medium">{ctx.accounts.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your data</CardTitle>
          <CardDescription>
            Export everything we hold about your workspace, or delete it permanently.
            Deletion is irreversible and removes all connected accounts, posts, comments,
            messages, and automations.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          {env.mockMode ? (
            <span
              className="inline-flex items-center gap-2 rounded-md border bg-muted px-3 py-2 text-sm font-medium text-muted-foreground"
              aria-disabled="true"
            >
              <Download className="size-4" />
              Download my data (JSON)
            </span>
          ) : (
            <a
              href="/api/account/export"
              className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Download className="size-4" />
              Download my data (JSON)
            </a>
          )}
          <DeleteAccountDialog ownerEmail={ownerEmail} disabled={env.mockMode} />
          {env.mockMode ? (
            <p className="text-xs text-muted-foreground">
              Data export and deletion are disabled in mock mode.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration status</CardTitle>
          <CardDescription>
            Which services are configured. See .env.example for all keys.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {configRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between border-b pb-2 text-sm last:border-0">
              <span className="text-muted-foreground">{row.label}</span>
              {row.ok ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="size-4" /> Configured
                </span>
              ) : (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <XCircle className="size-4" /> Not set
                </span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
