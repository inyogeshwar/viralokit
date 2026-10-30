"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Share2,
  Send,
  MessageCircle,
  BarChart3,
  RefreshCw,
  Loader2,
  ExternalLink,
  Key,
  Image as ImageIcon,
  CheckCircle2,
  ThumbsUp,
  Repeat,
  Quote,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ChannelsPage() {
  const [activeTab, setActiveTab] = useState<"threads" | "facebook">("threads");

  // Threads State
  const [threadText, setThreadText] = useState("");
  const [threadImageUrl, setThreadImageUrl] = useState("");
  const [isPostingThread, setIsPostingThread] = useState(false);
  const [replyThreadId, setReplyThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // Threads Token Exchanger State
  const [shortLivedToken, setShortLivedToken] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [isExchanging, setIsExchanging] = useState(false);
  const [exchangedToken, setExchangedToken] = useState<string | null>(null);

  // Facebook State
  const [fbPostText, setFbPostText] = useState("");
  const [fbLink, setFbLink] = useState("");
  const [fbPhotoUrl, setFbPhotoUrl] = useState("");
  const [fbPhotoCaption, setFbPhotoCaption] = useState("");
  const [isPostingFb, setIsPostingFb] = useState(false);
  const [fbMode, setFbMode] = useState<"status" | "photo">("status");

  // Fetch capabilities & user
  const { data: authData } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      return res.json();
    },
  });

  const { data: capabilities } = useQuery({
    queryKey: ["meta-account"],
    queryFn: async () => {
      const res = await fetch("/api/meta/account");
      return res.json();
    },
  });

  // Fetch Threads Profile & Posts
  const {
    data: threadsData,
    isLoading: isThreadsLoading,
    refetch: refetchThreads,
  } = useQuery({
    queryKey: ["threads-data"],
    queryFn: async () => {
      const profileRes = await fetch("/api/meta/threads?type=profile");
      const postsRes = await fetch("/api/meta/threads?type=posts&limit=6");
      const profile = await profileRes.json();
      const posts = await postsRes.json();
      return { profile: profile.profile, posts: posts.posts || [] };
    },
    enabled: activeTab === "threads",
  });

  // Fetch Facebook Page Profile & Posts
  const {
    data: fbData,
    isLoading: isFbLoading,
    refetch: refetchFb,
  } = useQuery({
    queryKey: ["fb-data"],
    queryFn: async () => {
      const profileRes = await fetch("/api/meta/facebook?type=profile");
      const postsRes = await fetch("/api/meta/facebook?type=posts&limit=6");
      const profile = await profileRes.json();
      const posts = await postsRes.json();
      return { profile: profile.profile, posts: posts.posts || [] };
    },
    enabled: activeTab === "facebook",
  });

  const handlePostThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadText.trim()) {
      toast.error("Please enter text for your thread post.");
      return;
    }

    setIsPostingThread(true);
    try {
      const res = await fetch("/api/meta/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          text: threadText.trim(),
          mediaType: threadImageUrl.trim() ? "IMAGE" : "TEXT",
          imageUrl: threadImageUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Post published to Threads successfully!");
        setThreadText("");
        setThreadImageUrl("");
        refetchThreads();
      } else {
        toast.error(data.error || "Failed to publish to Threads.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error posting to Threads.");
    } finally {
      setIsPostingThread(false);
    }
  };

  const handleReplyThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyThreadId || !replyText.trim()) return;

    setIsReplying(true);
    try {
      const res = await fetch("/api/meta/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          threadId: replyThreadId,
          text: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Replied to thread successfully!");
        setReplyThreadId(null);
        setReplyText("");
        refetchThreads();
      } else {
        toast.error(data.error || "Failed to reply.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error replying to thread.");
    } finally {
      setIsReplying(false);
    }
  };

  const handleExchangeToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortLivedToken.trim() || !clientSecret.trim()) {
      toast.error("Short-lived token and Client Secret are required.");
      return;
    }

    setIsExchanging(true);
    setExchangedToken(null);
    try {
      const res = await fetch("/api/meta/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "exchange_token",
          shortLivedToken: shortLivedToken.trim(),
          clientSecret: clientSecret.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.accessToken) {
        setExchangedToken(data.accessToken);
        toast.success(`60-Day Token Generated! Valid for ${Math.round(data.expiresIn / 86400)} days.`);
      } else {
        toast.error(data.error || "Failed to exchange token.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error exchanging token.");
    } finally {
      setIsExchanging(false);
    }
  };

  const handlePostFb = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPostingFb(true);
    try {
      const payload: any = { action: fbMode };
      if (fbMode === "status") {
        if (!fbPostText.trim()) {
          toast.error("Please enter status update text.");
          setIsPostingFb(false);
          return;
        }
        payload.message = fbPostText.trim();
        if (fbLink.trim()) payload.link = fbLink.trim();
      } else {
        if (!fbPhotoUrl.trim()) {
          toast.error("Please enter a public photo URL.");
          setIsPostingFb(false);
          return;
        }
        payload.photoUrl = fbPhotoUrl.trim();
        if (fbPhotoCaption.trim()) payload.caption = fbPhotoCaption.trim();
      }

      const res = await fetch("/api/meta/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Published to Facebook Page successfully!");
        setFbPostText("");
        setFbLink("");
        setFbPhotoUrl("");
        setFbPhotoCaption("");
        refetchFb();
      } else {
        toast.error(data.error || "Failed to publish to Facebook.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error publishing to Facebook.");
    } finally {
      setIsPostingFb(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-pink-500 selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Header
          user={authData?.user}
          accountUsername={capabilities?.username}
          isConnected={capabilities?.connected}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
          {/* Top Title Banner */}
          <div className="border-b border-white/[0.08] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 border border-pink-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <Share2 className="w-3 h-3 text-pink-400" />
                  Cross-Platform Channels
                </span>
                <span className="text-[11px] text-zinc-500">• Official Threads API & Facebook Page</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-headline">
                Channels Studio
              </h1>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center bg-zinc-900/90 border border-white/[0.08] p-1 rounded-2xl">
              <button
                onClick={() => setActiveTab("threads")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "threads"
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Threads Studio
              </button>
              <button
                onClick={() => setActiveTab("facebook")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "facebook"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Facebook Page
              </button>
            </div>
          </div>

          {/* TAB 1: THREADS STUDIO */}
          {activeTab === "threads" && (
            <div className="space-y-6">
              {/* Profile Bar */}
              {threadsData?.profile && (
                <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 flex items-center justify-center font-bold text-white text-base">
                      {threadsData.profile.threads_profile_picture_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={threadsData.profile.threads_profile_picture_url}
                          alt="Threads Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        threadsData.profile.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm block">@{threadsData.profile.username}</span>
                      <p className="text-xs text-zinc-400">{threadsData.profile.threads_biography || "Threads Creator"}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchThreads()}
                    disabled={isThreadsLoading}
                    className="text-xs border-white/[0.08]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isThreadsLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              )}

              {/* Threads Composer */}
              <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-pink-400" />
                  Publish New Thread
                </h3>

                <form onSubmit={handlePostThread} className="space-y-3">
                  <textarea
                    rows={4}
                    value={threadText}
                    onChange={(e) => setThreadText(e.target.value)}
                    maxLength={500}
                    placeholder="What's happening? Share thoughts, links, or updates on Threads (up to 500 chars)..."
                    className="w-full bg-zinc-900 border border-white/[0.1] rounded-2xl p-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500 resize-none"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-zinc-500 shrink-0" />
                      <input
                        type="url"
                        value={threadImageUrl}
                        onChange={(e) => setThreadImageUrl(e.target.value)}
                        placeholder="Optional public image URL to attach"
                        className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="text-[11px] text-zinc-500">{500 - threadText.length} left</span>
                      <Button
                        type="submit"
                        disabled={isPostingThread || !threadText.trim()}
                        className="primary-gradient-bg text-white text-xs px-5 py-2 rounded-xl shadow-lg shadow-pink-500/20 font-semibold"
                      >
                        {isPostingThread ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
                        Post to Threads
                      </Button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Recent Threads Feed */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-purple-400" />
                  Recent Published Threads
                </h3>

                <div className="space-y-3">
                  {threadsData?.posts?.map((p: any) => (
                    <div
                      key={p.id}
                      className="bg-zinc-900/60 border border-white/[0.08] rounded-2xl p-4 space-y-3"
                    >
                      <p className="text-xs text-zinc-200 whitespace-pre-wrap">{p.text}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[11px] text-zinc-400">
                        <span className="text-zinc-500">
                          {new Date(p.timestamp).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        <div className="flex items-center gap-2">
                          {p.permalink && (
                            <a
                              href={p.permalink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-pink-400 hover:underline"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyThreadId(p.id)}
                            className="text-[11px] text-zinc-300 hover:text-white h-7 px-2"
                          >
                            Reply
                          </Button>
                        </div>
                      </div>

                      {/* Reply Box if selected */}
                      {replyThreadId === p.id && (
                        <form onSubmit={handleReplyThread} className="pt-2 flex items-center gap-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply to this thread..."
                            className="flex-1 bg-zinc-950 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500"
                          />
                          <Button
                            type="submit"
                            disabled={isReplying}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3"
                          >
                            {isReplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send"}
                          </Button>
                          <button
                            type="button"
                            onClick={() => setReplyThreadId(null)}
                            className="text-xs text-zinc-500 hover:text-white px-1"
                          >
                            Cancel
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 60-Day Threads Token Exchanger Tool */}
              <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-white">60-Day Threads Token Generator</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Exchange a short-lived Threads user token into an official 60-day long-lived token.
                </p>

                <form onSubmit={handleExchangeToken} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="password"
                      value={shortLivedToken}
                      onChange={(e) => setShortLivedToken(e.target.value)}
                      placeholder="Short-Lived Threads Token (TH...)"
                      className="bg-zinc-900 border border-white/[0.1] rounded-xl px-3.5 py-2 text-white placeholder-zinc-600"
                    />
                    <input
                      type="password"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="Threads App Client Secret"
                      className="bg-zinc-900 border border-white/[0.1] rounded-xl px-3.5 py-2 text-white placeholder-zinc-600"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isExchanging}
                      className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-4 py-2 rounded-xl"
                    >
                      {isExchanging ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Key className="w-3.5 h-3.5 mr-1.5" />}
                      Generate 60-Day Token
                    </Button>
                  </div>
                </form>

                {exchangedToken && (
                  <div className="p-3 bg-zinc-950 rounded-xl border border-emerald-500/30 text-xs space-y-1">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 60-Day Token Ready:
                    </span>
                    <p className="font-mono text-[10px] text-zinc-300 break-all bg-black/60 p-2 rounded border border-white/[0.06]">
                      {exchangedToken}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FACEBOOK PAGE STUDIO */}
          {activeTab === "facebook" && (
            <div className="space-y-6">
              {/* Facebook Profile Bar */}
              {fbData?.profile && (
                <div className="bg-[#0C0C0C] border border-blue-500/20 rounded-3xl p-5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-base block">{fbData.profile.name}</span>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                      <span>Followers: <strong>{fbData.profile.followers_count || fbData.profile.fan_count || 0}</strong></span>
                      {fbData.profile.category && <span>Category: {fbData.profile.category}</span>}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchFb()}
                    disabled={isFbLoading}
                    className="text-xs border-white/[0.08]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFbLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              )}

              {/* Facebook Composer */}
              <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-400" />
                    Publish to Facebook Page
                  </h3>

                  <div className="flex items-center bg-zinc-900 p-1 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => setFbMode("status")}
                      className={`px-3 py-1 rounded-lg ${fbMode === "status" ? "bg-blue-600 text-white font-semibold" : "text-zinc-400"}`}
                    >
                      Status / Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setFbMode("photo")}
                      className={`px-3 py-1 rounded-lg ${fbMode === "photo" ? "bg-blue-600 text-white font-semibold" : "text-zinc-400"}`}
                    >
                      Photo Post
                    </button>
                  </div>
                </div>

                <form onSubmit={handlePostFb} className="space-y-3">
                  {fbMode === "status" ? (
                    <>
                      <textarea
                        rows={4}
                        value={fbPostText}
                        onChange={(e) => setFbPostText(e.target.value)}
                        placeholder="Write an announcement or post for your Facebook Page..."
                        className="w-full bg-zinc-900 border border-white/[0.1] rounded-2xl p-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none"
                      />
                      <input
                        type="url"
                        value={fbLink}
                        onChange={(e) => setFbLink(e.target.value)}
                        placeholder="Optional web link to attach to post"
                        className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                      />
                    </>
                  ) : (
                    <>
                      <input
                        type="url"
                        value={fbPhotoUrl}
                        onChange={(e) => setFbPhotoUrl(e.target.value)}
                        placeholder="Public photo URL (HTTPS)"
                        className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                      />
                      <textarea
                        rows={3}
                        value={fbPhotoCaption}
                        onChange={(e) => setFbPhotoCaption(e.target.value)}
                        placeholder="Write a photo caption..."
                        className="w-full bg-zinc-900 border border-white/[0.1] rounded-2xl p-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isPostingFb}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-5 py-2 rounded-xl shadow-lg shadow-blue-500/20 font-semibold"
                    >
                      {isPostingFb ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
                      Publish to Facebook
                    </Button>
                  </div>
                </form>
              </div>

              {/* Recent Facebook Posts */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  Recent Facebook Page Posts
                </h3>

                <div className="space-y-3">
                  {fbData?.posts?.map((p: any) => (
                    <div
                      key={p.id}
                      className="bg-zinc-900/60 border border-white/[0.08] rounded-2xl p-4 space-y-2"
                    >
                      <p className="text-xs text-zinc-200 whitespace-pre-wrap">{p.message || "Photo / Media Post"}</p>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-white/[0.04]">
                        <span>{new Date(p.created_time).toLocaleDateString()}</span>
                        {p.permalink_url && (
                          <a
                            href={p.permalink_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Open on Facebook</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
