import { createClient } from "@/lib/supabase/server";
import { decryptToken } from "@/lib/security/encryption";
import { config } from "@/lib/config";

export interface UserMetaCredentials {
  instagramUserId: string;
  accessToken: string;
  username: string | null;
  pageId?: string | null;
  pageAccessToken?: string | null;
  threadsUserId?: string | null;
  threadsAccessToken?: string | null;
}

export type UserInstagramCredentials = UserMetaCredentials;

/**
 * Retrieves and decrypts the connected Meta/Instagram/Threads account credentials
 * for a given user. Supports database storage with graceful environment fallback.
 */
export async function getUserInstagramCredentials(
  userId?: string
): Promise<UserMetaCredentials | null> {
  try {
    if (userId) {
      const supabase = await createClient();
      const { data: account, error } = await supabase
        .from("instagram_accounts")
        .select("instagram_user_id, access_token_encrypted, username, capabilities_json")
        .eq("user_id", userId)
        .single();

      if (!error && account && account.access_token_encrypted) {
        const accessToken = decryptToken(account.access_token_encrypted);
        const caps = (account.capabilities_json as any) || {};

        return {
          instagramUserId: account.instagram_user_id,
          accessToken,
          username: account.username,
          pageId: caps.page_id || config.meta.facebookPageId || null,
          pageAccessToken: caps.page_access_token ? decryptToken(caps.page_access_token) : (config.meta.facebookPageAccessToken || accessToken),
          threadsUserId: caps.threads_user_id || config.threads.userId || null,
          threadsAccessToken: caps.threads_access_token ? decryptToken(caps.threads_access_token) : (config.threads.accessToken || null),
        };
      }
    }

    // Fallback: Check environment configuration
    if (config.meta.defaultUserId && config.meta.defaultAccessToken) {
      return {
        instagramUserId: config.meta.defaultUserId,
        accessToken: config.meta.defaultAccessToken,
        username: config.meta.instagramUsername || "Creator",
        pageId: config.meta.facebookPageId || null,
        pageAccessToken: config.meta.facebookPageAccessToken || config.meta.defaultAccessToken,
        threadsUserId: config.threads.userId || null,
        threadsAccessToken: config.threads.accessToken || null,
      };
    }

    return null;
  } catch (err) {
    console.error("Failed to retrieve user Meta credentials:", err);

    // Fallback even on DB error if env vars are present
    if (config.meta.defaultUserId && config.meta.defaultAccessToken) {
      return {
        instagramUserId: config.meta.defaultUserId,
        accessToken: config.meta.defaultAccessToken,
        username: config.meta.instagramUsername || "Creator",
        pageId: config.meta.facebookPageId || null,
        pageAccessToken: config.meta.facebookPageAccessToken || config.meta.defaultAccessToken,
        threadsUserId: config.threads.userId || null,
        threadsAccessToken: config.threads.accessToken || null,
      };
    }

    return null;
  }
}
