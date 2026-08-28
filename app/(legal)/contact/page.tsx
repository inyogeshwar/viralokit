"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LEGAL_CONTACTS, PRODUCT_NAME } from "@/lib/legal";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      website: String(formData.get("website") ?? ""), // honeypot
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setErrorMsg(json.error || `Request failed (${res.status}).`);
        return;
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Network error.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="prose prose-neutral dark:prose-invert mb-12">
        <h1>Contact us</h1>
        <p className="text-muted-foreground">
          Have a question, suggestion, or need help? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-3 mb-12">
        <div className="flex flex-col items-center rounded-xl border bg-card p-6 text-center">
          <Mail className="mb-3 size-6 text-rose-500" />
          <h3 className="mb-1 text-sm font-semibold">Support</h3>
          <a href={`mailto:${LEGAL_CONTACTS.general}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {LEGAL_CONTACTS.general}
          </a>
        </div>
        <div className="flex flex-col items-center rounded-xl border bg-card p-6 text-center">
          <MessageSquare className="mb-3 size-6 text-blue-500" />
          <h3 className="mb-1 text-sm font-semibold">Feedback</h3>
          <a href={`mailto:${LEGAL_CONTACTS.feedback}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {LEGAL_CONTACTS.feedback}
          </a>
        </div>
        <div className="flex flex-col items-center rounded-xl border bg-card p-6 text-center">
          <Send className="mb-3 size-6 text-green-500" />
          <h3 className="mb-1 text-sm font-semibold">Business</h3>
          <a href={`mailto:${LEGAL_CONTACTS.business}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {LEGAL_CONTACTS.business}
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-xl rounded-xl border bg-card p-8">
        {status === "success" ? (
          <div className="text-center py-8">
            <div className="mb-4 text-4xl">✅</div>
            <h3 className="mb-2 text-lg font-semibold">Message sent</h3>
            <p className="text-sm text-muted-foreground">
              Thank you for reaching out. We&apos;ll get back to you within one business day.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={() => setStatus("idle")}
            >
              Send another
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Your name" required maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" placeholder="How can we help?" required maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" placeholder="Tell us more..." rows={5} required minLength={10} maxLength={5000} />
            </div>
            {/* Honeypot — must remain empty */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            {status === "error" && errorMsg ? (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            ) : null}
            <Button type="submit" className="w-full" disabled={status === "submitting"}>
              {status === "submitting" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Send message
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              We use your message only to reply. By submitting you agree to our{" "}
              <a href="/privacy-policy" className="underline">Privacy Policy</a>.
            </p>
            <p className="sr-only">Product: {PRODUCT_NAME}</p>
          </form>
        )}
      </div>
    </div>
  );
}
