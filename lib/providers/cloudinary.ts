import { v2 as cloudinary } from "cloudinary";

import { env } from "@/lib/env";

export class MediaHostError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaHostError";
  }
}

function configure() {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

export async function uploadBuffer(
  buffer: Buffer,
  filename: string,
  folder = "social-copilot",
  resourceType: "image" | "video" = "image",
) {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    throw new MediaHostError(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (or use MOCK_MODE=true).",
    );
  }
  configure();
  const publicId = `${folder}/${Date.now()}-${filename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 40)}`;
  const uploadOptions: Record<string, unknown> = {
    public_id: publicId,
    folder: undefined,
    resource_type: resourceType,
  };
  if (resourceType === "video") {
    // Cloudinary recommends 6 MB chunks for streamed uploads; eager_async lets
    // the server-side transcoding happen out-of-band so the upload call returns
    // a playable MP4 URL as soon as the bytes are received.
    uploadOptions.chunk_size = 6_000_000;
    uploadOptions.eager_async = true;
  }
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(new MediaHostError(`Cloudinary upload failed: ${error.message}`));
        } else if (!result) {
          reject(new MediaHostError("Cloudinary returned no result"));
        } else {
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      },
    );
    stream.end(buffer);
  });
}

export function mockUploadUrl(publicId: string) {
  return `https://res.cloudinary.com/${env.cloudinary.cloudName || "mock"}/image/upload/${publicId}`;
}

export async function listCloudinaryResources(folder = "social-copilot", maxResults = 100) {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    return { resources: [], total: 0 };
  }
  configure();
  const result = await cloudinary.api.resources({
    type: "upload",
    prefix: `${folder}/`,
    max_results: maxResults,
    resource_type: "image",
  });
  return {
    resources: (result.resources ?? []).map((r: Record<string, unknown>) => ({
      publicId: r.public_id as string,
      url: r.secure_url as string,
      format: r.format as string,
      width: r.width as number,
      height: r.height as number,
      bytes: r.bytes as number,
      createdAt: r.created_at as string,
    })),
    total: (result as Record<string, unknown>).total_count as number ?? 0,
  };
}

export async function deleteCloudinaryResources(publicIds: string[]) {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    throw new MediaHostError("Cloudinary not configured.");
  }
  configure();
  const result = await cloudinary.api.delete_resources(publicIds, {
    resource_type: "image",
  });
  return result as { deleted: Record<string, "deleted" | "not_found"> };
}
