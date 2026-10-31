"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Search,
  MessageSquare,
  Share2,
  BookOpen,
  PlusSquare,
  X,
  Images,
  BarChart3,
  Sparkles,
  Settings,
  Instagram,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primaryItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Automate", href: "/automations", icon: Zap },
  { name: "Create", href: "/create", icon: PlusSquare },
  { name: "Inbox", href: "/messages", icon: MessageSquare },
  { name: "More", href: "#more", icon: Menu, isDrawer: true },
];

const drawerItems = [
  { name: "Discovery", href: "/discovery", icon: Search },
  { name: "Channels", href: "/channels", icon: Share2 },
  { name: "Posts", href: "/posts", icon: Images },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Analysis", href: "/ai-analysis", icon: Sparkles },
  { name: "Meta Docs", href: "/docs", icon: BookOpen },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Bottom tab bar */}
      <nav
        aria-label="Primary navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/98 backdrop-blur-xl border-t border-zinc-800 safe-area-pb"
      >
        <div className="flex items-stretch justify-around h-14">
          {primaryItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.isDrawer) {
              return (
                <button
                  key="drawer"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open navigation menu"
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 flex-1 text-[10px] font-medium transition-colors min-w-[48px]",
                    drawerOpen ? "text-pink-400" : "text-zinc-400"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 text-[10px] font-medium transition-colors min-w-[48px]",
                  isActive ? "text-pink-400" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    item.href === "/create"
                      ? "text-pink-400"
                      : isActive
                      ? "text-pink-400"
                      : ""
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Full-screen drawer overlay */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Slide-in panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 rounded-t-xl p-4 space-y-1 pb-safe">
            {/* Handle */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center">
                  <Instagram className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-white">ViraloKit</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="w-10 h-10 flex items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {drawerItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 rounded-md text-sm font-medium transition-colors min-h-[48px]",
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      isActive ? "text-pink-400" : "text-zinc-500"
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
