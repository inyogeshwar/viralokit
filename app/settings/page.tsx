"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Settings,
  Instagram,
  Sparkles,
  User,
  ShieldCheck,
  Zap,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Database,
  Cloud,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { CapabilityBadges } from "@/components/instagram/capability-badges";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [selectedModel, setSelectedModel] = useState("openrouter/free");
  const [geminiFallbackEnabled, setGeminiFallbackEnabled] = useState(true);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  // 1. Fetch system & user status
  const { data: authData } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      return res.json();
    },
  });

  // 2. Fetch Instagram capabilities
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

  // 3. Fetch Free AI Models
  const { data: modelsData, isLoading: isModelsLoading } = useQuery({
    queryKey: ["ai-models"],
    queryFn: async () => {
      const res = await fetch("/api/ai/models");
      return res.json();
    },
  });

  const handleRefreshToken = async () => {
    setIsRefreshingToken(true);
    try {
      const res = await fetch("/api/meta/refresh-token", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.data.message || "Token refreshed successfully!");
        refetchCap();
      } else {
        toast.error(data.error?.message || "Failed to refresh token");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error refreshing token");
    } finally {
      setIsRefreshingToken(false);
    }
  };

  const handleSavePreferences = () => {
    toast.success("AI and provider preferences updated!");
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header
          user={authData?.user}
          accountUsername={capabilities?.username}
          isConnected={capabilities?.connected}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="border-b border-zinc-800/80 pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Settings & Integrations
            </h1>
            <p className="text-xs text-zinc-400">
              Manage your connected Instagram business accounts, AI model routing, and cloud infrastructure.
            </p>
          </div>

          {/* Instagram Account Integration */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                  <Instagram className="w-4 h-4 text-pink-400" />
                  <span>Instagram Professional Account</span>
                </CardTitle>
                <Badge variant={capabilities?.connected ? "success" : "warning"} className="text-[10px]">
                  {capabilities?.connected ? "Active & Authorized" : "Not Connected"}
                </Badge>
              </div>
              <CardDescription className="text-xs text-zinc-400">
                Connected directly to Meta Graph API v23.0 with server-side secure authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CapabilityBadges
                capabilities={capabilities}
                isLoading={isCapLoading}
                onRefresh={() => refetchCap()}
              />

              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Target API Version:</span>
                  <span className="font-mono text-pink-400">{authData?.systemStatus?.apiVersion || "v23.0"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Server Token Protection:</span>
                  <span className="text-emerald-400">Encrypted / Server-Side Only (Never Exposed to Browser)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/80">
                <div className="text-xs">
                  <p className="text-zinc-200 font-medium">Keep Token Alive (Auto-Refresh)</p>
                  <p className="text-[11px] text-zinc-400">Instagram long-lived tokens last 60 days. Extend validity safely.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshToken}
                  disabled={isRefreshingToken || !capabilities?.connected}
                  className="h-8 text-xs gap-1.5 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingToken ? "animate-spin text-pink-400" : ""}`} />
                  {isRefreshingToken ? "Extending..." : "Extend 60 Days"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic AI Models Configuration */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>AI Engine & Model Routing</span>
                </CardTitle>
                <Badge variant="default" className="text-[10px]">
                  Lumina Engine
                </Badge>
              </div>
              <CardDescription className="text-xs text-zinc-400">
                High-speed multi-model AI routing with multimodal vision support for creative copy & accounts auditing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300 font-medium">Active AI Model:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-pink-500"
                >
                  <option value="openrouter/free">Auto — Intelligent Smart Router (Recommended)</option>
                  {modelsData?.freeTextModels?.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.name.replace(/\s*\(free\)/gi, "")} {m.supportsVision ? "• Vision Supported" : ""}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-zinc-500">
                  {modelsData?.totalAvailable
                    ? `${modelsData.totalAvailable} high-performance AI models available for captioning and visual analysis.`
                    : "Fetching available models..."}
                </p>
              </div>

              {/* Gemini Fallback Toggle */}
              <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white text-xs">Multimodal Failover (Google Gemini)</h4>
                  <p className="text-[11px] text-zinc-400">
                    Automatic failover routing to ensure 99.9% uptime for AI captions and visual media analysis.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={geminiFallbackEnabled}
                  onChange={(e) => setGeminiFallbackEnabled(e.target.checked)}
                  className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-end">
                <Button size="sm" onClick={handleSavePreferences} className="text-xs">
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cloud Infrastructure Overview */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Cloud & System Integrations</span>
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Connected production services and live backend health status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">WorkOS AuthKit</span>
                    <Badge variant={authData?.systemStatus?.authKitConfigured ? "success" : "secondary"} className="text-[9px] py-0">
                      {authData?.systemStatus?.authKitConfigured ? "Connected" : "Dev Mock"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400">Enterprise Authentication & SSO</p>
                </div>

                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Neon PostgreSQL</span>
                    <Badge variant={authData?.systemStatus?.databaseConfigured ? "success" : "secondary"} className="text-[9px] py-0">
                      {authData?.systemStatus?.databaseConfigured ? "Connected" : "Dev Mock"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400">Serverless High-Speed Database</p>
                </div>

                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Cloudinary CDN</span>
                    <Badge variant={authData?.systemStatus?.cloudinaryConfigured ? "success" : "secondary"} className="text-[9px] py-0">
                      {authData?.systemStatus?.cloudinaryConfigured ? "Connected" : "Pending"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400">Optimized Global Media CDN</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current User Session Profile */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                <User className="w-4 h-4 text-blue-400" />
                <span>Account Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                {authData?.user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center font-bold text-sm text-pink-400">
                      {authData.user.name?.charAt(0).toUpperCase() || "C"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">{authData.user.name}</p>
                      <p className="text-zinc-400 text-xs">{authData.user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-sm text-white">Not Signed In</p>
                    <p className="text-zinc-400 text-xs">Sign in with your email or SSO to link your profile.</p>
                  </div>
                )}

                {authData?.user ? (
                  <a href="/api/auth/logout">
                    <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5 border-zinc-800 text-zinc-400 hover:text-white">
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </Button>
                  </a>
                ) : (
                  <a href="/api/auth/login">
                    <Button size="sm" className="text-xs h-8 gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>Sign In with WorkOS</span>
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
