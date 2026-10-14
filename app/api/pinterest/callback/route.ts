import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { encryptToken } from "@/lib/security/encryption";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", config.app.url));
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const cookieState = request.cookies.get("pinterest_oauth_state")?.value;
  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(new URL("/pinterest?error=Invalid+OAuth+state", config.app.url));
  }

  try {
    const clientId = process.env.PINTEREST_CLIENT_ID?.trim();
    const clientSecret = process.env.PINTEREST_CLIENT_SECRET?.trim();
    if (!clientId || !clientSecret) throw new Error("Pinterest OAuth credentials are missing.");
    const redirectUri = `${config.app.url}/api/pinterest/callback`;
    const tokenResponse = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
      cache: "no-store",
    });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.access_token) throw new Error(token.message || "Pinterest token exchange failed.");

    const meResponse = await fetch("https://api.pinterest.com/v5/user_account", {
      headers: { Authorization: "Bearer " + token.access_token },
      cache: "no-store",
    });
    const me = await meResponse.json();
    if (!meResponse.ok) throw new Error(me.message || "Could not read Pinterest account.");

    const supabase = await createClient();
    const record = {
      user_id: user.id,
      pinterest_user_id: String(me.account_type || me.username || user.id),
      username: me.username || null,
      access_token_encrypted: encryptToken(token.access_token),
      refresh_token_encrypted: token.refresh_token ? encryptToken(token.refresh_token) : null,
      token_expires_at: token.expires_in ? new Date(Date.now() + Number(token.expires_in) * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("pinterest_accounts").upsert(record, { onConflict: "user_id" });
    if (error) throw new Error("Could not save Pinterest connection.");
    const response = NextResponse.redirect(new URL("/pinterest?connected=1", config.app.url));
    response.cookies.delete("pinterest_oauth_state");
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pinterest connection failed.";
    return NextResponse.redirect(new URL("/pinterest?error=" + encodeURIComponent(message), config.app.url));
  }
}
