import { NextRequest, NextResponse } from "next/server";
import { authkit, handleAuthkitHeaders } from "@workos-inc/authkit-nextjs";

export default async function middleware(request: NextRequest) {
  // If WorkOS environment variables are not set, allow dev mode
  if (!process.env.WORKOS_API_KEY || !process.env.WORKOS_CLIENT_ID) {
    return NextResponse.next();
  }

  try {
    const redirectUri =
      process.env.NODE_ENV === "production"
        ? "https://viralokit.vercel.app/callback"
        : `${request.nextUrl.origin}/callback`;

    const { session, headers, authorizationUrl } = await authkit(request, {
      redirectUri,
    });
    const { pathname } = request.nextUrl;

    const protectedRoutes = [
      "/dashboard",
      "/create",
      "/posts",
      "/analytics",
      "/ai-analysis",
      "/settings",
    ];

    const isPageProtected = protectedRoutes.some((route) => pathname.startsWith(route));
    const isApiProtected =
      pathname.startsWith("/api/meta") ||
      pathname.startsWith("/api/cloudinary") ||
      pathname.startsWith("/api/ai");

    // Unauthenticated API calls must receive 401 Unauthorized
    if (isApiProtected && !session.user) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Authentication required", code: "UNAUTHORIZED" },
          { status: 401 }
        );
      }
    }

    // Unauthenticated page visits redirect to WorkOS AuthKit
    if (isPageProtected && !session.user && authorizationUrl) {
      return handleAuthkitHeaders(request, headers, { redirect: authorizationUrl });
    }

    return handleAuthkitHeaders(request, headers);
  } catch (err) {
    console.error("Middleware auth error:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/create/:path*",
    "/posts/:path*",
    "/analytics/:path*",
    "/ai-analysis/:path*",
    "/settings/:path*",
    "/api/auth/:path*",
    "/api/meta/:path*",
    "/api/cloudinary/:path*",
    "/api/ai/:path*",
  ],
};

