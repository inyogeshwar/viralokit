"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  MessageSquare,
  Share2,
  PlusSquare,
  Images,
  BarChart3,
  Sparkles,
  Settings,
  Instagram,
  Search,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Automations", href: "/automations", icon: Zap, badge: "Funnels" },
  { name: "Discovery & Limits", href: "/discovery", icon: Search, badge: "Meta v23" },
  { name: "Messages", href: "/messages", icon: MessageSquare, badge: "Direct" },
  { name: "Channels", href: "/channels", icon: Share2, badge: "FB + Threads" },
  { name: "Meta Docs", href: "/docs", icon: BookOpen, badge: "70 Guides" },
  { name: "Create Post", href: "/create", icon: PlusSquare, badge: "Publish" },
  { name: "Posts", href: "/posts", icon: Images },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Analysis", href: "/ai-analysis", icon: Sparkles, badge: "AI" },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-zinc-800 bg-zinc-950 h-screen sticky top-0 p-4 justify-between z-30 shrink-0">
      <div className="space-y-5">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-2 py-2 min-h-[48px]"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shrink-0">
            <Instagram className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white font-headline">
              ViraloKit
            </span>
            <span className="text-[10px] text-zinc-500 block -mt-0.5 tracking-wider uppercase">
              Creator Studio
            </span>
          </div>
        </Link>

        {/* New Post CTA */}
        <div className="px-1">
          <Link
            href="/create"
            className="w-full primary-gradient-bg text-white text-xs font-semibold py-3 px-3 rounded-md flex justify-center items-center gap-2 hover:opacity-90 transition-opacity min-h-[48px]"
          >
            <PlusSquare className="w-4 h-4" />
            <span>New Post</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 rounded-md text-sm font-medium transition-colors min-h-[44px]",
                  isActive
                    ? "bg-zinc-800 text-white border-l-2 border-pink-500"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0",
                      isActive ? "text-pink-400" : "text-zinc-500"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className="text-[10px] py-0 px-1.5 font-medium"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Status footer */}
      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-md space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            Meta Social Suite
          </span>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-pink-500/40 text-pink-300">
            v23.0
          </Badge>
        </div>
        <p className="text-[11px] text-zinc-500 leading-snug">
          Instagram DMs, Growth Funnels, Facebook &amp; Threads
        </p>
      </div>
    </aside>
  );
}
