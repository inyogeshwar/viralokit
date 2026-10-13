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
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { CapabilityBadges } from "@/components/instagram/capability-badges";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestedStatus, setKeyTestedStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash");
  const [creatorTheme, setCreatorTheme] = useState("Aesthetic DPs, Matching PFPs, Vector Art & Wallpapers");
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("viralokit_gemini_api_key");
      if (savedKey) setGeminiApiKey(savedKey);

      const savedTheme = localStorage.getItem("viralokit_creator_theme");
      if (savedTheme) setCreatorTheme(savedTheme);

      const savedModel = localStorage.getItem("viralokit_gemini_model");
      if (savedModel && savedModel !== "gemini-1.5-flash" && savedModel !== "openrouter/free") {
        setSelectedModel(savedModel);
      } else {
        setSelectedModel("gemini-3.5-flash");
        localStorage.setItem("viralokit_gemini_model", "gemini-3.5-flash");
      }
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

  // 3. Fetch Gemini Models
  const { data: modelsData } = useQuery({
    queryKey: ["ai-models"],
    queryFn: async () => {
      const res = await fetch("/api/ai/models");
      return res.json();
    },
  });

  const handleTestKey = async () => {
    const key = geminiApiKey.trim();
    if (!key) {
      toast.error("Please enter a Google Gemini API key first.");
      return;
    }

    setIsTestingKey(true);
    setKeyTestedStatus("idle");
    try {
      const res = await fetch("/api/ai/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setKeyTestedStatus("valid");
        toast.success(data.message || "Gemini API key is 100% active and working!");
      } else {
        setKeyTestedStatus("invalid");
        toast.error(data.error || "Invalid Gemini API key. Please verify at Google AI Studio.");
      }
    } catch {
      setKeyTestedStatus("invalid");
      toast.error("Network error testing Gemini API key.");
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveGeminiKey = () => {
    if (typeof window !== "undefined") {
      const trimmed = geminiApiKey.trim();
      if (trimmed) {
        localStorage.setItem("viralokit_gemini_api_key", trimmed);
        toast.success("Google Gemini API key saved! Used for all your captions & image audits.");
      } else {
        localStorage.removeItem("viralokit_gemini_api_key");
        toast.info("Gemini API key cleared from browser storage.");
      }
    }
  };

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
      localStorage.setItem("viralokit_gemini_model", selectedModel);
      if (geminiApiKey.trim()) {
        localStorage.setItem("viralokit_gemini_api_key", geminiApiKey.trim());
      }
    }
    toast.success("All creator preferences & Gemini settings saved!");
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
              <span className="text-[11px] text-zinc-500">• Google Gemini & Account</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-headline flex items-center gap-2">
              Settings & Account
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Configure your personal Google Gemini API key (Free Tier), Instagram publishing token, and default creator theme.
            </p>
          </div>

          {/* BYOK: Google Gemini API Key Card */}
          <div className="bg-[#0C0C0C] border border-pink-500/20 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
              <div className="space-y-1">
                <h3 className="text-base font-bold flex items-center gap-2 text-white font-headline">
                  <Key className="w-5 h-5 text-pink-400" />
                  <span>Google Gemini API Key (Bring Your Own Key)</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Enter your free Gemini API key from Google AI Studio. Stored privately in your browser.
                </p>
              </div>
              <Badge
                variant={geminiApiKey.trim() ? "success" : "warning"}
                className="text-[10px] py-1 px-3 self-start sm:self-auto"
              >
                {geminiApiKey.trim() ? "Key Saved (Active)" : "Free Key Needed"}
              </Badge>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-pink-500/5 border border-pink-500/20 text-zinc-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-pink-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    100% Free Forever (15 Requests/Min)
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-2"
                  >
                    <span>Get Free Key at aistudio.google.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Google AI Studio gives every user a free API key with no billing required. Using your own key ensures your requests never run out of credits or get throttled!
                </p>
              </div>

              {/* Key Input Field */}
              <div className="space-y-2">
                <label className="text-xs text-zinc-200 font-bold flex items-center justify-between">
                  <span>Your Gemini API Key:</span>
                  {keyTestedStatus === "valid" && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Key verified & working
                    </span>
                  )}
                  {keyTestedStatus === "invalid" && (
                    <span className="text-[11px] text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      Verification failed
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={geminiApiKey}
                    onChange={(e) => {
                      setGeminiApiKey(e.target.value);
                      setKeyTestedStatus("idle");
                    }}
                    placeholder="AIzaSy..."
                    className="w-full bg-black/60 border border-white/[0.1] rounded-2xl p-3.5 pr-11 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-pink-500 font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 cursor-pointer transition-colors"
                    title={showKey ? "Hide key" : "Show key"}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons for Key */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleTestKey}
                    disabled={isTestingKey || !geminiApiKey.trim()}
                    className="text-xs h-9 px-3.5 rounded-xl border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 cursor-pointer gap-1.5"
                  >
                    {isTestingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />}
                    <span>{isTestingKey ? "Testing..." : "Test Key"}</span>
                  </Button>

                  {geminiApiKey.trim() && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setGeminiApiKey("");
                        if (typeof window !== "undefined") {
                          localStorage.removeItem("viralokit_gemini_api_key");
                        }
                        setKeyTestedStatus("idle");
                        toast.info("Key cleared.");
                      }}
                      className="text-xs h-9 px-3 text-zinc-400 hover:text-red-400 cursor-pointer"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                <Button
                  size="sm"
                  onClick={handleSaveGeminiKey}
                  disabled={!geminiApiKey.trim()}
                  className="text-xs h-9 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold cursor-pointer"
                >
                  Save Key
                </Button>
              </div>
            </div>
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

          {/* Creator Theme & Gemini Model Preferences */}
          <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2 text-white font-headline">
                  <Palette className="w-5 h-5 text-purple-400" />
                  <span>Default Page Theme & Gemini Model</span>
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

              {/* Active Gemini Model */}
              <div className="space-y-2">
                <label className="text-xs text-zinc-300 font-medium">Google Gemini Model:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-black/60 border border-white/[0.1] rounded-2xl p-3.5 text-xs text-zinc-200 focus:outline-none focus:border-pink-500 cursor-pointer"
                >
                  {modelsData?.freeTextModels?.map((m: any) => (
                    <option key={m.id} value={m.id} className="bg-zinc-950">
                      {m.name}
                    </option>
                  )) || (
                    <>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Free — Recommended)</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-Gen Speed)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <Button size="sm" onClick={handleSavePreferences} className="text-xs h-9 px-5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold cursor-pointer">
                  Save All Preferences
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
