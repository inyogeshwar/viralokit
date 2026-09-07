import React from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PostGram Creator Studio",
    operatingSystem: "Web",
    applicationCategory: "BusinessApplication",
    description:
      "Professional Instagram Creator Studio for multi-slide carousel publishing, live feed preview, AI copywriting, and verified Meta Graph API analytics.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-between selection:bg-pink-500/30 selection:text-pink-200 overflow-x-hidden">
      {/* Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background Ambience Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-pink-600/20 via-purple-600/20 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[600px] right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-600/10 via-purple-600/10 to-transparent blur-[130px] rounded-full" />
      </div>

      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-40 px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform duration-300">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-headline-md">
                PostGram
              </span>
              <span className="text-[10px] text-zinc-400 block -mt-1 font-medium tracking-wider uppercase">
                Creator Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#studio-preview" className="hover:text-white transition-colors">
              Studio
            </a>
            <a href="#analytics" className="hover:text-white transition-colors">
              Meta Insights
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              Workflow
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button size="sm" variant="ghost" className="text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="text-xs gap-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-md shadow-pink-500/20 font-semibold">
                <span>Launch Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 z-10">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 pt-16 sm:pt-24 pb-16 max-w-6xl mx-auto flex flex-col items-center text-center space-y-8">
          
          <Badge
            variant="outline"
            className="gap-2 py-1.5 px-3.5 text-xs rounded-full border-pink-500/30 bg-pink-500/10 text-pink-300 backdrop-blur-md shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span>Official Meta Graph API v23.0 Verified Partner Platform</span>
          </Badge>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.08] text-white">
            The Modern Studio for{" "}
            <span className="bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] bg-clip-text text-transparent">
              Instagram Creators
            </span>{" "}
            Who Scale.
          </h1>

          <p className="text-base sm:text-xl text-zinc-400 max-w-2xl leading-relaxed font-normal">
            Craft multi-slide carousels, preview realistic feeds live, generate viral captions with multimodal AI, and audit verified Meta performance insights — without limits.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="text-sm gap-2 h-12 px-7 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 shadow-xl shadow-pink-500/25 font-semibold active:scale-[0.98] transition-all"
              >
                <span>Launch Creator Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/create">
              <Button
                size="lg"
                variant="outline"
                className="text-sm h-12 px-7 border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 active:scale-[0.98] transition-all"
              >
                Create New Post
              </Button>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-zinc-400 font-medium border-t border-zinc-800/60 w-full max-w-3xl">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              100% Meta Graph API Compliant
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Zero Third-Party Watermarks
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Carousels Up to 10 Slides
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Direct Organic Publishing
            </span>
          </div>

          {/* Live Studio Mockup Showcase */}
          <div
            id="studio-preview"
            className="w-full pt-10 rounded-2xl md:rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-3 sm:p-5 shadow-2xl shadow-purple-500/5 relative overflow-hidden"
          >
            {/* Top Studio Browser Bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80 px-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-zinc-500 text-[11px] ml-2 font-mono">viralokit.vercel.app/studio</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-[10px] py-0">
                  Live Meta v23.0 Connected
                </Badge>
              </div>
            </div>

            {/* Split UI Demonstration */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
              {/* Left Column: Creator Studio Editor Controls */}
              <div className="lg:col-span-7 bg-zinc-950/70 rounded-2xl border border-zinc-800/80 p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-pink-400" />
                    <span className="font-semibold text-sm text-white">Carousel Studio (4 / 10 Slides)</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    Aspect Ratio: 4:5 Portrait
                  </Badge>
                </div>

                {/* Slides Visual Strip */}
                <div className="grid grid-cols-4 gap-2.5">
                  {[1, 2, 3, 4].map((slide) => (
                    <div
                      key={slide}
                      className="aspect-[4/5] rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden relative group p-1 flex items-end"
                    >
                      <div className="w-full h-full absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                        <span className="text-[10px] font-mono text-zinc-300 font-semibold">Slide {slide}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Copywriting Preview */}
                <div className="space-y-2 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Lumina AI Caption
                    </span>
                    <span className="text-[10px] text-pink-400 font-mono">Tone: Aesthetic</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    Stepping into the frame with intention. Every slide reflects a creative journey crafted to inspire and elevate. ✨📸
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] bg-zinc-800/90 text-zinc-300 px-2 py-0.5 rounded-md">#CreatorLife</span>
                    <span className="text-[10px] bg-zinc-800/90 text-zinc-300 px-2 py-0.5 rounded-md">#AestheticFeed</span>
                    <span className="text-[10px] bg-zinc-800/90 text-zinc-300 px-2 py-0.5 rounded-md">#VisualStorytelling</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-zinc-400">Ready for instant organic publish</span>
                  <Link href="/create">
                    <Button size="sm" className="text-xs gap-1.5 bg-gradient-to-r from-pink-600 to-purple-600 font-semibold">
                      Publish Now
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Live Instagram Phone View */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="w-full max-w-[320px] rounded-3xl bg-black border-[3px] border-zinc-800 shadow-2xl p-3.5 space-y-3">
                  {/* Phone Header */}
                  <div className="flex items-center justify-between text-xs text-white px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-500 to-pink-500 p-[1.5px]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold">
                          JG
                        </div>
                      </div>
                      <span className="font-semibold text-xs text-white">jay_gurudeventerprises</span>
                    </div>
                    <span className="text-zinc-500 font-bold">•••</span>
                  </div>

                  {/* Phone Image Container */}
                  <div className="aspect-[4/5] rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden relative flex items-center justify-center">
                    <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white font-mono">
                      1 / 4
                    </div>
                    <div className="w-16 h-16 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Phone Action Bar */}
                  <div className="flex items-center justify-between px-1 text-white">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      <MessageCircle className="w-5 h-5" />
                      <Send className="w-5 h-5 -rotate-12" />
                    </div>
                    <Bookmark className="w-5 h-5" />
                  </div>

                  {/* Phone Likes & Caption */}
                  <div className="px-1 text-xs space-y-1">
                    <p className="font-semibold text-white">121 likes</p>
                    <p className="text-zinc-300 text-[11px] line-clamp-2">
                      <span className="font-semibold text-white mr-1">jay_gurudeventerprises</span>
                      Stepping into the frame with intention. Every slide reflects a creative journey...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars Section */}
        <section id="features" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-xs text-purple-400 border-purple-500/30">
              Built for Modern Creators
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything You Need to Dominate the Feed.
            </h2>
            <p className="text-sm text-zinc-400">
              Stop juggling disjointed tools. PostGram unites carousel crafting, AI copywriting, and Meta analytics in a unified dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-pink-500/50 transition-all duration-300 space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-base text-white">Carousel Studio (2–10 Slides)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Drag-and-drop slide reordering, aspect ratio calibration (1:1, 4:5, 9:16), and instant container publishing directly via Meta Graph API.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-purple-500/50 transition-all duration-300 space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-base text-white">Lumina Multimodal AI Copy</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Visual image analysis generates tone-aligned captions, viral hooks, and high-conversion hashtags in English, Hinglish, Hindi, and Spanish.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-emerald-500/50 transition-all duration-300 space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-base text-white">Verified Meta Analytics</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Click any post to view official Instagram Insights: views, follower vs non-follower discovery, interactions, saves, and engagement breakdown.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-blue-500/50 transition-all duration-300 space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-base text-white">Enterprise Security & OAuth</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Server-side secret isolation, SSRF upload guards, System User long-lived authentication, and strict CSRF protection on all API endpoints.
              </p>
            </div>
          </div>
        </section>

        {/* Workflow / 3 Steps */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-zinc-950/60 border-y border-zinc-800/80">
          <div className="max-w-6xl mx-auto space-y-12 text-center">
            <div className="space-y-3 max-w-xl mx-auto">
              <Badge variant="outline" className="text-xs text-pink-400 border-pink-500/30">
                Simple 3-Step Flow
              </Badge>
              <h2 className="text-3xl font-bold text-white tracking-tight">How PostGram Works</h2>
              <p className="text-sm text-zinc-400">From raw creative concepts to live published posts in under 60 seconds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3 relative">
                <span className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 font-bold flex items-center justify-center text-sm">
                  1
                </span>
                <h3 className="font-semibold text-base text-white">Upload Media Assets</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Drop single photos or up to 10 images for carousels. Assets are optimized and cached via global Cloudinary CDN.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3 relative">
                <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-sm">
                  2
                </span>
                <h3 className="font-semibold text-base text-white">AI Vision & Copy Crafting</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Generate authentic, engaging captions, trending hashtags, and visual analyses tailored to your specific niche.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3 relative">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm">
                  3
                </span>
                <h3 className="font-semibold text-base text-white">Publish Direct to Meta</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Hit publish to trigger Meta Graph API two-step container orchestration. Posts go live organically on Instagram instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-indigo-500/15 border border-pink-500/30 backdrop-blur-xl space-y-6 relative overflow-hidden shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-pink-500/30">
              <Instagram className="w-7 h-7" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-2xl mx-auto leading-tight">
              Ready to Upgrade Your Instagram Publishing?
            </h2>

            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Experience the power of native Meta Graph API publishing, realistic preview studios, and AI copy generation.
            </p>

            <div className="pt-2">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="text-sm gap-2 h-12 px-8 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 shadow-xl shadow-pink-500/25 font-semibold active:scale-[0.98] transition-all"
                >
                  <span>Launch Creator Studio Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-zinc-800/80 py-10 px-6 bg-zinc-950 text-xs text-zinc-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center">
              <Instagram className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white text-sm">PostGram Creator Studio</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/create" className="hover:text-white transition-colors">
              Create Post
            </Link>
            <Link href="/posts" className="hover:text-white transition-colors">
              Posts Manager
            </Link>
            <Link href="/analytics" className="hover:text-white transition-colors">
              Analytics
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/data-deletion" className="hover:text-white transition-colors">
              Data Deletion
            </Link>
          </div>

          <p className="text-zinc-500 text-center md:text-right">
            © {new Date().getFullYear()} PostGram. Built for official Meta Graph API v23.0.
          </p>
        </div>
      </footer>
    </div>
  );
}
