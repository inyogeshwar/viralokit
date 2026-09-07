"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusSquare,
  Images,
  BarChart3,
  Sparkles,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Create", href: "/create", icon: PlusSquare },
  { name: "Posts", href: "/posts", icon: Images },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI", href: "/ai-analysis", icon: Sparkles },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-2 py-2">
      <div className="flex items-center justify-around">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors",
                isActive ? "text-pink-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-pink-400 scale-110 transition-transform")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
