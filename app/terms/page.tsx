import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | ViraloKit",
  description: "Terms of Service for ViraloKit Instagram Creator Platform",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-pink-500 selection:text-white">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to ViraloKit
        </Link>

        <div className="border-b border-white/[0.08] pb-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-headline">Terms of Service</h1>
          </div>
          <p className="text-xs text-zinc-500">Last updated: September 8, 2026 • Meta Graph v23.0 Compliant</p>
        </div>

        <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-zinc-300 shadow-xl">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using ViraloKit, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">2. Meta Platform Compliance</h2>
            <p>
              ViraloKit integrates with the Meta Graph API and Instagram Platform. Users must comply with Meta&apos;s Community Guidelines, Terms of Service, and Developer Policies. You may not use ViraloKit for spam, unauthorized scraping, or publishing misleading content.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">3. User Content & Intellectual Property</h2>
            <p>
              You retain all ownership rights to the media, captions, and visual assets you publish via ViraloKit. You represent and warrant that you hold all necessary licenses and copyrights for content uploaded to our service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">4. Service Availability & Rate Limits</h2>
            <p>
              We strive to provide continuous uptime, but services may occasionally be constrained by Meta Graph API rate limits or third-party service maintenance.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">5. Termination & Disconnection</h2>
            <p>
              You may terminate your account and disconnect your Instagram profile at any time through the platform Settings.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
