"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Images,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  PenSquare,
  Settings,
  Users,
  X,
  Zap,
  Bot,
  Rocket,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/compose", label: "Compose", icon: PenSquare },
      { href: "/calendar", label: "Calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/media", label: "Media", icon: Images },
      { href: "/inbox", label: "Inbox", icon: Inbox },
      { href: "/automation", label: "Automation", icon: Bot },
      { href: "/accounts", label: "Accounts", icon: Users },
    ],
  },
  {
    label: "Insights",
    items: [{ href: "/analytics", label: "Analytics", icon: BarChart3 }],
  },
  {
    label: "Preferences",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/help", label: "Help Center", icon: LifeBuoy },
      { href: "/onboarding", label: "Get Started", icon: Rocket },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}

function NavGroup({ group, onNavigate }: { group: (typeof navGroups)[number]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {group.label}
      </p>
      {group.items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={`sidebar-pill-${group.label}`}
                className="absolute inset-0 rounded-lg bg-primary/10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <item.icon className="relative z-10 size-4 shrink-0" />
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-card px-3 py-4 md:flex">
      <Link href="/dashboard" className="mb-4 flex items-center gap-2 px-2 text-lg font-bold">
        <Zap className="size-5 text-rose-500" />
        ViraloKit
      </Link>
      <div className="flex flex-1 flex-col overflow-y-auto">
        {navGroups.map((group) => (
          <NavGroup key={group.label} group={group} />
        ))}
      </div>
      <div className="mt-4 border-t pt-4">
        <ThemeToggle className="w-full" />
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 md:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-4">
        <div className="mb-2 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold" onClick={() => setOpen(false)}>
            <Zap className="size-5 text-rose-500" />
            ViraloKit
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="size-8">
            <X className="size-4" />
          </Button>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto pb-6">
          {navGroups.map((group) => (
            <NavGroup key={group.label} group={group} onNavigate={() => setOpen(false)} />
          ))}
        </div>
        <div className="border-t pt-4">
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/compose", label: "Compose", icon: PenSquare },
    { href: "/inbox", label: "Inbox", icon: Inbox },
    { href: "/media", label: "Media", icon: Images },
    { href: "/analytics", label: "Stats", icon: BarChart3 },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t bg-card/95 px-2 py-1.5 backdrop-blur md:hidden">
      {items.map((item) => {
        const active =
          item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="bottom-nav-active"
                className="absolute inset-0 rounded-lg bg-primary/10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <item.icon className="relative z-10 size-5" />
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
