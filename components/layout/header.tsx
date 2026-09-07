"use client";

import React from "react";
import Link from "next/link";
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
  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {isConnected && accountUsername ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-300">
              @{accountUsername}
            </span>
            <Badge variant="success" className="text-[10px] hidden sm:inline-flex py-0 px-1.5">
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
          <Button size="sm" className="gap-1.5 text-xs h-8">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Post</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </Link>

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-200 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            {user.isDemoUser && (
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
