"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Loader2,
  Wand2,
  HelpCircle,
  Languages,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountAuditResult } from "@/lib/ai/account-analysis";

export default function AiAnalysisPage() {
  const [selectedModel, setSelectedModel] = useState("openrouter/free");
  const [selectedLanguage, setSelectedLanguage] = useState("Hinglish");
  const [auditResult, setAuditResult] = useState<AccountAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

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
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate audit");
      }

      setAuditResult(data.audit);
      toast.success(`AI Account Audit complete in ${selectedLanguage}!`);
    } catch (err: any) {
      toast.error(err?.message || "Audit could not be completed. Please try another model.");
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-pink-500 selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/25 px-2.5 py-0.5 rounded-full">
                  Lumina AI Engine
                </span>
                <span className="text-[11px] text-zinc-500">• Multi-Model Reasoning</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-headline flex items-center gap-2">
                AI Account Audit & Strategy
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Deep architectural analysis of your Instagram presence powered by multi-model AI reasoning.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Language Selector */}
              <div className="flex items-center gap-1.5 bg-black/60 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-zinc-200">
                <Languages className="w-3.5 h-3.5 text-pink-400" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-transparent border-0 text-xs text-zinc-200 focus:outline-none cursor-pointer"
                >
                  <option value="English" className="bg-zinc-950">English</option>
                  <option value="Hinglish" className="bg-zinc-950">Hinglish (Hindi+Eng)</option>
                  <option value="Hindi" className="bg-zinc-950">हिन्दी (Hindi)</option>
                  <option value="Spanish" className="bg-zinc-950">Español (Spanish)</option>
                </select>
              </div>

              {/* Model Selector */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-black/60 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-pink-500 cursor-pointer"
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
                className="text-xs gap-2 h-9 px-4 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/20 cursor-pointer"
              >
                {isAuditing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                <span>{isAuditing ? "Auditing Account..." : "Run AI Audit"}</span>
              </Button>
            </div>
          </div>

          {/* Prominent AI Disclaimer Notice */}
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white font-headline">AI-Generated Strategy Intelligence: </span>
              These recommendations are strategic interpretations produced by AI based on your public post history and Meta Graph API metrics. They guide content growth and engagement benchmarks.
            </div>
          </div>

          {/* Audit Results Container */}
          {auditResult ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Executive Summary */}
              <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <h3 className="text-base font-bold text-white font-headline">Account Performance Summary</h3>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Generated via {auditResult.model}
                  </span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-zinc-300">
                  <p>{auditResult.summary}</p>
                  <p className="text-zinc-400 italic pt-1">
                    Visual Consistency: {auditResult.visualConsistency}
                  </p>
                </div>
              </div>

              {/* Themes & Patterns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Content Patterns */}
                <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 space-y-3 shadow-xl">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold text-white font-headline uppercase tracking-wider">Observed Patterns</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    {auditResult.contentPatterns.map((pat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        <span>{pat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strong Themes */}
                <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 space-y-3 shadow-xl">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white font-headline uppercase tracking-wider">High-Resonance Themes</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    {auditResult.strongThemes.map((theme, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{theme}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Growth Opportunities */}
                <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 space-y-3 shadow-xl">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white font-headline uppercase tracking-wider">Growth Opportunities</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    {auditResult.contentOpportunities.map((opp, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{opp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Next Content Actions */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white font-headline flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Recommended Next Posts</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {auditResult.recommendedPosts.map((post, idx) => (
                    <div key={idx} className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl flex flex-col justify-between p-6 space-y-4 shadow-xl hover:border-purple-500/40 transition-colors">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-[10px] py-0.5 px-2 bg-purple-500/10 text-purple-300 border-purple-500/20">
                            {post.type}
                          </Badge>
                          <span className="text-[10px] text-zinc-500 font-bold">Concept #{idx + 1}</span>
                        </div>
                        <h4 className="font-bold text-sm text-white font-headline">{post.title}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">{post.concept}</p>
                        <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-pink-300 italic">
                          &ldquo;{post.suggestedHook}&rdquo;
                        </div>
                      </div>

                      <Link href="/create">
                        <Button size="sm" variant="outline" className="w-full text-xs gap-2 rounded-xl border-white/[0.1] hover:bg-white/[0.08] cursor-pointer">
                          <span>Build this in Studio</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0C0C0C] border border-dashed border-white/[0.1] rounded-3xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-zinc-200 font-headline">Ready to Audit Your Content</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Click &ldquo;Run AI Audit&rdquo; above to analyze your connected Instagram account&apos;s recent performance patterns and receive strategic next post ideas.
                </p>
              </div>
              <Button onClick={handleRunAudit} disabled={isAuditing} size="sm" className="text-xs gap-2 h-9 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white cursor-pointer font-medium">
                {isAuditing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Start Account Audit</span>
              </Button>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
