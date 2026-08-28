import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://viralo-kit.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const publicPages: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${APP_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${APP_URL}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/terms-of-service`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/cookie-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/acceptable-use`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/security`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/responsible-disclosure`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/accessibility`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  return publicPages;
}
