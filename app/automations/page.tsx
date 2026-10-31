"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Zap,
  Copy,
  Check,
  Play,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  Lock,
  Globe,
  Radio,
  FileText,
  Volume2,
  Plus,
  RefreshCw,
  Loader2,
  ShoppingBag,
  ExternalLink,
  Trash2,
  Layers,
  Tag,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const WISHLINK_TEMPLATES = [
  {
    id: "product_drop",
    name: "🛍️ Wishlink Product Drop",
    text: "Hey @{username}! 🛍️ Here is the exact product link from this post:\n\n🔗 {link}\n\nTap above to view product details and buy! ✨",
  },
  {
    id: "outfit",
    name: "👗 Outfit & Aesthetic Links",
    text: "Hey @{username}! 🎀 Here are all the outfit & item links from this reel:\n\n✨ {link}\n\nSave this for later! 💖",
  },
  {
    id: "discount",
    name: "🎟️ Exclusive Discount & Deal",
    text: "Hey @{username}! 🎟️ Special Creator Discount unlocked for you:\n\n👉 {link}\n\nUse this direct link for extra discount at checkout! 🔥",
  },
  {
    id: "custom",
    name: "📝 Custom Template",
    text: "Hey @{username}! Here is your link: {link} 🚀 Enjoy!",
  },
];

export default function AutomationsPage() {
  const [activeTab, setActiveTab] = useState<"wishlink" | "global" | "runner">("wishlink");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // --- Wishlink Studio State ---
  const [wishlinkMode, setWishlinkMode] = useState<"specific" | "all">("specific");
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [wishlinkKeyword, setWishlinkKeyword] = useState("LINK");
  const [wishlinkProductUrl, setWishlinkProductUrl] = useState("https://wishlink.com/in.yogeshwar/");
  const [selectedTemplateId, setSelectedTemplateId] = useState("product_drop");
  const [wishlinkMessageTemplate, setWishlinkMessageTemplate] = useState(WISHLINK_TEMPLATES[0].text);
  const [wishlinkRequireFollow, setWishlinkRequireFollow] = useState(true);
  const [wishlinkPublicReply, setWishlinkPublicReply] = useState("Sent you the direct link in DM! 🛍️ Check your inbox @{username}!");
  const [isSavingWishlink, setIsSavingWishlink] = useState(false);

  // --- Global Funnel State ---
  const [globalKeyword, setGlobalKeyword] = useState("GUIDE");
  const [globalRequireFollow, setGlobalRequireFollow] = useState(true);
  const [globalPublicReply, setGlobalPublicReply] = useState("Sent you the resource in DM! 📩 Check your inbox @{username}!");
  const [globalFollowGateMsg, setGlobalFollowGateMsg] = useState(
    "Hey @{username}! 👋 Follow our account first to unlock this exclusive resource! Once followed, reply 'DONE' 🚀"
  );
  const [globalUnlockedMsg, setGlobalUnlockedMsg] = useState(
    "Here is your exclusive link: https://viralokit.vercel.app 🚀 Enjoy!"
  );
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);

  // --- Manual Runner State ---
  const [targetMediaId, setTargetMediaId] = useState("latest");
  const [isRunningManual, setIsRunningManual] = useState(false);
  const [runLogs, setRunLogs] = useState<any[] | null>(null);

  // Fetch active funnels
  const {
    data: funnelsData,
    isLoading: isFunnelsLoading,
    refetch: refetchFunnels,
  } = useQuery({
    queryKey: ["growth-funnels"],
    queryFn: async () => {
      const res = await fetch("/api/meta/growth-funnel");
      return res.json();
    },
  });

  // Fetch recent posts for Wishlink Post Picker
  const {
    data: postsData,
    isLoading: isPostsLoading,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ["recent-posts-picker"],
    queryFn: async () => {
      const res = await fetch("/api/meta/posts?limit=12");
      return res.json();
    },
  });

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/meta/webhook`
      : "https://viralokit.vercel.app/api/meta/webhook";
  const verifyToken = "viralokit_webhook_secure";

  const handleCopy = (text: string, type: "url" | "token") => {
    navigator.clipboard.writeText(text);
    if (type === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  const handleTemplateSelect = (tmpl: typeof WISHLINK_TEMPLATES[0]) => {
    setSelectedTemplateId(tmpl.id);
    setWishlinkMessageTemplate(tmpl.text);
  };

  const handleSaveWishlinkAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishlinkKeyword.trim()) {
      toast.error("Please enter a trigger keyword (e.g. LINK or BUY).");
      return;
    }
    if (!wishlinkProductUrl.trim()) {
      toast.error("Please enter your Wishlink or product URL.");
      return;
    }

    if (wishlinkMode === "specific" && !selectedPost) {
      toast.error("Please select a specific Instagram post/reel below or choose 'Apply to All Posts'.");
      return;
    }

    setIsSavingWishlink(true);
    try {
      const finalDmText = wishlinkMessageTemplate.replace(/\{link\}/gi, wishlinkProductUrl.trim());

      const res = await fetch("/api/meta/growth-funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_rule",
          keyword: wishlinkKeyword.trim().toUpperCase(),
          publicReplyTemplate: wishlinkPublicReply.trim(),
          requireFollow: wishlinkRequireFollow,
          followGateMessage: `Hey @{username}! 👋 Follow our account first to unlock this link! Once followed, reply 'DONE' 🛍️`,
          unlockedContentText: finalDmText,
          targetMediaId: wishlinkMode === "specific" ? selectedPost?.id : undefined,
          targetMediaCaption: wishlinkMode === "specific" ? selectedPost?.caption?.slice(0, 100) : undefined,
          targetMediaPermalink: wishlinkMode === "specific" ? selectedPost?.permalink : undefined,
          funnelType: "wishlink",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Wishlink automation activated for "${wishlinkKeyword.toUpperCase()}"!`);
        refetchFunnels();
      } else {
        toast.error(data.error || "Failed to save Wishlink rule.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error saving Wishlink rule.");
    } finally {
      setIsSavingWishlink(false);
    }
  };

  const handleSaveGlobalFunnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalKeyword.trim()) {
      toast.error("Please enter a trigger keyword.");
      return;
    }

    setIsSavingGlobal(true);
    try {
      const res = await fetch("/api/meta/growth-funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_rule",
          keyword: globalKeyword.trim().toUpperCase(),
          publicReplyTemplate: globalPublicReply.trim(),
          requireFollow: globalRequireFollow,
          followGateMessage: globalFollowGateMsg.trim(),
          unlockedContentText: globalUnlockedMsg.trim(),
          funnelType: "keyword",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Global funnel rule activated for "${globalKeyword.toUpperCase()}"!`);
        refetchFunnels();
      } else {
        toast.error(data.error || "Failed to save rule.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error.");
    } finally {
      setIsSavingGlobal(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const res = await fetch("/api/meta/growth-funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_rule", ruleId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Rule removed.");
        refetchFunnels();
      }
    } catch {
      toast.error("Failed to delete rule.");
    }
  };

  const handleRunManual = async () => {
    setIsRunningManual(true);
    setRunLogs(null);
    try {
      const res = await fetch("/api/meta/growth-funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "run_manual",
          mediaId: targetMediaId.trim() || "latest",
          keyword: wishlinkKeyword.trim(),
          publicReplyTemplate: wishlinkPublicReply,
          requireFollow: wishlinkRequireFollow,
          unlockedContentText: wishlinkMessageTemplate.replace(/\{link\}/gi, wishlinkProductUrl),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRunLogs(data.results || []);
        toast.success(
          `Scanned ${data.totalCommentsChecked} comments. Processed ${data.processedCount} matching comments!`
        );
      } else {
        toast.error(data.error || "Manual scan failed.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error running scan.");
    } finally {
      setIsRunningManual(false);
    }
  };

  const activeFunnels = funnelsData?.funnels || [];
  const recentPosts = postsData?.posts || [];

  return (
    <div className="flex h-screen bg-[#080808] text-zinc-100 antialiased overflow-hidden selection:bg-pink-500/20 selection:text-pink-300">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Header Title */}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30">
                <ShoppingBag className="w-3 h-3 text-pink-400" />
                Wishlink & ManyChat Alternative
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1.5">
              Social Growth & DM Automation Studio
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Send product links, affiliate collections, or guides automatically when someone comments on your Instagram posts!
            </p>
          </div>

          {/* Webhook Status Card */}
          <div className="p-4 sm:p-5 rounded-lg bg-zinc-900 border border-zinc-800 relative overflow-hidden shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-pink-500/10 flex items-center justify-center text-pink-400 shrink-0">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    24/7 Meta Cloud Webhook
                    <Badge className="bg-emerald-500/15 text-emerald-400 text-[9px] px-1.5 py-0 h-4 border-emerald-500/30">
                      Active In Cloud
                    </Badge>
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Works 24/7 on Vercel without keeping your laptop or phone on.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="bg-zinc-900/60 p-2.5 rounded-md border border-white/[0.04] flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-semibold">Callback URL</span>
                  <span className="text-xs font-mono text-zinc-300 truncate block">{webhookUrl}</span>
                </div>
                <button
                  onClick={() => handleCopy(webhookUrl, "url")}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 shrink-0"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="bg-zinc-900/60 p-2.5 rounded-md border border-white/[0.04] flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-semibold">Verify Token</span>
                  <span className="text-xs font-mono text-zinc-300 truncate block">{verifyToken}</span>
                </div>
                <button
                  onClick={() => handleCopy(verifyToken, "token")}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 shrink-0"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Studio Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <button
              onClick={() => setActiveTab("wishlink")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold transition-all ${
                activeTab === "wishlink"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Wishlink & Post DM Studio
            </button>

            <button
              onClick={() => setActiveTab("global")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold transition-all ${
                activeTab === "global"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Global Keywords (All Posts)
            </button>

            <button
              onClick={() => setActiveTab("runner")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold transition-all ${
                activeTab === "runner"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Scan Now (Test Runner)
            </button>
          </div>

          {/* TAB 1: WISHLINK & POST-SPECIFIC DM STUDIO */}
          {activeTab === "wishlink" && (
            <div className="space-y-6">
              <form onSubmit={handleSaveWishlinkAutomation} className="p-5 sm:p-6 rounded-lg bg-zinc-900 border border-zinc-800 space-y-5 shadow-2xl">
                <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-pink-400" />
                      Create Wishlink Post Automation
                    </h2>
                    <p className="text-[11px] text-zinc-500">
                      When someone comments your trigger keyword on a specific post, ViraloKit sends the exact product link instantly in DM!
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-md border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setWishlinkMode("specific")}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        wishlinkMode === "specific" ? "bg-pink-600 text-white" : "text-zinc-400"
                      }`}
                    >
                      Specific Post
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWishlinkMode("all");
                        setSelectedPost(null);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        wishlinkMode === "all" ? "bg-pink-600 text-white" : "text-zinc-400"
                      }`}
                    >
                      All Posts
                    </button>
                  </div>
                </div>

                {/* Specific Post Picker */}
                {wishlinkMode === "specific" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 block flex items-center justify-between">
                      <span>1. Select Specific Instagram Post / Reel:</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => refetchPosts()}
                        disabled={isPostsLoading}
                        className="text-[10px] text-zinc-500 h-6 px-1.5"
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${isPostsLoading ? "animate-spin" : ""}`} /> Refresh Posts
                      </Button>
                    </label>

                    {selectedPost ? (
                      <div className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {selectedPost.thumbnail_url || selectedPost.media_url ? (
                            <img
                              src={selectedPost.thumbnail_url || selectedPost.media_url}
                              alt="Post"
                              className="w-12 h-12 rounded-md object-cover shrink-0 border border-zinc-800"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-zinc-800 flex items-center justify-center shrink-0">
                              <ImageIcon className="w-5 h-5 text-zinc-500" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">
                              {selectedPost.caption || "Instagram Media Post"}
                            </span>
                            <span className="text-[10px] text-pink-300 font-mono block">
                              Media ID: {selectedPost.id} • {selectedPost.media_type}
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPost(null)}
                          className="text-[10px] border-zinc-800 text-zinc-400 hover:text-white"
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
                        {isPostsLoading ? (
                          <div className="col-span-full py-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-pink-400" /> Loading your recent Instagram posts...
                          </div>
                        ) : recentPosts.length === 0 ? (
                          <div className="col-span-full py-6 text-center text-xs text-zinc-500">
                            No posts found. You can also paste Media ID or choose "All Posts".
                          </div>
                        ) : (
                          recentPosts.map((post: any) => (
                            <button
                              key={post.id}
                              type="button"
                              onClick={() => setSelectedPost(post)}
                              className="text-left p-2 rounded-md bg-zinc-900/80 border border-zinc-800 hover:border-pink-500/50 hover:bg-zinc-800/80 transition-all group flex flex-col justify-between"
                            >
                              <div className="w-full aspect-square rounded-lg bg-zinc-800 overflow-hidden mb-1.5 relative">
                                {post.thumbnail_url || post.media_url ? (
                                  <img
                                    src={post.thumbnail_url || post.media_url}
                                    alt="Post"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                    <ImageIcon className="w-6 h-6" />
                                  </div>
                                )}
                                <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] px-1 rounded text-white font-mono">
                                  {post.media_type === "VIDEO" ? "Reel" : "Post"}
                                </span>
                              </div>
                              <span className="text-[11px] text-zinc-200 line-clamp-1 block font-medium">
                                {post.caption || "Untitled"}
                              </span>
                              <span className="text-[9px] text-pink-400 mt-0.5 group-hover:underline">
                                Select Post →
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Trigger Keyword & Product URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">2. Comment Trigger Keyword:</label>
                    <input
                      type="text"
                      value={wishlinkKeyword}
                      onChange={(e) => setWishlinkKeyword(e.target.value.toUpperCase())}
                      placeholder="e.g. LINK, BUY, SHOP, 1, OUTFIT"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500 font-mono font-bold"
                      required
                    />
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-zinc-500">Quick set:</span>
                      {["LINK", "BUY", "SHOP", "1", "OUTFIT", "PRICE"].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setWishlinkKeyword(k)}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">3. Wishlink / Product URL:</label>
                    <input
                      type="url"
                      value={wishlinkProductUrl}
                      onChange={(e) => setWishlinkProductUrl(e.target.value)}
                      placeholder="https://wishlink.com/in.yogeshwar/... or store link"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500 font-mono"
                      required
                    />
                    <span className="text-[10px] text-zinc-500 block">
                      This link will be automatically inserted into the direct message.
                    </span>
                  </div>
                </div>

                {/* Templates Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">4. Choose Wishlink DM Template:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {WISHLINK_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleTemplateSelect(tmpl)}
                        className={`text-left p-2.5 rounded-md border text-xs transition-all ${
                          selectedTemplateId === tmpl.id
                            ? "bg-pink-500/10 border-pink-500 text-white font-medium shadow-sm shadow-pink-500/10"
                            : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <span className="block font-bold text-white mb-1">{tmpl.name}</span>
                        <span className="text-[11px] text-zinc-400 line-clamp-2">{tmpl.text}</span>
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    value={wishlinkMessageTemplate}
                    onChange={(e) => setWishlinkMessageTemplate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500"
                    placeholder="Custom DM text (use {username} and {link} as placeholders)..."
                  />
                </div>

                {/* Settings & Switches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-3 p-3 bg-zinc-900/60 rounded-md border border-zinc-800">
                    <input
                      type="checkbox"
                      id="wishlinkFollow"
                      checked={wishlinkRequireFollow}
                      onChange={(e) => setWishlinkRequireFollow(e.target.checked)}
                      className="w-4 h-4 rounded text-pink-600 bg-zinc-800 border-zinc-700 focus:ring-0"
                    />
                    <label htmlFor="wishlinkFollow" className="text-xs text-zinc-300 cursor-pointer">
                      <span className="font-semibold block text-white">Require User To Follow (Follow-to-Unlock)</span>
                      <span className="text-[10px] text-zinc-500 block">
                        Non-followers get a prompt to follow first, boosting your follower growth by 400%!
                      </span>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-400 block">Public Comment Auto-Reply:</label>
                    <input
                      type="text"
                      value={wishlinkPublicReply}
                      onChange={(e) => setWishlinkPublicReply(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isSavingWishlink}
                    className="primary-gradient-bg text-white text-xs px-6 py-2.5 rounded-md shadow-lg shadow-pink-500/20"
                  >
                    {isSavingWishlink ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 mr-1.5" />
                    )}
                    Save & Activate Wishlink Automation
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: GLOBAL COMMENT FUNNELS (ALL POSTS) */}
          {activeTab === "global" && (
            <div className="space-y-6">
              <form onSubmit={handleSaveGlobalFunnel} className="p-5 sm:p-6 rounded-lg bg-zinc-900 border border-zinc-800 space-y-4 shadow-2xl">
                <div className="border-b border-zinc-800 pb-3">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    Global Comment Funnel (Across All Posts)
                  </h2>
                  <p className="text-[11px] text-zinc-500">
                    Triggers whenever someone comments a keyword on ANY of your Instagram posts or reels.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Comment Trigger Keyword:</label>
                    <input
                      type="text"
                      value={globalKeyword}
                      onChange={(e) => setGlobalKeyword(e.target.value.toUpperCase())}
                      placeholder="e.g. GUIDE, FREE, TUTORIAL"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3.5 py-2 text-xs text-white font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Public Comment Reply:</label>
                    <input
                      type="text"
                      value={globalPublicReply}
                      onChange={(e) => setGlobalPublicReply(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3.5 py-2 text-xs text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Unlocked DM Message / Resource:</label>
                  <textarea
                    rows={3}
                    value={globalUnlockedMsg}
                    onChange={(e) => setGlobalUnlockedMsg(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-xs text-white"
                    placeholder="Content sent when follower status is confirmed..."
                    required
                  />
                </div>

                <div className="flex items-center justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isSavingGlobal}
                    className="primary-gradient-bg text-white text-xs px-6 py-2.5 rounded-md shadow-lg shadow-pink-500/20"
                  >
                    {isSavingGlobal ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Save Global Rule
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: TEST RUNNER (ON-DEMAND SCAN) */}
          {activeTab === "runner" && (
            <div className="p-5 sm:p-6 rounded-lg bg-zinc-900 border border-zinc-800 space-y-4 shadow-2xl">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  On-Demand Comment Scanner & Execution Test
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Manually scan comments on your latest Instagram post or specific media ID and execute DM delivery immediately.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={targetMediaId}
                  onChange={(e) => setTargetMediaId(e.target.value)}
                  placeholder="Enter 'latest' or specific Instagram Media ID"
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3.5 py-2 text-xs text-white font-mono"
                />
                <Button
                  onClick={handleRunManual}
                  disabled={isRunningManual}
                  className="primary-gradient-bg text-white text-xs px-4 py-2 rounded-md shrink-0"
                >
                  {isRunningManual ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                  Scan & Execute
                </Button>
              </div>

              {runLogs && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold text-zinc-300">Scan Execution Output:</h4>
                  {runLogs.length === 0 ? (
                    <div className="p-4 bg-zinc-900/50 rounded-md text-center text-xs text-zinc-500 border border-white/[0.04]">
                      No new matching comments found on this post.
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.04] bg-zinc-900/60 rounded-md border border-zinc-800 overflow-hidden">
                      {runLogs.map((log, idx) => (
                        <div key={idx} className="p-3 text-xs flex items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-white">@{log.username}</span>
                            <span className="text-zinc-400 ml-2">"{log.comment_text}"</span>
                          </div>
                          <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] border-emerald-500/30">
                            {log.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ACTIVE RULES LIST */}
          <div className="p-5 sm:p-6 rounded-lg bg-zinc-900 border border-zinc-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-pink-400" />
                  Active Growth & Wishlink Automations ({activeFunnels.length})
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Rules actively running 24/7 on incoming Instagram comments
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchFunnels()}
                disabled={isFunnelsLoading}
                className="text-xs border-zinc-800"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFunnelsLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {isFunnelsLoading ? (
              <div className="py-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-pink-400" /> Loading active rules...
              </div>
            ) : activeFunnels.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No automations created yet. Create your first Wishlink automation above!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeFunnels.map((funnel: any) => {
                  const isWishlink = funnel.funnel_type === "wishlink" || Boolean(funnel.target_media_id);

                  return (
                    <div
                      key={funnel.id}
                      className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-lg border border-pink-500/30">
                            TRIGGER: "{funnel.keyword}"
                          </span>
                          <Badge
                            className={`text-[9px] px-1.5 py-0 h-4 ${
                              isWishlink
                                ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {isWishlink ? "Wishlink" : "Global"}
                          </Badge>
                        </div>

                        {funnel.id && !funnel.id.startsWith("default-") && (
                          <button
                            onClick={() => handleDeleteRule(funnel.id)}
                            className="text-zinc-500 hover:text-red-400 p-1"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {funnel.target_media_caption && (
                        <div className="text-[11px] text-zinc-400 bg-zinc-950/50 p-2 rounded-md border border-white/[0.04]">
                          <span className="text-[10px] text-zinc-500 block">Specific Post:</span>
                          <span className="line-clamp-1 font-medium text-white">{funnel.target_media_caption}</span>
                          {funnel.target_media_id && (
                            <span className="text-[9px] text-pink-400 font-mono block mt-0.5">
                              ID: {funnel.target_media_id}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="text-[11px] text-zinc-300 line-clamp-2 bg-zinc-950/40 p-2 rounded-md">
                        <span className="text-[9px] text-zinc-500 block uppercase tracking-wider">DM Content:</span>
                        {funnel.unlocked_content_text}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-white/[0.04]">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {funnel.require_follow ? "Follower-Gated (400% boost)" : "Open to All"}
                        </span>
                        <span>Auto-Reply Active</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
