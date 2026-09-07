import { v2 as cloudinary } from "cloudinary";
import { config } from "@/lib/config";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

export interface UserResourceItem {
  publicId: string;
  secureUrl: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  createdAt: string;
}

export interface UserStorageStats {
  folder: string;
  prefix: string;
  assetCount: number;
  totalBytes: number;
  totalMB: number;
  resources: UserResourceItem[];
  globalUsage: {
    plan: string;
    creditsUsed: number;
    creditsLimit: number;
    creditsUsedPercent: number;
    storageBytes: number;
    bandwidthBytes: number;
  } | null;
}

/**
 * Deletes a single Cloudinary asset by public_id.
 * If expectedPrefix is passed, enforces that public_id starts with that prefix.
 */
export async function deleteCloudinaryAsset(
  publicId: string,
  expectedPrefix?: string
): Promise<boolean> {
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    return false;
  }

  if (expectedPrefix && !publicId.startsWith(expectedPrefix)) {
    throw new Error("Access denied: You cannot delete assets outside your assigned directory.");
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (err) {
    console.error("Cloudinary delete asset error:", err);
    return false;
  }
}

/**
 * Deletes all assets in a specific user's isolated Cloudinary folder.
 * Uses delete_resources_by_prefix and cleans up the folder.
 */
export async function deleteUserFolderAssets(
  userPrefix: string
): Promise<{ success: boolean; deletedCount: number; deletedIds: string[] }> {
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  // Safety guard: Must be inside postgram/users/ and have a subfolder
  if (!userPrefix.startsWith("postgram/users/") || userPrefix === "postgram/users/") {
    throw new Error("Invalid prefix: Mass deletion is strictly restricted to isolated user folders.");
  }

  try {
    let allDeletedIds: string[] = [];
    let hasMore = true;
    let iterations = 0;

    // Cloudinary batch deletes up to 100-500 resources at a time
    while (hasMore && iterations < 10) {
      iterations++;
      const result = await cloudinary.api.delete_resources_by_prefix(userPrefix, {
        keep_original: false,
      });

      const deletedMap = result?.deleted || {};
      const deletedKeys = Object.keys(deletedMap);
      allDeletedIds = [...allDeletedIds, ...deletedKeys];

      if (!result?.partial || deletedKeys.length === 0) {
        hasMore = false;
      }
    }

    // Attempt to delete the now empty directory
    try {
      const folderPath = userPrefix.endsWith("/") ? userPrefix.slice(0, -1) : userPrefix;
      await cloudinary.api.delete_folder(folderPath);
    } catch {
      // Ignored if folder delete has delayed cleanup
    }

    return {
      success: true,
      deletedCount: allDeletedIds.length,
      deletedIds: allDeletedIds,
    };
  } catch (err: any) {
    console.error("Failed to delete user folder assets:", err);
    throw new Error(err?.message || "Failed to delete Cloudinary user assets.");
  }
}

/**
 * Fetches user storage usage and resource listing for their specific folder,
 * plus global account usage (credits, 25 GB free quota).
 */
export async function getUserStorageStats(
  folder: string,
  prefix: string
): Promise<UserStorageStats> {
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    return {
      folder,
      prefix,
      assetCount: 0,
      totalBytes: 0,
      totalMB: 0,
      resources: [],
      globalUsage: null,
    };
  }

  try {
    // 1. Fetch user resources
    const listRes = await cloudinary.api.resources({
      type: "upload",
      prefix: prefix,
      max_results: 100,
    });

    const resources: UserResourceItem[] = (listRes.resources || []).map((r: any) => ({
      publicId: r.public_id,
      secureUrl: r.secure_url,
      format: r.format,
      bytes: r.bytes || 0,
      width: r.width || 0,
      height: r.height || 0,
      createdAt: r.created_at,
    }));

    const totalBytes = resources.reduce((acc, curr) => acc + curr.bytes, 0);
    const totalMB = Number((totalBytes / (1024 * 1024)).toFixed(2));

    // 2. Fetch global account usage (Credits / 25 GB limit)
    let globalUsage: UserStorageStats["globalUsage"] = null;
    try {
      const usageRes = await cloudinary.api.usage();
      globalUsage = {
        plan: usageRes.plan || "Free",
        creditsUsed: usageRes.credits?.usage ?? 0,
        creditsLimit: usageRes.credits?.limit ?? 25,
        creditsUsedPercent: usageRes.credits?.used_percent ?? 0,
        storageBytes: usageRes.storage?.usage ?? 0,
        bandwidthBytes: usageRes.bandwidth?.usage ?? 0,
      };
    } catch (err) {
      console.warn("Could not fetch global Cloudinary usage:", err);
    }

    return {
      folder,
      prefix,
      assetCount: resources.length,
      totalBytes,
      totalMB,
      resources,
      globalUsage,
    };
  } catch (err: any) {
    console.error("Error fetching user storage stats:", err);
    throw new Error(err?.message || "Failed to retrieve Cloudinary storage metrics.");
  }
}
