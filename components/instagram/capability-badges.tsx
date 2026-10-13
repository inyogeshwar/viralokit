"use client";

import React from "react";
import { CheckCircle2, XCircle, Instagram, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AccountCapabilities } from "@/lib/meta/types";

interface CapabilityBadgesProps {
  capabilities: AccountCapabilities | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function CapabilityBadges({ capabilities, isLoading, onRefresh }: CapabilityBadgesProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg animate-pulse">
        <div className="w-4 h-4 bg-zinc-700 rounded-full" />
        <div className="h-4 bg-zinc-700 rounded w-48" />
      </div>
    );
  }

  if (!capabilities || !capabilities.connected) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {capabilities?.reason || "Instagram account not connected or access token expired."}
          </span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-md font-medium text-amber-100 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Check Connection
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center p-0.5">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden">
              {capabilities.profilePictureUrl ? (
                <img
                  src={capabilities.profilePictureUrl}
                  alt={capabilities.username || "IG"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Instagram className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white">
                @{capabilities.username || "instagram_user"}
              </span>
              <Badge variant="success" className="text-[10px] py-0 px-1.5">
                Connected
              </Badge>
            </div>
            {capabilities.publishingLimit && (
              <p className="text-[11px] text-zinc-400">
                Publishing Usage: {capabilities.publishingLimit.quotaUsage}{" "}
                {capabilities.publishingLimit.configType ? `(${capabilities.publishingLimit.configType})` : ""}
              </p>
            )}
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
            title="Refresh Account Status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-1.5 p-2 bg-zinc-950/50 rounded-lg border border-zinc-800/60">
          {capabilities.canPublish ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          )}
          <span className="text-zinc-300">Publishing</span>
        </div>

        <div className="flex items-center gap-1.5 p-2 bg-zinc-950/50 rounded-lg border border-zinc-800/60">
          {capabilities.canPublishCarousel ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          )}
          <span className="text-zinc-300">Carousels (2-10)</span>
        </div>

        <div className="flex items-center gap-1.5 p-2 bg-zinc-950/50 rounded-lg border border-zinc-800/60">
          {capabilities.canFetchInsights ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          <span className="text-zinc-300">Insights</span>
        </div>

        <div className="flex items-center gap-1.5 p-2 bg-zinc-950/50 rounded-lg border border-zinc-800/60">
          {capabilities.canDeleteMedia ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          )}
          <span className="text-zinc-300">Media Deletion</span>
        </div>
      </div>
    </div>
  );
}
