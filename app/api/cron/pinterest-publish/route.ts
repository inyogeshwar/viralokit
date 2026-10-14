import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { decryptToken } from "@/lib/security/encryption";
import { publishSingleImage } from "@/lib/meta/publishing";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return Response.json({ error: "Missing Supabase service configuration" }, { status: 500 });
  }

  const supabase = createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: jobs, error } = await supabase
    .from("pinterest_instagram_queue")
    .select("*")
    .eq("status", "queued")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(5);

  if (error) return Response.json({ error: "Could not load due jobs" }, { status: 500 });

  const results: Array<{ id: string; status: string }> = [];
  for (const job of jobs || []) {
    const { data: claimed, error: claimError } = await supabase
      .from("pinterest_instagram_queue")
      .update({ status: "publishing", attempts: Number(job.attempts || 0) + 1, updated_at: new Date().toISOString() })
      .eq("id", job.id)
      .eq("status", "queued")
      .select("id")
      .maybeSingle();
    if (claimError || !claimed) continue;

    try {
      const { data: account, error: accountError } = await supabase
        .from("instagram_accounts")
        .select("instagram_user_id, access_token_encrypted")
        .eq("user_id", job.user_id)
        .maybeSingle();
      if (accountError || !account) throw new Error("No connected Instagram account.");
      const result = await publishSingleImage(
        job.image_url,
        job.caption || "",
        account.instagram_user_id,
        decryptToken(account.access_token_encrypted)
      );
      const { data: post } = await supabase.from("posts").insert({
        user_id: job.user_id,
        instagram_account_id: account.instagram_user_id,
        instagram_media_id: result.mediaId,
        media_type: "IMAGE",
        caption: job.caption || "",
        status: "published",
        permalink: result.permalink || null,
        published_at: result.publishedAt || new Date().toISOString(),
      }).select("id").maybeSingle();
      if (post?.id) {
        await supabase.from("post_media").insert({
          post_id: post.id,
          cloudinary_public_id: "pinterest_import",
          secure_url: job.image_url,
          position: 0,
        });
      }
      await supabase.from("pinterest_instagram_queue").update({
        status: "published",
        instagram_media_id: result.mediaId,
        instagram_permalink: result.permalink || null,
        error_message: null,
        updated_at: new Date().toISOString(),
      }).eq("id", job.id);
      results.push({ id: job.id, status: "published" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Publishing failed";
      await supabase.from("pinterest_instagram_queue").update({
        status: Number(job.attempts || 0) < 2 ? "queued" : "failed",
        error_message: message.slice(0, 500),
        updated_at: new Date().toISOString(),
      }).eq("id", job.id);
      results.push({ id: job.id, status: "failed" });
    }
  }
  return Response.json({ processed: results.length, results });
}
