import { graphRequest, sendInstagramDM } from "./messaging";

export interface FunnelOptions {
  mediaId?: string;
  keyword: string;
  publicReplyTemplate?: string;
  likeMatchingComments?: boolean;
  requireFollow?: boolean;
  followGateMessage?: string;
  unlockedContentText: string;
  attachmentType?: "audio" | "file" | "image" | "video";
  attachmentUrl?: string;
  attachmentId?: string;
  pageId: string;
  instagramId: string;
  accessToken: string;
}

export interface FunnelResult {
  comment_id: string;
  username: string;
  comment_text: string;
  liked: boolean;
  public_reply_sent: boolean;
  dm_sent: boolean;
  status: string;
  is_follower?: boolean;
  error?: string;
}

/**
 * Checks whether an Instagram user follows your account.
 */
export async function checkUserFollowsAccount(
  userId: string,
  accessToken: string
): Promise<{ isFollowing: boolean; username?: string; name?: string }> {
  try {
    const res = await graphRequest({
      endpoint: `/${userId}?fields=is_user_follow_business,is_business_follow_user,name,username`,
      accessToken,
    });
    return {
      isFollowing: Boolean(res.is_user_follow_business),
      username: res.username,
      name: res.name,
    };
  } catch (err: any) {
    console.warn(`[checkUserFollowsAccount] Could not query follow status for ${userId}:`, err?.message);
    return { isFollowing: false };
  }
}

/**
 * Like a comment on Instagram
 */
export async function likeComment(commentId: string, instagramId: string, accessToken: string) {
  return graphRequest({
    endpoint: `/${instagramId}/likes`,
    method: "POST",
    data: { comment_id: commentId },
    accessToken,
  });
}

/**
 * Reply to a comment on Instagram
 */
export async function replyToComment(commentId: string, message: string, accessToken: string) {
  return graphRequest({
    endpoint: `/${commentId}/replies`,
    method: "POST",
    data: { message },
    accessToken,
  });
}

/**
 * Executes a ManyChat/Superprofile-style Follow-to-Unlock Growth Funnel
 * across comments of a post or Reel.
 */
export async function runCommentGrowthFunnel(opts: FunnelOptions): Promise<{
  mediaId: string;
  keyword: string;
  totalCommentsChecked: number;
  matchingCommentsFound: number;
  processedCount: number;
  results: FunnelResult[];
}> {
  let targetMediaId: string = opts.mediaId || "";
  if (!targetMediaId || targetMediaId.toLowerCase() === "latest") {
    const mediaRes = await graphRequest({
      endpoint: `/${opts.instagramId}/media?fields=id&limit=1`,
      accessToken: opts.accessToken,
    });
    if (!mediaRes.data || mediaRes.data.length === 0) {
      throw new Error("No media posts found on the Instagram account.");
    }
    targetMediaId = String(mediaRes.data[0].id);
  }

  const keywordLower = opts.keyword.trim().toLowerCase();
  const commentsRes = await graphRequest({
    endpoint: `/${targetMediaId}/comments?fields=id,text,timestamp,username,from&limit=30`,
    accessToken: opts.accessToken,
  });

  const allComments: any[] = commentsRes.data || [];
  const matchingComments = allComments.filter((c) => {
    const text = (c.text || "").toLowerCase();
    return text.includes(keywordLower);
  });

  const processed: FunnelResult[] = [];
  const followGatePrompt =
    opts.followGateMessage ||
    `Hey @{username}! 👋 Thanks for commenting! To unlock your exclusive resource, please follow our account first! Once followed, reply 'DONE' here to get it 🎁`;

  for (const comment of matchingComments) {
    const commentId = comment.id;
    const commenterUsername = comment.username || (comment.from ? comment.from.username : "there");
    const commenterId = comment.from ? comment.from.id : null;

    const log: FunnelResult = {
      comment_id: commentId,
      username: commenterUsername,
      comment_text: comment.text,
      liked: false,
      public_reply_sent: false,
      dm_sent: false,
      status: "",
    };

    // 1. Auto-like matching comment
    if (opts.likeMatchingComments !== false) {
      try {
        await likeComment(commentId, opts.instagramId, opts.accessToken);
        log.liked = true;
      } catch (e: any) {
        log.error = `Like error: ${e.message}`;
      }
    }

    // 2. Post public reply
    if (opts.publicReplyTemplate) {
      try {
        const replyText = opts.publicReplyTemplate.replace(/\{username\}/gi, commenterUsername);
        await replyToComment(commentId, replyText, opts.accessToken);
        log.public_reply_sent = true;
      } catch (e: any) {
        log.error = (log.error ? `${log.error}; ` : "") + `Public reply error: ${e.message}`;
      }
    }

    // 3. Follow Verification Gate
    let isFollowing = false;
    if (opts.requireFollow !== false && commenterId) {
      const check = await checkUserFollowsAccount(commenterId, opts.accessToken);
      isFollowing = check.isFollowing;
    } else {
      isFollowing = true;
    }
    log.is_follower = isFollowing;

    // 4. Send Direct Message (Follow Gate or Unlocked Resource)
    try {
      if (!isFollowing && opts.requireFollow !== false) {
        const gateText = followGatePrompt.replace(/\{username\}/gi, commenterUsername);
        await graphRequest({
          endpoint: `/${opts.pageId}/messages`,
          method: "POST",
          data: {
            recipient: { comment_id: commentId },
            message: { text: gateText },
          },
          isJson: true,
          accessToken: opts.accessToken,
        });
        log.dm_sent = true;
        log.status = "FOLLOW_GATE_SENT";
      } else {
        const unlockedText = opts.unlockedContentText.replace(/\{username\}/gi, commenterUsername);
        const messageObj: any = { text: unlockedText };

        if (opts.attachmentType) {
          if (opts.attachmentId) {
            messageObj.attachment = {
              type: opts.attachmentType,
              payload: { attachment_id: opts.attachmentId },
            };
          } else if (opts.attachmentUrl) {
            messageObj.attachment = {
              type: opts.attachmentType,
              payload: { url: opts.attachmentUrl, is_reusable: true },
            };
          }
        }

        await graphRequest({
          endpoint: `/${opts.pageId}/messages`,
          method: "POST",
          data: {
            recipient: { comment_id: commentId },
            message: messageObj,
          },
          isJson: true,
          accessToken: opts.accessToken,
        });
        log.dm_sent = true;
        log.status = "UNLOCKED_CONTENT_SENT";
      }
    } catch (e: any) {
      log.error = (log.error ? `${log.error}; ` : "") + `DM delivery error: ${e.message}`;
      log.status = "DM_FAILED";
    }

    processed.push(log);
  }

  return {
    mediaId: targetMediaId,
    keyword: opts.keyword,
    totalCommentsChecked: allComments.length,
    matchingCommentsFound: matchingComments.length,
    processedCount: processed.length,
    results: processed,
  };
}

/**
 * Handles a single real-time comment event received via Meta Webhooks in <1s.
 */
export async function processWebhookComment({
  commentId,
  commentText,
  commenterId,
  commenterUsername,
  funnel,
  pageId,
  instagramId,
  accessToken,
}: {
  commentId: string;
  commentText: string;
  commenterId?: string;
  commenterUsername: string;
  funnel: {
    keyword: string;
    publicReplyTemplate?: string;
    requireFollow?: boolean;
    followGateMessage?: string;
    unlockedContentText: string;
    attachmentType?: "audio" | "file" | "image" | "video";
    attachmentUrl?: string;
  };
  pageId: string;
  instagramId: string;
  accessToken: string;
}) {
  const keywordLower = funnel.keyword.trim().toLowerCase();
  if (!commentText.toLowerCase().includes(keywordLower)) {
    return { matched: false };
  }

  // 1. Auto-like
  try {
    await likeComment(commentId, instagramId, accessToken);
  } catch (err) {
    console.warn("[webhook] likeComment failed:", err);
  }

  // 2. Public reply
  if (funnel.publicReplyTemplate) {
    try {
      const reply = funnel.publicReplyTemplate.replace(/\{username\}/gi, commenterUsername);
      await replyToComment(commentId, reply, accessToken);
    } catch (err) {
      console.warn("[webhook] replyToComment failed:", err);
    }
  }

  // 3. Follow check
  let isFollowing = false;
  if (funnel.requireFollow !== false && commenterId) {
    const check = await checkUserFollowsAccount(commenterId, accessToken);
    isFollowing = check.isFollowing;
  } else {
    isFollowing = true;
  }

  // 4. Send DM
  if (!isFollowing && funnel.requireFollow !== false) {
    const gateText = (
      funnel.followGateMessage ||
      `Hey @{username}! 👋 Follow our account first to unlock this exclusive resource! Once followed, reply 'DONE' 🎁`
    ).replace(/\{username\}/gi, commenterUsername);

    await graphRequest({
      endpoint: `/${pageId}/messages`,
      method: "POST",
      data: {
        recipient: { comment_id: commentId },
        message: { text: gateText },
      },
      isJson: true,
      accessToken,
    });
    return { matched: true, status: "FOLLOW_GATE_SENT" };
  } else {
    const unlockedText = funnel.unlockedContentText.replace(/\{username\}/gi, commenterUsername);
    const messageObj: any = { text: unlockedText };

    if (funnel.attachmentType && funnel.attachmentUrl) {
      messageObj.attachment = {
        type: funnel.attachmentType,
        payload: { url: funnel.attachmentUrl, is_reusable: true },
      };
    }

    await graphRequest({
      endpoint: `/${pageId}/messages`,
      method: "POST",
      data: {
        recipient: { comment_id: commentId },
        message: messageObj,
      },
      isJson: true,
      accessToken,
    });
    return { matched: true, status: "UNLOCKED_CONTENT_SENT" };
  }
}
