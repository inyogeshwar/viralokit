/**
 * PostGram Central Configuration
 * Never import or expose sensitive keys in client components.
 */

function clean(val?: string): string {
  if (!val) return "";
  return val.replace(/[\u200B-\u200D\uFEFF]/g, "").trim().replace(/^["']|["']$/g, "");
}

export const config = {
  app: {
    url: clean(process.env.NEXT_PUBLIC_APP_URL) || "https://viralokit.vercel.app",
  },
  meta: {
    apiVersion: clean(process.env.META_GRAPH_API_VERSION) || "v23.0",
    getBaseUrl: () => `https://graph.facebook.com/${clean(process.env.META_GRAPH_API_VERSION) || "v23.0"}`,
    appId: clean(process.env.META_APP_ID),
    appSecret: clean(process.env.META_APP_SECRET),
    defaultUserId: clean(process.env.IG_USER_ID),
    defaultAccessToken: clean(process.env.IG_ACCESS_TOKEN),
  },
  cloudinary: {
    cloudName: clean(process.env.CLOUDINARY_CLOUD_NAME),
    apiKey: clean(process.env.CLOUDINARY_API_KEY),
    apiSecret: clean(process.env.CLOUDINARY_API_SECRET),
  },
  workos: {
    apiKey: clean(process.env.WORKOS_API_KEY),
    clientId: clean(process.env.WORKOS_CLIENT_ID),
    cookiePassword: clean(process.env.WORKOS_COOKIE_PASSWORD),
  },
  database: {
    url: clean(process.env.DATABASE_URL),
  },
  ai: {
    openRouterKey: clean(process.env.OPENROUTER_API_KEY),
    geminiKey: clean(process.env.GEMINI_API_KEY),
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
