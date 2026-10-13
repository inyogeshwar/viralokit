import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { config } from "@/lib/config";
import crypto from "crypto";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to connect Instagram account.", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { appId } = config.meta;
  if (!appId) {
    return NextResponse.json(
      { error: "Meta App ID is not configured.", code: "MISSING_CONFIG" },
      { status: 500 }
    );
  }

  // Generate state to prevent CSRF
  const state = crypto.randomBytes(16).toString("hex");

  const instagramAppId = config.instagram?.appId || config.meta.appId;
  const redirectUri = `${config.app.url}/api/meta/oauth/callback`;
  const scopes = [
    "instagram_business_basic",
    "instagram_business_manage_messages",
    "instagram_business_manage_comments",
    "instagram_business_content_publish",
    "instagram_business_manage_insights",
  ].join(",");

  const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_reauth=true&client_id=${instagramAppId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${state}`;

  const response = NextResponse.redirect(authUrl);
  
  // Set state in HttpOnly cookie to verify in callback
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  return response;
}
