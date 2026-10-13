import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";
import { publishSingleImage, publishCarousel, publishReel, publishStory } from "@/lib/meta/publishing";
import { sanitizeErrorMessage } from "@/lib/security/sanitize";

export const dynamic = "force-dynamic";

// 1. GET: Fetch user's scheduled posts
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: scheduledPosts, error } = await supabase
      .from("posts")
      .select(`
        id,
        media_type,
        caption,
        status,
        scheduled_for,
        created_at,
        post_media (
          secure_url,
          position
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "scheduled")
      .order("scheduled_for", { ascending: true });

    if (error) {
      console.warn("Error fetching scheduled posts from Supabase:", error);
      return NextResponse.json({ posts: [] });
    }

    const formatted = (scheduledPosts || []).map((post: any) => {
      const media = (post.post_media || []).sort((a: any, b: any) => a.position - b.position);
      return {
        id: post.id,
        media_type: post.media_type,
        caption: post.caption,
        status: post.status,
        scheduled_for: post.scheduled_for,
        created_at: post.created_at,
        imageUrls: media.map((m: any) => m.secure_url),
      };
    });

    return NextResponse.json({ posts: formatted, total: formatted.length });
  } catch (err: any) {
    return NextResponse.json(
      { error: sanitizeErrorMessage(err, "Failed to fetch scheduled posts.") },
      { status: 500 }
    );
  }
}

// 2. DELETE: Cancel a scheduled post
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("id");

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required." }, { status: 400 });
    }

    const supabase = await createClient();
    // Delete associated media records first
    await supabase.from("post_media").delete().eq("post_id", postId);

    // Delete scheduled post
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Scheduled post cancelled." });
  } catch (err: any) {
    return NextResponse.json(
      { error: sanitizeErrorMessage(err, "Failed to cancel scheduled post.") },
      { status: 500 }
    );
  }
}

// 3. POST: Trigger instant publish for a scheduled post now
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required." }, { status: 400 });
    }

    const credentials = await getUserInstagramCredentials(user.id);
    if (!credentials) {
      return NextResponse.json({ error: "No connected Instagram credentials found." }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: post, error: fetchErr } = await supabase
      .from("posts")
      .select(`
        id,
        user_id,
        media_type,
        caption,
        post_media (
          secure_url,
          position
        )
      `)
      .eq("id", postId)
      .eq("user_id", user.id)
      .single();

    if (fetchErr || !post) {
      return NextResponse.json({ error: "Scheduled post not found." }, { status: 404 });
    }

    const media = (post.post_media as any[]).sort((a, b) => a.position - b.position);
    const imageUrls = media.map((m) => m.secure_url);

    if (imageUrls.length === 0) {
      return NextResponse.json({ error: "No media assets found for this post." }, { status: 400 });
    }

    let result;
    if (post.media_type === "IMAGE") {
      result = await publishSingleImage(imageUrls[0], post.caption || "", credentials.instagramUserId, credentials.accessToken);
    } else if (post.media_type === "CAROUSEL") {
      result = await publishCarousel(imageUrls, post.caption || "", credentials.instagramUserId, credentials.accessToken);
    } else if (post.media_type === "REELS") {
      result = await publishReel(imageUrls[0], post.caption || "", credentials.instagramUserId, credentials.accessToken);
    } else if (post.media_type === "STORIES") {
      const isVideo = imageUrls[0].toLowerCase().includes(".mp4") || imageUrls[0].toLowerCase().includes(".mov");
      result = await publishStory(imageUrls[0], isVideo, credentials.instagramUserId, credentials.accessToken);
    }

    if (!result) {
      throw new Error("Publishing failed or unsupported media type.");
    }

    // Update status to published in Supabase
    await supabase
      .from("posts")
      .update({
        status: "published",
        instagram_media_id: result.mediaId,
        permalink: result.permalink || null,
        published_at: new Date().toISOString(),
      })
      .eq("id", post.id);

    return NextResponse.json({
      success: true,
      message: "Post published to Instagram immediately!",
      post: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: sanitizeErrorMessage(err, "Failed to publish scheduled post now.") },
      { status: 500 }
    );
  }
}
