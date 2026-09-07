import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "PostGram — Instagram Publishing & Analytics Studio",
  description:
    "Production-grade Instagram creator tool for single and carousel publishing, post management, deletion, official Meta analytics, and dynamic free AI assistance.",
  openGraph: {
    title: "PostGram — Instagram Publishing & Analytics Studio",
    description:
      "Publish single & carousel posts to Instagram, analyze performance with official Meta insights, and leverage free AI models.",
    type: "website",
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
      </body>
    </html>
  );
}
