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
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-pink-500/30 selection:text-pink-200">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Instagram className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            PostGram
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button size="sm" variant="outline" className="text-xs">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/create">
            <Button size="sm" className="text-xs gap-1.5">
              <span>Publish Post</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-16 sm:py-24 max-w-5xl mx-auto space-y-8">
        <Badge variant="default" className="gap-1.5 py-1 px-3 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Meta Graph API v23.0 • Dynamic FREE OpenRouter AI</span>
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.1]">
          Publish, Analyze & Scale on{" "}
          <span className="instagram-gradient-text">Instagram</span> with Zero-Cost Infrastructure.
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          Craft single image and 2–10 item carousels, preview realistic feeds live, publish directly to Meta, audit official analytics, and optimize with free AI models.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/dashboard">
            <Button size="lg" className="text-sm gap-2">
              <span>Launch Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/create">
            <Button size="lg" variant="secondary" className="text-sm">
              Create New Post
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full pt-12 text-left">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-white">Carousels & Single Posts</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload 1 to 10 images via Cloudinary CDN, reorder slides, and publish using two-step Meta containers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-white">Dynamic FREE AI Models</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Real-time model discovery from OpenRouter with auto-routing (`openrouter/free`) and Gemini Free Tier fallback.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-white">Real Meta Analytics</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Official reach, impressions, interactions, and leaderboard stats directly from Meta Graph API. Zero fake data.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-white">Safe Media Deletion</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Single and bulk deletion with pace-controlled rate limiting and granular per-post confirmation.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-6 px-6 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-6xl mx-auto w-full">
        <p>© 2026 PostGram. Built for Instagram creators with official Meta Graph API v23.0.</p>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">
            Dashboard
          </Link>
          <Link href="/analytics" className="hover:text-zinc-300 transition-colors">
            Analytics
          </Link>
          <Link href="/settings" className="hover:text-zinc-300 transition-colors">
            Settings
          </Link>
        </div>
      </footer>
    </div>
  );
}
