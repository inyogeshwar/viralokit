import { NextRequest, NextResponse } from "next/server";

import { decryptToken } from "@/lib/crypto";
import { getDashboardContext } from "@/lib/context";
import { InstagramProvider } from "@/lib/providers/instagram";
import { jsonError, requireUserId } from "@/lib/http";

export const dynamic = "force-dynamic";

/** GET /api/engagement/ice-breakers — fetch the current IG app's ice breakers */
export async function GET() {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const ctx = await getDashboardContext();
  const active = ctx.accounts.find((a) => a.isActive) ?? ctx.accounts[0];
  if (!active) return jsonError("No connected Instagram account");

  try {
    const provider = new InstagramProvider({
      igUserId: active.igUserId,
      accessToken: decryptToken(active.accessToken),
    });
    const iceBreakers = await provider.getIceBreakers();
    return NextResponse.json({ ok: true, iceBreakers });
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Failed to fetch ice breakers",
      502,
    );
  }
}

/** POST /api/engagement/ice-breakers — set the IG app's ice breakers (max 4) */
export async function POST(req: NextRequest) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const ctx = await getDashboardContext();
  const active = ctx.accounts.find((a) => a.isActive) ?? ctx.accounts[0];
  if (!active) return jsonError("No connected Instagram account");

  const body = (await req.json().catch(() => ({}))) as {
    questions?: Array<{ question?: string; payload?: string }>;
  };
  const questions = (body.questions ?? [])
    .map((q) => ({
      question: String(q.question ?? "").trim(),
      payload: String(q.payload ?? "").trim(),
    }))
    .filter((q) => q.question && q.payload);

  if (questions.length === 0) {
    return jsonError("At least one question is required");
  }
  if (questions.length > 4) {
    return jsonError("Maximum 4 ice breakers");
  }

  try {
    const provider = new InstagramProvider({
      igUserId: active.igUserId,
      accessToken: decryptToken(active.accessToken),
    });
    const result = await provider.setIceBreakers(questions);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Failed to set ice breakers",
      502,
    );
  }
}

/** DELETE /api/engagement/ice-breakers — remove all ice breakers */
export async function DELETE() {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const ctx = await getDashboardContext();
  const active = ctx.accounts.find((a) => a.isActive) ?? ctx.accounts[0];
  if (!active) return jsonError("No connected Instagram account");

  try {
    const provider = new InstagramProvider({
      igUserId: active.igUserId,
      accessToken: decryptToken(active.accessToken),
    });
    const result = await provider.deleteIceBreakers();
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Failed to delete ice breakers",
      502,
    );
  }
}
