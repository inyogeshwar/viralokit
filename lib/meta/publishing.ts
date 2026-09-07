import { config, getMetaGraphUrl } from "@/lib/config";
import { PublishResult } from "./types";

export class MetaApiError extends Error {
  code?: number | string;
  subcode?: number;
  constructor(message: string, code?: number | string, subcode?: number) {
    super(message);
    this.name = "MetaApiError";
    this.code = code;
    this.subcode = subcode;
  }
}

async function postMeta(path: string, body: Record<string, string>, accessToken: string) {
  const url = getMetaGraphUrl(path);
  const params = new URLSearchParams({
    ...body,
    access_token: accessToken,
  });

  const response = await fetch(`${url}?${params.toString()}`, {
    method: "POST",
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    const err = data.error || {};
    throw new MetaApiError(
      err.message || `Meta API error on ${path}`,
      err.code,
      err.error_subcode
    );
  }

  return data;
}

async function getMeta(path: string, params: Record<string, string>, accessToken: string) {
  const url = getMetaGraphUrl(path);
  const searchParams = new URLSearchParams({
    ...params,
    access_token: accessToken,
  });

  const response = await fetch(`${url}?${searchParams.toString()}`);
  const data = await response.json();
  if (!response.ok || data.error) {
    const err = data.error || {};
    throw new MetaApiError(
      err.message || `Meta API error on ${path}`,
      err.code,
      err.error_subcode
    );
  }

  return data;
}

// Poll container status until ready (FINISHED) or failed (ERROR)
async function waitForContainer(containerId: string, accessToken: string, maxAttempts = 10, delayMs = 2000): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const data = await getMeta(containerId, { fields: "status_code" }, accessToken);
      const status = data.status_code;
      if (status === "FINISHED") {
        return;
      }
      if (status === "ERROR" || status === "EXPIRED") {
        throw new MetaApiError(`Media container processing failed with status: ${status}`);
      }
    } catch (err: any) {
      if (err instanceof MetaApiError && err.message.includes("Media container processing failed")) {
        throw err;
      }
      // Transient check error: keep polling
    }
    await new Promise((res) => setTimeout(res, delayMs));
  }
}

export async function publishSingleImage(
  imageUrl: string,
  caption: string,
  customUserId?: string,
  customAccessToken?: string
): Promise<PublishResult> {
  const userId = customUserId || config.meta.defaultUserId;
  const accessToken = customAccessToken || config.meta.defaultAccessToken;

  if (!userId || !accessToken) {
    throw new MetaApiError("Missing Instagram credentials. Please connect your account in Settings.");
  }

  // 1. Create Media Container
  const container = await postMeta(
    `${userId}/media`,
    {
      image_url: imageUrl,
      caption: caption || "",
    },
    accessToken
  );

  const containerId = container.id;

  // 2. Poll for container readiness
  await waitForContainer(containerId, accessToken);

  // 3. Publish Container
  const published = await postMeta(
    `${userId}/media_publish`,
    {
      creation_id: containerId,
    },
    accessToken
  );

  const mediaId = published.id;

  // 4. Fetch live permalink
  let permalink: string | undefined;
  try {
    const mediaDetails = await getMeta(mediaId, { fields: "permalink" }, accessToken);
    permalink = mediaDetails.permalink;
  } catch {
    // Non-critical if permalink fetch takes time to populate
  }

  return {
    type: "IMAGE",
    containerId,
    mediaId,
    permalink,
    publishedAt: new Date().toISOString(),
    publicUrls: [imageUrl],
  };
}

export async function publishCarousel(
  imageUrls: string[],
  caption: string,
  customUserId?: string,
  customAccessToken?: string
): Promise<PublishResult> {
  const userId = customUserId || config.meta.defaultUserId;
  const accessToken = customAccessToken || config.meta.defaultAccessToken;

  if (!userId || !accessToken) {
    throw new MetaApiError("Missing Instagram credentials. Please connect your account in Settings.");
  }

  if (!imageUrls || imageUrls.length < 2 || imageUrls.length > 10) {
    throw new MetaApiError("Instagram carousels require between 2 and 10 images.");
  }

  // 1. Create child containers sequentially
  const childContainerIds: string[] = [];
  for (const url of imageUrls) {
    const child = await postMeta(
      `${userId}/media`,
      {
        image_url: url,
        is_carousel_item: "true",
      },
      accessToken
    );
    childContainerIds.push(child.id);
  }

  // 2. Poll child containers
  for (const childId of childContainerIds) {
    await waitForContainer(childId, accessToken);
  }

  // 3. Create parent carousel container
  const carouselContainer = await postMeta(
    `${userId}/media`,
    {
      media_type: "CAROUSEL",
      children: childContainerIds.join(","),
      caption: caption || "",
    },
    accessToken
  );

  const carouselContainerId = carouselContainer.id;

  // 4. Poll parent container
  await waitForContainer(carouselContainerId, accessToken);

  // 5. Publish Carousel
  const published = await postMeta(
    `${userId}/media_publish`,
    {
      creation_id: carouselContainerId,
    },
    accessToken
  );

  const mediaId = published.id;

  // 6. Fetch live permalink
  let permalink: string | undefined;
  try {
    const mediaDetails = await getMeta(mediaId, { fields: "permalink" }, accessToken);
    permalink = mediaDetails.permalink;
  } catch {
    // Non-critical
  }

  return {
    type: "CAROUSEL",
    containerId: carouselContainerId,
    mediaId,
    permalink,
    publishedAt: new Date().toISOString(),
    publicUrls: imageUrls,
  };
}
