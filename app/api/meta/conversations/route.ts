import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";
import { getConversations, getConversationMessages } from "@/lib/meta/messaging";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const credentials = await getUserInstagramCredentials(user?.id);

    if (!credentials || !credentials.pageAccessToken || !credentials.pageId) {
      return NextResponse.json(
        { error: "Meta credentials or Page ID not configured." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const limit = parseInt(searchParams.get("limit") || "15", 10);

    if (conversationId) {
      const messages = await getConversationMessages({
        conversationId,
        limit,
        accessToken: credentials.pageAccessToken,
      });
      return NextResponse.json({ messages });
    }

    const conversations = await getConversations({
      limit,
      pageId: credentials.pageId,
      accessToken: credentials.pageAccessToken,
    });

    return NextResponse.json({ conversations });
  } catch (err: any) {
    console.error("[Conversations API Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch conversations." },
      { status: 500 }
    );
  }
}
