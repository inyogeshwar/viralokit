/**
 * PostGram Central Configuration
 * Never import or expose sensitive keys in client components.
 */

export const config = {
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  meta: {
    apiVersion: process.env.META_GRAPH_API_VERSION || "v23.0",
    getBaseUrl: () => `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION || "v23.0"}`,
    appId: process.env.META_APP_ID || "",
    appSecret: process.env.META_APP_SECRET || "",
    defaultUserId: process.env.IG_USER_ID || "",
    defaultAccessToken: process.env.IG_ACCESS_TOKEN || "",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  workos: {
    apiKey: process.env.WORKOS_API_KEY || "",
    clientId: process.env.WORKOS_CLIENT_ID || "",
    cookiePassword: process.env.WORKOS_COOKIE_PASSWORD || "",
  },
  database: {
    url: process.env.DATABASE_URL || "",
  },
  ai: {
    openRouterKey: process.env.OPENROUTER_API_KEY || "",
    geminiKey: process.env.GEMINI_API_KEY || "",
  },
};

export function getMetaGraphVersion(): string {
  return process.env.META_GRAPH_API_VERSION || "v23.0";
}

export function getMetaGraphUrl(endpoint: string): string {
  const version = getMetaGraphVersion();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `https://graph.facebook.com/${version}/${cleanEndpoint}`;
}
