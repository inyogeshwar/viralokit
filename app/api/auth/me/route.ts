import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/db";
import { isAuthKitConfigured } from "@/lib/auth/workos";
import { config } from "@/lib/config";

export async function GET() {
  const user = await getCurrentUser();

  return NextResponse.json({
    user,
    systemStatus: {
      authKitConfigured: isAuthKitConfigured(),
      databaseConfigured: isDatabaseConfigured(),
      instagramConfigured: Boolean(config.meta.defaultUserId && config.meta.defaultAccessToken),
      cloudinaryConfigured: Boolean(
        config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret
      ),
      openRouterConfigured: Boolean(config.ai.openRouterKey),
      geminiConfigured: Boolean(config.ai.geminiKey),
      apiVersion: config.meta.apiVersion,
    },
  });
}
