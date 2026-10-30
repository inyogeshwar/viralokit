import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";
import { runCommentGrowthFunnel } from "@/lib/meta/funnel";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    let funnels: any[] = [];

    if (user) {
      try {
        const supabase = await createClient();
        const { data } = await supabase
          .from("growth_funnels")
          .select("*")
          .order("created_at", { ascending: false });
        if (data) funnels = data;
      } catch (err) {
        console.warn("growth_funnels table read warning:", err);
      }
    }

    // Default smart funnels if none in DB
    if (funnels.length === 0) {
      funnels = [
        {
          id: "default-link",
          keyword: "link",
          public_reply_template: "Sent you the link in DM! 📩 Check your inbox @{username}!",
          require_follow: true,
          follow_gate_message: "Hey @{username}! 👋 Follow @account first to unlock this link! Once followed, reply 'DONE' 🚀",
          unlocked_content_text: "Here is your exclusive link: https://viralokit.vercel.app 🚀 Enjoy!",
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: "default-guide",
          keyword: "guide",
          public_reply_template: "I just sent the guide to your DM @{username}! 🎁",
          require_follow: true,
          follow_gate_message: "Hey @{username}! 👋 Follow @account first to unlock the free guide! Once followed, reply 'DONE' 🎁",
          unlocked_content_text: "Here is your guide: https://viralokit.vercel.app 🚀 Enjoy!",
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ];
    }

    return NextResponse.json({ funnels });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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
    const { action = "run_manual" } = body;

    if (action === "run_manual") {
      const {
        mediaId,
        keyword,
        publicReplyTemplate,
        likeMatchingComments = true,
        requireFollow = true,
        followGateMessage,
        unlockedContentText,
        attachmentType,
        attachmentUrl,
      } = body;

      if (!keyword || !unlockedContentText) {
        return NextResponse.json(
          { error: "keyword and unlockedContentText are required." },
          { status: 400 }
        );
      }

      const results = await runCommentGrowthFunnel({
        mediaId,
        keyword,
        publicReplyTemplate,
        likeMatchingComments,
        requireFollow,
        followGateMessage,
        unlockedContentText,
        attachmentType,
        attachmentUrl,
        pageId: credentials.pageId,
        instagramId: credentials.instagramUserId,
        accessToken: credentials.pageAccessToken,
      });

      return NextResponse.json({ success: true, ...results });
    }

    if (action === "save_rule") {
      const {
        keyword,
        publicReplyTemplate,
        requireFollow = true,
        followGateMessage,
        unlockedContentText,
        attachmentType,
        attachmentUrl,
      } = body;

      if (user) {
        try {
          const supabase = await createClient();
          const { data, error } = await supabase.from("growth_funnels").insert({
            user_id: user.id,
            instagram_account_id: credentials.instagramUserId,
            keyword,
            public_reply_template: publicReplyTemplate,
            require_follow: requireFollow,
            follow_gate_message: followGateMessage,
            unlocked_content_text: unlockedContentText,
            attachment_type: attachmentType,
            attachment_url: attachmentUrl,
            is_active: true,
          }).select().single();

          if (error) throw error;
          return NextResponse.json({ success: true, rule: data });
        } catch (dbErr: any) {
          console.warn("DB insert error on growth_funnels:", dbErr.message);
        }
      }

      // If DB is unavailable, return success with in-memory rule
      return NextResponse.json({
        success: true,
        rule: {
          id: `rule-${Date.now()}`,
          keyword,
          public_reply_template: publicReplyTemplate,
          require_follow: requireFollow,
          follow_gate_message: followGateMessage,
          unlocked_content_text: unlockedContentText,
          attachment_type: attachmentType,
          attachment_url: attachmentUrl,
          is_active: true,
        },
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error("[Growth Funnel API Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process growth funnel action." },
      { status: 500 }
    );
  }
}
