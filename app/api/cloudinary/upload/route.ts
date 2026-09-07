import { NextResponse } from "next/server";
import { uploadImageBuffer, uploadImageFromUrl } from "@/lib/cloudinary/upload";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserCloudinaryFolder } from "@/lib/cloudinary/user-folder";

/**
 * Validates that an external image URL is safe from SSRF attacks.
 * Rejects private IPs, loopbacks, link-local addresses, and cloud metadata services.
 */
function isSafePublicImageUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    // 1. Enforce HTTPS only
    if (parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // 2. Reject localhost and loopback names
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      return false;
    }

    // 3. Reject IPv4 loopbacks, private networks, and link-local addresses
    // 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16 (AWS/GCP metadata)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    if (match) {
      const octet1 = parseInt(match[1], 10);
      const octet2 = parseInt(match[2], 10);

      if (octet1 === 127) return false; // Loopback
      if (octet1 === 10) return false; // Private 10.0.0.0/8
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return false; // Private 172.16.0.0/12
      if (octet1 === 192 && octet2 === 168) return false; // Private 192.168.0.0/16
      if (octet1 === 169 && octet2 === 254) return false; // Link-local / Cloud metadata (169.254.169.254)
      if (octet1 === 0) return false; // 0.0.0.0
    }

    // 4. Reject IPv6 loopbacks and private addresses
    if (hostname.includes(":") || hostname === "[::1]") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    // 1. Mandatory authentication check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to upload media.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // 2. Resolve user's isolated Cloudinary directory (e.g. postgram/users/ig_jay_gurudeventerprises)
    const urlObj = new URL(request.url);
    const customUsername = urlObj.searchParams.get("username") || urlObj.searchParams.get("igUserId");
    const userFolderInfo = await getUserCloudinaryFolder(user, customUsername);

    const contentType = request.headers.get("content-type") || "";

    // 3. JSON payload with URL
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { url } = body;
      if (!url || typeof url !== "string") {
        return NextResponse.json({ error: "Missing image URL in request body." }, { status: 400 });
      }

      if (!isSafePublicImageUrl(url)) {
        return NextResponse.json(
          { error: "Invalid or restricted image URL. Only public HTTPS image URLs are permitted." },
          { status: 400 }
        );
      }

      const result = await uploadImageFromUrl(url, userFolderInfo.folder);
      return NextResponse.json({
        success: true,
        asset: result,
        folder: userFolderInfo.folder,
      });
    }

    // 4. Multipart form data with file uploads
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No image files provided for upload." }, { status: 400 });
    }

    const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB Instagram limit
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/jpg"];

    const uploadedAssets = [];
    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the maximum allowed size of 8MB.` },
          { status: 400 }
        );
      }

      // Validate MIME type
      if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        return NextResponse.json(
          { error: `File "${file.name}" has an unsupported format (${file.type}). Supported formats: JPG, PNG, WEBP, HEIC.` },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await uploadImageBuffer(buffer, userFolderInfo.folder);
      uploadedAssets.push(result);
    }

    return NextResponse.json({
      success: true,
      assets: uploadedAssets,
      count: uploadedAssets.length,
      folder: userFolderInfo.folder,
      userIdentifier: userFolderInfo.userIdentifier,
    });
  } catch (err: any) {
    console.error("Cloudinary upload API error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to upload media to Cloudinary." },
      { status: 500 }
    );
  }
}
