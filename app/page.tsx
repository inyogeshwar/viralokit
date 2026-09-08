"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Instagram,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Layers,
  CheckCircle2,
  Image as ImageIcon,
  TrendingUp,
  Clock,
  Heart,
  MessageCircle,
  Eye,
  Bookmark,
  Send,
  Lock,
  Globe2,
  FolderLock,
  Trash2,
  Sliders,
  ChevronDown,
  ExternalLink,
  Smartphone,
  Cpu,
  RefreshCw,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"carousel" | "insights" | "cdn">("carousel");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ViraloKit — Professional Instagram Creator Studio",
    operatingSystem: "Web",
    applicationCategory: "BusinessApplication",
    description:
      "Professional Instagram Creator Studio for multi-slide carousel publishing, live feed preview, AI copywriting, verified Meta Graph API analytics, and isolated 25 GB media storage.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const faqs = [
    {
      q: "Is publishing through ViraloKit compliant with Meta policies?",
      a: "Yes, 100%. ViraloKit connects directly to the official Meta Graph API v23.0 using your verified Meta Developer app credentials or permanent System User token. There is zero scraping, zero browser automation, and zero risk of shadowbans.",
    },
    {
      q: "How many carousel slides can I publish at once?",
      a: "You can publish 2 to 10 high-resolution images per carousel album. ViraloKit automatically optimizes each image to 1080px and provides aspect ratio locking for 1:1 Square, 4:5 Portrait, and 9:16 Story formats.",
    },
    {
      q: "How does the isolated 25 GB Cloudinary storage work?",
      a: "Every creator gets a dedicated, isolated folder named after their verified Instagram handle (e.g., postgram/users/ig_yourusername). Once your post is published to Instagram, Meta copies the media to its own servers, so you can safely purge all uploaded files from Cloudinary anytime with 1 click to keep your 25 GB free quota empty.",
    },
    {
      q: "Why do my Meta Graph API tokens expire and how can I fix it?",
      a: "Standard Graph API user access tokens expire every 60 days. ViraloKit provides full support for Meta System User tokens generated through Meta Business Manager, which have permanent, lifetime validity and never expire.",
    },
    {
      q: "Which AI models power the caption generator and visual analysis?",
      a: "ViraloKit integrates dynamic model routing with OpenRouter (accessing top free open-weights models) and Google Gemini 1.5 Flash for multimodal visual subject and mood analysis.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col justify-between selection:bg-pink-500/30 selection:text-pink-200 overflow-x-hidden font-sans">
      {/* Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background Ambience Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-tr from-pink-600/15 via-purple-600/15 to-transparent blur-[160px] rounded-full" />
        <div className="absolute top-[800px] right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-600/10 via-purple-600/10 to-transparent blur-[150px] rounded-full" />
        <div className="absolute top-[1800px] left-[-100px] w-[600px] h-[600px] bg-gradient-to-tr from-pink-600/10 via-amber-600/10 to-transparent blur-[160px] rounded-full" />
      </div>

      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800/80 bg-[#050507]/85 backdrop-blur-2xl sticky top-0 z-50 px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform duration-300">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-headline">
                ViraloKit
              </span>
              <span className="text-[10px] text-zinc-400 block -mt-1 font-medium tracking-wider uppercase">
                Creator Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
            <a href="#studio-preview" className="hover:text-white transition-colors cursor-pointer">
              Interactive Studio
            </a>
            <a href="#features" className="hover:text-white transition-colors cursor-pointer">
              Capabilities
            </a>
            <a href="#insights" className="hover:text-white transition-colors cursor-pointer">
              Meta Insights
            </a>
            <a href="#storage" className="hover:text-white transition-colors cursor-pointer">
              25 GB Cloud
            </a>
            <a href="#faq" className="hover:text-white transition-colors cursor-pointer">
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button size="sm" variant="ghost" className="text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 cursor-pointer">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="text-xs gap-1.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 shadow-md shadow-pink-500/20 font-semibold cursor-pointer border-0">
                <span>Launch Studio Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 z-10">
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative px-4 sm:px-6 pt-16 sm:pt-28 pb-16 max-w-6xl mx-auto flex flex-col items-center text-center space-y-8">
          {/* Status Badge */}
          <Badge
            variant="outline"
            className="gap-2 py-1.5 px-4 text-xs rounded-full border-pink-500/30 bg-pink-500/10 text-pink-300 backdrop-blur-md shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Official Meta Graph API v23.0 Verified Studio</span>
          </Badge>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.08] text-white font-headline">
            Publish, Analyze & Scale on Instagram with{" "}
            <span className="bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] bg-clip-text text-transparent">
              Zero Guesswork
            </span>
          </h1>

          {/* Value Prop Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed">
            The next-generation creator studio for serious Instagram brands. Compose multi-slide carousels,
            audit 100% verified Meta insights, craft AI captions, and manage media with dedicated 25 GB cloud isolation.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 text-sm gap-2 font-semibold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 shadow-xl shadow-pink-500/25 border-0 cursor-pointer transition-all transform hover:-translate-y-0.5"
              >
                <span>Start Creating Now — 100% Free</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <a href="#studio-preview" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-6 text-sm gap-2 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900/60 cursor-pointer backdrop-blur-md"
              >
                <span>Explore Interactive Demo</span>
              </Button>
            </a>
          </div>

          {/* Highlights Proof Pill Strip */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left w-full max-w-3xl">
            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm">
              <p className="text-xs text-zinc-400">Meta Publishing Limit</p>
              <p className="text-sm font-bold text-white font-mono">100 Posts / Day</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm">
              <p className="text-xs text-zinc-400">Carousel Albums</p>
              <p className="text-sm font-bold text-pink-400 font-mono">2 to 10 Slides</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm">
              <p className="text-xs text-zinc-400">Meta Insights</p>
              <p className="text-sm font-bold text-emerald-400 font-mono">100% Live Graph API</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm">
              <p className="text-xs text-zinc-400">Media CDN Storage</p>
              <p className="text-sm font-bold text-blue-400 font-mono">25 GB Isolated</p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* INTERACTIVE STUDIO & POST INSIGHTS PREVIEW (BENTO SHOWCASE) */}
        {/* ========================================================================= */}
        <section id="studio-preview" className="px-4 sm:px-6 py-16 max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">
              Interactive Live Preview
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-headline">
              Experience the Studio Interface
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
              Switch between tabs below to inspect how carousel creation, official Meta insights, and CDN storage operate.
            </p>
          </div>

          {/* Preview Tab Controls */}
          <div className="flex items-center justify-center gap-2 p-1.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl max-w-md mx-auto">
            <button
              onClick={() => setActiveTab("carousel")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "carousel"
                  ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Carousel Studio</span>
            </button>

            <button
              onClick={() => setActiveTab("insights")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "insights"
                  ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Live Insights</span>
            </button>

            <button
              onClick={() => setActiveTab("cdn")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "cdn"
                  ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <FolderLock className="w-3.5 h-3.5" />
              <span>25 GB CDN</span>
            </button>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/70 via-zinc-950/90 to-black p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
            {activeTab === "carousel" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left: Studio Editor Controls */}
                <div className="lg:col-span-7 space-y-5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-pink-400" />
                      <span>Carousel Slide Manager (2-10 Slides)</span>
                    </span>
                    <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                      Aspect Ratio: 1:1 Square
                    </Badge>
                  </div>

                  {/* Simulated Slides Ribbon */}
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className={`aspect-square rounded-xl border p-1 flex flex-col justify-between text-[10px] font-bold transition-all cursor-pointer ${
                          idx === 1
                            ? "border-pink-500 bg-pink-500/10 text-pink-300 ring-2 ring-pink-500/20"
                            : "border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:border-zinc-700"
                        }`}
                      >
                        <span>#{idx}</span>
                        <span className="text-[9px] font-normal">{idx === 1 ? "Cover" : "Slide"}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI Generated Caption Box */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        AI Copywriter Hook
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">1,842 chars remaining</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      &ldquo;Mastering high-impact visual storytelling on Instagram isn&apos;t luck — it&apos;s a repeatable architecture.
                      Swipe through for our 5-slide breakdown. 📸✨ #CreatorStudio #VisualStorytelling #InstagramGrowth&rdquo;
                    </p>
                  </div>

                  {/* Publishing Bar */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Direct Meta v23.0 Server Publish</span>
                    </div>

                    <Button size="sm" className="bg-pink-600 hover:bg-pink-500 text-white text-xs gap-1.5 cursor-pointer">
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish Live to Feed</span>
                    </Button>
                  </div>
                </div>

                {/* Right: Phone Mockup */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-[280px] sm:w-[300px] rounded-[38px] border-4 border-zinc-800 bg-black p-3 shadow-2xl relative overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-900 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center font-bold text-[10px] text-white">
                          J
                        </div>
                        <span className="font-bold text-white text-[11px]">@jay_gurudeventerprises</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] py-0 px-1 border-pink-500/40 text-pink-400">
                        Live Feed
                      </Badge>
                    </div>

                    {/* Image Area */}
                    <div className="aspect-square rounded-2xl bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900 my-2 relative overflow-hidden flex items-center justify-center border border-zinc-800">
                      <div className="text-center p-4 space-y-1">
                        <Instagram className="w-8 h-8 text-pink-400 mx-auto opacity-80" />
                        <p className="text-[11px] font-bold text-white">Carousel Slide 1 of 5</p>
                        <p className="text-[9px] text-zinc-400">1080 × 1080 • 1:1 Square</p>
                      </div>
                      <span className="absolute top-2 right-2 bg-black/75 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white">
                        1/5
                      </span>
                    </div>

                    {/* Post Engagement Bar */}
                    <div className="flex items-center justify-between text-xs py-1 text-zinc-300">
                      <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                        <MessageCircle className="w-4 h-4" />
                        <Share2 className="w-4 h-4" />
                      </div>
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] font-bold text-white text-left">121 likes • 14,561 views</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "insights" && (
              <div className="max-w-3xl mx-auto space-y-6 text-left">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-emerald-400" />
                      <span>Verified Meta Graph API Media Insights</span>
                    </h3>
                    <p className="text-xs text-zinc-400">Live analytics parsed directly from Meta Graph API v23.0 endpoint</p>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    100% Real Graph Data
                  </Badge>
                </div>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                    <p className="text-xs text-zinc-400 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>Total Views</span>
                    </p>
                    <p className="text-xl font-extrabold text-white font-mono mt-1">14,561</p>
                    <p className="text-[10px] text-emerald-400">99.3% Non-followers</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                    <p className="text-xs text-zinc-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-pink-400" />
                      <span>Unique Reach</span>
                    </p>
                    <p className="text-xl font-extrabold text-white font-mono mt-1">12,890</p>
                    <p className="text-[10px] text-zinc-400">Accounts reached</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                    <p className="text-xs text-zinc-400 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-red-400" />
                      <span>Interactions</span>
                    </p>
                    <p className="text-xl font-extrabold text-white font-mono mt-1">192</p>
                    <p className="text-[10px] text-zinc-400">121 Likes • 30 Shares</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                    <p className="text-xs text-zinc-400 flex items-center gap-1">
                      <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                      <span>Saved</span>
                    </p>
                    <p className="text-xl font-extrabold text-white font-mono mt-1">15</p>
                    <p className="text-[10px] text-zinc-400">13 Profile Visits</p>
                  </div>
                </div>

                {/* Breakdown Progress Bars */}
                <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3">
                  <span className="text-xs font-semibold text-white">Discovery Traffic Source:</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-400 text-[11px]">
                      <span>From Home & Explore Feed (14,324 views)</span>
                      <span className="font-mono text-white font-bold">98.4%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-400 to-blue-500 h-full w-[98.4%]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "cdn" && (
              <div className="max-w-3xl mx-auto space-y-6 text-left">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <FolderLock className="w-5 h-5 text-blue-400" />
                      <span>Isolated Cloudinary Media Management</span>
                    </h3>
                    <p className="text-xs text-zinc-400">Dedicated username directory with 25 GB free quota monitoring</p>
                  </div>
                  <Badge variant="outline" className="border-blue-500/40 text-blue-300 text-[10px]">
                    Zero-Quota Anxiety
                  </Badge>
                </div>

                {/* Directory Display */}
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-300">Your Isolated Cloud Directory:</span>
                    <Badge variant="success" className="text-[9px]">Private & Segregated</Badge>
                  </div>
                  <code className="block p-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 font-mono text-xs text-emerald-300">
                    postgram/users/ig_jay_gurudeventerprises/
                  </code>
                  <p className="text-[11px] text-zinc-400">
                    Other creators cannot access your folder. You can safely purge all uploaded images with 1 click anytime.
                  </p>
                </div>

                {/* 25 GB Quota Gauge */}
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-white">
                    <span>25 GB Free Tier Quota Usage</span>
                    <span className="font-mono text-blue-400">0.28% used</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full w-[2%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>0.07 credits used</span>
                    <span>Limit: 25.00 credits (~25 GB)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BENTO GRID OF CORE CAPABILITIES */}
        {/* ========================================================================= */}
        <section id="features" className="px-4 sm:px-6 py-20 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-xs border-pink-500/30 text-pink-300">
              Core Capabilities
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-headline">
              Engineered for Serious Creators
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              No fragile automation, no cookie scraping. Built exclusively on official Meta Graph API v23.0 infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {/* Bento Card 1: Official Meta API */}
            <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-pink-500/40 transition-all duration-300 space-y-3 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                <Instagram className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Meta Graph API v23.0 Engine</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect your Instagram Professional Account directly. Publish carousel albums, reels, and photos with zero shadowban risk.
              </p>
            </div>

            {/* Bento Card 2: Deep Insights */}
            <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-emerald-500/40 transition-all duration-300 space-y-3 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Verified Post Insights</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Audit true live metrics: Total Views, Reach, Non-follower distribution, Profile visits, and Saves parsed directly from Meta endpoints.
              </p>
            </div>

            {/* Bento Card 3: Multimodal AI */}
            <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-amber-500/40 transition-all duration-300 space-y-3 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Multimodal AI Studio</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                AI visual subject recognition, mood analysis, viral caption generation, and hashtag recommendations powered by OpenRouter & Gemini.
              </p>
            </div>

            {/* Bento Card 4: 25 GB Cloudinary Storage */}
            <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-blue-500/40 transition-all duration-300 space-y-3 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <FolderLock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Isolated 25 GB Media Cloud</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                User-segregated storage under your handle. Purge uploaded media in 1 click to keep your 25 GB CDN quota free permanently.
              </p>
            </div>

            {/* Bento Card 5: High-Res Carousels */}
            <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-purple-500/40 transition-all duration-300 space-y-3 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Smart Carousel Builder</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Upload 2 to 10 slides, reorder on the fly, and lock aspect ratios (1:1 Square, 4:5 Portrait, 9:16 Story) with client-side 1080px optimization.
              </p>
            </div>

            {/* Bento Card 6: Enterprise Security */}
            <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-indigo-500/40 transition-all duration-300 space-y-3 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Zero-Leak Security Architecture</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                WorkOS AuthKit authentication, Neon PostgreSQL isolation, GitGuardian verified pre-commit shields, and server-side token encryption.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* WORKFLOW STEPS (HOW IT WORKS) */}
        {/* ========================================================================= */}
        <section id="workflow" className="px-4 sm:px-6 py-20 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">
              Simple 3-Step Process
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-headline">
              How ViraloKit Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 space-y-3 relative overflow-hidden">
              <span className="text-4xl font-extrabold text-pink-500/20 font-headline absolute top-4 right-6">01</span>
              <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-base text-white">Connect Instagram</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Link your Instagram Professional account with official Meta Graph API v23.0 server-side tokens in under 60 seconds.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 space-y-3 relative overflow-hidden">
              <span className="text-4xl font-extrabold text-purple-500/20 font-headline absolute top-4 right-6">02</span>
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-base text-white">Compose with AI</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Upload up to 10 carousel slides. Let multimodal AI analyze visual themes and write viral, engagement-driven captions.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 space-y-3 relative overflow-hidden">
              <span className="text-4xl font-extrabold text-emerald-500/20 font-headline absolute top-4 right-6">03</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-base text-white">Publish & Inspect</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Publish directly to your live Instagram feed. Track real-time views, reach, non-follower discovery, and saves.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CREATOR FAQS */}
        {/* ========================================================================= */}
        <section id="faq" className="px-4 sm:px-6 py-20 max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
              Questions & Answers
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-headline">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3 text-left">
            {faqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-white hover:text-pink-300 transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-pink-400" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CLIMAX CTA */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 py-20 max-w-5xl mx-auto text-center">
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-black border border-pink-500/30 relative overflow-hidden shadow-2xl space-y-6">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent pointer-events-none" />

            <Badge variant="outline" className="text-xs border-pink-500/40 text-pink-300">
              Ready to Upgrade Your Instagram Publishing?
            </Badge>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto leading-tight font-headline">
              Experience the Future of Creator Studios Today
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              No credit card required. Connect your Instagram account and publish high-resolution carousels with verified Meta Graph API insights.
            </p>

            <div className="pt-2 flex justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="px-10 py-6 text-sm font-bold bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 text-white shadow-xl shadow-pink-500/25 border-0 cursor-pointer transition-all transform hover:scale-105"
                >
                  <span>Launch ViraloKit Studio Free</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* PROFESSIONAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-zinc-800/80 py-10 px-6 bg-zinc-950 text-xs text-zinc-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-md shadow-pink-500/20">
              <Instagram className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm font-headline">ViraloKit</span>
              <span className="text-[10px] text-zinc-500 block -mt-0.5 font-sans">Official Meta v23.0 Creator Studio</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400">
            <Link href="/dashboard" className="hover:text-white transition-colors cursor-pointer">
              Studio
            </Link>
            <Link href="/create" className="hover:text-white transition-colors cursor-pointer">
              Create Post
            </Link>
            <Link href="/posts" className="hover:text-white transition-colors cursor-pointer">
              Live Feed
            </Link>
            <Link href="/analytics" className="hover:text-white transition-colors cursor-pointer">
              Analytics
            </Link>
            <Link href="/settings" className="hover:text-white transition-colors cursor-pointer">
              25 GB Cloud
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors cursor-pointer">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors cursor-pointer">
              Terms
            </Link>
            <Link href="/data-deletion" className="hover:text-white transition-colors cursor-pointer">
              Data Deletion
            </Link>
          </div>

          <p className="text-zinc-500 text-center md:text-right">
            © {new Date().getFullYear()} ViraloKit. Built for official Meta Graph API v23.0.
          </p>
        </div>
      </footer>
    </div>
  );
}
