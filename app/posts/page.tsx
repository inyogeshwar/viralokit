"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutGrid,
  List,
  CheckSquare,
  Square,
  Trash2,
  ExternalLink,
  Heart,
  MessageCircle,
  Eye,
  MoreVertical,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatNumber } from "@/lib/utils";
import { InstagramMediaItem } from "@/lib/meta/types";

export default function PostsPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [postToDelete, setPostToDelete] = useState<InstagramMediaItem | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{
    running: boolean;
    total: number;
    results: Array<{ mediaId: string; status: "deleted" | "failed"; reason?: string }>;
  } | null>(null);

  // 1. Fetch Posts from Meta API
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["meta-posts"],
    queryFn: async () => {
      const res = await fetch("/api/meta/posts?limit=30");
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const posts: InstagramMediaItem[] = data?.posts || [];

  // 2. Selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === posts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(posts.map((p) => p.id));
    }
  };

  // 3. Single Deletion Mutation
  const singleDeleteMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const res = await fetch("/api/meta/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.reason || "Deletion failed on Meta API");
      }
      return data;
    },
    onSuccess: (_, mediaId) => {
      toast.success("Post deleted from Instagram!");
      setSelectedIds((prev) => prev.filter((id) => id !== mediaId));
      setPostToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["meta-posts"] });
      queryClient.invalidateQueries({ queryKey: ["meta-analytics"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete post");
      setPostToDelete(null);
    },
  });

  // 4. Bulk Deletion Mutation
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    setBulkProgress({
      running: true,
      total: selectedIds.length,
      results: [],
    });

    try {
      const res = await fetch("/api/meta/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaIds: selectedIds }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Bulk deletion failed");
      }

      setBulkProgress({
        running: false,
        total: selectedIds.length,
        results: data.summary.results,
      });

      toast.success(
        `Bulk operation complete: ${data.summary.totalDeleted} deleted, ${data.summary.totalFailed} failed.`
      );

      // Deselect successfully deleted items
      const successfullyDeleted = new Set(
        data.summary.results
          .filter((r: any) => r.status === "deleted")
          .map((r: any) => r.mediaId)
      );
      setSelectedIds((prev) => prev.filter((id) => !successfullyDeleted.has(id)));

      queryClient.invalidateQueries({ queryKey: ["meta-posts"] });
      queryClient.invalidateQueries({ queryKey: ["meta-analytics"] });
    } catch (err: any) {
      toast.error(err?.message || "Failed to process bulk deletion");
      setBulkProgress(null);
      setIsBulkDeleteModalOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Published Instagram Posts
              </h1>
              <p className="text-xs text-zinc-400">
                Official media feed from Meta Graph API. Select posts for bulk management or deletion.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Select All Toggle */}
              {posts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  className="text-xs gap-1.5 h-8 border-zinc-800 text-zinc-300"
                >
                  {selectedIds.length === posts.length ? (
                    <CheckSquare className="w-3.5 h-3.5 text-pink-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                  <span>{selectedIds.length === posts.length ? "Deselect All" : "Select All"}</span>
                </Button>
              )}

              {/* Grid / List Switcher */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === "grid" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === "list" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              <Link href="/create">
                <Button size="sm" className="text-xs gap-1.5 h-8">
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Post</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Posts Feed */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-zinc-900/60 rounded-2xl border border-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card className="p-12 text-center bg-zinc-900/40 border-dashed border-zinc-800">
              <p className="text-zinc-400 text-sm mb-2">No published posts found on this Instagram account.</p>
              <p className="text-xs text-zinc-500 mb-4">
                Upload images and publish your first post through PostGram to get started.
              </p>
              <Link href="/create">
                <Button size="sm" className="text-xs">
                  Create Post
                </Button>
              </Link>
            </Card>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {posts.map((post) => {
                const isSelected = selectedIds.includes(post.id);
                return (
                  <div
                    key={post.id}
                    className={`group relative rounded-2xl overflow-hidden bg-zinc-900/60 border transition-all duration-200 flex flex-col ${
                      isSelected
                        ? "border-pink-500 ring-2 ring-pink-500/30 shadow-lg shadow-pink-500/10"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    {/* Media Thumbnail */}
                    <div className="relative aspect-square bg-zinc-950 overflow-hidden">
                      <img
                        src={post.media_url || post.thumbnail_url}
                        alt={post.caption || "Instagram post"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Top Bar on Image: Selection checkbox & post type badge */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(post.id);
                          }}
                          className={`w-6 h-6 rounded-md flex items-center justify-center pointer-events-auto transition-all ${
                            isSelected
                              ? "bg-pink-600 text-white"
                              : "bg-black/60 backdrop-blur-sm text-white hover:bg-black/80"
                          }`}
                        >
                          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>

                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-black/60 backdrop-blur-sm text-white border-0">
                          {post.media_type}
                        </Badge>
                      </div>

                      {/* External permalink button */}
                      {post.permalink && (
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-pink-600 transition-colors opacity-0 group-hover:opacity-100"
                          title="View on Instagram"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Post Info & Metrics */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                      <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed font-normal">
                        {post.caption || <span className="text-zinc-500 italic">No caption provided</span>}
                      </p>

                      <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                        {/* Real Metrics Line */}
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5 text-pink-400" />
                              <span>{formatNumber(post.like_count)}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                              <span>{formatNumber(post.comments_count)}</span>
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500">{formatDate(post.timestamp)}</span>
                        </div>

                        {/* Single Delete Button */}
                        <div className="flex justify-end pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPostToDelete(post)}
                            className="text-[11px] h-7 px-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2.5">
              {posts.map((post) => {
                const isSelected = selectedIds.includes(post.id);
                return (
                  <div
                    key={post.id}
                    className={`p-3 rounded-xl bg-zinc-900/60 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      isSelected
                        ? "border-pink-500 ring-1 ring-pink-500/30"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleSelect(post.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                          isSelected ? "text-pink-400" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>

                      <div className="w-14 h-14 rounded-lg bg-zinc-950 overflow-hidden shrink-0 border border-zinc-800">
                        <img
                          src={post.media_url || post.thumbnail_url}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-[9px] py-0">
                            {post.media_type}
                          </Badge>
                          <span className="text-[10px] text-zinc-500 font-mono">ID: {post.id}</span>
                        </div>
                        <p className="text-xs text-zinc-200 line-clamp-1">
                          {post.caption || "No caption"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800">
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-pink-400" />
                          <span>{formatNumber(post.like_count)}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-blue-400" />
                          <span>{formatNumber(post.comments_count)}</span>
                        </span>
                        <span className="text-[11px] text-zinc-500">{formatDate(post.timestamp)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {post.permalink && (
                          <a
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                            title="View on Instagram"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => setPostToDelete(post)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/95 backdrop-blur-xl border border-pink-500/40 shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            <span className="text-xs font-semibold text-white">
              {selectedIds.length} post{selectedIds.length > 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="text-xs text-zinc-400 hover:text-white h-8"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="text-xs gap-1.5 h-8 bg-red-600 hover:bg-red-500 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </Button>
          </div>
        </div>
      )}

      {/* Single Post Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-white">Delete Instagram Post?</h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              This action will send a permanent <code className="text-pink-400 font-mono">DELETE</code> request
              to the official Meta Graph API. If your connected account permissions allow it, the post will be
              removed from Instagram.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPostToDelete(null)}
                disabled={singleDeleteMutation.isPending}
                className="text-xs text-zinc-400"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => singleDeleteMutation.mutate(postToDelete.id)}
                disabled={singleDeleteMutation.isPending}
                className="text-xs gap-1.5 bg-red-600 hover:bg-red-500"
              >
                {singleDeleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Post</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal with Live Progress Report */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-white">
                  Delete {selectedIds.length} Selected Posts?
                </h3>
                <p className="text-xs text-zinc-400">
                  Processed with pace control to respect Meta API rate limits.
                </p>
              </div>
            </div>

            {/* Live Progress or Final Status */}
            {bulkProgress ? (
              <div className="space-y-3 py-2">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span>Progress:</span>
                  <span>
                    {bulkProgress.running ? (
                      <span className="flex items-center gap-1.5 text-pink-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Executing deletions on Meta...
                      </span>
                    ) : (
                      "Completed"
                    )}
                  </span>
                </div>

                {/* Per-post item report */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
                  {bulkProgress.results.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 rounded bg-zinc-900/60">
                      <span className="font-mono text-zinc-400">Post {r.mediaId.slice(-6)}</span>
                      {r.status === "deleted" ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Deleted</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 font-medium" title={r.reason}>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Failed</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-300 leading-relaxed">
                This will delete {selectedIds.length} media item(s) from your connected Instagram account.
                Successful removals cannot be undone.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsBulkDeleteModalOpen(false);
                  setBulkProgress(null);
                }}
                disabled={bulkProgress?.running}
                className="text-xs text-zinc-400"
              >
                {bulkProgress && !bulkProgress.running ? "Close" : "Cancel"}
              </Button>

              {!bulkProgress && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-xs gap-1.5 bg-red-600 hover:bg-red-500 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete {selectedIds.length} Posts</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
