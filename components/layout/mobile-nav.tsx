"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Search,
  MessageSquare,
  Share2,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Automate", href: "/automations", icon: Zap },
  { name: "Explore", href: "/discovery", icon: Search },
  { name: "Inbox", href: "/messages", icon: MessageSquare },
  { name: "Channels", href: "/channels", icon: Share2 },
  { name: "Docs", href: "/docs", icon: BookOpen },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-1 py-1.5">
      <div className="flex items-center justify-around">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[9px] font-medium transition-colors",
                isActive ? "text-pink-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive && "text-pink-400 scale-110 transition-transform")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
