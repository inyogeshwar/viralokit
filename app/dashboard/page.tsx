"use client";

import React from "react";
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
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { CapabilityBadges } from "@/components/instagram/capability-badges";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatDate } from "@/lib/utils";

export default function DashboardPage() {
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

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header
          user={authData?.user}
          accountUsername={capabilities?.username}
          isConnected={capabilities?.connected}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent p-6 rounded-2xl border border-zinc-800/80">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                Welcome to PostGram
              </h1>
              <p className="text-sm text-zinc-400">
                {capabilities?.connected
                  ? `Active connection with @${capabilities.username}. Ready to publish and analyze.`
                  : "Connect your Instagram Professional account to publish posts and track insights."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link href="/create">
                <Button className="gap-2 text-xs h-9">
                  <PlusSquare className="w-4 h-4" />
                  <span>Create Post</span>
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="secondary" className="gap-2 text-xs h-9">
                  <BarChart3 className="w-4 h-4" />
                  <span>View Analytics</span>
                </Button>
              </Link>
              <Link href="/ai-analysis">
                <Button variant="outline" className="gap-2 text-xs h-9 text-pink-300 border-pink-500/30">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>AI Audit</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Account Capabilities Matrix */}
          <CapabilityBadges
            capabilities={capabilities}
            isLoading={isCapLoading}
            onRefresh={() => refetchCap()}
          />

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-zinc-400">Followers</CardTitle>
                <Users className="w-4 h-4 text-pink-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(capabilities?.followersCount ?? analytics?.account?.followersCount)}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Official Meta Count</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-zinc-400">Total Posts</CardTitle>
                <ImageIcon className="w-4 h-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(capabilities?.mediaCount ?? analytics?.account?.mediaCount)}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Published Media</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-zinc-400">Reach</CardTitle>
                <Eye className="w-4 h-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(analytics?.insights?.reach)}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {analytics?.insights?.reach !== null && analytics?.insights?.reach !== undefined
                    ? "28-day Reach"
                    : "Not available for this token"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-zinc-400">Interactions</CardTitle>
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(analytics?.insights?.totalInteractions)}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {analytics?.insights?.totalInteractions !== null && analytics?.insights?.totalInteractions !== undefined
                    ? "Total Engagements"
                    : "Not available"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Published Media Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Recent Published Posts</h2>
                <p className="text-xs text-zinc-400">Directly fetched from Meta Graph API</p>
              </div>
              <Link href="/posts">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-pink-400">
                  <span>View All Posts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {isAnalyticsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-zinc-900 rounded-xl animate-pulse border border-zinc-800" />
                ))}
              </div>
            ) : analytics?.recentMedia && analytics.recentMedia.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {analytics.recentMedia.slice(0, 4).map((post: any) => (
                  <div
                    key={post.id}
                    className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 aspect-square"
                  >
                    <img
                      src={post.media_url || post.thumbnail_url}
                      alt={post.caption || "Post"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between text-xs">
                      <div className="flex justify-end">
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                          {post.media_type}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white line-clamp-2 text-[11px] font-medium leading-snug">
                          {post.caption || "No caption"}
                        </p>
                        <p className="text-zinc-400 text-[10px]">{formatDate(post.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center bg-zinc-900/40 border-dashed border-zinc-800">
                <ImageIcon className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h3 className="font-semibold text-sm text-zinc-300">No Published Posts Found</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
                  Create and publish your first image or carousel post to Instagram with PostGram.
                </p>
                <Link href="/create">
                  <Button size="sm" className="text-xs">
                    Create New Post
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
