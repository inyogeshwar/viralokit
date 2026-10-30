import { config } from "@/lib/config";

const THREADS_API_BASE = config.threads.apiBase || "https://graph.threads.net/v1.0";

interface ThreadsRequestOptions {
  endpoint: string;
  method?: "GET" | "POST" | "DELETE";
  data?: any;
  isJson?: boolean;
  accessToken: string;
}

export async function threadsRequest({
  endpoint,
  method = "GET",
  data = null,
  isJson = false,
  accessToken,
}: ThreadsRequestOptions): Promise<any> {
  const urlObj = new URL(`${THREADS_API_BASE}${endpoint}`);
  urlObj.searchParams.set("access_token", accessToken);

  const headers: Record<string, string> = {};
  let body: any = undefined;

  if ((method === "POST" || method === "DELETE") && data) {
    if (isJson) {
      body = JSON.stringify(data);
      headers["Content-Type"] = "application/json";
    } else {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
          params.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
        }
      }
      body = params.toString();
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
  }

  const res = await fetch(urlObj.toString(), {
    method,
    headers,
    body,
  });

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response from Threads API (${res.status}): ${text}`);
  }

  if (!res.ok || json.error) {
    const err = json.error || {};
    throw new Error(err.message || `Threads API Error (${res.status}): ${text}`);
  }

  return json;
}

export interface ThreadsProfile {
  id: string;
  username: string;
  name?: string;
  threads_profile_picture_url?: string;
  threads_biography?: string;
}

export interface ThreadsPost {
  id: string;
  media_type: "TEXT" | "IMAGE" | "VIDEO";
  permalink?: string;
  text?: string;
  timestamp: string;
  shortcode?: string;
}

/**
 * Fetch Threads profile details
 */
export async function getThreadsProfile({
  userId = "me",
  accessToken,
}: {
  userId?: string;
  accessToken: string;
}): Promise<ThreadsProfile> {
  return threadsRequest({
    endpoint: `/${userId}?fields=id,username,name,threads_profile_picture_url,threads_biography`,
    accessToken,
  });
}

/**
 * Publish a post to Threads (Official 2-Step Container Architecture)
 */
export async function publishThreadsPost({
  userId = "me",
  text,
  mediaType = "TEXT",
  imageUrl,
  videoUrl,
  accessToken,
}: {
  userId?: string;
  text: string;
  mediaType?: "TEXT" | "IMAGE" | "VIDEO";
  imageUrl?: string;
  videoUrl?: string;
  accessToken: string;
}) {
  const containerData: Record<string, string> = {
    media_type: mediaType,
    text,
  };
  if (imageUrl) containerData.image_url = imageUrl;
  if (videoUrl) containerData.video_url = videoUrl;

  // Step 1: Create Container
  const container = await threadsRequest({
    endpoint: `/${userId}/threads`,
    method: "POST",
    data: containerData,
    accessToken,
  });

  const creationId = container.id;

  // Step 1.5: If media, wait for processing
  if (mediaType !== "TEXT") {
    await new Promise((r) => setTimeout(r, 4000));
  }

  // Step 2: Publish Container
  const publish = await threadsRequest({
    endpoint: `/${userId}/threads_publish`,
    method: "POST",
    data: { creation_id: creationId },
    accessToken,
  });

  return {
    success: true,
    threadId: publish.id,
    creationId,
    message: "Thread post published successfully to Threads!",
  };
}

/**
 * Fetch recent Threads posts
 */
export async function getThreadsPosts({
  userId = "me",
  limit = 5,
  accessToken,
}: {
  userId?: string;
  limit?: number;
  accessToken: string;
}): Promise<ThreadsPost[]> {
  const res = await threadsRequest({
    endpoint: `/${userId}/threads?fields=id,media_type,permalink,text,timestamp,shortcode&limit=${limit}`,
    accessToken,
  });
  return res.data || [];
}

/**
 * Reply to a specific post/thread on Threads
 */
export async function replyToThreadsPost({
  userId = "me",
  threadId,
  text,
  accessToken,
}: {
  userId?: string;
  threadId: string;
  text: string;
  accessToken: string;
}) {
  const container = await threadsRequest({
    endpoint: `/${userId}/threads`,
    method: "POST",
    data: {
      media_type: "TEXT",
      text,
      reply_to_id: threadId,
    },
    accessToken,
  });

  const publish = await threadsRequest({
    endpoint: `/${userId}/threads_publish`,
    method: "POST",
    data: { creation_id: container.id },
    accessToken,
  });

  return {
    success: true,
    replyId: publish.id,
    threadId,
    message: "Replied to thread successfully!",
  };
}

/**
 * Fetch metrics for Threads (views, likes, replies, reposts, quotes)
 */
export async function getThreadsInsights({
  userId = "me",
  threadId,
  accessToken,
}: {
  userId?: string;
  threadId?: string;
  accessToken: string;
}) {
  const targetId = threadId || userId;
  const metrics = threadId
    ? "views,likes,replies,reposts,quotes"
    : "views,likes,replies,reposts,quotes,followers_count";

  const res = await threadsRequest({
    endpoint: `/${targetId}/threads_insights?metric=${metrics}`,
    accessToken,
  });
  return res.data || [];
}

/**
 * Exchange a short-lived Threads user token for a 60-day long-lived token
 */
export async function exchangeThreadsToken({
  clientSecret,
  shortLivedToken,
}: {
  clientSecret: string;
  shortLivedToken: string;
}) {
  const url = `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${clientSecret}&access_token=${shortLivedToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || "Failed to exchange Threads token");
  }

  return {
    accessToken: data.access_token,
    tokenType: data.token_type,
    expiresIn: data.expires_in,
  };
}
