import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserCloudinaryFolder, validateFolderOwnership } from "@/lib/cloudinary/user-folder";
import { deleteUserFolderAssets, deleteCloudinaryAsset } from "@/lib/cloudinary/delete";

/**
 * DELETE /api/cloudinary/cleanup
 *
 * Purges uploaded assets for the authenticated user to free up CDN storage:
 * - If body contains `publicId`: Deletes a specific asset owned by the user.
 * - If body contains `action: "delete_all"` or no publicId: Purges ALL uploaded images in the user's isolated folder.
 *
 * Security:
 * - Strict folder boundary check: Cannot delete files from other users or root directory.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const urlObj = new URL(request.url);
    const customUsername = urlObj.searchParams.get("username") || urlObj.searchParams.get("igUserId");
    const userFolderInfo = await getUserCloudinaryFolder(user, customUsername);

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Empty body implies delete_all for this user's folder
      body = { action: "delete_all" };
    }

    // 1. Single asset deletion
    if (body.publicId && typeof body.publicId === "string") {
      const { publicId } = body;
      
      // Strict ownership check: Must be inside this user's folder
      if (!publicId.startsWith(userFolderInfo.prefix)) {
        return NextResponse.json(
          {
            error: "Forbidden: You cannot delete an asset outside your designated directory.",
            code: "FORBIDDEN",
          },
          { status: 403 }
        );
      }

      const ok = await deleteCloudinaryAsset(publicId, userFolderInfo.prefix);
      if (!ok) {
        return NextResponse.json(
          { error: "Failed to delete asset from Cloudinary.", success: false },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Asset deleted successfully from Cloudinary.",
        deletedPublicId: publicId,
      });
    }

    // 2. Mass delete all assets in user's folder
    if (!validateFolderOwnership(userFolderInfo.prefix, userFolderInfo)) {
      return NextResponse.json(
        { error: "Security violation: Invalid user directory path.", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const result = await deleteUserFolderAssets(userFolderInfo.prefix);

    return NextResponse.json({
      success: true,
      message: `Successfully purged ${result.deletedCount} image(s) from your Cloudinary storage.`,
      deletedCount: result.deletedCount,
      folder: userFolderInfo.folder,
      userIdentifier: userFolderInfo.userIdentifier,
    });
  } catch (err: any) {
    console.error("Cloudinary cleanup API error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to execute Cloudinary cleanup." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  // Delegate DELETE requests to POST handler
  return POST(request);
}
