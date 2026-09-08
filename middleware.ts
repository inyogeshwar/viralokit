import { NextRequest, NextResponse } from "next/server";
import { authkit, handleAuthkitHeaders } from "@workos-inc/authkit-nextjs";
import { rateLimiter, RATE_LIMIT_TIERS, getClientIp, type RateLimitTier } from "@/lib/security/rate-limit";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request.headers);

  // =========================================================================
  // 1. PRODUCTION RATE LIMITING (Layer 1 Defense against abuse and DoS)
  // =========================================================================
  if (pathname.startsWith("/api/")) {
    let tier: RateLimitTier = RATE_LIMIT_TIERS.GENERAL_API;

    if (pathname.startsWith("/api/auth/")) {
      // 5 requests per 15 minutes per IP
      tier = RATE_LIMIT_TIERS.AUTH;
    } else if (pathname.startsWith("/api/ai/")) {
      // 10 requests per minute per IP
      tier = RATE_LIMIT_TIERS.AI_PROXY;
    } else if (pathname.startsWith("/api/cloudinary/")) {
      // 5 requests per minute per IP (uploads & CDN cleanup)
      tier = RATE_LIMIT_TIERS.UPLOADS;
    }

    const rateCheck = rateLimiter.check(`${tier.tierName}:${ip}`, tier.limit, tier.windowMs);

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please slow down and try again later.",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: rateCheck.resetInSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.resetInSeconds),
            "X-RateLimit-Limit": String(rateCheck.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateCheck.resetInSeconds),
          },
        }
      );
    }
  }

  // If WorkOS environment variables are not set, allow dev mode
  if (!process.env.WORKOS_API_KEY || !process.env.WORKOS_CLIENT_ID) {
    return NextResponse.next();
  }

  // =========================================================================
  // 2. SESSION VALIDATION & ROLE-LEVEL ACCESS CONTROL
  // =========================================================================
  try {
    const redirectUri =
      process.env.NODE_ENV === "production"
        ? "https://viralokit.vercel.app/callback"
        : `${request.nextUrl.origin}/callback`;

    const { session, headers, authorizationUrl } = await authkit(request, {
      redirectUri,
    });

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
