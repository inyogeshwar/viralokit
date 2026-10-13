"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Wand2,
  HelpCircle,
  Languages,
  Copy,
  Check,
  Flame,
  ShieldCheck,
  Target,
  Zap,
  BarChart3,
  Layers,
  FileText,
  UserCheck,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountAuditResult, RubricItem } from "@/lib/ai/account-analysis";

export default function AiAnalysisPage() {
  const [selectedModel, setSelectedModel] = useState("openrouter/free");
  const [selectedLanguage, setSelectedLanguage] = useState("Hinglish");
  const [customBio, setCustomBio] = useState("");
  const [showBioInput, setShowBioInput] = useState(false);
  const [auditResult, setAuditResult] = useState<AccountAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);
  const [copiedName, setCopiedName] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Fetch Free Models for dropdown
  const { data: modelsData } = useQuery({
    queryKey: ["ai-models"],
    queryFn: async () => {
      const res = await fetch("/api/ai/models");
      return res.json();
    },
  });

  // Fetch Account Capabilities
  const { data: accountData } = useQuery({
    queryKey: ["meta-account"],
    queryFn: async () => {
      const res = await fetch("/api/meta/account");
      return res.json();
    },
  });

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch("/api/ai/account-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: selectedModel,
          enableGeminiFallback: true,
          language: selectedLanguage,
          customBioOverride: customBio.trim() ? customBio.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate audit");
      }

      setAuditResult(data.audit);
      toast.success(`12-Part Creator Audit Complete (${selectedLanguage})!`);
    } catch (err: any) {
      toast.error(err?.message || "Audit could not be completed. Please try another model.");
    } finally {
      setIsAuditing(false);
    }
  };

  const copyToClipboard = (text: string, type: "bio" | "name") => {
    navigator.clipboard.writeText(text);
    if (type === "bio") {
      setCopiedBio(true);
      setTimeout(() => setCopiedBio(false), 2000);
      toast.success("Ready-to-paste bio copied to clipboard!");
    } else {
      setCopiedName(true);
      setTimeout(() => setCopiedName(false), 2000);
      toast.success("Optimized name field copied!");
    }
  };

  const filteredRubric = auditResult?.rubric.filter((r) => {
    if (activeCategory === "All") return true;
    return r.category === activeCategory;
  });

  const getGradeColor = (grade?: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "B":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      case "C":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      default:
        return "text-pink-400 bg-pink-500/10 border-pink-500/30";
    }
  };

  return (
    <div className="flex min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-pink-500 selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 border border-pink-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3" />
                  12-Part Creator Audit Rubric
                </span>
                <span className="text-[11px] text-zinc-500">• Fix-First Ranking</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-headline flex items-center gap-2">
                Instagram Profile Audit & Strategy
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                12-point conversion teardown, outlier multiplier analysis, and anti-slop copy optimizations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Language Selector */}
              <div className="flex items-center gap-1.5 bg-black/70 border border-white/[0.12] rounded-xl px-3 py-1.5 text-xs text-zinc-200">
                <Languages className="w-3.5 h-3.5 text-pink-400" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-transparent border-0 text-xs text-zinc-200 focus:outline-none cursor-pointer"
                >
                  <option value="Hinglish" className="bg-zinc-950">Hinglish (Hindi+Eng)</option>
                  <option value="English" className="bg-zinc-950">English (Creator)</option>
                  <option value="Hindi" className="bg-zinc-950">हिन्दी (Hindi)</option>
                  <option value="Spanish" className="bg-zinc-950">Español (Spanish)</option>
                </select>
              </div>

              {/* Model Selector */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-black/70 border border-white/[0.12] rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value="openrouter/free">Auto — Intelligent Router</option>
                {modelsData?.freeTextModels?.map((m: any) => (
                  <option key={m.id} value={m.id} className="bg-zinc-950">
                    {m.name.replace(/\s*\(free\)/gi, "")}
                  </option>
                ))}
              </select>

              <Button
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="text-xs gap-2 h-9 px-4 rounded-xl font-bold bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white shadow-lg shadow-pink-500/20 cursor-pointer"
              >
                {isAuditing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                <span>{isAuditing ? "Auditing Profile..." : auditResult ? "Re-Audit Profile" : "Run 12-Part Audit"}</span>
              </Button>
            </div>
          </div>

          {/* Optional Bio Testing Bar */}
          <div className="bg-[#0c0c0c] border border-white/[0.08] rounded-2xl p-3 sm:p-4 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-300 font-medium">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Custom Bio Sandbox (Optional)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowBioInput(!showBioInput)}
                className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
              >
                {showBioInput ? "Hide Sandbox" : "Test Custom Bio Draft Before Auditing"}
              </button>
            </div>
            {showBioInput && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                <textarea
                  value={customBio}
                  onChange={(e) => setCustomBio(e.target.value)}
                  placeholder="Paste or write your bio draft here to audit custom copy against the 12-part rubric..."
                  rows={3}
                  className="w-full bg-black/60 border border-white/[0.1] rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 resize-none font-sans"
                />
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Leave blank to automatically analyze your live Instagram bio.</span>
                  <span>{customBio.length}/150 chars</span>
                </div>
              </div>
            )}
          </div>

          {/* Audit Results Container */}
          {auditResult ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Scorecard Hero Banner */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#121019] via-[#0C0C0C] to-[#0A0A0A] border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Score & Grade */}
                  <div className="flex items-center gap-5">
                    <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-black/80 border border-white/[0.15] shadow-inner">
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-black font-headline tracking-tight text-white">
                          {auditResult.overallScore}
                        </div>
                        <div className="text-[10px] font-semibold tracking-wider uppercase text-zinc-500">
                          out of 100
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider rounded-lg border ${getGradeColor(
                            auditResult.grade
                          )}`}
                        >
                          Grade: {auditResult.grade}
                        </Badge>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          Engine: {auditResult.model}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-white font-headline">
                        {auditResult.overallScore >= 80
                          ? "High-Converting Profile Architecture"
                          : auditResult.overallScore >= 65
                          ? "Solid Foundation with Clear Conversion Leaks"
                          : "Critical Conversion Leaks Detected"}
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                        {auditResult.summary}
                      </p>
                    </div>
                  </div>

                  {/* Account Snapshot Pill */}
                  {accountData?.username && (
                    <div className="flex items-center gap-3 bg-black/60 border border-white/[0.1] rounded-2xl p-3 shrink-0">
                      {accountData.profilePictureUrl ? (
                        <Image
                          src={accountData.profilePictureUrl}
                          alt={accountData.username}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover border border-white/[0.15]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-sm">
                          @{accountData.username[0].toUpperCase()}
                        </div>
                      )}
                      <div className="text-xs">
                        <div className="font-bold text-white">@{accountData.username}</div>
                        <div className="text-zinc-400 text-[11px]">
                          {accountData.followersCount?.toLocaleString() || "0"} followers
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* FIX-FIRST ACTION PLAN (Priority Order) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h3 className="text-base font-bold text-white font-headline">
                      Fix-First Action Plan (Highest ROI Order)
                    </h3>
                  </div>
                  <span className="text-[11px] text-zinc-400">Implement in order for maximum lift</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Critical Fixes */}
                  <div className="bg-[#0C0C0C] border border-red-500/20 rounded-3xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider">
                        🚨 Critical Fixes (Do Today)
                      </h4>
                    </div>
                    <div className="space-y-3.5">
                      {auditResult.criticalFixes.map((fix, idx) => (
                        <div key={idx} className="space-y-1.5 p-3 rounded-2xl bg-black/60 border border-white/[0.06]">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{fix.title}</span>
                            <Badge variant="secondary" className="text-[9px] bg-red-500/10 text-red-300 border-red-500/20">
                              Immediate Lift
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed">{fix.action}</p>
                          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 pt-0.5">
                            <TrendingUp className="w-3 h-3" />
                            <span>{fix.impact}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* High Leverage Tweaks & Wins */}
                  <div className="space-y-4">
                    {/* Tweaks */}
                    <div className="bg-[#0C0C0C] border border-amber-500/20 rounded-3xl p-5 space-y-3 shadow-xl">
                      <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          ⚠️ High-Leverage Tweaks
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {auditResult.highLeverageTweaks.map((tweak, idx) => (
                          <div key={idx} className="space-y-1 p-2.5 rounded-2xl bg-black/60 border border-white/[0.06]">
                            <div className="text-xs font-bold text-zinc-200">{tweak.title}</div>
                            <p className="text-[11px] text-zinc-400">{tweak.action}</p>
                            <div className="text-[10px] text-blue-400 pt-0.5">{tweak.impact}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Winning Traits */}
                    <div className="bg-[#0C0C0C] border border-emerald-500/20 rounded-3xl p-5 space-y-2.5 shadow-xl">
                      <div className="flex items-center gap-2 pb-1.5 border-b border-white/[0.08]">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                          ✅ What&apos;s Crushing It (Double Down)
                        </h4>
                      </div>
                      <div className="space-y-2 text-xs">
                        {auditResult.winningTraits.map((trait, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            <span>{trait}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BIO TEARDOWN & READY-TO-PASTE MAKEOVER */}
              <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-pink-400" />
                    <h3 className="text-base font-bold text-white font-headline">
                      Bio Teardown & Ready-To-Paste Makeover
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-500/30 w-fit">
                    Anti-Slop Conversion Framework
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Current Bio Issues */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Current Bio Bottlenecks Detected
                    </h4>
                    <div className="space-y-2">
                      {auditResult.bioTeardown.currentIssues.map((issue, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300 bg-black/40 p-2.5 rounded-xl border border-white/[0.05]">
                          <AlertCircle className="w-3.5 h-3.5 text-pink-400 mt-0.5 shrink-0" />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-black/60 border border-white/[0.08] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase">Search-Optimized Name Field</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(auditResult.bioTeardown.suggestedName, "name")}
                          className="h-6 px-2 text-[10px] text-zinc-300 hover:text-white"
                        >
                          {copiedName ? <Check className="w-3 h-3 text-emerald-400 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                          {copiedName ? "Copied" : "Copy Name"}
                        </Button>
                      </div>
                      <div className="font-mono text-xs text-purple-300 bg-zinc-950 p-2 rounded-lg border border-purple-500/20">
                        {auditResult.bioTeardown.suggestedName}
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        Include keywords after the separator &apos;|&apos; so you rank for high-intent search queries.
                      </p>
                    </div>
                  </div>

                  {/* Ready to Paste Bio */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        High-Converting 3-Line Bio (Ready To Paste)
                      </h4>
                      <Button
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            auditResult.bioTeardown.suggestedBioLines.join("\n"),
                            "bio"
                          )
                        }
                        className="h-7 px-3 text-xs bg-pink-500 hover:bg-pink-600 text-white rounded-xl cursor-pointer"
                      >
                        {copiedBio ? <Check className="w-3 h-3 mr-1.5" /> : <Copy className="w-3 h-3 mr-1.5" />}
                        <span>{copiedBio ? "Copied to Clipboard!" : "Copy Full Bio"}</span>
                      </Button>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/80 border border-pink-500/30 space-y-3 font-sans shadow-lg">
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/[0.08] space-y-1">
                          <span className="text-[10px] font-bold text-pink-400 uppercase">Line 1 • Audience & Value Prop</span>
                          <div className="text-zinc-200 font-medium">
                            {auditResult.bioTeardown.suggestedBioLines[0]}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/[0.08] space-y-1">
                          <span className="text-[10px] font-bold text-purple-400 uppercase">Line 2 • Credibility / Proof Anchor</span>
                          <div className="text-zinc-200 font-medium">
                            {auditResult.bioTeardown.suggestedBioLines[1]}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/[0.08] space-y-1">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">Line 3 • Directive Action & Link CTA</span>
                          <div className="text-zinc-200 font-medium">
                            {auditResult.bioTeardown.suggestedBioLines[2]}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">External Link Button Text:</span>
                        <span className="font-bold text-white bg-white/[0.08] px-2 py-0.5 rounded-md">
                          {auditResult.bioTeardown.suggestedLinkCta}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* OUTLIER MULTIPLIER TEARDOWN */}
              <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <h3 className="text-base font-bold text-white font-headline">
                      Outlier Multiplier Engine (Top Performers vs Median)
                    </h3>
                  </div>
                  <div className="text-xs text-zinc-400">
                    Account Median Baseline:{" "}
                    <span className="font-bold text-white">{auditResult.outlierAnalysis.medianInteractions} interactions</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {auditResult.outlierAnalysis.replicationStrategy}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {auditResult.outlierAnalysis.outliersFound.map((outlier, idx) => (
                    <div
                      key={idx}
                      className="bg-black/60 border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-[10px] bg-orange-500/10 text-orange-300 border-orange-500/20 font-bold">
                            {outlier.multiplier}x Median Reach 🔥
                          </Badge>
                          <span className="text-[10px] text-zinc-500 uppercase">{outlier.type.replace("_ALBUM", "")}</span>
                        </div>
                        <p className="text-xs text-zinc-300 line-clamp-2 italic">
                          &ldquo;{outlier.captionSnippet}&rdquo;
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1">
                          <span>❤️ {outlier.likes.toLocaleString()} likes</span>
                          <span>💬 {outlier.comments.toLocaleString()} comments</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/[0.06] space-y-1.5 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">Why It Outperformed:</span>
                          <p className="text-zinc-300 text-[11px] leading-relaxed">{outlier.whyItWorked}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">How To Clone It:</span>
                          <p className="text-zinc-300 text-[11px] leading-relaxed">{outlier.howToReplicate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 12-PART COMPLETE AUDIT RUBRIC */}
              <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <h3 className="text-base font-bold text-white font-headline">
                      12-Part Audit Rubric Scorecard
                    </h3>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {["All", "Bio & Identity", "Visual & Feed", "Distribution & Strategy"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          activeCategory === cat
                            ? "bg-white text-black border-white font-bold"
                            : "bg-black/40 text-zinc-400 border-white/[0.08] hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRubric?.map((item: RubricItem) => (
                    <div
                      key={item.id}
                      className="bg-black/60 border border-white/[0.08] rounded-2xl p-4 space-y-2.5 hover:border-white/[0.18] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            {item.category}
                          </span>
                          <h4 className="font-bold text-xs text-white">{item.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-zinc-300">
                            {item.score}/{item.maxScore}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`text-[9px] uppercase px-1.5 py-0.5 font-bold ${
                              item.status === "pass"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : item.status === "warning"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed">{item.finding}</p>

                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/[0.06] text-xs space-y-0.5">
                        <span className="text-[10px] font-bold uppercase text-purple-400">Actionable Fix:</span>
                        <div className="text-zinc-200 text-[11px] leading-relaxed">{item.fix}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECOMMENDED NEXT CONTENT BLUEPRINTS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h3 className="text-base font-bold text-white font-headline">
                      Recommended Next Posts (Based on 26 Hook Formulas)
                    </h3>
                  </div>
                  <span className="text-[11px] text-zinc-400">Pre-engineered for high watch time & saves</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {auditResult.recommendedPosts.map((post, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl flex flex-col justify-between p-6 space-y-4 shadow-xl hover:border-purple-500/40 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className="text-[10px] py-0.5 px-2 bg-purple-500/10 text-purple-300 border-purple-500/20 font-bold"
                          >
                            {post.type} • {post.targetStage}
                          </Badge>
                          <span className="text-[10px] text-zinc-500 font-mono">Formula #{idx + 1}</span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-pink-400">{post.formulaName}</span>
                          <h4 className="font-bold text-sm text-white font-headline pt-0.5">{post.title}</h4>
                        </div>

                        {/* Hook line preview under 125 chars */}
                        <div className="p-3 rounded-xl bg-black/80 border border-white/[0.08] text-xs text-pink-300 italic">
                          &ldquo;{post.hookLine}&rdquo;
                        </div>

                        {/* Structural Outline */}
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-zinc-400">Structure Blueprint:</span>
                          <ul className="space-y-1 text-[11px] text-zinc-300">
                            {post.structure.map((step, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-1.5">
                                <span className="text-purple-400 font-bold">•</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="text-[11px] text-zinc-400 pt-1">
                          <span className="font-bold text-zinc-300">Why it converts: </span>
                          {post.whyItConverts}
                        </div>
                      </div>

                      <Link href={`/create?title=${encodeURIComponent(post.title)}&hook=${encodeURIComponent(post.hookLine)}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs gap-2 rounded-xl border-white/[0.1] hover:bg-white/[0.08] cursor-pointer mt-2"
                        >
                          <span>Build in Studio</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-[#0C0C0C] border border-dashed border-white/[0.1] rounded-3xl p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center mx-auto shadow-lg shadow-pink-500/10">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-base text-zinc-200 font-headline">
                  Ready to Run the 12-Part Profile Audit
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Diagnose your account with the elite creator 12-point rubric: bio conversion leaks, Name SEO keywords, outlier multipliers, and ready-to-copy bio rewrites.
                </p>
              </div>
              <Button
                onClick={handleRunAudit}
                disabled={isAuditing}
                size="sm"
                className="text-xs gap-2 h-9 px-5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white cursor-pointer font-bold shadow-lg shadow-pink-500/20"
              >
                {isAuditing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Start 12-Part Audit</span>
              </Button>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
