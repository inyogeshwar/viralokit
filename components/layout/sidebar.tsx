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
  Flame,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ViraloKitLogo } from "@/components/brand/logo";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    iconColor: "text-blue-400 group-hover:text-blue-300",
    bgActive: "bg-blue-500/10 border-blue-500/30 text-blue-300",
  },
  {
    name: "Create Post",
    href: "/create",
    icon: PlusCircle,
    badge: "Publish",
    iconColor: "text-pink-400 group-hover:text-pink-300",
    bgActive: "bg-pink-500/10 border-pink-500/30 text-pink-300",
  },
  {
    name: "Feed & Posts",
    href: "/posts",
    icon: Film,
    iconColor: "text-purple-400 group-hover:text-purple-300",
    bgActive: "bg-purple-500/10 border-purple-500/30 text-purple-300",
  },
  {
    name: "Meta Analytics",
    href: "/analytics",
    icon: BarChart3,
    iconColor: "text-emerald-400 group-hover:text-emerald-300",
    bgActive: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  },
  {
    name: "AI Studio",
    href: "/ai-analysis",
    icon: Sparkles,
    badge: "AI",
    iconColor: "text-amber-400 group-hover:text-amber-300",
    bgActive: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    iconColor: "text-zinc-400 group-hover:text-zinc-300",
    bgActive: "bg-zinc-800/60 border-zinc-700/60 text-zinc-200",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800/80 bg-zinc-950/95 backdrop-blur-2xl h-screen sticky top-0 p-4 justify-between z-30 shadow-2xl">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="px-2 py-1">
          <ViraloKitLogo href="/dashboard" />
        </div>

        {/* Quick New Post Action */}
        <div className="px-1">
          <Link
            href="/create"
            className="w-full relative group overflow-hidden rounded-xl p-px font-semibold text-xs shadow-lg transition-all active:scale-95 block"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-[11px] bg-zinc-950/80 text-white group-hover:bg-transparent transition-colors">
              <PlusCircle className="w-4 h-4 text-pink-400 group-hover:text-white transition-colors" />
              <span>New Instagram Post</span>
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group border",
                  isActive
                    ? `${item.bgActive} font-semibold shadow-sm`
                    : "border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 hover:border-zinc-800/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                      isActive
                        ? "bg-white/10 shadow-inner"
                        : "bg-zinc-900 border border-zinc-800/80 group-hover:border-zinc-700"
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : item.iconColor)} />
                  </div>
                  <span className="tracking-tight">{item.name}</span>
                </div>

                {item.badge && (
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className="text-[9px] py-0 px-1.5 font-bold uppercase tracking-wider"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Pro Studio Status Badge */}
      <div className="p-3.5 bg-gradient-to-b from-zinc-900/70 to-zinc-950/90 border border-zinc-800/90 rounded-2xl space-y-2 shadow-inner">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-pink-400 fill-pink-500/20 animate-pulse" />
            <span>ViraloKit Pro</span>
          </span>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-pink-500/40 text-pink-300 font-mono">
            Meta v23.0
          </Badge>
        </div>
        <p className="text-[11px] text-zinc-400 leading-tight">
          Official Meta Graph API Publishing & 25 GB Cloudinary Storage
        </p>
      </div>
    </aside>
  );
}
