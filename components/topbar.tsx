import { UserButton } from "@clerk/nextjs";

import { AccountSwitcher } from "@/components/account-switcher";
import { MobileSidebar } from "@/components/sidebar";
import { NotificationsBell } from "@/components/notifications-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { env } from "@/lib/env";

export function Topbar({ workspaceName }: { workspaceName: string }) {
  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4">
      <div className="flex items-center gap-2">
        <MobileSidebar />
        <span className="text-sm font-semibold">{workspaceName}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <ThemeToggle className="hidden md:flex" />
        <NotificationsBell />
        <AccountSwitcher mockMode={env.mockMode} />
        <UserButton />
      </div>
    </header>
  );
}
