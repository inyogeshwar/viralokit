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
import { Button } from "@/components/ui/button";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";
import { getDashboardContext } from "@/lib/context";
import { isFullyConfigured } from "@/lib/env";
import { listAccounts } from "@/lib/workspace";

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
    user?.primaryEmailAddress?.emailAddress ?? `${user?.id ?? "owner"}@unknown.local`;
  const accounts = await listAccounts(ctx.workspace.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Profile, workspace, integrations, and data controls.</p>
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
              <span className="font-medium">{ownerEmail}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">Owner</span>
            </div>
            <p className="text-xs text-muted-foreground">
              To change your name, email, password, or two-factor settings, use the avatar
              menu in the top-right corner.
            </p>
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
              <span className="font-medium">{accounts.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Your data</CardTitle>
          <CardDescription>
            Download a copy of your data, or delete your workspace permanently.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-md border bg-muted/30 p-3">
            <div>
              <p className="font-medium">Download my data</p>
              <p className="text-xs text-muted-foreground">
                A JSON file with your accounts, posts, media, comments, messages, and
                automation rules. Access tokens are not included.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href="/api/account/export" download>
                <Download className="mr-1.5 size-3.5" />
                Download JSON
              </a>
            </Button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-md border border-destructive/40 bg-destructive/5 p-3">
            <div>
              <p className="font-medium text-destructive">Delete this workspace</p>
              <p className="text-xs text-muted-foreground">
                Permanently removes your workspace, accounts, posts, media, and
                automations. This cannot be undone. You can also delete your sign-in
                account from the avatar menu.
              </p>
            </div>
            <DeleteAccountDialog ownerEmail={ownerEmail} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
