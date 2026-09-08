import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | ViraloKit",
  description: "Privacy Policy for ViraloKit Instagram Creator Platform",
};

export default function PrivacyPolicyPage() {
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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-headline">Privacy Policy</h1>
          </div>
          <p className="text-xs text-zinc-500">Last updated: September 8, 2026 • Meta Graph v23.0 Compliant</p>
        </div>

        <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-zinc-300 shadow-xl">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">1. Overview</h2>
            <p>
              ViraloKit (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) provides an automated creator studio for Instagram creators and businesses. We respect your privacy and are committed to protecting your personal data in full compliance with Meta Platform Policies and applicable data protection regulations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">2. Information We Collect</h2>
            <p>
              When you connect your Instagram account or use ViraloKit, we may access and process:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
              <li>Instagram Business Account ID, username, and profile details via the Meta Graph API.</li>
              <li>OAuth access tokens required to publish content and read post insights on your behalf.</li>
              <li>Media assets (images, captions) you explicitly upload or generate for publishing.</li>
              <li>Account performance metrics (reach, impressions, engagement) to render your analytics dashboard.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">3. How We Use Information</h2>
            <p>
              We process your data strictly to provide core features:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
              <li>Publishing scheduled or immediate posts and carousels to your connected Instagram account.</li>
              <li>Displaying analytics, reach, and performance benchmarks in your dashboard.</li>
              <li>Generating AI-assisted captions and hashtags based on user prompts.</li>
            </ul>
            <p className="text-zinc-400">
              We never sell your personal information or use your private data to train public foundation models without your consent.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">4. Token Security & Storage</h2>
            <p>
              Access tokens are transmitted over TLS and stored securely server-side. Access tokens are never exposed to public client-side code or third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">5. Data Retention and Deletion</h2>
            <p>
              You have full control over your data at any time. You may disconnect your Instagram account or request complete erasure of your data via our{" "}
              <Link href="/data-deletion" className="text-pink-400 hover:underline">
                Data Deletion Instructions
              </Link>
              .
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">6. Contact Information</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact our team at:
              <br />
              <span className="font-mono text-zinc-200">support@viralokit.com</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
