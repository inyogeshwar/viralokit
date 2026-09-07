import { NextResponse } from "next/server";
import { refreshLongLivedAccessToken } from "@/lib/meta/token";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAuthorizedUser } from "@/lib/config";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required.", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  if (!isAuthorizedUser(user)) {
    return NextResponse.json(
      { error: "You are not authorized to refresh the Instagram access token.", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  try {
    const result = await refreshLongLivedAccessToken();
    // Return sanitized status without exposing secret token value directly
    return NextResponse.json({
      success: true,
      data: {
        refreshed: true,
        tokenType: result.token_type,
        expiresInSeconds: result.expires_in,
        expiresInDays: Math.floor(result.expires_in / 86400),
        message: "Long-lived Instagram token refreshed successfully. Valid for 60 days.",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REFRESH_FAILED",
          message: err?.message || "Failed to refresh token",
        },
      },
      { status: 400 }
    );
  }
}
