import { CurrentUser } from "@/lib/auth/current-user";
import { config } from "@/lib/config";
import { getDb } from "@/db";
import { instagramAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface UserFolderInfo {
  folder: string;
  prefix: string;
  userIdentifier: string;
  isIgId: boolean;
}

/**
 * Computes the isolated Cloudinary folder path for a given user.
 * Format: "postgram/users/ig_{instagram_user_id}" or "postgram/users/u_{workos_user_id}"
 *
 * This ensures strict per-user isolation:
 * - User uploads are kept strictly separated by IG account / user ID.
 * - Cleanup commands will NEVER touch other users' folders or assets.
 */
export async function getUserCloudinaryFolder(
  user: CurrentUser,
  customIgUserId?: string | null
): Promise<UserFolderInfo> {
  // 1. Explicitly supplied Instagram ID (verified numeric)
  if (customIgUserId && /^\d+$/.test(customIgUserId.trim())) {
    const cleanIg = customIgUserId.trim();
    return {
      folder: `postgram/users/ig_${cleanIg}`,
      prefix: `postgram/users/ig_${cleanIg}/`,
      userIdentifier: cleanIg,
      isIgId: true,
    };
  }

  // 2. Query connected account from Neon PostgreSQL
  try {
    const db = getDb();
    if (db) {
      const account = await db
        .select({ instagramUserId: instagramAccounts.instagramUserId })
        .from(instagramAccounts)
        .where(eq(instagramAccounts.workosUserId, user.workosUserId))
        .limit(1);

      if (account && account.length > 0 && account[0].instagramUserId) {
        const cleanIg = account[0].instagramUserId.replace(/[^a-zA-Z0-9_-]/g, "");
        return {
          folder: `postgram/users/ig_${cleanIg}`,
          prefix: `postgram/users/ig_${cleanIg}/`,
          userIdentifier: cleanIg,
          isIgId: true,
        };
      }
    }
  } catch (err) {
    // Graceful fallback if database query fails
  }

  // 3. Fallback to default server-side IG_USER_ID if configured
  if (config.meta.defaultUserId && /^\d+$/.test(config.meta.defaultUserId)) {
    return {
      folder: `postgram/users/ig_${config.meta.defaultUserId}`,
      prefix: `postgram/users/ig_${config.meta.defaultUserId}/`,
      userIdentifier: config.meta.defaultUserId,
      isIgId: true,
    };
  }

  // 4. Default fallback to WorkOS user ID
  const sanitizedWorkos = user.workosUserId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return {
    folder: `postgram/users/u_${sanitizedWorkos}`,
    prefix: `postgram/users/u_${sanitizedWorkos}/`,
    userIdentifier: sanitizedWorkos,
    isIgId: false,
  };
}

/**
 * Validates that a target folder prefix belongs exclusively to the authenticated user.
 * Prevents unauthorized deletion of other users' assets or root directory.
 */
export function validateFolderOwnership(
  targetPrefix: string,
  userFolderInfo: UserFolderInfo
): boolean {
  if (!targetPrefix || typeof targetPrefix !== "string") return false;
  
  // Must start strictly with "postgram/users/"
  if (!targetPrefix.startsWith("postgram/users/")) return false;

  // Cannot be the base directory
  if (targetPrefix === "postgram/users/" || targetPrefix === "postgram/users" || targetPrefix === "postgram") {
    return false;
  }

  // Must match the user's exact folder or prefix
  return (
    targetPrefix === userFolderInfo.folder ||
    targetPrefix === userFolderInfo.prefix ||
    targetPrefix.startsWith(userFolderInfo.prefix)
  );
}
