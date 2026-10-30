import { config } from "@/lib/config";

const GRAPH_API_BASE = `https://graph.facebook.com/${config.meta.apiVersion || "v23.0"}`;

interface GraphRequestOptions {
  endpoint: string;
  method?: "GET" | "POST" | "DELETE";
  data?: any;
  isJson?: boolean;
  accessToken: string;
}

export async function graphRequest({
  endpoint,
  method = "GET",
  data = null,
  isJson = false,
  accessToken,
}: GraphRequestOptions): Promise<any> {
  const urlObj = new URL(`${GRAPH_API_BASE}${endpoint}`);
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
    throw new Error(`Invalid JSON response from Meta API (${res.status}): ${text}`);
  }

  if (!res.ok || json.error) {
    const err = json.error || {};
    throw new Error(err.message || `Meta API Error (${res.status}): ${text}`);
  }

  return json;
}

export interface SendDmOptions {
  recipientId: string;
  messageText?: string;
  attachmentType?: "audio" | "file" | "image" | "video";
  attachmentUrl?: string;
  attachmentId?: string;
  replyToMessageId?: string;
  pageId: string;
  accessToken: string;
}

/**
 * Send an Instagram Direct Message (Text, Voice Note M4A/WAV, PDF, Image, Quoted Reply)
 */
export async function sendInstagramDM({
  recipientId,
  messageText,
  attachmentType,
  attachmentUrl,
  attachmentId,
  replyToMessageId,
  pageId,
  accessToken,
}: SendDmOptions) {
  const messageObj: any = {};
  if (messageText) messageObj.text = messageText;

  if (attachmentType) {
    if (attachmentId) {
      messageObj.attachment = {
        type: attachmentType,
        payload: { attachment_id: attachmentId },
      };
    } else if (attachmentUrl) {
      messageObj.attachment = {
        type: attachmentType,
        payload: {
          url: attachmentUrl,
          is_reusable: true,
        },
      };
    }
  }

  const payload: any = {
    recipient: { id: recipientId },
    message: messageObj,
  };

  if (replyToMessageId) {
    payload.reply_to = { mid: replyToMessageId };
  }

  return graphRequest({
    endpoint: `/${pageId}/messages`,
    method: "POST",
    data: payload,
    isJson: true,
    accessToken,
  });
}

/**
 * Send a Private Reply DM directly to an Instagram Commenter
 */
export async function sendInstagramPrivateReply({
  commentId,
  messageText,
  pageId,
  accessToken,
}: {
  commentId: string;
  messageText: string;
  pageId: string;
  accessToken: string;
}) {
  const payload = {
    recipient: { comment_id: commentId },
    message: { text: messageText },
  };

  return graphRequest({
    endpoint: `/${pageId}/messages`,
    method: "POST",
    data: payload,
    isJson: true,
    accessToken,
  });
}

/**
 * Double-Tap Emoji Reaction (❤️, 🔥, 👍, unreact)
 */
export async function reactToMessage({
  recipientId,
  messageId,
  reaction = "❤️",
  action = "react",
  pageId,
  accessToken,
}: {
  recipientId: string;
  messageId: string;
  reaction?: string;
  action?: "react" | "unreact";
  pageId: string;
  accessToken: string;
}) {
  const reactionPayload: any = { message_id: messageId };
  if (action === "react") {
    reactionPayload.reaction = reaction;
  }

  const payload = {
    recipient: { id: recipientId },
    sender_action: action,
    payload: reactionPayload,
  };

  return graphRequest({
    endpoint: `/${pageId}/messages`,
    method: "POST",
    data: payload,
    isJson: true,
    accessToken,
  });
}

/**
 * Trigger typing_on, typing_off, or mark_seen sender action
 */
export async function sendSenderAction({
  recipientId,
  action,
  pageId,
  accessToken,
}: {
  recipientId: string;
  action: "typing_on" | "typing_off" | "mark_seen";
  pageId: string;
  accessToken: string;
}) {
  return graphRequest({
    endpoint: `/${pageId}/messages`,
    method: "POST",
    data: {
      recipient: { id: recipientId },
      sender_action: action,
    },
    isJson: true,
    accessToken,
  });
}

/**
 * Send interactive Quick Reply buttons
 */
export async function sendQuickReplies({
  recipientId,
  messageText,
  quickReplies,
  pageId,
  accessToken,
}: {
  recipientId: string;
  messageText: string;
  quickReplies: Array<{ title: string; payload: string }>;
  pageId: string;
  accessToken: string;
}) {
  const payload = {
    recipient: { id: recipientId },
    message: {
      text: messageText,
      quick_replies: quickReplies.map((q) => ({
        content_type: "text",
        title: q.title,
        payload: q.payload,
      })),
    },
  };

  return graphRequest({
    endpoint: `/${pageId}/messages`,
    method: "POST",
    data: payload,
    isJson: true,
    accessToken,
  });
}

/**
 * Upload reusable media attachment to get an attachment_id
 */
export async function uploadReusableAttachment({
  url,
  attachmentType,
  pageId,
  accessToken,
}: {
  url: string;
  attachmentType: "audio" | "file" | "image" | "video";
  pageId: string;
  accessToken: string;
}) {
  const payload = {
    platform: "instagram",
    message: {
      attachment: {
        type: attachmentType,
        payload: {
          is_reusable: true,
          url,
        },
      },
    },
  };

  return graphRequest({
    endpoint: `/${pageId}/message_attachments`,
    method: "POST",
    data: payload,
    isJson: true,
    accessToken,
  });
}

/**
 * Fetch direct message conversation threads
 */
export async function getConversations({
  limit = 10,
  pageId,
  accessToken,
}: {
  limit?: number;
  pageId: string;
  accessToken: string;
}) {
  const res = await graphRequest({
    endpoint: `/${pageId}/conversations?platform=instagram&fields=id,updated_time,unread_count,participants&limit=${limit}`,
    accessToken,
  });
  return res.data || [];
}

/**
 * Fetch messages inside a conversation thread
 */
export async function getConversationMessages({
  conversationId,
  limit = 15,
  accessToken,
}: {
  conversationId: string;
  limit?: number;
  accessToken: string;
}) {
  const res = await graphRequest({
    endpoint: `/${conversationId}/messages?fields=id,message,created_time,from,attachments&limit=${limit}`,
    accessToken,
  });
  return res.data || [];
}

/**
 * Generate an ig.me short link with optional referral payload
 */
export function generateIgMeLink(username: string, refPayload?: string): string {
  let link = `https://ig.me/m/${username}`;
  if (refPayload) {
    link += `?ref=${encodeURIComponent(refPayload)}`;
  }
  return link;
}
