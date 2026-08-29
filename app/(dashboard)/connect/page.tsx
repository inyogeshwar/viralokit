import { redirect } from "next/navigation";

import { ConnectAccountCards } from "@/components/connect-account-cards";
import { getDashboardContext } from "@/lib/context";
import { PRODUCT_NAME } from "@/lib/legal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Connect Account · ${PRODUCT_NAME}`,
  description:
    "Link your Instagram business account to publish, automate, and reply at scale.",
};

export default async function ConnectPage() {
  const ctx = await getDashboardContext();
  if (ctx.accounts.length > 0) {
    redirect("/accounts");
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Connect Account</h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Choose how you want to connect. Each option enables different
          features and requires different permissions.
        </p>
      </header>
      <ConnectAccountCards />
    </div>
  );
}
