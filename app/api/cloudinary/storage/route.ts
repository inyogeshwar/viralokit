import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserCloudinaryFolder } from "@/lib/cloudinary/user-folder";
import { getUserStorageStats } from "@/lib/cloudinary/delete";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const urlObj = new URL(request.url);
    const customIgUserId = urlObj.searchParams.get("igUserId");
    const userFolderInfo = await getUserCloudinaryFolder(user, customIgUserId);

    const stats = await getUserStorageStats(userFolderInfo.folder, userFolderInfo.prefix);

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        userIdentifier: userFolderInfo.userIdentifier,
        isIgId: userFolderInfo.isIgId,
      },
    });
  } catch (err: any) {
    console.error("Cloudinary storage API error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch Cloudinary storage status." },
      { status: 500 }
    );
  }
}
