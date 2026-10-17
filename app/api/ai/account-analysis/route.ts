import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchAccountAnalytics } from "@/lib/meta/insights";
import { generateAccountAnalysisWithAi } from "@/lib/ai/account-analysis";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";
import { createClient } from "@/lib/supabase/server";
import { sanitizeErrorMessage } from "@/lib/security/sanitize";

const auditSchema = z.object({
  modelId: z.string().max(100).default("gemini-3.5-flash"),
  apiKey: z.string().max(250).optional(),
  language: z.enum(["English", "Hinglish", "Hindi", "Spanish"]).default("English"),
  customBioOverride: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to run account audit.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const headerApiKey = request.headers.get("x-gemini-api-key")?.trim() || undefined;
    const rawBody = await request.json().catch(() => ({}));
    const validated = auditSchema.safeParse(rawBody);
    const { modelId, apiKey: bodyApiKey, language, customBioOverride } = validated.success
      ? validated.data
      : { modelId: "gemini-3.8-flash", apiKey: undefined, language: "English" as const, customBioOverride: undefined };

    const effectiveApiKey = bodyApiKey?.trim() || headerApiKey;

    const credentials = await getUserInstagramCredentials(user.id);
    if (!credentials) {
      return NextResponse.json(
        { error: "No connected Instagram account found to audit. Please connect your account first in Settings." },
        { status: 400 }
      );
    }

    // 1. Fetch real Meta analytics
    const analytics = await fetchAccountAnalytics(credentials.instagramUserId, credentials.accessToken);
    if (!analytics) {
      return NextResponse.json(
        { error: "Unable to retrieve Instagram metrics. Please reconnect your account." },
        { status: 400 }
      );
    }

    // 2. Run strategic AI audit with language preference & custom Gemini key
    const audit = await generateAccountAnalysisWithAi(
      analytics,
      modelId,
      effectiveApiKey,
      language,
      customBioOverride
    );

    // 3. Save generation record
    const supabase = await createClient();
    if (user) {
      try {
        await supabase.from("ai_generations").insert({
          user_id: user.id,
          provider: audit.provider,
          model: audit.model,
          generation_type: "account_audit",
          input_metadata: { language, modelId },
          output: JSON.stringify(audit),
        });
      } catch (err) {
        console.warn("Supabase DB audit save error:", err);
      }
    }

    return NextResponse.json(audit);
  } catch (err: any) {
    console.error("Account audit route error:", err);
    return NextResponse.json(
      { error: sanitizeErrorMessage(err, "Failed to complete AI account audit.") },
      { status: 500 }
    );
  }
}
