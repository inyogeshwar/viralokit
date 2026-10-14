import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getCurrentUser } from "@/lib/auth/current-user";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", config.app.url));

  const clientId = process.env.PINTEREST_CLIENT_ID?.trim();
  if (!clientId) return NextResponse.redirect(new URL("/settings?error=PINTEREST_CLIENT_ID+missing", config.app.url));

  const state = randomBytes(24).toString("hex");
  const redirectUri = `${config.app.url}/api/pinterest/callback`;
  const query = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "boards:read,pins:read,user_accounts:read",
    state,
  });
  const response = NextResponse.redirect(`https://www.pinterest.com/oauth/?${query.toString()}`);
  response.cookies.set("pinterest_oauth_state", state, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: 600,
  });
  return response;
}
