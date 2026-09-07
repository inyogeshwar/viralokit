import { config, getMetaGraphUrl } from "@/lib/config";
import { InstagramMediaItem, NormalizedAccountAnalytics } from "./types";

function extractMetricValue(data: any[], metricName: string): number | null {
  if (!Array.isArray(data)) return null;
  const item = data.find((m) => m.name === metricName);
  if (!item) return null;

  if (typeof item.total_value?.value === "number") {
    return item.total_value.value;
  }
  if (Array.isArray(item.values) && item.values.length > 0) {
    const last = item.values[item.values.length - 1];
    if (typeof last?.value === "number") return last.value;
    if (typeof last?.value?.value === "number") return last.value.value;
  }
  return null;
}

export async function fetchRecentMedia(
  limit = 25,
  customUserId?: string,
  customAccessToken?: string
): Promise<InstagramMediaItem[]> {
  const userId = customUserId || config.meta.defaultUserId;
  const accessToken = customAccessToken || config.meta.defaultAccessToken;

  if (!userId || !accessToken) {
    return [];
  }

  const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count";
  const url = `${getMetaGraphUrl(`${userId}/media`)}?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(accessToken)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok || data.error) {
      console.warn("Failed to fetch recent Instagram media:", data.error?.message);
      return [];
    }
    return (data.data || []).map((item: any) => ({
      id: item.id,
      caption: item.caption || "",
      media_type: item.media_type || "IMAGE",
      media_url: item.media_url || item.thumbnail_url || "",
      thumbnail_url: item.thumbnail_url || item.media_url || "",
      permalink: item.permalink || "",
      timestamp: item.timestamp,
      like_count: typeof item.like_count === "number" ? item.like_count : null,
      comments_count: typeof item.comments_count === "number" ? item.comments_count : null,
    }));
  } catch (err) {
    console.error("Error fetching media:", err);
    return [];
  }
}

export async function fetchAccountAnalytics(
  customUserId?: string,
  customAccessToken?: string
): Promise<NormalizedAccountAnalytics | null> {
  const userId = customUserId || config.meta.defaultUserId;
  const accessToken = customAccessToken || config.meta.defaultAccessToken;

  if (!userId || !accessToken) {
    return null;
  }

  try {
    // 1. Fetch Profile Data
    const userUrl = `${getMetaGraphUrl(userId)}?fields=id,username,name,followers_count,follows_count,media_count,profile_picture_url&access_token=${encodeURIComponent(accessToken)}`;
    const userRes = await fetch(userUrl);
    const userData = await userRes.json();

    if (!userRes.ok || userData.error) {
      throw new Error(userData.error?.message || "Failed to fetch profile");
    }

    // 2. Fetch Insights (day period)
    let reach: number | null = null;
    let impressions: number | null = null;
    let profileViews: number | null = null;
    let totalInteractions: number | null = null;
    let accountsEngaged: number | null = null;
    let followerGrowth: number | null = null;

    try {
      const insightsUrl = `${getMetaGraphUrl(`${userId}/insights`)}?metric=reach,impressions&period=day&access_token=${encodeURIComponent(accessToken)}`;
      const insightsRes = await fetch(insightsUrl);
      const insightsData = await insightsRes.json();
      if (insightsRes.ok && Array.isArray(insightsData.data)) {
        reach = extractMetricValue(insightsData.data, "reach");
        impressions = extractMetricValue(insightsData.data, "impressions");
      }
    } catch {
      // Metric not supported for this account type
    }

    try {
      const interactionsUrl = `${getMetaGraphUrl(`${userId}/insights`)}?metric=profile_views,accounts_engaged,total_interactions&period=day&metric_type=total_value&access_token=${encodeURIComponent(accessToken)}`;
      const interRes = await fetch(interactionsUrl);
      const interData = await interRes.json();
      if (interRes.ok && Array.isArray(interData.data)) {
        profileViews = extractMetricValue(interData.data, "profile_views");
        accountsEngaged = extractMetricValue(interData.data, "accounts_engaged");
        totalInteractions = extractMetricValue(interData.data, "total_interactions");
      }
    } catch {
      // Metric not supported
    }

    // 3. Fetch Recent Media & Top Posts
    const recentMedia = await fetchRecentMedia(20, userId, accessToken);

    // Rank top posts by sum of likes and comments where available
    const topPosts = [...recentMedia]
      .filter((post) => post.like_count !== null || post.comments_count !== null)
      .sort((a, b) => {
        const scoreA = (a.like_count || 0) + (a.comments_count || 0) * 2;
        const scoreB = (b.like_count || 0) + (b.comments_count || 0) * 2;
        return scoreB - scoreA;
      })
      .slice(0, 5);

    return {
      account: {
        id: userData.id,
        username: userData.username || "Creator",
        name: userData.name || userData.username || "",
        followersCount: typeof userData.followers_count === "number" ? userData.followers_count : null,
        followsCount: typeof userData.follows_count === "number" ? userData.follows_count : null,
        mediaCount: typeof userData.media_count === "number" ? userData.media_count : null,
        profilePictureUrl: userData.profile_picture_url || null,
      },
      insights: {
        reach,
        impressions,
        profileViews,
        totalInteractions,
        accountsEngaged,
        followerGrowth,
      },
      recentMedia,
      topPosts,
      snapshotsTimestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error("fetchAccountAnalytics error:", err);
    return null;
  }
}
