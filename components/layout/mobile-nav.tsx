"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Film,
  BarChart3,
  Sparkles,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Feed", href: "/posts", icon: Film },
  { name: "Create", href: "/create", icon: PlusCircle, isPrimary: true },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Studio", href: "/ai-analysis", icon: Sparkles },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-800/80 px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-4 flex flex-col items-center group active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-2xl primary-gradient-bg flex items-center justify-center text-white shadow-lg shadow-pink-500/40 border-2 border-zinc-950 group-hover:scale-105 transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-pink-400 mt-1">Create</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-medium transition-all relative",
                isActive
                  ? "text-white font-bold"
                  : "text-zinc-400 hover:text-zinc-200 active:scale-95"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                  isActive
                    ? "bg-pink-500/15 border border-pink-500/30 text-pink-400 shadow-sm"
                    : "text-zinc-400"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isActive && "scale-110 text-pink-400"
                  )}
                />
              </div>
              <span className="leading-none">{item.name}</span>

              {/* Active neon pip */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-pink-500 absolute -bottom-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
