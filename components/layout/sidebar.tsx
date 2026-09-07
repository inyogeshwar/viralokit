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
  Instagram,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Create Post",
    href: "/create",
    icon: PlusSquare,
    badge: "Publish",
  },
  {
    name: "Posts",
    href: "/posts",
    icon: Images,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "AI Analysis",
    href: "/ai-analysis",
    icon: Sparkles,
    badge: "FREE AI",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl h-screen sticky top-0 p-4 justify-between z-30">
      <div className="space-y-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-1.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform">
            <Instagram className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-headline-md">
              PostGram
            </span>
            <span className="text-[10px] text-zinc-400 block -mt-1 font-medium tracking-wider uppercase">
              Creator Studio
            </span>
          </div>
        </Link>

        {/* Quick New Post CTA */}
        <div className="px-1">
          <Link
            href="/create"
            className="w-full primary-gradient-bg text-white text-xs font-semibold py-2.5 px-3 rounded-lg flex justify-center items-center gap-2 hover:opacity-95 transition-all shadow-[0_4px_15px_rgba(244,82,173,0.3)] active:scale-95"
          >
            <PlusSquare className="w-4 h-4" />
            <span>New Post</span>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-gradient-to-r from-pink-500/15 via-pink-500/10 to-transparent text-pink-300 border-l-2 border-pink-500 font-semibold"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-pink-400" : "text-zinc-400 group-hover:text-zinc-200"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant={item.badge === "FREE AI" ? "default" : "secondary"}
                    className="text-[10px] py-0 px-1.5 font-normal"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Free-tier infrastructure pill */}
      <div className="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
          <Zap className="w-3.5 h-3.5 text-pink-400" />
          <span>Zero-Cost Stack</span>
        </div>
        <div className="text-[11px] text-zinc-400 space-y-1">
          <p className="flex justify-between">
            <span>Auth:</span>
            <span className="text-zinc-300 font-mono">WorkOS</span>
          </p>
          <p className="flex justify-between">
            <span>Database:</span>
            <span className="text-zinc-300 font-mono">Neon PG</span>
          </p>
          <p className="flex justify-between">
            <span>AI:</span>
            <span className="text-pink-400 font-mono">OpenRouter Free</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
