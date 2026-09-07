"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Cloud,
  Trash2,
  RefreshCw,
  FolderLock,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UserResourceItem {
  publicId: string;
  secureUrl: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  createdAt: string;
}

interface StorageStatsData {
  folder: string;
  prefix: string;
  assetCount: number;
  totalBytes: number;
  totalMB: number;
  userIdentifier: string;
  isIgUsername?: boolean;
  resources: UserResourceItem[];
  globalUsage: {
    plan: string;
    creditsUsed: number;
    creditsLimit: number;
    creditsUsedPercent: number;
    storageBytes: number;
    bandwidthBytes: number;
  } | null;
}

export function CloudinaryStorageManager() {
  const queryClient = useQueryClient();
  const [isConfirmingPurge, setIsConfirmingPurge] = useState(false);
  const [deletingPublicId, setDeletingPublicId] = useState<string | null>(null);

  // 1. Fetch Storage Data
  const { data, isLoading, isFetching, refetch } = useQuery<{ success: boolean; data: StorageStatsData }>({
    queryKey: ["cloudinary-storage"],
    queryFn: async () => {
      const res = await fetch("/api/cloudinary/storage");
      if (!res.ok) {
        throw new Error("Failed to load Cloudinary storage metrics.");
      }
      return res.json();
    },
    refetchInterval: 30000,
  });

  const storageData = data?.data;

  // 2. Mass Purge All Assets Mutation
  const purgeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/cloudinary/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_all" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to purge assets.");
      }
      return json;
    },
    onSuccess: (res) => {
      toast.success(res.message || "All uploaded images deleted from Cloudinary!");
      setIsConfirmingPurge(false);
      queryClient.invalidateQueries({ queryKey: ["cloudinary-storage"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to purge images from Cloudinary.");
    },
  });

  // 3. Single Asset Deletion Mutation
  const deleteAssetMutation = useMutation({
    mutationFn: async (publicId: string) => {
      setDeletingPublicId(publicId);
      const res = await fetch("/api/cloudinary/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete asset.");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("Image removed from Cloudinary.");
      queryClient.invalidateQueries({ queryKey: ["cloudinary-storage"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete image.");
    },
    onSettled: () => {
      setDeletingPublicId(null);
    },
  });

  const creditsUsed = storageData?.globalUsage?.creditsUsed ?? 0;
  const creditsLimit = storageData?.globalUsage?.creditsLimit ?? 25;
  const usedPercent = Math.min(
    100,
    storageData?.globalUsage?.creditsUsedPercent ?? (creditsUsed / creditsLimit) * 100
  );

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 relative overflow-hidden">
      {/* Subtle top accent gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500" />

      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
              <Cloud className="w-4 h-4 text-blue-400" />
              <span>Cloudinary CDN & Storage Manager</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Isolated user media directory and real-time 25 GB free tier quota monitoring.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-8 text-xs gap-1.5 border-zinc-800 text-zinc-300 hover:text-white bg-zinc-950/50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Badge variant="success" className="text-[10px] py-0.5">
              Active CDN
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Isolation Directory Card */}
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/90 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <FolderLock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dedicated User Directory:</span>
              <code className="px-2 py-0.5 bg-zinc-900 border border-zinc-700/80 rounded text-[11px] font-mono text-emerald-300">
                {storageData?.folder || "postgram/users/..."}
              </code>
            </div>

            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 self-start sm:self-auto">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Isolated Storage
            </Badge>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            All your uploaded images are stored strictly inside your account&apos;s isolated folder.
            Deleting or purging media will <strong>never</strong> impact other creators, and published Instagram posts
            remain permanently active on Meta&apos;s servers.
          </p>
        </div>

        {/* 25 GB Quota & Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: 25 GB Quota */}
          <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                25 GB Free Tier CDN
              </span>
              <span className="font-semibold text-white text-xs font-mono">
                {usedPercent.toFixed(2)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usedPercent > 80
                    ? "bg-red-500"
                    : usedPercent > 50
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-blue-500 to-emerald-400"
                }`}
                style={{ width: `${Math.max(2, usedPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>{creditsUsed.toFixed(2)} credits used</span>
              <span>Limit: {creditsLimit} credits (~25 GB)</span>
            </div>
          </div>

          {/* Card 2: Your Uploaded Files */}
          <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 space-y-1">
            <span className="text-[11px] text-zinc-400 font-medium">Your Uploaded Media</span>
            <p className="text-lg font-bold text-white font-mono">
              {storageData?.assetCount ?? (isLoading ? "..." : 0)}{" "}
              <span className="text-xs font-normal text-zinc-400">files</span>
            </p>
            <p className="text-[11px] text-zinc-400">
              Total folder size: <strong className="text-zinc-200">{storageData?.totalMB ?? 0} MB</strong>
            </p>
          </div>

          {/* Card 3: Free CDN Quota Action */}
          <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 flex flex-col justify-between">
            <span className="text-[11px] text-zinc-400 font-medium">Storage Maintenance</span>
            <div className="pt-2">
              {!isConfirmingPurge ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConfirmingPurge(true)}
                  disabled={purgeMutation.isPending || (storageData?.assetCount === 0)}
                  className="w-full text-xs h-8 gap-1.5 border-red-500/40 text-red-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/80 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge All Media</span>
                </Button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    onClick={() => purgeMutation.mutate()}
                    disabled={purgeMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs h-8 gap-1 font-semibold"
                  >
                    {purgeMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Confirm</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsConfirmingPurge(false)}
                    disabled={purgeMutation.isPending}
                    className="text-xs h-8 px-2 text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">
              Clears temporary uploads to keep your 25 GB free tier quota empty.
            </p>
          </div>
        </div>

        {/* Confirmation warning alert banner when confirming */}
        {isConfirmingPurge && (
          <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-red-200">Are you sure you want to delete all uploaded images?</p>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                This will delete all media inside <code className="text-red-300 font-mono">{storageData?.folder}</code>{" "}
                from Cloudinary to free your CDN storage. Any posts already published to Instagram will remain live.
              </p>
            </div>
          </div>
        )}

        {/* Uploaded Images Gallery */}
        <div className="space-y-3 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <span>Media Assets in Your Folder</span>
              <span className="text-[11px] text-zinc-400 font-normal">
                ({storageData?.resources?.length || 0})
              </span>
            </h4>
            <span className="text-[11px] text-zinc-400">Click trash icon to delete individual images</span>
          </div>

          {isLoading ? (
            <div className="py-8 flex items-center justify-center text-xs text-zinc-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>Scanning Cloudinary directory...</span>
            </div>
          ) : !storageData?.resources || storageData.resources.length === 0 ? (
            <div className="py-8 rounded-xl bg-zinc-950/40 border border-dashed border-zinc-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                <Cloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-zinc-300">Your Cloudinary folder is completely empty</p>
              <p className="text-[11px] text-zinc-400">
                No active images are consuming your 25 GB CDN storage.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {storageData.resources.map((item) => {
                const sizeKb = (item.bytes / 1024).toFixed(1);
                const isDeletingThis = deletingPublicId === item.publicId;

                return (
                  <div
                    key={item.publicId}
                    className="group relative rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all aspect-square shadow-sm flex flex-col justify-end"
                  >
                    {/* Image Thumbnail */}
                    <img
                      src={item.secureUrl}
                      alt={item.publicId}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-80 group-hover:opacity-100 transition-opacity" />

                    {/* Format & Size Badge */}
                    <div className="relative z-10 p-2 flex items-center justify-between text-[10px] text-white">
                      <span className="font-mono bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded uppercase font-semibold">
                        {item.format} • {sizeKb} KB
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Open in new tab */}
                        <a
                          href={item.secureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-white"
                          title="Open Full Image"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {/* Delete asset */}
                        <button
                          onClick={() => deleteAssetMutation.mutate(item.publicId)}
                          disabled={isDeletingThis}
                          className="p-1 rounded bg-red-600/90 hover:bg-red-500 text-white transition-colors"
                          title="Delete from Cloudinary"
                        >
                          {isDeletingThis ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
