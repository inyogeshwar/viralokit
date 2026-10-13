/**
 * ViraloKit Central Configuration
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
  instagram: {
    appId: clean(process.env.INSTAGRAM_APP_ID),
    appSecret: clean(process.env.INSTAGRAM_APP_SECRET),
  },
  cloudinary: {
    cloudName: clean(process.env.CLOUDINARY_CLOUD_NAME),
    apiKey: clean(process.env.CLOUDINARY_API_KEY),
    apiSecret: clean(process.env.CLOUDINARY_API_SECRET),
  },
  supabase: {
    url: clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  },
  ai: {
    geminiKey: clean(process.env.GEMINI_API_KEY),
  },
  auth: {
    // Comma-separated list of authorized admin user IDs or emails.
    adminUserIds: (clean(process.env.ADMIN_USER_IDS) || clean(process.env.ADMIN_WORKOS_USER_IDS))
      ? (clean(process.env.ADMIN_USER_IDS) || clean(process.env.ADMIN_WORKOS_USER_IDS))
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  },
  security: {
    encryptionKey: clean(process.env.ENCRYPTION_KEY),
  },
};

/**
 * Checks if a given Supabase user is authorized to perform privileged Meta operations.
 * If ADMIN_WORKOS_USER_IDS is configured, user must match one of the allowed IDs or emails.
 */
export function isAuthorizedUser(user: { id: string; email?: string } | null): boolean {
  if (!user) return false;
  const admins = config.auth.adminUserIds;
  if (admins.length === 0) return false; // Fail closed: if no admins are configured, no one is admin
  return admins.includes(user.id) || (user.email ? admins.includes(user.email) : false);
}

export function getMetaGraphVersion(): string {
  return process.env.META_GRAPH_API_VERSION || "v23.0";
}

export function getMetaGraphUrl(endpoint: string, accessToken?: string): string {
  const version = getMetaGraphVersion();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const isIg =
    accessToken?.startsWith("IG") ||
    accessToken?.startsWith("AQ") ||
    cleanEndpoint.includes("access_token=IG") ||
    cleanEndpoint.includes("access_token=AQ");
  const host = isIg ? "graph.instagram.com" : "graph.facebook.com";
  return `https://${host}/${version}/${cleanEndpoint}`;
}

/**
 * Validates critical environment variables in production.
 * Fails fast if mandatory security configurations are missing without leaking values.
 */
export function validateProductionEnvironment(): { valid: boolean; missing: string[] } {
  if (process.env.NODE_ENV !== "production") {
    return { valid: true, missing: [] };
  }

  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "ENCRYPTION_KEY",
  ];

  const missing = required.filter((key) => !process.env[key] || !process.env[key]?.trim());
  return {
    valid: missing.length === 0,
    missing,
  };
}
