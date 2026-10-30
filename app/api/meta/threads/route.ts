import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";
import {
  getThreadsProfile,
  publishThreadsPost,
  getThreadsPosts,
  replyToThreadsPost,
  getThreadsInsights,
  exchangeThreadsToken,
} from "@/lib/meta/threads";
import { config } from "@/lib/config";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const credentials = await getUserInstagramCredentials(user?.id);

    const threadsToken = credentials?.threadsAccessToken || config.threads.accessToken;
    const threadsUserId = credentials?.threadsUserId || config.threads.userId || "me";

    if (!threadsToken) {
      return NextResponse.json(
        { error: "Threads access token not configured. Please add THREADS_ACCESS_TOKEN." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "profile";
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const threadId = searchParams.get("threadId") || undefined;

    if (type === "posts") {
      const posts = await getThreadsPosts({
        userId: threadsUserId,
        limit,
        accessToken: threadsToken,
      });
      return NextResponse.json({ posts });
    }

    if (type === "insights") {
      const insights = await getThreadsInsights({
        userId: threadsUserId,
        threadId,
        accessToken: threadsToken,
      });
      return NextResponse.json({ insights });
    }

    const profile = await getThreadsProfile({
      userId: threadsUserId,
      accessToken: threadsToken,
    });

    return NextResponse.json({ profile });
  } catch (err: any) {
    console.error("[Threads API Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch Threads data." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const credentials = await getUserInstagramCredentials(user?.id);

    const threadsToken = credentials?.threadsAccessToken || config.threads.accessToken;
    const threadsUserId = credentials?.threadsUserId || config.threads.userId || "me";

    const body = await request.json();
    const { action = "publish" } = body;

    if (action === "exchange_token") {
      const { shortLivedToken, clientSecret = config.threads.appSecret } = body;
      if (!shortLivedToken || !clientSecret) {
        return NextResponse.json(
          { error: "shortLivedToken and clientSecret are required." },
          { status: 400 }
        );
      }

      const res = await exchangeThreadsToken({
        shortLivedToken,
        clientSecret,
      });

      return NextResponse.json(res);
    }

    if (!threadsToken) {
      return NextResponse.json(
        { error: "Threads access token not configured. Please add THREADS_ACCESS_TOKEN." },
        { status: 400 }
      );
    }

    if (action === "publish") {
      const { text, mediaType, imageUrl, videoUrl } = body;
      if (!text) {
        return NextResponse.json({ error: "Post text is required." }, { status: 400 });
      }

      const res = await publishThreadsPost({
        userId: threadsUserId,
        text,
        mediaType,
        imageUrl,
        videoUrl,
        accessToken: threadsToken,
      });

      return NextResponse.json(res);
    }

    if (action === "reply") {
      const { threadId, text } = body;
      if (!threadId || !text) {
        return NextResponse.json(
          { error: "threadId and reply text are required." },
          { status: 400 }
        );
      }

      const res = await replyToThreadsPost({
        userId: threadsUserId,
        threadId,
        text,
        accessToken: threadsToken,
      });

      return NextResponse.json(res);
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error("[Threads Publish Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to publish to Threads." },
      { status: 500 }
    );
  }
}
