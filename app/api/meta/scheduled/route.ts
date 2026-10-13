import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { getUserInstagramCredentials, UserInstagramCredentials } from "@/lib/meta/user-account";
import { publishSingleImage, publishCarousel, publishReel, publishStory } from "@/lib/meta/publishing";
import { sanitizeErrorMessage } from "@/lib/security/sanitize";

export const dynamic = "force-dynamic";

/**
 * Executes live Instagram publishing for a scheduled post record and updates database.
 */
async function executePublishPost(
  post: any,
  credentials: UserInstagramCredentials,
  supabase: any
) {
  const media = (post.post_media as any[]).sort((a, b) => a.position - b.position);
  const imageUrls = media.map((m) => m.secure_url);

  if (imageUrls.length === 0) {
    throw new Error("No media assets found for this post.");
  }

  // Mark as processing to avoid duplicate runs
  await supabase
    .from("posts")
    .update({ status: "processing" })
    .eq("id", post.id);

  try {
    let result;
    if (post.media_type === "IMAGE") {
      result = await publishSingleImage(
        imageUrls[0],
        post.caption || "",
        credentials.instagramUserId,
        credentials.accessToken
      );
    } else if (post.media_type === "CAROUSEL") {
      result = await publishCarousel(
        imageUrls,
        post.caption || "",
        credentials.instagramUserId,
        credentials.accessToken
      );
    } else if (post.media_type === "REELS") {
      result = await publishReel(
        imageUrls[0],
        post.caption || "",
        credentials.instagramUserId,
        credentials.accessToken
      );
    } else if (post.media_type === "STORIES") {
      const isVideo =
        imageUrls[0].toLowerCase().includes(".mp4") ||
        imageUrls[0].toLowerCase().includes(".mov");
      result = await publishStory(
        imageUrls[0],
        isVideo,
        credentials.instagramUserId,
        credentials.accessToken
      );
    }

    if (!result) {
      throw new Error("Publishing returned empty result.");
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

    return result;
  } catch (err: any) {
    // If failed, mark as failed so user can retry or cancel
    await supabase
      .from("posts")
      .update({ status: "failed" })
      .eq("id", post.id);
    throw err;
  }
}

// 1. GET: Fetch user's scheduled posts & automatically execute any overdue posts
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

    const now = new Date();
    // Auto-detect any posts whose scheduled time has already arrived
    const duePosts = (scheduledPosts || []).filter(
      (p: any) => p.scheduled_for && new Date(p.scheduled_for) <= now
    );

    let newlyPublishedCount = 0;
    if (duePosts.length > 0) {
      const credentials = await getUserInstagramCredentials(user.id);
      if (credentials) {
        for (const post of duePosts) {
          try {
            await executePublishPost(post, credentials, supabase);
            newlyPublishedCount++;
          } catch (pubErr) {
            console.error(`Auto-publish error for overdue post ${post.id}:`, pubErr);
          }
        }
      }
    }

    // If any post was auto-published, refresh the remaining list
    let remainingPosts = scheduledPosts || [];
    if (newlyPublishedCount > 0) {
      const { data: updatedScheduled } = await supabase
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

      remainingPosts = updatedScheduled || [];
    }

    const formatted = remainingPosts.map((post: any) => {
      const media = (post.post_media || []).sort((a: any, b: any) => a.position - b.position);
      return {
        id: post.id,
        media_type: post.media_type,
        caption: post.caption,
        status: post.status,
        scheduled_for: post.scheduled_for,
        created_at: post.created_at,
        imageUrls: media.map((m: any) => m.secure_url),
        isDue: post.scheduled_for ? new Date(post.scheduled_for) <= new Date() : false,
      };
    });

    return NextResponse.json({
      posts: formatted,
      total: formatted.length,
      newlyPublishedCount,
    });
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

    const result = await executePublishPost(post, credentials, supabase);

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
