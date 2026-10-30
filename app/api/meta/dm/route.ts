import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";
import {
  sendInstagramDM,
  reactToMessage,
  sendSenderAction,
  sendQuickReplies,
} from "@/lib/meta/messaging";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const credentials = await getUserInstagramCredentials(user?.id);

    if (!credentials || !credentials.pageAccessToken || !credentials.pageId) {
      return NextResponse.json(
        { error: "Meta credentials or Page ID not configured." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action = "send_dm" } = body;

    if (action === "send_dm") {
      const {
        recipientId,
        messageText,
        attachmentType,
        attachmentUrl,
        attachmentId,
        replyToMessageId,
      } = body;

      if (!recipientId) {
        return NextResponse.json({ error: "recipientId is required." }, { status: 400 });
      }

      const res = await sendInstagramDM({
        recipientId,
        messageText,
        attachmentType,
        attachmentUrl,
        attachmentId,
        replyToMessageId,
        pageId: credentials.pageId,
        accessToken: credentials.pageAccessToken,
      });

      return NextResponse.json({ success: true, result: res });
    }

    if (action === "react") {
      const { recipientId, messageId, reaction = "❤️", reactionAction = "react" } = body;

      if (!recipientId || !messageId) {
        return NextResponse.json(
          { error: "recipientId and messageId are required for reactions." },
          { status: 400 }
        );
      }

      const res = await reactToMessage({
        recipientId,
        messageId,
        reaction,
        action: reactionAction,
        pageId: credentials.pageId,
        accessToken: credentials.pageAccessToken,
      });

      return NextResponse.json({ success: true, result: res });
    }

    if (action === "sender_action") {
      const { recipientId, senderAction } = body;

      if (!recipientId || !senderAction) {
        return NextResponse.json(
          { error: "recipientId and senderAction are required." },
          { status: 400 }
        );
      }

      const res = await sendSenderAction({
        recipientId,
        action: senderAction,
        pageId: credentials.pageId,
        accessToken: credentials.pageAccessToken,
      });

      return NextResponse.json({ success: true, result: res });
    }

    if (action === "quick_replies") {
      const { recipientId, messageText, quickReplies } = body;

      const res = await sendQuickReplies({
        recipientId,
        messageText,
        quickReplies,
        pageId: credentials.pageId,
        accessToken: credentials.pageAccessToken,
      });

      return NextResponse.json({ success: true, result: res });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error("[DM API Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to process DM request." }, { status: 500 });
  }
}
