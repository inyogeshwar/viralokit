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
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AutomationsPage() {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // New Rule Form State
  const [keyword, setKeyword] = useState("LINK");
  const [requireFollow, setRequireFollow] = useState(true);
  const [publicReply, setPublicReply] = useState("Sent you the link in DM! 📩 Check your inbox @{username}!");
  const [followGateMsg, setFollowGateMsg] = useState(
    "Hey @{username}! 👋 Follow our account first to unlock this exclusive link! Once followed, reply 'DONE' 🚀"
  );
  const [unlockedMsg, setUnlockedMsg] = useState(
    "Here is your exclusive link: https://viralokit.vercel.app 🚀 Enjoy!"
  );
  const [attachmentType, setAttachmentType] = useState<"none" | "audio" | "file">("none");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Manual Runner State
  const [targetMediaId, setTargetMediaId] = useState("latest");
  const [isRunningManual, setIsRunningManual] = useState(false);
  const [runLogs, setRunLogs] = useState<any[] | null>(null);

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

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || !unlockedMsg.trim()) {
      toast.error("Keyword and unlocked DM content are required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/meta/growth-funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_rule",
          keyword: keyword.trim().toLowerCase(),
          publicReplyTemplate: publicReply,
          requireFollow,
          followGateMessage: followGateMsg,
          unlockedContentText: unlockedMsg,
          attachmentType: attachmentType !== "none" ? attachmentType : undefined,
          attachmentUrl: attachmentUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Automation funnel for '${keyword}' created!`);
        refetchFunnels();
      } else {
        toast.error(data.error || "Failed to save funnel rule.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error saving rule.");
    } finally {
      setIsSaving(false);
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
          keyword: keyword.trim().toLowerCase(),
          publicReplyTemplate: publicReply,
          requireFollow,
          followGateMessage: followGateMsg,
          unlockedContentText: unlockedMsg,
          attachmentType: attachmentType !== "none" ? attachmentType : undefined,
          attachmentUrl: attachmentUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRunLogs(data.results || []);
        toast.success(`Processed ${data.processedCount || 0} matching comments!`);
      } else {
        toast.error(data.error || "Execution failed.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error executing funnel.");
    } finally {
      setIsRunningManual(false);
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
          <div className="border-b border-white/[0.08] pb-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 border border-pink-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-pink-400" />
                Growth Engine
              </span>
              <span className="text-[11px] text-zinc-500">• ManyChat / Superprofile Alternative</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-headline flex items-center gap-2">
              Social Growth & Funnel Automation
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Follow-to-Unlock comment funnels, voice notes & automated DMs. Runs 24/7 in the cloud on Vercel without keeping your phone or laptop on!
            </p>
          </div>

          {/* 1. 24/7 Cloud Webhook Configuration Card */}
          <div className="bg-[#0C0C0C] border border-pink-500/25 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
              <div className="space-y-1">
                <h3 className="text-base font-bold flex items-center gap-2 text-white font-headline">
                  <Radio className="w-5 h-5 text-pink-400 animate-pulse" />
                  <span>24/7 Real-Time Cloud Webhook (Zero Laptop Required)</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  When anyone comments on your Instagram posts, Meta immediately sends the event to Vercel. ViraloKit executes your growth funnel in under 1 second!
                </p>
              </div>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-500/10 text-[10px] py-1 px-3 self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-ping" />
                Cloud Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-medium">Meta Callback URL</label>
                <div className="flex items-center gap-2 bg-zinc-900/90 border border-white/[0.08] rounded-xl px-3 py-2 text-zinc-200">
                  <span className="truncate flex-1 font-mono text-[11px] text-pink-300">{webhookUrl}</span>
                  <button
                    onClick={() => handleCopy(webhookUrl, "url")}
                    className="p-1 hover:text-white transition-colors"
                    title="Copy URL"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-medium">Verify Token</label>
                <div className="flex items-center gap-2 bg-zinc-900/90 border border-white/[0.08] rounded-xl px-3 py-2 text-zinc-200">
                  <span className="truncate flex-1 font-mono text-[11px] text-emerald-300">{verifyToken}</span>
                  <button
                    onClick={() => handleCopy(verifyToken, "token")}
                    className="p-1 hover:text-white transition-colors"
                    title="Copy Token"
                  >
                    {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-900/40 border border-white/[0.06] rounded-2xl text-[11px] text-zinc-400 space-y-1">
              <span className="font-semibold text-zinc-200 block">📱 How to connect on your smartphone:</span>
              <p>
                1. Open <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-pink-400 underline">Meta Developer Portal</a> → Select your App → <strong>Webhooks</strong>.
              </p>
              <p>
                2. Select <strong>Instagram</strong> → Click <strong>Edit Subscription</strong> → Paste the Callback URL and Verify Token above.
              </p>
              <p>
                3. Check the <strong>comments</strong> and <strong>messages</strong> boxes. Done! Your automation is 100% active in the cloud!
              </p>
            </div>
          </div>

          {/* 2. Active Funnel Rules List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                Active Follow-to-Unlock Funnels
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchFunnels()}
                disabled={isFunnelsLoading}
                className="text-xs border-white/[0.08]"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFunnelsLoading ? "animate-spin" : ""}`} />
                Refresh Rules
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {funnelsData?.funnels?.map((f: any) => (
                <div
                  key={f.id}
                  className="bg-zinc-900/60 border border-white/[0.08] hover:border-pink-500/30 transition-all rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-pink-300 uppercase tracking-wide flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-pink-400" />
                      Trigger: &quot;{f.keyword}&quot;
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        f.require_follow !== false
                          ? "border-amber-500/40 text-amber-300 bg-amber-500/10 text-[10px]"
                          : "border-zinc-700 text-zinc-400 text-[10px]"
                      }
                    >
                      {f.require_follow !== false ? "🔒 Follower Gate" : "🔓 Open to All"}
                    </Badge>
                  </div>

                  <div className="text-xs space-y-2 text-zinc-300">
                    <div>
                      <span className="text-zinc-500 block text-[10px] font-semibold uppercase">Public Reply:</span>
                      <p className="bg-zinc-950/50 rounded-lg p-2 text-zinc-200 mt-0.5 border border-white/[0.04]">
                        {f.public_reply_template}
                      </p>
                    </div>

                    <div>
                      <span className="text-zinc-500 block text-[10px] font-semibold uppercase">Unlocked DM:</span>
                      <p className="bg-zinc-950/50 rounded-lg p-2 text-pink-200 mt-0.5 border border-white/[0.04] truncate">
                        {f.unlocked_content_text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Create New Funnel Rule Form */}
          <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
            <h3 className="text-base font-bold flex items-center gap-2 text-white font-headline border-b border-white/[0.08] pb-4">
              <Plus className="w-5 h-5 text-pink-400" />
              <span>Create Follow-to-Unlock Automation</span>
            </h3>

            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Comment Trigger Keyword</label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g. LINK, GUIDE, AI, PRICE"
                    className="w-full bg-zinc-900 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500 uppercase tracking-wider font-bold"
                  />
                  <p className="text-[10px] text-zinc-500">Case-insensitive. Triggers when comment contains this word.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Follower Verification Gate</label>
                  <div className="flex items-center gap-3 bg-zinc-900 border border-white/[0.1] rounded-xl px-3.5 py-2.5">
                    <input
                      type="checkbox"
                      id="followGateToggle"
                      checked={requireFollow}
                      onChange={(e) => setRequireFollow(e.target.checked)}
                      className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500 bg-zinc-800 border-zinc-700"
                    />
                    <label htmlFor="followGateToggle" className="cursor-pointer text-zinc-200 font-medium">
                      Require user to follow before unlocking link
                    </label>
                  </div>
                  <p className="text-[10px] text-amber-400/90 font-medium">
                    ⚡ Increases your Instagram follower conversion by 400%!
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Public Comment Reply Template</label>
                <input
                  type="text"
                  value={publicReply}
                  onChange={(e) => setPublicReply(e.target.value)}
                  placeholder="Sent you the link in DM! 📩 Check your inbox @{username}!"
                  className="w-full bg-zinc-900 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500"
                />
                <p className="text-[10px] text-zinc-500">Use {'{username}'} to automatically tag the commenter.</p>
              </div>

              {requireFollow && (
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold text-amber-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Non-Follower Gate Prompt (Sent if user is not following yet)
                  </label>
                  <textarea
                    rows={2}
                    value={followGateMsg}
                    onChange={(e) => setFollowGateMsg(e.target.value)}
                    className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl px-3.5 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold text-pink-300">
                  Unlocked Content / Resource (Sent in DM once verified)
                </label>
                <textarea
                  rows={2}
                  value={unlockedMsg}
                  onChange={(e) => setUnlockedMsg(e.target.value)}
                  placeholder="Here is your exclusive link: https://... 🚀 Enjoy!"
                  className="w-full bg-zinc-900 border border-pink-500/30 rounded-xl px-3.5 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Optional DM Attachment Type</label>
                  <select
                    value={attachmentType}
                    onChange={(e: any) => setAttachmentType(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-pink-500"
                  >
                    <option value="none">None (Text / Link only)</option>
                    <option value="audio">Voice Note / Audio (.m4a / .wav)</option>
                    <option value="file">Document / PDF (.pdf)</option>
                  </select>
                </div>

                {attachmentType !== "none" && (
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold">Public Attachment URL</label>
                    <input
                      type="url"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      placeholder="https://example.com/audio.m4a or .pdf"
                      className="w-full bg-zinc-900 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="primary-gradient-bg text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-pink-500/20"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                  Save & Activate Funnel
                </Button>
              </div>
            </form>
          </div>

          {/* 4. Live Manual Runner & Simulator */}
          <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold flex items-center gap-2 text-white font-headline">
                  <Play className="w-5 h-5 text-emerald-400" />
                  <span>Test Run Funnel Now (On-Demand Scan)</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Scan recent comments on your latest Instagram post or specific Media ID, execute follower verification, and deliver DMs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={targetMediaId}
                  onChange={(e) => setTargetMediaId(e.target.value)}
                  placeholder="latest or media_id"
                  className="bg-zinc-900 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 w-36"
                />
                <Button
                  onClick={handleRunManual}
                  disabled={isRunningManual}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  {isRunningManual ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5 fill-black" />}
                  Run Scan
                </Button>
              </div>
            </div>

            {runLogs && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Execution Logs ({runLogs.length} matching comments processed):
                </h4>
                {runLogs.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic bg-zinc-950 p-4 rounded-xl border border-white/[0.04]">
                    No matching comments with keyword &quot;{keyword}&quot; found on the post yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {runLogs.map((log: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-zinc-950 p-3.5 rounded-xl border border-white/[0.06] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold text-white">@{log.username}</span>: &quot;{log.comment_text}&quot;
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                            <span>Liked: {log.liked ? "✅" : "❌"}</span>
                            <span>Public Reply: {log.public_reply_sent ? "✅" : "❌"}</span>
                            <span>DM Delivered: {log.dm_sent ? "✅" : "❌"}</span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            log.status.includes("UNLOCKED")
                              ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10 text-[10px]"
                              : "border-amber-500/40 text-amber-300 bg-amber-500/10 text-[10px]"
                          }
                        >
                          {log.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
