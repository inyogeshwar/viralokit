import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

const ContactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
  // Honeypot — bots love filling extra fields. Real users never see it.
  website: z.string().max(0).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const limiter = rateLimit({ key: `contact:${ip}`, limit: 5, windowMs: 60_000 });
  if (!limiter.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait a minute and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(limiter.resetMs / 1000)) },
      },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const parsed = ContactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please fill all fields. The message should be at least 10 characters.",
      },
      { status: 400 },
    );
  }

  if (parsed.data.website && parsed.data.website.length > 0) {
    // Honeypot triggered — pretend success without logging.
    return NextResponse.json({ ok: true, mock: env.mockMode });
  }

  if (typeof console !== "undefined") {
    console.info("[contact] new submission", {
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      messagePreview: parsed.data.message.slice(0, 200),
      at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true, mock: env.mockMode });
}
