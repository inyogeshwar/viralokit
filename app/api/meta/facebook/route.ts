import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";
import {
  getFacebookPageProfile,
  publishFacebookPost,
  publishFacebookPhoto,
  getFacebookPosts,
} from "@/lib/meta/facebook";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const credentials = await getUserInstagramCredentials(user?.id);

    if (!credentials || !credentials.pageAccessToken || !credentials.pageId) {
      return NextResponse.json(
        { error: "Facebook Page credentials or Page ID not configured." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "profile";
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (type === "posts") {
      const posts = await getFacebookPosts({
        pageId: credentials.pageId,
        limit,
        accessToken: credentials.pageAccessToken,
      });
      return NextResponse.json({ posts });
    }

    const profile = await getFacebookPageProfile({
      pageId: credentials.pageId,
      accessToken: credentials.pageAccessToken,
    });

    return NextResponse.json({ profile });
  } catch (err: any) {
    console.error("[Facebook API Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch Facebook data." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const credentials = await getUserInstagramCredentials(user?.id);

    if (!credentials || !credentials.pageAccessToken || !credentials.pageId) {
      return NextResponse.json(
        { error: "Facebook Page credentials or Page ID not configured." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action = "post" } = body;

    if (action === "post") {
      const { message, link } = body;
      if (!message) {
        return NextResponse.json({ error: "Post message is required." }, { status: 400 });
      }

      const res = await publishFacebookPost({
        pageId: credentials.pageId,
        message,
        link,
        accessToken: credentials.pageAccessToken,
      });

      return NextResponse.json(res);
    }

    if (action === "photo") {
      const { photoUrl, caption } = body;
      if (!photoUrl) {
        return NextResponse.json({ error: "photoUrl is required." }, { status: 400 });
      }

      const res = await publishFacebookPhoto({
        pageId: credentials.pageId,
        photoUrl,
        caption,
        accessToken: credentials.pageAccessToken,
      });

      return NextResponse.json(res);
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error("[Facebook Publish Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to publish to Facebook." },
      { status: 500 }
    );
  }
}
