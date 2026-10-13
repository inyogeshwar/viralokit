"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Settings,
  Instagram,
  Sparkles,
  User,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Palette,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { CapabilityBadges } from "@/components/instagram/capability-badges";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [selectedModel, setSelectedModel] = useState("openrouter/free");
  const [geminiFallbackEnabled, setGeminiFallbackEnabled] = useState(true);
  const [creatorTheme, setCreatorTheme] = useState("Aesthetic DPs, Matching PFPs, Vector Art & Wallpapers");
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("viralokit_creator_theme");
      if (savedTheme) setCreatorTheme(savedTheme);
    }
  }, []);

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
  const { data: modelsData } = useQuery({
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

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your Instagram account? You will need to reconnect it to publish again.")) return;
    try {
      const res = await fetch("/api/meta/oauth/disconnect", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Account disconnected successfully");
        refetchCap();
      } else {
        toast.error(data.error || "Failed to disconnect");
      }
    } catch {
      toast.error("Network error disconnecting account");
    }
  };

  const handleConnect = () => {
    window.location.href = "/api/meta/oauth/start";
  };

  const handleSavePreferences = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("viralokit_creator_theme", creatorTheme);
    }
    toast.success("Creator preferences & default theme saved!");
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8">
          <div className="border-b border-white/[0.08] pb-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 border border-pink-500/25 px-2.5 py-0.5 rounded-full">
                Creator Settings
              </span>
              <span className="text-[11px] text-zinc-500">• Profile & AI Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-headline flex items-center gap-2">
              Settings & Account
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Manage your connected Instagram professional account and custom AI caption preferences.
            </p>
          </div>

          {/* Instagram Account Integration */}
          <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="space-y-1">
                <h3 className="text-base font-bold flex items-center gap-2 text-white font-headline">
                  <Instagram className="w-5 h-5 text-pink-400" />
                  <span>Instagram Professional Account</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Connected directly to Meta Graph API v23.0 for publishing and insights.
                </p>
              </div>
              <Badge variant={capabilities?.connected ? "success" : "warning"} className="text-[10px] py-1 px-3">
                {capabilities?.connected ? "Active & Connected" : "Not Connected"}
              </Badge>
            </div>

            <CapabilityBadges
              capabilities={capabilities}
              isLoading={isCapLoading}
              onRefresh={() => refetchCap()}
            />

            {capabilities?.connected ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-black/60 rounded-2xl border border-white/[0.08]">
                <div className="text-xs">
                  <p className="text-zinc-200 font-bold font-headline">Connection Actions</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Extend your 60-day token or disconnect your account.</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshToken}
                    disabled={isRefreshingToken}
                    className="h-9 px-4 rounded-xl text-xs gap-2 border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingToken ? "animate-spin text-pink-400" : ""}`} />
                    <span>{isRefreshingToken ? "Extending..." : "Extend Token"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                    className="h-9 px-4 rounded-xl text-xs gap-2 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 cursor-pointer"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-black/60 rounded-2xl border border-white/[0.08]">
                <div className="text-xs">
                  <p className="text-zinc-200 font-bold font-headline">Connect Instagram Professional Account</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Securely authenticate with Meta to enable publishing and analytics.</p>
                </div>
                <Button
                  onClick={handleConnect}
                  className="h-9 px-4 rounded-xl text-xs gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white cursor-pointer font-bold"
                >
                  <Instagram className="w-4 h-4" />
                  Connect Account
                </Button>
              </div>
            )}
          </div>

          {/* Creator Theme & AI Preferences */}
          <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2 text-white font-headline">
                  <Palette className="w-5 h-5 text-purple-400" />
                  <span>Default Page Theme & AI Caption Tone</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Set your page&apos;s primary theme so AI captions automatically match your visual aesthetic.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Custom Theme Prompt */}
              <div className="space-y-2">
                <label className="text-xs text-zinc-200 font-bold">Your Account Content Theme / Niche:</label>
                <input
                  type="text"
                  value={creatorTheme}
                  onChange={(e) => setCreatorTheme(e.target.value)}
                  placeholder="e.g. Aesthetic DPs, Matching PFPs, Vector Art, Wallpapers"
                  className="w-full bg-black/60 border border-white/[0.1] rounded-2xl p-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-pink-500 font-sans"
                />
                <p className="text-[11px] text-zinc-500">
                  When you generate captions in Studio, Google Gemini will tailor hooks and hashtags to this exact niche.
                </p>
              </div>

              {/* Active AI Model */}
              <div className="space-y-2">
                <label className="text-xs text-zinc-300 font-medium">Default AI Model:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-black/60 border border-white/[0.1] rounded-2xl p-3.5 text-xs text-zinc-200 focus:outline-none focus:border-pink-500 cursor-pointer"
                >
                  <option value="openrouter/free">Auto — Google Gemini Vision & Smart Router (Recommended)</option>
                  {modelsData?.freeTextModels?.map((m: any) => (
                    <option key={m.id} value={m.id} className="bg-zinc-950">
                      {m.name.replace(/\s*\(free\)/gi, "")} {m.supportsVision ? "• Vision Supported" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <Button size="sm" onClick={handleSavePreferences} className="text-xs h-9 px-5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold cursor-pointer">
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>

          {/* Current User Session Profile */}
          <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold flex items-center gap-2 text-white font-headline">
                <User className="w-5 h-5 text-blue-400" />
                <span>Account Profile</span>
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs">
              {authData?.user ? (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center font-extrabold text-sm text-pink-400 font-headline">
                    {authData.user.name?.charAt(0).toUpperCase() || "C"}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white font-headline">{authData.user.name}</p>
                    <p className="text-zinc-400 text-xs">{authData.user.email}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-sm text-white font-headline">Creator Session Active</p>
                  <p className="text-zinc-400 text-xs">Server-side authenticated for Instagram Creator Studio.</p>
                </div>
              )}

              {authData?.user ? (
                <a href="/api/auth/logout">
                  <Button variant="outline" size="sm" className="text-xs h-9 px-3.5 rounded-xl gap-2 border-white/[0.1] text-zinc-300 hover:text-white cursor-pointer">
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </Button>
                </a>
              ) : (
                <a href="/login">
                  <Button size="sm" className="text-xs h-9 px-4 rounded-xl gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium cursor-pointer">
                    <User className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Button>
                </a>
              )}
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
