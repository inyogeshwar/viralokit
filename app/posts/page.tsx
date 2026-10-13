"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutGrid,
  List,
  Trash2,
  ExternalLink,
  Heart,
  MessageCircle,
  Eye,
  Calendar,
  Clock,
  Send,
  Loader2,
  Plus,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber } from "@/lib/utils";
import { InstagramMediaItem } from "@/lib/meta/types";
import { PostInsightsModal } from "@/components/posts/post-insights-modal";

export default function PostsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"published" | "scheduled">("published");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [postToDelete, setPostToDelete] = useState<InstagramMediaItem | null>(null);
  const [selectedPostForInsights, setSelectedPostForInsights] = useState<InstagramMediaItem | null>(null);
  const [publishingScheduledId, setPublishingScheduledId] = useState<string | null>(null);

  // 1. Fetch Published Posts from Meta API
  const { data: publishedData, isLoading: isPublishedLoading, refetch: refetchPublished } = useQuery({
    queryKey: ["meta-posts"],
    queryFn: async () => {
      const res = await fetch("/api/meta/posts?limit=30");
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const posts: InstagramMediaItem[] = publishedData?.posts || [];

  // 2. Fetch Scheduled Posts Queue from Supabase with 12s live polling
  const { data: scheduledData, isLoading: isScheduledLoading, refetch: refetchScheduled } = useQuery({
    queryKey: ["meta-scheduled-posts"],
    queryFn: async () => {
      const res = await fetch("/api/meta/scheduled");
      if (!res.ok) throw new Error("Failed to fetch scheduled posts");
      return res.json();
    },
    refetchInterval: 12000, // Checks every 12 seconds so scheduled posts auto-publish on time
  });

  const scheduledPosts = scheduledData?.posts || [];

  // Notify when a scheduled post was auto-published by the engine
  React.useEffect(() => {
    if (scheduledData?.newlyPublishedCount && scheduledData.newlyPublishedCount > 0) {
      toast.success(
        `🎉 ${scheduledData.newlyPublishedCount} scheduled post(s) automatically published to Instagram!`,
        { duration: 5000 }
      );
      refetchPublished();
      queryClient.invalidateQueries({ queryKey: ["meta-posts"] });
    }
  }, [scheduledData?.newlyPublishedCount]);

  // Client-side auto-trigger fallback for due posts
  React.useEffect(() => {
    if (scheduledPosts.length > 0 && !publishingScheduledId) {
      const now = new Date();
      const overduePost = scheduledPosts.find(
        (p: any) => p.scheduled_for && new Date(p.scheduled_for) <= now
      );
      if (overduePost) {
        handlePublishNow(overduePost.id);
      }
    }
  }, [scheduledPosts, publishingScheduledId]);

  // 3. Single Published Post Deletion
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
    onSuccess: () => {
      toast.success("Post deleted from Instagram!");
      setPostToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["meta-posts"] });
      queryClient.invalidateQueries({ queryKey: ["meta-analytics"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete post");
      setPostToDelete(null);
    },
  });

  // 4. Cancel a Scheduled Post
  const handleCancelScheduled = async (postId: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled post?")) return;
    try {
      const res = await fetch(`/api/meta/scheduled?id=${postId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Scheduled post cancelled.");
        refetchScheduled();
      } else {
        toast.error(data.error || "Failed to cancel post");
      }
    } catch {
      toast.error("Network error cancelling post");
    }
  };

  // 5. Trigger Immediate Publish of a Scheduled Post
  const handlePublishNow = async (postId: string) => {
    setPublishingScheduledId(postId);
    try {
      const res = await fetch("/api/meta/scheduled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Published to Instagram successfully!");
        refetchScheduled();
        refetchPublished();
      } else {
        toast.error(data.error || "Failed to publish post");
      }
    } catch {
      toast.error("Network error publishing post");
    } finally {
      setPublishingScheduledId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-pink-500 selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 border border-pink-500/25 px-2.5 py-0.5 rounded-full">
                  Content Manager
                </span>
                <span className="text-[11px] text-zinc-500">• Live Feed & Scheduling</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-headline">
                Manage Posts
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Track live published media on Instagram or monitor your upcoming scheduled queue.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/create">
                <Button size="sm" className="text-xs gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium shadow-md shadow-pink-500/20 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  <span>Create Post</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Tab Switcher: Published vs Scheduled */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("published")}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "published"
                    ? "bg-white text-black shadow-md"
                    : "bg-black/60 text-zinc-400 hover:text-white border border-white/[0.08]"
                }`}
              >
                <span>Published Media</span>
                <Badge variant="secondary" className="text-[9px] py-0 px-1.5 bg-black/10 text-inherit">
                  {posts.length}
                </Badge>
              </button>

              <button
                onClick={() => setActiveTab("scheduled")}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "scheduled"
                    ? "bg-pink-500 text-white shadow-md shadow-pink-500/20"
                    : "bg-black/60 text-zinc-400 hover:text-white border border-white/[0.08]"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Scheduled Queue</span>
                {scheduledPosts.length > 0 && (
                  <Badge variant="secondary" className="text-[9px] py-0 px-1.5 bg-white/20 text-white">
                    {scheduledPosts.length}
                  </Badge>
                )}
              </button>
            </div>

            {/* Grid / List Switcher (only for published view) */}
            {activeTab === "published" && (
              <div className="flex items-center bg-black/60 border border-white/[0.1] p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    viewMode === "grid" ? "bg-white/[0.12] text-white" : "text-zinc-400 hover:text-white"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    viewMode === "list" ? "bg-white/[0.12] text-white" : "text-zinc-400 hover:text-white"
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* ==================== TAB 1: PUBLISHED POSTS ==================== */}
          {activeTab === "published" && (
            <>
              {isPublishedLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="aspect-square bg-[#0C0C0C] rounded-2xl border border-white/[0.08] animate-pulse"
                    />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="p-12 text-center bg-[#0C0C0C] rounded-3xl border border-dashed border-white/[0.1] space-y-4">
                  <p className="text-zinc-300 font-semibold text-base font-headline">No published posts found on this Instagram account.</p>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Publish your first post through ViraloKit Creator Studio to see it appear here.
                  </p>
                  <Link href="/create">
                    <Button size="sm" className="text-xs bg-pink-500 hover:bg-pink-600 text-white cursor-pointer">
                      Create Post
                    </Button>
                  </Link>
                </div>
              ) : viewMode === "grid" ? (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPostForInsights(post)}
                      className="group relative rounded-3xl overflow-hidden bg-[#0C0C0C] border border-white/[0.08] hover:border-pink-500/50 hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer"
                    >
                      {/* Media Thumbnail */}
                      <div className="relative aspect-square bg-[#050505] overflow-hidden">
                        <img
                          src={post.media_url || post.thumbnail_url}
                          alt={post.caption || "Instagram post"}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20400%22%3E%3Crect%20fill%3D%22%2318181b%22%20width%3D%22400%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%2371717a%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EInstagram%20Media%3C%2Ftext%3E%3C%2Fsvg%3E";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Bar on Image */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
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
                            onClick={(e) => e.stopPropagation()}
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

                          <div className="flex items-center justify-between pt-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPostForInsights(post);
                              }}
                              className="text-[11px] h-7 px-2 text-zinc-300 hover:text-white hover:bg-white/[0.08] gap-1"
                            >
                              <BarChart3 className="w-3 h-3 text-purple-400" />
                              <span>Insights</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPostToDelete(post);
                              }}
                              className="text-[11px] h-7 px-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-2.5">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="p-3 rounded-2xl bg-[#0C0C0C] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
                    >
                      <div
                        onClick={() => setSelectedPostForInsights(post)}
                        className="flex items-center gap-3 min-w-0 cursor-pointer flex-1 group"
                      >
                        <div className="w-14 h-14 rounded-xl bg-zinc-950 overflow-hidden shrink-0 border border-zinc-800 group-hover:border-purple-500 transition-colors">
                          <img
                            src={post.media_url || post.thumbnail_url}
                            alt="Thumbnail"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20fill%3D%22%2318181b%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%2371717a%22%20font-family%3D%22sans-serif%22%20font-size%3D%2210%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EIG%3C%2Ftext%3E%3C%2Fsvg%3E";
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-[9px] py-0">
                              {post.media_type}
                            </Badge>
                            <span className="text-[10px] text-zinc-500">{formatDate(post.timestamp)}</span>
                          </div>
                          <p className="text-xs text-zinc-200 truncate group-hover:text-purple-300 transition-colors">
                            {post.caption || "No caption"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-pink-400" />
                            <span>{formatNumber(post.like_count)}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                            <span>{formatNumber(post.comments_count)}</span>
                          </span>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPostToDelete(post)}
                          className="h-8 px-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ==================== TAB 2: SCHEDULED QUEUE ==================== */}
          {activeTab === "scheduled" && (
            <div className="space-y-4">
              {isScheduledLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-[#0C0C0C] rounded-2xl border border-white/[0.08] animate-pulse" />
                  ))}
                </div>
              ) : scheduledPosts.length === 0 ? (
                <div className="p-12 text-center bg-[#0C0C0C] rounded-3xl border border-dashed border-white/[0.1] space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mx-auto">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-zinc-200 font-headline">No Scheduled Posts in Queue</h3>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Schedule posts in advance using ViraloKit Studio. When scheduling a post, pick a future date & time.
                    </p>
                  </div>
                  <Link href="/create">
                    <Button size="sm" className="text-xs bg-pink-500 hover:bg-pink-600 text-white cursor-pointer">
                      Schedule a Post
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledPosts.map((post: any) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-3xl bg-[#0C0C0C] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:border-pink-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Media preview */}
                        <div className="w-16 h-16 rounded-2xl bg-zinc-950 overflow-hidden shrink-0 border border-white/[0.1]">
                          {post.imageUrls?.[0] ? (
                            <img src={post.imageUrls[0]} alt="Media" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600">No Img</div>
                          )}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {post.isDue || new Date(post.scheduled_for) <= new Date() ? (
                              <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-500/40 bg-emerald-500/15 animate-pulse">
                                <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />
                                Due Now • Auto-Publishing...
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/30 bg-amber-500/10">
                                <Clock className="w-2.5 h-2.5 mr-1" />
                                Scheduled for: {new Date(post.scheduled_for).toLocaleString()}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-[9px] py-0">
                              {post.media_type}
                            </Badge>
                          </div>

                          <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                            {post.caption || <span className="text-zinc-500 italic">No caption provided</span>}
                          </p>
                        </div>
                      </div>

                      {/* Scheduled Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <Button
                          size="sm"
                          onClick={() => handlePublishNow(post.id)}
                          disabled={publishingScheduledId === post.id}
                          className="text-xs h-8 px-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-medium cursor-pointer"
                        >
                          {publishingScheduledId === post.id || post.isDue || new Date(post.scheduled_for) <= new Date() ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                          ) : (
                            <Send className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          <span>
                            {publishingScheduledId === post.id || post.isDue || new Date(post.scheduled_for) <= new Date()
                              ? "Publishing..."
                              : "Publish Now"}
                          </span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelScheduled(post.id)}
                          className="text-xs h-8 px-2.5 rounded-xl border-white/[0.1] text-zinc-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          <span>Cancel</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <MobileNav />

      {/* Single Post Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0C0C0C] border border-white/[0.1] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white font-headline">Delete Instagram Post</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to delete this post from Instagram? This permanently removes the post from Meta servers.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPostToDelete(null)}
                className="text-xs border-white/[0.1]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => singleDeleteMutation.mutate(postToDelete.id)}
                disabled={singleDeleteMutation.isPending}
                className="text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                {singleDeleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Insights Modal */}
      {selectedPostForInsights && (
        <PostInsightsModal
          post={selectedPostForInsights}
          onClose={() => setSelectedPostForInsights(null)}
        />
      )}
    </div>
  );
}
