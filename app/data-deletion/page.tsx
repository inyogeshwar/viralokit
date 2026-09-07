import React from "react";
import Link from "next/link";
import { Trash2, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "User Data Deletion Instructions | ViraloKit",
  description: "How to delete your user data from ViraloKit",
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to ViraloKit
        </Link>

        <div className="border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Data Deletion Instructions</h1>
          </div>
          <p className="text-xs text-zinc-500">
            In accordance with Meta Platform Rules and GDPR/CCPA regulations, here is how you can delete your data from ViraloKit.
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-zinc-300">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">How to Delete Your Data</h2>
            
            <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Option 1: Remove via Facebook / Instagram Account Settings
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 text-xs ml-2">
                <li>Log in to your Facebook account and go to <strong>Settings & Privacy</strong> &gt; <strong>Settings</strong>.</li>
                <li>In the left sidebar, click <strong>Apps and Websites</strong>.</li>
                <li>Locate <strong>ViraloKit</strong> in the list of authorized apps.</li>
                <li>Click <strong>Remove</strong>.</li>
                <li>Check the box to delete all posts, videos, or events published by ViraloKit if desired, and click <strong>Remove</strong>.</li>
              </ol>
            </div>

            <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Option 2: Direct Erasure Request
              </h3>
              <p className="text-xs text-zinc-400">
                To request that all stored account IDs, access tokens, and associated logs be immediately purged from our servers:
              </p>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-mono text-zinc-300">
                Send an email to: <span className="text-pink-400">support@viralokit.com</span>
                <br />
                Subject: <span className="text-white">Data Deletion Request - [Your Instagram Username]</span>
              </div>
              <p className="text-xs text-zinc-500">
                Requests are processed within 48 business hours, and confirmation is provided via return email.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
