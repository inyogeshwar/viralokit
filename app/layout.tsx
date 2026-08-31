import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import { ThemeProvider } from "@/components/theme-provider";
import { PwaRegister } from "@/components/pwa-register";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://viralo-kit.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "ViraloKit — AI Social Media Management",
    template: "%s | ViraloKit",
  },
  description:
    "Publish and analyze Instagram posts across multiple accounts. AI captions, scheduling, analytics, DM automation, and comment automation in one place.",
  keywords: [
    "Instagram management",
    "social media scheduling",
    "AI captions",
    "Instagram analytics",
    "DM automation",
    "comment automation",
    "Instagram posting",
    "social media tool",
  ],
  authors: [{ name: "ViraloKit" }],
  creator: "ViraloKit",
  publisher: "ViraloKit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "ViraloKit",
    title: "ViraloKit — AI Social Media Management",
    description:
      "Publish and analyze Instagram posts across multiple accounts. AI captions, scheduling, analytics, DM automation, and comment automation.",
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "ViraloKit — AI Social Media Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ViraloKit — AI Social Media Management",
    description:
      "Publish and analyze Instagram posts across multiple accounts. AI captions, scheduling, analytics, DM automation, and comment automation.",
    images: [`${APP_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="flex min-h-full flex-col">
          <ThemeProvider>{children}</ThemeProvider>
          <Toaster richColors position="top-right" closeButton />
          <Analytics />
          <SpeedInsights />
          <PwaRegister />
        </body>
      </html>
    </ClerkProvider>
  );
}
