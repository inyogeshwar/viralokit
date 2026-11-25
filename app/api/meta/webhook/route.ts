import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "@/lib/config";
import { processWebhookComment } from "@/lib/meta/funnel";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Meta Webhooks Verification Handshake (GET)
 * Meta calls this endpoint when you configure the Webhook in Meta App Dashboard.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = config.webhook.verifyToken;
  const isTokenValid = Boolean(token && expectedToken && token === expectedToken);

  if (mode === "subscribe" && isTokenValid) {
    return new Response(challenge || "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn("[Meta Webhook] Verification failed. Token mismatch.");
  return new Response("Forbidden", { status: 403, headers: { "Content-Type": "text/plain" } });
}

function verifyMetaSignature(rawBody: string, signature: string | null): boolean {
  const secret = config.meta.appSecret;
  if (!secret || !signature || !signature.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const received = signature.slice(7);
  if (!/^[0-9a-f]{64}$/i.test(received)) return false;
  return timingSafeEqual(expected, Buffer.from(received, "hex"));
}

/**
 * Meta Webhooks Real-Time Event Receiver (POST)
 * Handles incoming Instagram comments and messages 24/7 in the cloud without needing a PC.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    if (!verifyMetaSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
      console.warn("[Meta Webhook] Invalid or missing X-Hub-Signature-256.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    if (body.object !== "instagram") {
      return NextResponse.json({ status: "ignored_non_instagram" }, { status: 200 });
    }

    const credentials = await getUserInstagramCredentials(undefined, {
      allowEnvironmentFallback: true,
    });
    if (!credentials || !credentials.pageAccessToken || !credentials.pageId) {
      console.warn("[Meta Webhook] Received webhook but Meta credentials are not configured.");
      return NextResponse.json({ status: "credentials_missing" }, { status: 200 });
    }

    // Process entry items
    const entries = body.entry || [];
    for (const entry of entries) {
      // 1. Changes (e.g. comments on posts/reels)
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field === "comments") {
          const value = change.value;
          const commentId = value.id;
          const commentText = value.text || "";
          const commenterUsername = value.from?.username || "creator";
          const commenterId = value.from?.id;
          const mediaId = value.media?.id || value.id;

          // Don't auto-process our own comments
          if (commenterUsername === credentials.username) continue;

          // Check database or default funnels
          let funnels: any[] = [];
          try {
            const supabase = await createClient();
            const { data } = await supabase
              .from("growth_funnels")
              .select("*")
              .eq("instagram_account_id", credentials.instagramUserId)
              .eq("is_active", true);
            if (data && data.length > 0) {
              funnels = data;
            }
          } catch {
            // DB table might not exist yet; fallback to default trigger if keyword in text
          }

          if (funnels.length === 0) {
            // Default built-in smart funnel if someone comments LINK, GUIDE, or SEND
            funnels = [
              {
                keyword: "link",
                publicReplyTemplate: "Sent you the link in DM! 📩 Check your inbox @{username}!",
                requireFollow: true,
                followGateMessage: "Hey @{username}! 👋 Follow our account first to unlock this link! Once followed, reply DONE 🚀",
                unlockedContentText: "Here is your exclusive link: https://viralokit.vercel.app 🚀 Enjoy!",
              },
              {
                keyword: "guide",
                publicReplyTemplate: "I just sent the guide to your DM @{username}! 🎁",
                requireFollow: true,
                followGateMessage: "Hey @{username}! 👋 Follow our account first to unlock the free guide! Once followed, reply DONE 🎁",
                unlockedContentText: "Here is your guide: https://viralokit.vercel.app 🚀 Enjoy!",
              },
            ];
          }

          for (const funnel of funnels) {
            // Wishlink specific post matching:
            // If the rule has target_media_id, only trigger if comment is on THAT post
            if (funnel.target_media_id && mediaId && String(funnel.target_media_id) !== String(mediaId)) {
              continue;
            }

            if (commentText.toLowerCase().includes(funnel.keyword.toLowerCase())) {
              await processWebhookComment({
                commentId,
                commentText,
                commenterId,
                commenterUsername,
                funnel: {
                  keyword: funnel.keyword,
                  publicReplyTemplate: funnel.public_reply_template || funnel.publicReplyTemplate,
                  requireFollow: funnel.require_follow ?? funnel.requireFollow,
                  followGateMessage: funnel.follow_gate_message || funnel.followGateMessage,
                  unlockedContentText: funnel.unlocked_content_text || funnel.unlockedContentText,
                  attachmentType: funnel.attachment_type,
                  attachmentUrl: funnel.attachment_url,
                },
                pageId: credentials.pageId,
                instagramId: credentials.instagramUserId,
                accessToken: credentials.pageAccessToken,
              });
              break; // Only trigger one funnel per comment
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (err: any) {
    console.error("[Meta Webhook POST Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process webhook event." },
      { status: 500 }
    );
  }
}
