import { graphRequest } from "./messaging";

export interface FacebookPageProfile {
  id: string;
  name: string;
  fan_count?: number;
  followers_count?: number;
  category?: string;
  link?: string;
  about?: string;
}

export interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  permalink_url?: string;
}

/**
 * Get Facebook Page profile details and follower counts
 */
export async function getFacebookPageProfile({
  pageId,
  accessToken,
}: {
  pageId: string;
  accessToken: string;
}): Promise<FacebookPageProfile> {
  return graphRequest({
    endpoint: `/${pageId}?fields=id,name,fan_count,followers_count,category,link,about`,
    accessToken,
  });
}

/**
 * Publish a text status or announcement to a Facebook Page
 */
export async function publishFacebookPost({
  pageId,
  message,
  link,
  accessToken,
}: {
  pageId: string;
  message: string;
  link?: string;
  accessToken: string;
}) {
  const data: Record<string, string> = { message };
  if (link) data.link = link;

  const res = await graphRequest({
    endpoint: `/${pageId}/feed`,
    method: "POST",
    data,
    accessToken,
  });

  return {
    success: true,
    postId: res.id,
    message: "Facebook post published successfully!",
  };
}

/**
 * Publish a photo with caption to a Facebook Page
 */
export async function publishFacebookPhoto({
  pageId,
  photoUrl,
  caption,
  accessToken,
}: {
  pageId: string;
  photoUrl: string;
  caption?: string;
  accessToken: string;
}) {
  const data: Record<string, string> = { url: photoUrl };
  if (caption) data.caption = caption;

  const res = await graphRequest({
    endpoint: `/${pageId}/photos`,
    method: "POST",
    data,
    accessToken,
  });

  return {
    success: true,
    photoId: res.id,
    message: "Facebook photo published successfully!",
  };
}

/**
 * Fetch recent Facebook Page posts
 */
export async function getFacebookPosts({
  pageId,
  limit = 10,
  accessToken,
}: {
  pageId: string;
  limit?: number;
  accessToken: string;
}): Promise<FacebookPost[]> {
  const res = await graphRequest({
    endpoint: `/${pageId}/posts?fields=id,message,created_time,permalink_url&limit=${limit}`,
    accessToken,
  });
  return res.data || [];
}
