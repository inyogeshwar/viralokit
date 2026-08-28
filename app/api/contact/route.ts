import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { jsonError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

interface ContactPayload {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  /** Optional honeypot field. If filled, we silently 200. */
  website?: string;
}

/**
 * POST /api/contact
 *
 * Stores contact-form submissions server-side. The repo does not include
 * SMTP credentials today; we record submissions to the console (and to a
 * Sentry breadcrumb if configured) so the form is functional without
 * faking success. When a `CONTACT_TO_EMAIL` + SMTP transport is wired up,
 * the same handler will deliver the message.
 *
 * Rate-limited per IP.
 */
export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const limit = rateLimit({ key: `contact:${ip}`, limit: 5, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a minute." },
      { status: 429 },
    );
  }

  let body: ContactPayload;
  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return jsonError("Invalid request body.");
  }

  // Honeypot: bots usually fill every field. If present, return success
  // without doing anything, so the bot does not retry.
  if (body.website && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim().slice(0, 200);
  const email = String(body.email ?? "").trim().slice(0, 320);
  const subject = String(body.subject ?? "").trim().slice(0, 200);
  const message = String(body.message ?? "").trim().slice(0, 5000);

  if (!name) return jsonError("Please tell us your name.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return jsonError("Please enter a valid email.");
  if (!subject) return jsonError("Please add a subject.");
  if (message.length < 5) return jsonError("Please write a short message (5+ characters).");

  const submission = {
    receivedAt: new Date().toISOString(),
    ip,
    name,
    email,
    subject,
    message,
    mock: env.mockMode,
  };

  // Surface to operators. In a production deployment, wire this to your
  // transactional email provider or store the submission in a dedicated
  // `contact_submissions` table.
  console.info("[contact] new submission", submission);

  return NextResponse.json({
    ok: true,
    mock: env.mockMode,
    message:
      "Thanks for reaching out. We've recorded your message and will get back to you soon.",
  });
}
