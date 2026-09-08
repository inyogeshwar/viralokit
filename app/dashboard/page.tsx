"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  PlusSquare,
  BarChart3,
  Sparkles,
  Users,
  Eye,
  HeartHandshake,
  Image as ImageIcon,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { CapabilityBadges } from "@/components/instagram/capability-badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatDate } from "@/lib/utils";
import { InstagramMediaItem } from "@/lib/meta/types";
import { PostInsightsModal } from "@/components/posts/post-insights-modal";

export default function DashboardPage() {
  const [selectedPostForInsights, setSelectedPostForInsights] = useState<InstagramMediaItem | null>(null);

  // 1. Fetch system & user status
  const { data: authData } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      return res.json();
    },
  });

  // 2. Fetch Instagram Account Capabilities
  const {
    data: capabilities,
    isLoading: isCapLoading,
    refetch: refetchCap,
  } = useQuery({
    queryKey: ["meta-account"],
    queryFn: async () => {
      const res = await fetch("/api/meta/account");
      return res.json();
    },
  });

  // 3. Fetch Official Analytics & Recent Posts
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["meta-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/meta/analytics");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: Boolean(capabilities?.connected),
  });

  const username = capabilities?.username || "Creator";

  return (
    <div className="flex min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-pink-500 selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Header
          user={authData?.user}
          accountUsername={capabilities?.username}
          isConnected={capabilities?.connected}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Welcome Bento Hero */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#120516] via-[#0C0C0C] to-[#050C16] p-6 sm:p-8 shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                  <span>Meta Graph v23.0 Studio Live</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-headline">
                  {capabilities?.connected ? (
                    <>
                      Welcome back, <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">@{username}</span>
                    </>
                  ) : (
                    <>
                      Welcome to <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">ViraloKit</span>
                    </>
                  )}
                </h1>
                <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
                  {capabilities?.connected
                    ? `Your Instagram Professional studio is connected. High-definition carousels, 25 GB isolated CDN, and multi-model AI are ready.`
                    : "Connect your Instagram Professional or Business account to enable zero-cost publishing, real-time telemetry, and AI captioning."}
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/create">
                  <Button className="h-11 px-5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium text-xs shadow-lg shadow-pink-500/20 transition-all cursor-pointer gap-2">
                    <PlusSquare className="w-4 h-4" />
                    <span>Create Post</span>
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button variant="secondary" className="h-11 px-5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.1] font-medium text-xs transition-all cursor-pointer gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    <span>Analytics</span>
                  </Button>
                </Link>
                <Link href="/ai-analysis">
                  <Button variant="outline" className="h-11 px-5 rounded-xl bg-purple-500/[0.06] hover:bg-purple-500/[0.15] text-purple-300 border border-purple-500/30 font-medium text-xs transition-all cursor-pointer gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>AI Audit</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Account Capabilities Matrix */}
          <CapabilityBadges
            capabilities={capabilities}
            isLoading={isCapLoading}
            onRefresh={() => refetchCap()}
          />

          {/* Bento Stat Telemetry Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Followers Card */}
            <Card className="bg-[#0C0C0C] border-white/[0.08] hover:border-pink-500/40 transition-all duration-300 rounded-2xl group shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-medium text-zinc-400">Total Followers</span>
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/20 group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4 text-pink-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-headline">
                  {formatNumber(capabilities?.followersCount ?? analytics?.account?.followersCount)}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <Activity className="w-3 h-3 text-pink-400" />
                  <span>Official Graph v23.0 Sync</span>
                </div>
              </CardContent>
            </Card>

            {/* Published Posts Card */}
            <Card className="bg-[#0C0C0C] border-white/[0.08] hover:border-purple-500/40 transition-all duration-300 rounded-2xl group shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-medium text-zinc-400">Total Media</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-headline">
                  {formatNumber(capabilities?.mediaCount ?? analytics?.account?.mediaCount)}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <Zap className="w-3 h-3 text-purple-400" />
                  <span>Images & Carousels</span>
                </div>
              </CardContent>
            </Card>

            {/* Reach Card */}
            <Card className="bg-[#0C0C0C] border-white/[0.08] hover:border-indigo-500/40 transition-all duration-300 rounded-2xl group shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-medium text-zinc-400">Audience Reach</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                  <Eye className="w-4 h-4 text-indigo-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-headline">
                  {formatNumber(analytics?.insights?.reach)}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <TrendingUp className="w-3 h-3 text-indigo-400" />
                  <span>{analytics?.insights?.reach ? "28-Day Window" : "Direct Graph Telemetry"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Interactions Card */}
            <Card className="bg-[#0C0C0C] border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 rounded-2xl group shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-medium text-zinc-400">Total Interactions</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-4 h-4 text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-headline">
                  {formatNumber(analytics?.insights?.totalInteractions)}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Likes + Comments + Saves</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Published Media Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white font-headline">Recent Published Posts</h2>
                <p className="text-xs text-zinc-400">Direct media feed fetched from Meta Graph API v23.0</p>
              </div>
              <Link href="/posts">
                <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 cursor-pointer">
                  <span>View All Posts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {isAnalyticsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-[#0C0C0C] rounded-2xl animate-pulse border border-white/[0.08]" />
                ))}
              </div>
            ) : analytics?.recentMedia && analytics.recentMedia.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {analytics.recentMedia.slice(0, 4).map((post: any) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPostForInsights(post)}
                    className="group relative rounded-2xl overflow-hidden bg-[#0C0C0C] border border-white/[0.08] aspect-square cursor-pointer hover:border-pink-500/60 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10"
                  >
                    <img
                      src={post.media_url || post.thumbnail_url}
                      alt={post.caption || "Post"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-xs">
                      <div className="flex justify-end">
                        <Badge variant="secondary" className="text-[10px] py-0.5 px-2 bg-black/70 backdrop-blur-md border border-white/[0.1] text-zinc-200">
                          {post.media_type}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-white line-clamp-2 text-xs font-medium leading-snug">
                          {post.caption || "No caption"}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span>{formatDate(post.timestamp)}</span>
                          <span className="text-pink-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <BarChart3 className="w-3 h-3" />
                            Insights
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-[#0C0C0C] rounded-2xl border border-dashed border-white/[0.1] space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-base text-zinc-200 font-headline">No Published Posts Yet</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Create and publish your first image or carousel post directly to Instagram using ViraloKit.
                  </p>
                </div>
                <Link href="/create">
                  <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white text-xs cursor-pointer">
                    Create New Post
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Post Insights Modal */}
      <PostInsightsModal
        post={selectedPostForInsights}
        onClose={() => setSelectedPostForInsights(null)}
      />

      <MobileNav />
    </div>
  );
}
