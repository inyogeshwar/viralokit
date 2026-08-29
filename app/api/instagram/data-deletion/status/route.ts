/**
 * GET /api/instagram/data-deletion/status?code=…
 *
 * The URL we return to Meta from the data-deletion callback. The user
 * can visit this URL to see the current status of their deletion
 * request. In production this would be a real page; for now we return
 * JSON so it can be rendered by either the same route or a separate
 * UI page.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { ok: false, error: "Missing code" },
      { status: 400 },
    );
  }

  // The deletion is performed synchronously inside the callback, so by
  // the time the user reaches this URL the work is done. We return a
  // human-readable summary.
  return NextResponse.json({
    ok: true,
    confirmation_code: code,
    status: "complete",
    message:
      "Your data has been removed from our active systems. Backups may take up to 90 days to fully expire.",
  });
}
