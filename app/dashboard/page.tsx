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
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  MessageSquare,
  Search,
  Share2,
  BookOpen,
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { CapabilityBadges } from "@/components/instagram/capability-badges";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatDate } from "@/lib/utils";
import { InstagramMediaItem } from "@/lib/meta/types";
import { PostInsightsModal } from "@/components/posts/post-insights-modal";

const featureCards = [
  {
    title: "Follow-to-Unlock Funnel",
    href: "/automations",
    icon: Zap,
    color: "text-amber-400",
    border: "border-amber-500/20 hover:border-amber-500/40",
    bg: "bg-amber-500/8",
    desc: "Auto-reply to comments. DM links or guides only when the user follows your account. Cloud-executed 24/7 via Meta Webhooks.",
  },
  {
    title: "Business Discovery",
    href: "/discovery",
    icon: Search,
    color: "text-emerald-400",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    bg: "bg-emerald-500/8",
    desc: "Competitor @username lookup, viral hashtag intelligence, 24-hour rolling quota monitor, and live error code resolver.",
  },
  {
    title: "Direct Messaging Suite",
    href: "/messages",
    icon: MessageSquare,
    color: "text-pink-400",
    border: "border-pink-500/20 hover:border-pink-500/40",
    bg: "bg-pink-500/8",
    desc: "Send voice notes (.m4a/.wav), PDF attachments, double-tap heart reactions (❤️), and quoted replies from any device.",
  },
  {
    title: "Threads & Facebook",
    href: "/channels",
    icon: Share2,
    color: "text-purple-400",
    border: "border-purple-500/20 hover:border-purple-500/40",
    bg: "bg-purple-500/8",
    desc: "Cross-post text & photos to Facebook Pages, compose Threads, reply to threads, and exchange 60-day tokens.",
  },
  {
    title: "Meta Developer Docs",
    href: "/docs",
    icon: BookOpen,
    color: "text-blue-400",
    border: "border-blue-500/20 hover:border-blue-500/40",
    bg: "bg-blue-500/8",
    desc: "Offline reader for all 70 official Meta Graph API guides — webhooks, error codes, and publishing rules.",
  },
];

export default function DashboardPage() {
  const [selectedPostForInsights, setSelectedPostForInsights] = useState<InstagramMediaItem | null>(null);

  const { data: authData } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      return res.json();
    },
  });

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

  const statCards = [
    {
      title: "Total Followers",
      value: formatNumber(capabilities?.followersCount ?? analytics?.account?.followersCount),
      icon: Users,
      color: "text-pink-400",
      sub: "Meta Graph v23.0",
    },
    {
      title: "Total Media",
      value: formatNumber(capabilities?.mediaCount ?? analytics?.account?.mediaCount),
      icon: ImageIcon,
      color: "text-purple-400",
      sub: "Images & Carousels",
    },
    {
      title: "Audience Reach",
      value: formatNumber(analytics?.insights?.reach),
      icon: Eye,
      color: "text-indigo-400",
      sub: "28-Day Window",
    },
    {
      title: "Total Interactions",
      value: formatNumber(analytics?.insights?.totalInteractions),
      icon: HeartHandshake,
      color: "text-emerald-400",
      sub: "Likes + Comments + Saves",
    },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans overflow-x-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header
          user={authData?.user}
          accountUsername={capabilities?.username}
          isConnected={capabilities?.connected}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">

          {/* Welcome header */}
          <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-5 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-pink-500/30 bg-pink-500/8 text-pink-300 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                  <span>Meta Graph v23.0 + Threads API</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-headline leading-tight">
                  {capabilities?.connected ? (
                    <>
                      Welcome back,{" "}
                      <span className="text-pink-400">@{username}</span>
                    </>
                  ) : (
                    <>
                      Welcome to{" "}
                      <span className="text-pink-400">ViraloKit</span>
                    </>
                  )}
                </h1>

                <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
                  Meta Graph API publishing engine — follow-to-unlock funnels, voice DMs, cross-platform posting to Facebook and Threads. Runs 24/7 on any device.
                </p>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/automations">
                  <Button className="h-11 px-5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs border-none gap-2 min-w-[48px]">
                    <Zap className="w-4 h-4" />
                    <span>Growth Funnels</span>
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="secondary" className="h-11 px-5 text-zinc-200 text-xs gap-2 min-w-[48px]">
                    <MessageSquare className="w-4 h-4 text-pink-400" />
                    <span>Direct Inbox</span>
                  </Button>
                </Link>
                <Link href="/create">
                  <Button variant="secondary" className="h-11 px-5 text-zinc-200 text-xs gap-2 min-w-[48px]">
                    <PlusSquare className="w-4 h-4 text-purple-400" />
                    <span>Create Post</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.href} href={card.href} className="group">
                  <div
                    className={`bg-zinc-900 border ${card.border} transition-colors rounded-lg p-5 space-y-3 h-full`}
                  >
                    <div
                      className={`w-10 h-10 rounded-md flex items-center justify-center border border-zinc-700 ${card.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm flex items-center justify-between">
                        <span>{card.title}</span>
                        <ArrowRight className={`w-4 h-4 ${card.color} group-hover:translate-x-0.5 transition-transform`} />
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Capability badges */}
          <CapabilityBadges
            capabilities={capabilities}
            isLoading={isCapLoading}
            onRefresh={() => refetchCap()}
          />

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <span className="text-xs font-medium text-zinc-400">{stat.title}</span>
                    <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center border border-zinc-700">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <div className="text-2xl font-bold text-white tracking-tight font-headline">
                      {stat.value || "—"}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <Activity className={`w-3 h-3 ${stat.color}`} />
                      <span>{stat.sub}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent posts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white font-headline">Recent Published Posts</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Fetched directly from Meta Graph API</p>
              </div>
              <Link href="/posts">
                <Button variant="ghost" className="text-sm gap-2 text-pink-400 hover:text-pink-300 hover:bg-pink-500/8 rounded-md h-9">
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {isAnalyticsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-zinc-900 rounded-lg animate-pulse border border-zinc-800" />
                ))}
              </div>
            ) : analytics?.recentMedia && analytics.recentMedia.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {analytics.recentMedia.slice(0, 4).map((post: any) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPostForInsights(post)}
                    className="group relative rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 aspect-square cursor-pointer hover:border-pink-500/50 transition-colors text-left w-full"
                    aria-label={`View insights for: ${post.caption || "Post"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.media_url || post.thumbnail_url}
                      alt={post.caption || "Post"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                      <p className="text-white line-clamp-2 text-xs font-medium leading-snug">
                        {post.caption || "No caption"}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-zinc-300 mt-2">
                        <span>{formatDate(post.timestamp)}</span>
                        <span className="text-pink-400 font-semibold flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          Insights
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-zinc-900 rounded-lg border border-zinc-800">
                <div className="w-12 h-12 rounded-lg bg-zinc-800 text-pink-400 flex items-center justify-center mx-auto mb-4 border border-zinc-700">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-base text-white mb-2">No published posts yet</h3>
                <p className="text-sm text-zinc-400 max-w-xs mx-auto mb-5">
                  Create and publish your first image or carousel post directly to Instagram.
                </p>
                <Link href="/create">
                  <Button className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 h-10 rounded-md">
                    Create Post
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Connect prompt */}
          {!capabilities?.connected && !isCapLoading && (
            <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-zinc-800 flex items-center justify-center border border-zinc-700 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Connect your Instagram account</p>
                  <p className="text-xs text-zinc-400">Official Meta Graph API v23.0 — zero scraping, zero shadowban risk</p>
                </div>
              </div>
              <Link href="/settings">
                <Button className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold px-5 h-10 rounded-md shrink-0">
                  Connect Now
                </Button>
              </Link>
            </div>
          )}
        </main>
      </div>

      {selectedPostForInsights && (
        <PostInsightsModal
          post={selectedPostForInsights}
          onClose={() => setSelectedPostForInsights(null)}
        />
      )}

      <MobileNav />
    </div>
  );
}
