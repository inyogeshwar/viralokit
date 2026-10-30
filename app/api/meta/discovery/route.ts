import { NextRequest, NextResponse } from "next/server";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";
import {
  discoverBusinessProfile,
  searchHashtag,
  getHashtagTopMedia,
  getHashtagRecentMedia,
  getContentPublishingLimit,
  moderateComment,
  resolveMetaError
} from "@/lib/meta/discovery";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const userId = searchParams.get("userId") || undefined;

    if (action === "error_resolver") {
      const code = searchParams.get("code") || "";
      const subcode = searchParams.get("subcode") || null;
      const info = resolveMetaError(code, subcode);
      return NextResponse.json(info);
    }

    const credentials = await getUserInstagramCredentials(userId);
    if (!credentials) {
      return NextResponse.json(
        { error: "No connected Instagram account or environment credentials found." },
        { status: 401 }
      );
    }

    if (action === "business") {
      const username = searchParams.get("username");
      if (!username) {
        return NextResponse.json({ error: "username parameter is required" }, { status: 400 });
      }
      const data = await discoverBusinessProfile(credentials, username);
      return NextResponse.json(data);
    }

    if (action === "search_hashtag") {
      const query = searchParams.get("query");
      if (!query) {
        return NextResponse.json({ error: "query parameter is required" }, { status: 400 });
      }
      const data = await searchHashtag(credentials, query);
      return NextResponse.json(data);
    }

    if (action === "top_media") {
      const hashtagId = searchParams.get("hashtagId");
      if (!hashtagId) {
        return NextResponse.json({ error: "hashtagId parameter is required" }, { status: 400 });
      }
      const limit = Number(searchParams.get("limit")) || 10;
      const data = await getHashtagTopMedia(credentials, hashtagId, limit);
      return NextResponse.json(data);
    }

    if (action === "recent_media") {
      const hashtagId = searchParams.get("hashtagId");
      if (!hashtagId) {
        return NextResponse.json({ error: "hashtagId parameter is required" }, { status: 400 });
      }
      const limit = Number(searchParams.get("limit")) || 10;
      const data = await getHashtagRecentMedia(credentials, hashtagId, limit);
      return NextResponse.json(data);
    }

    if (action === "publishing_limit") {
      const data = await getContentPublishingLimit(credentials);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, commentId, moderateAction, userId } = body;

    const credentials = await getUserInstagramCredentials(userId);
    if (!credentials) {
      return NextResponse.json(
        { error: "No connected Instagram account found." },
        { status: 401 }
      );
    }

    if (action === "moderate_comment") {
      if (!commentId || !moderateAction) {
        return NextResponse.json(
          { error: "commentId and moderateAction (hide|unhide|delete) are required." },
          { status: 400 }
        );
      }
      const res = await moderateComment(credentials, commentId, moderateAction);
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
