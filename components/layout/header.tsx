"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export function Header({ user, accountUsername, isConnected }: HeaderProps) {
  // Automatically fallback to live query if parent component didn't provide props
  const { data: fetchedAccount } = useQuery({
    queryKey: ["meta-account"],
    queryFn: async () => {
      const res = await fetch("/api/meta/account");
      return res.json();
    },
    enabled: isConnected === undefined,
    staleTime: 60000,
  });

  const { data: fetchedUser } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      return res.json();
    },
    enabled: user === undefined,
    staleTime: 60000,
  });

  const finalConnected = isConnected !== undefined ? isConnected : Boolean(fetchedAccount?.connected);
  const finalUsername = accountUsername || fetchedAccount?.username || null;
  const finalUser = user !== undefined ? user : (fetchedUser?.user || null);

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {finalConnected && finalUsername ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-300">
              @{finalUsername}
            </span>
            <Badge variant="success" className="text-[10px] hidden sm:inline-flex py-0 px-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              Live Meta v23.0
            </Badge>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs text-zinc-400">Instagram Disconnected</span>
            <Link href="/settings" className="text-xs text-pink-400 hover:underline">
              Connect
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link href="/create">
          <Button size="sm" className="gap-1.5 text-xs h-8 bg-pink-500 hover:bg-pink-600 text-white font-medium">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Post</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </Link>

        {finalUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-200 overflow-hidden">
              {finalUser.avatarUrl ? (
                <img src={finalUser.avatarUrl} alt={finalUser.name} className="w-full h-full object-cover" />
              ) : (
                (finalUser.name || "U").charAt(0).toUpperCase()
              )}
            </div>
            {finalUser.isDemoUser && (
              <Badge variant="secondary" className="text-[9px] py-0 px-1 text-zinc-400">
                Dev
              </Badge>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
