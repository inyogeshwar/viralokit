"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Instagram, ShieldCheck, Sparkles, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ViraloKitLogo } from "@/components/brand/logo";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatarUrl?: string | null;
    isDemoUser?: boolean;
  } | null;
  accountUsername?: string | null;
  isConnected?: boolean;
}

export function Header(props: HeaderProps) {
  // 1. Fetch user status if not provided via props
  const { data: authData } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      return res.json();
    },
    enabled: !props.user,
  });

  // 2. Fetch Instagram Account Capabilities if not provided via props
  const { data: capabilities } = useQuery({
    queryKey: ["meta-account"],
    queryFn: async () => {
      const res = await fetch("/api/meta/account");
      return res.json();
    },
    enabled: props.isConnected === undefined,
  });

  const currentUser = props.user !== undefined ? props.user : authData?.user;
  const isConnected = props.isConnected !== undefined ? props.isConnected : Boolean(capabilities?.connected);
  const accountUsername = props.accountUsername !== undefined ? props.accountUsername : capabilities?.username;

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Mobile Brand Logo & Desktop Account Status */}
      <div className="flex items-center gap-3">
        {/* Mobile: ViraloKit Logo */}
        <div className="md:hidden">
          <ViraloKitLogo size="sm" href="/dashboard" />
        </div>

        {/* Desktop: Real-time Connected Status */}
        <div className="hidden md:flex items-center gap-2.5">
          {isConnected && accountUsername ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-xs font-semibold text-zinc-200 font-mono">
                @{accountUsername}
              </span>
              <Badge variant="success" className="text-[9px] py-0 px-1.5 ml-1">
                Meta v23.0
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-zinc-300">Instagram Disconnected</span>
              <Link href="/settings" className="text-pink-400 font-semibold hover:underline text-xs">
                Connect
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right Actions: Quick Create + Account Profile */}
      <div className="flex items-center gap-2.5">
        <Link href="/create">
          <Button
            size="sm"
            className="primary-gradient-bg text-white font-semibold text-xs h-8 px-3 gap-1.5 shadow-md shadow-pink-500/25 hover:opacity-95 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Post</span>
            <span className="sm:hidden">Post</span>
          </Button>
        </Link>

        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <Link
              href="/settings"
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-zinc-700/80 flex items-center justify-center text-xs font-bold text-zinc-200 overflow-hidden hover:border-pink-500/50 transition-colors shadow-inner"
              title={currentUser.name || currentUser.email}
            >
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                (currentUser.name || "C").charAt(0).toUpperCase()
              )}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
