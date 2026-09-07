import { withAuth } from "@workos-inc/authkit-nextjs";
import { isAuthKitConfigured } from "./workos";

export interface CurrentUser {
  workosUserId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isDemoUser: boolean;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  // If WorkOS is configured, use official AuthKit session
  if (isAuthKitConfigured()) {
    try {
      const { user } = await withAuth();
      if (!user) return null;

      const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Creator";
      return {
        workosUserId: user.id,
        email: user.email,
        name,
        avatarUrl: user.profilePictureUrl || null,
        isDemoUser: false,
      };
    } catch (err) {
      console.warn("AuthKit withAuth error:", err);
      return null;
    }
  }

  // In production, unauthenticated requests MUST strictly return null
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  // Local development fallback ONLY when WorkOS credentials are not configured
  return {
    workosUserId: "dev_creator_local",
    email: "creator@postgram.local",
    name: "PostGram Creator (Dev Mode)",
    avatarUrl: null,
    isDemoUser: true,
  };
}
