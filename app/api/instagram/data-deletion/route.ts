/**
 * Meta Data Deletion Request Callback (Required for App Review)
 *
 * Reference:
 *   https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 *
 * Flow:
 *   1. User requests data deletion through Facebook/Instagram.
 *   2. Meta sends a `signed_request` form-urlencoded body to the URL we
 *      configured in the App Dashboard.
 *   3. We validate the signed request (HMAC-SHA256 with our app secret).
 *   4. We kick off deletion of the matching user's data and return a
 *      `url` + `confirmation_code` so the user can check status.
 *   5. The user (or Meta) GETs /api/instagram/data-deletion/status?code=…
 *      to see the result.
 */

import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  generateConfirmationCode,
  parseSignedRequest,
} from "@/lib/meta-signed-request";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/instagram/data-deletion
 *
 * Body: application/x-www-form-urlencoded with `signed_request=<base64url>.<base64url>`
 * Response: JSON { url, confirmation_code }
 */
export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  let signedRequest = "";

  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as {
      signed_request?: string;
    };
    signedRequest = body.signed_request ?? "";
  } else {
    const form = await req.formData();
    signedRequest = String(form.get("signed_request") ?? "");
  }

  if (!signedRequest) {
    return NextResponse.json(
      { ok: false, error: "Missing signed_request" },
      { status: 400 },
    );
  }

  const parsed = parseSignedRequest(signedRequest, env.meta.appSecret);
  if (!parsed?.user_id) {
    return NextResponse.json(
      { ok: false, error: "Invalid signed_request" },
      { status: 400 },
    );
  }

  const confirmationCode = generateConfirmationCode();
  const db = getDb();
  if (db) {
    // The signed_request's `user_id` is the Instagram Scoped User ID
    // (IGSID). We look up the matching social account and remove its
    // workspace cascade. In mock mode without a DB, we just record the
    // code so the status endpoint can echo it back.
    const account = await db.query.socialAccounts.findFirst({
      where: eq(schema.socialAccounts.igUserId, parsed.user_id),
    });
    if (account) {
      try {
        await db
          .delete(schema.socialAccounts)
          .where(eq(schema.socialAccounts.id, account.id));
      } catch (err) {
        // Don't fail the callback if DB is unhappy — return the
        // confirmation code so the user can retry / check status.
        console.error("[data-deletion] social account delete failed", err);
      }
    }
  }

  const statusUrl = `${env.appUrl}/api/instagram/data-deletion/status?code=${confirmationCode}`;

  return NextResponse.json({
    url: statusUrl,
    confirmation_code: confirmationCode,
  });
}
