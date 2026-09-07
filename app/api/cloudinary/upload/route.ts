import { NextResponse } from "next/server";
import { uploadImageBuffer, uploadImageFromUrl } from "@/lib/cloudinary/upload";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // 1. JSON payload with URL
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { url } = body;
      if (!url || typeof url !== "string") {
        return NextResponse.json({ error: "Missing image URL in request body." }, { status: 400 });
      }
      const result = await uploadImageFromUrl(url);
      return NextResponse.json({ success: true, asset: result });
    }

    // 2. Multipart form data with file uploads
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
      const result = await uploadImageBuffer(buffer);
      uploadedAssets.push(result);
    }

    return NextResponse.json({
      success: true,
      assets: uploadedAssets,
      count: uploadedAssets.length,
    });
  } catch (err: any) {
    console.error("Cloudinary upload API error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to upload media to Cloudinary." },
      { status: 500 }
    );
  }
}
