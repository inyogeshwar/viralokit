import { UserMetaCredentials } from "./user-account";

const GRAPH_BASE = "https://graph.facebook.com/v26.0";

export interface BusinessProfileResult {
  id: string;
  ig_id?: string;
  username: string;
  name?: string;
  biography?: string;
  profile_picture_url?: string;
  website?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  media?: {
    data: Array<{
      id: string;
      caption?: string;
      like_count?: number;
      comments_count?: number;
      timestamp?: string;
      permalink?: string;
      media_type?: string;
      media_url?: string;
    }>;
  };
}

export interface HashtagSearchResult {
  id: string;
  name?: string;
}

export interface HashtagMediaItem {
  id: string;
  caption?: string;
  comments_count?: number;
  like_count?: number;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
}

export interface PublishingLimitResult {
  quota_usage: number;
  quota_total: number;
  quota_duration_seconds: number;
  quota_remaining: number;
}

export interface MetaErrorInfo {
  code: number | string;
  subcode?: number | string | null;
  title: string;
  message: string;
  solution: string;
}

export const OFFICIAL_META_ERROR_CODES: MetaErrorInfo[] = [
  { code: -2, subcode: 2207003, title: "Download Timeout", message: "It takes too long to download the media.", solution: "A timeout occurred while downloading the media from your server. Ensure host responds quickly and retry." },
  { code: -2, subcode: 2207020, title: "Media Expired", message: "The media you are trying to access has expired.", solution: "Generate a new container ID and retry upload within 24 hours." },
  { code: -1, subcode: 2207001, title: "Instagram Server Error", message: "Instagram internal server error.", solution: "Temporary Meta server error. Wait 30 seconds and retry." },
  { code: -1, subcode: 2207032, title: "Create Media Failed", message: "Create media fail, please try to re-create media.", solution: "Failed to create a media container. Re-verify the asset URL and retry." },
  { code: -1, subcode: 2207053, title: "Upload Error", message: "Unknown upload error during video processing.", solution: "Generate a new media container and use resumable upload session for large videos." },
  { code: 1, subcode: 2207057, title: "Invalid Thumbnail Offset", message: "Thumbnail offset must be >= 0 and < video duration.", solution: "Provide thumbnail offset in milliseconds within the video duration." },
  { code: 4, subcode: 2207051, title: "Spam Rate Limit / Restriction", message: "Action restricted to protect community.", solution: "Meta flagged frequent repetitive actions as spam. Increase delay between requests and rotate message templates." },
  { code: 9, subcode: 2207042, title: "Publishing Quota Exceeded", message: "Daily Content Publishing API limit reached (50 posts/24h).", solution: "The account reached the 50 published posts limit in 24 hours. Wait for the rolling 24h window to reset." },
  { code: 24, subcode: 2207006, title: "Media Not Found / Permission Denied", message: "The media cannot be found or token lacks permissions.", solution: "Verify token has instagram_basic and instagram_content_publish permissions." },
  { code: 24, subcode: 2207008, title: "Container Builder Expired", message: "Media builder creation ID does not exist or expired.", solution: "Wait 30-60 seconds for processing or recreate container." },
  { code: 25, subcode: 2207050, title: "Account Restricted", message: "Instagram Professional account is restricted or checkpointed.", solution: "Log in to Instagram app on smartphone and complete verification/security prompts." },
  { code: 100, subcode: 2207023, title: "Unknown Media Type", message: "Media type not recognized.", solution: "Use supported media_type: IMAGE, VIDEO, REELS, STORIES, or CAROUSEL." },
  { code: 100, subcode: 2207028, title: "Invalid Carousel Count", message: "Carousels need between 2 and 20 photos/videos.", solution: "Provide at least 2 items and no more than 20 items in children parameter." },
  { code: 100, subcode: 2207040, title: "Too Many User Tags", message: "Cannot use more than 20 @ tags per post.", solution: "Reduce user tags to 20 or fewer." },
  { code: 100, subcode: 2018007, title: "Invalid Direct Audio Format", message: "Audio format rejected in Direct Message.", solution: "Instagram Direct strictly requires .m4a, .aac, or .wav containers (MP3/OGG unsupported)." },
  { code: 190, subcode: null, title: "Invalid / Expired Access Token", message: "The access token is expired or revoked.", solution: "Re-authenticate with Facebook/Instagram Login or exchange for a fresh 60-day token." },
  { code: 352, subcode: 2207026, title: "Unsupported Video Codec", message: "Video format is not supported.", solution: "Ensure video is MP4/MOV container with H.264 video codec and AAC audio codec." },
  { code: 9004, subcode: 2207052, title: "Media URL Unreachable", message: "Media could not be fetched from URI.", solution: "Ensure media URL is public (HTTP 200), does not require auth, and has valid SSL certificate." },
  { code: 9007, subcode: 2207027, title: "Media Processing Incomplete", message: "Media is not ready for publishing.", solution: "Poll GET /<container_id>?fields=status_code until status is FINISHED before publishing." },
  { code: 36000, subcode: 2207004, title: "Image Too Large", message: "Image size exceeds maximum limit.", solution: "Compress image to less than 8 MiB." },
  { code: 36003, subcode: 2207009, title: "Invalid Aspect Ratio", message: "Submitted image aspect ratio is not supported.", solution: "Crop image within aspect ratio range 4:5 (0.8) to 1.91:1." },
  { code: 36004, subcode: 2207010, title: "Caption Too Long", message: "Caption exceeds maximum character limit.", solution: "Shorten caption to max 2,200 characters and max 30 hashtags." }
];

export function resolveMetaError(code: number | string, subcode?: number | string | null): MetaErrorInfo {
  const match = OFFICIAL_META_ERROR_CODES.find(
    (e) =>
      String(e.code) === String(code) &&
      (subcode === undefined || subcode === null || String(e.subcode) === String(subcode))
  );
  if (match) return match;
  return {
    code,
    subcode,
    title: "Meta Graph API Error",
    message: `API Error ${code} ${subcode ? `(subcode: ${subcode})` : ""}`,
    solution: "Refer to the official Meta error code documentation in docs/meta-api-reference/."
  };
}

/**
 * Discover public info and recent media of any Instagram Business or Creator account
 */
export async function discoverBusinessProfile(
  credentials: UserMetaCredentials,
  username: string
): Promise<BusinessProfileResult> {
  const cleanUsername = username.replace(/^@/, "").trim();
  const fields = `business_discovery.username(${cleanUsername}){username,website,name,ig_id,id,profile_picture_url,biography,follows_count,followers_count,media_count,media{id,caption,like_count,comments_count,timestamp,permalink,media_type,media_url}}`;

  const url = `${GRAPH_BASE}/${credentials.instagramUserId}?fields=${encodeURIComponent(fields)}&access_token=${credentials.accessToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    const resolved = resolveMetaError(data.error.code, data.error.error_subcode);
    throw new Error(`Business Discovery failed: ${data.error.message} (${resolved.solution})`);
  }

  return data.business_discovery;
}

/**
 * Search Instagram hashtags to find static hashtag ID
 */
export async function searchHashtag(
  credentials: UserMetaCredentials,
  query: string
): Promise<HashtagSearchResult[]> {
  const cleanQuery = query.replace(/^#/, "").trim();
  const url = `${GRAPH_BASE}/ig_hashtag_search?user_id=${credentials.instagramUserId}&q=${encodeURIComponent(cleanQuery)}&access_token=${credentials.accessToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(`Hashtag search failed: ${data.error.message}`);
  }

  return (data.data || []).map((item: any) => ({
    id: item.id,
    name: cleanQuery
  }));
}

/**
 * Get top performing media for a hashtag
 */
export async function getHashtagTopMedia(
  credentials: UserMetaCredentials,
  hashtagId: string,
  limit: number = 10
): Promise<HashtagMediaItem[]> {
  const fields = "id,caption,comments_count,like_count,media_type,media_url,permalink,timestamp";
  const url = `${GRAPH_BASE}/${hashtagId}/top_media?user_id=${credentials.instagramUserId}&fields=${fields}&limit=${limit}&access_token=${credentials.accessToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(`Top media failed: ${data.error.message}`);
  }

  return data.data || [];
}

/**
 * Get recent media for a hashtag
 */
export async function getHashtagRecentMedia(
  credentials: UserMetaCredentials,
  hashtagId: string,
  limit: number = 10
): Promise<HashtagMediaItem[]> {
  const fields = "id,caption,comments_count,like_count,media_type,media_url,permalink,timestamp";
  const url = `${GRAPH_BASE}/${hashtagId}/recent_media?user_id=${credentials.instagramUserId}&fields=${fields}&limit=${limit}&access_token=${credentials.accessToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(`Recent media failed: ${data.error.message}`);
  }

  return data.data || [];
}

/**
 * Query 24h rolling Content Publishing API quota usage
 */
export async function getContentPublishingLimit(
  credentials: UserMetaCredentials,
  since?: number
): Promise<PublishingLimitResult> {
  let url = `${GRAPH_BASE}/${credentials.instagramUserId}/content_publishing_limit?fields=quota_usage,config&access_token=${credentials.accessToken}`;
  if (since) url += `&since=${since}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(`Publishing limit check failed: ${data.error.message}`);
  }

  const item = (data.data && data.data[0]) || data;
  const usage = item.quota_usage !== undefined ? Number(item.quota_usage) : 0;
  const total = item.config ? Number(item.config.quota_total) : 50;
  const duration = item.config ? Number(item.config.quota_duration) : 86400;

  return {
    quota_usage: usage,
    quota_total: total,
    quota_duration_seconds: duration,
    quota_remaining: Math.max(0, total - usage)
  };
}

/**
 * Moderate a comment: hide, unhide, or delete
 */
export async function moderateComment(
  credentials: UserMetaCredentials,
  commentId: string,
  action: "hide" | "unhide" | "delete"
): Promise<{ success: boolean; action: string }> {
  const token = credentials.pageAccessToken || credentials.accessToken;

  if (action === "hide" || action === "unhide") {
    const url = `${GRAPH_BASE}/${commentId}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        hide: action === "hide" ? "true" : "false",
        access_token: token
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return { success: true, action };
  } else if (action === "delete") {
    const url = `${GRAPH_BASE}/${commentId}?access_token=${token}`;
    const res = await fetch(url, { method: "DELETE" });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return { success: true, action: "delete" };
  }

  throw new Error("Invalid action. Must be hide, unhide, or delete.");
}
