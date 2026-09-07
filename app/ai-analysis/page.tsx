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
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate audit");
      }

      setAuditResult(data.audit);
      toast.success("AI Account Audit complete!");
    } catch (err: any) {
      toast.error(err?.message || "Audit failed. Check keys or try another free model.");
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  AI Account Performance Audit
                </h1>
                <Badge variant="default" className="text-[10px] py-0">
                  AI-Generated
                </Badge>
              </div>
              <p className="text-xs text-zinc-400">
                Synthesizes official Meta analytics, caption history, and visual patterns to discover actionable growth opportunities.
              </p>
            </div>

            {/* Model Selector & Action */}
            <div className="flex items-center gap-3">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-pink-500"
              >
                <option value="openrouter/free">Auto — Best Free Model</option>
                {modelsData?.freeTextModels?.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (Free)
                  </option>
                ))}
              </select>

              <Button
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="text-xs gap-1.5 bg-gradient-to-r from-pink-600 to-purple-600 shadow-md shadow-pink-500/20"
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
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">AI-Generated Content Insights: </span>
              These recommendations are strategic interpretations produced by AI based solely on your public post history and Meta metrics. They do not represent Instagram's private internal algorithm scores.
            </div>
          </div>

          {/* Audit Results Container */}
          {auditResult ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Executive Summary */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      <span>Account Performance Summary</span>
                    </CardTitle>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Generated via {auditResult.model}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs leading-relaxed text-zinc-300">
                  <p>{auditResult.summary}</p>
                  <p className="text-zinc-400 italic pt-1">
                    Visual Consistency: {auditResult.visualConsistency}
                  </p>
                </CardContent>
              </Card>

              {/* Themes & Patterns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Content Patterns */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-white flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                      <span>Observed Patterns</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {auditResult.contentPatterns.map((pat, i) => (
                      <div key={i} className="flex items-start gap-2 text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        <span>{pat}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Strong Themes */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-white flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>High-Resonance Themes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {auditResult.strongThemes.map((theme, i) => (
                      <div key={i} className="flex items-start gap-2 text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{theme}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Growth Opportunities */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-white flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>Content Opportunities</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {auditResult.contentOpportunities.map((opp, i) => (
                      <div key={i} className="flex items-start gap-2 text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{opp}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Recommended Next Content Actions */}
              <div className="space-y-3">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Recommended Next Posts</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {auditResult.recommendedPosts.map((post, idx) => (
                    <Card key={idx} className="bg-zinc-900/70 border-zinc-800 flex flex-col justify-between p-4 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-[10px]">
                            {post.type}
                          </Badge>
                          <span className="text-[10px] text-zinc-500 font-bold">Concept #{idx + 1}</span>
                        </div>
                        <h4 className="font-semibold text-sm text-white">{post.title}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">{post.concept}</p>
                        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-300 italic">
                          "{post.suggestedHook}"
                        </div>
                      </div>

                      <Link href="/create">
                        <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 border-zinc-700">
                          <span>Build this in Studio</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center bg-zinc-900/30 border-dashed border-zinc-800">
              <Sparkles className="w-10 h-10 text-purple-400/80 mx-auto mb-3" />
              <h3 className="font-semibold text-sm text-zinc-300">Ready to Audit Your Content</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1 mb-4">
                Click "Run AI Audit" above to analyze your connected Instagram account's recent performance patterns and receive strategic next post ideas.
              </p>
              <Button onClick={handleRunAudit} disabled={isAuditing} size="sm" className="text-xs gap-1.5">
                {isAuditing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Start Account Audit</span>
              </Button>
            </Card>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
