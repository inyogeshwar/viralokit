"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LEGAL_CONTACTS } from "@/lib/legal";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  // Honeypot field for bots. If filled we silently accept (handled server-side).
  const [website, setWebsite] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement)?.value ?? "",
      email: (form.elements.namedItem("email") as HTMLInputElement)?.value ?? "",
      subject: (form.elements.namedItem("subject") as HTMLInputElement)?.value ?? "",
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)?.value ?? "",
      website, // honeypot
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.error ?? "Could not send your message. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      form.reset();
      setWebsite("");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="prose prose-neutral dark:prose-invert mb-12">
        <h1>Contact Us</h1>
        <p className="text-muted-foreground">
          Have a question, suggestion, or need help? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-3 mb-12">
        <div className="flex flex-col items-center rounded-xl border bg-card p-6 text-center">
          <Mail className="mb-3 size-6 text-rose-500" />
          <h3 className="mb-1 text-sm font-semibold">Email</h3>
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
          <div className="text-center py-8" role="status" aria-live="polite">
            <div className="mb-4 text-4xl" aria-hidden="true">✅</div>
            <h3 className="mb-2 text-lg font-semibold">Message sent</h3>
            <p className="text-sm text-muted-foreground">
              Thanks for reaching out. We&apos;ll get back to you within 1–2 business days.
            </p>
            <Button
              type="button"
              variant="ghost"
              className="mt-4"
              onClick={() => setStatus("idle")}
            >
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Your name" required maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required maxLength={320} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" placeholder="How can we help?" required maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" placeholder="Tell us more..." rows={5} required maxLength={5000} />
            </div>
            {/* Honeypot — hidden from humans and screen readers. */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={status === "submitting"}>
              <Send className="mr-2 size-4" />
              {status === "submitting" ? "Sending…" : "Send Message"}
            </Button>
            <p className="text-xs text-muted-foreground">
              By submitting, you agree we may store your message to reply. We do not
              use it for marketing.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
