import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    default: "PostGram — Professional Instagram Creator Studio & AI Publishing",
    template: "%s | PostGram Creator Studio",
  },
  description:
    "The all-in-one studio for Instagram creators and brands. Create & publish multi-slide carousels, preview realistic feeds, analyze verified Meta Graph API insights, and supercharge captions with AI.",
  keywords: [
    "Instagram Creator Studio",
    "Instagram Scheduler",
    "Instagram Carousel Publisher",
    "Meta Graph API v23.0",
    "Instagram Analytics",
    "Instagram Insights",
    "AI Caption Generator",
    "Social Media Automation",
    "Instagram Growth Tool",
    "ViraloKit",
    "PostGram",
  ],
  authors: [{ name: "PostGram Engineering Team" }],
  creator: "PostGram",
  metadataBase: new URL("https://viralokit.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PostGram — Professional Instagram Creator Studio",
    description:
      "Publish multi-slide carousels, schedule posts, audit live Meta Graph API analytics, and craft viral captions with AI.",
    url: "https://viralokit.vercel.app",
    siteName: "PostGram",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PostGram — Professional Instagram Creator Studio",
    description:
      "Publish single & carousel posts to Instagram, analyze performance with official Meta insights, and generate viral captions with AI.",
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
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
