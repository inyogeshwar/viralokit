import { CurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export interface UserFolderInfo {
  folder: string;
  prefix: string;
  userIdentifier: string;
  isIgUsername: boolean;
}

function sanitizeForPath(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/^@+/, "") // remove leading @
    .replace(/[^a-z0-9_.-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 50);
}

/**
 * Computes the isolated Cloudinary folder path for a given user using their USERNAME.
 * Never uses raw numeric Meta/Instagram IDs in folder names.
 *
 * Output format: "viralokit/users/ig_{instagram_username}" or "viralokit/users/u_{username}"
 * Example: "viralokit/users/ig_creatorname"
 */
export async function getUserCloudinaryFolder(
  user: CurrentUser
): Promise<UserFolderInfo> {
  // Folder is always derived from the authenticated user's own account or identity.
  // Caller-supplied usernames must never select another user's storage folder.
  // Query Supabase PostgreSQL database for connected account username
  try {
    const supabase = await createClient();
    const { data: account } = await supabase
      .from("instagram_accounts")
      .select("username")
      .eq("user_id", user.id)
      .maybeSingle();

    if (account?.username) {
      const cleanUser = sanitizeForPath(account.username);
      if (cleanUser.length > 0) {
        return {
          folder: `viralokit/users/ig_${cleanUser}`,
          prefix: `viralokit/users/ig_${cleanUser}/`,
          userIdentifier: cleanUser,
          isIgUsername: true,
        };
      }
    }
  } catch (err) {
    // Database query fallback
  }

  // Fallback: User email prefix or friendly name (no numeric IDs, never global IG account)
  let fallbackName = user.email ? user.email.split("@")[0] : user.name || "creator";
  const cleanFallback = sanitizeForPath(fallbackName);

  return {
    folder: `viralokit/users/u_${cleanFallback || "creator"}`,
    prefix: `viralokit/users/u_${cleanFallback || "creator"}/`,
    userIdentifier: cleanFallback || "creator",
    isIgUsername: false,
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

  // Must start strictly with "viralokit/users/" or legacy "postgram/users/"
  const isAllowedRoot = targetPrefix.startsWith("viralokit/users/") || targetPrefix.startsWith("postgram/users/");
  if (!isAllowedRoot) return false;

  // Cannot be the base directory
  if (
    targetPrefix === "viralokit/users/" ||
    targetPrefix === "viralokit/users" ||
    targetPrefix === "viralokit" ||
    targetPrefix === "postgram/users/" ||
    targetPrefix === "postgram/users" ||
    targetPrefix === "postgram"
  ) {
    return false;
  }

  // Must match the user's exact folder or prefix
  return (
    targetPrefix === userFolderInfo.folder ||
    targetPrefix === userFolderInfo.prefix ||
    targetPrefix.startsWith(userFolderInfo.prefix)
  );
}
