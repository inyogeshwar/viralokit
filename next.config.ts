import type { NextConfig } from "next";

const allowedOrigin = process.env.ALLOWED_ORIGIN || "https://viralokit.vercel.app";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Security Problem #7: Remove X-Powered-By header to prevent tech stack fingerprinting
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Ensure strict server boundaries for sensitive keys
  serverExternalPackages: ["cloudinary"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // Security Problem #7: Enforce HTTPS via HSTS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Security Problem #7: Prevent MIME-sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Security Problem #7: Clickjacking prevention
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Security Problem #7: Referrer privacy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Security Problem #7: Restrict hardware device APIs
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Security Problem #7: Comprehensive Content Security Policy (CSP)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://res.cloudinary.com https://*.cdninstagram.com https://*.fbcdn.net https://images.unsplash.com",
              "connect-src 'self' https://api.workos.com https://api.openrouter.ai https://generativelanguage.googleapis.com https://graph.facebook.com https://res.cloudinary.com https://api.cloudinary.com https://*.neon.tech https://va.vercel-scripts.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      {
        // Security Problem #6: Explicit CORS Whitelist (Zero wildcard * in production)
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: allowedOrigin,
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS, DELETE",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
