import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchAccountAnalytics } from "@/lib/meta/insights";
import { generateAccountAnalysisWithAi } from "@/lib/ai/account-analysis";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb, schema } from "@/db";

const auditSchema = z.object({
  modelId: z.string().default("openrouter/free"),
  enableGeminiFallback: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const rawBody = await request.json().catch(() => ({}));
    const validated = auditSchema.safeParse(rawBody);
    const { modelId, enableGeminiFallback } = validated.success
      ? validated.data
      : { modelId: "openrouter/free", enableGeminiFallback: true };

    // 1. Fetch real Meta analytics
    const analytics = await fetchAccountAnalytics();
    if (!analytics) {
      return NextResponse.json(
        { error: "No connected Instagram account found to audit. Please connect your account first." },
        { status: 400 }
      );
    }

    // 2. Run strategic AI audit
    const audit = await generateAccountAnalysisWithAi(analytics, modelId, enableGeminiFallback);

    // 3. Save generation record
    const db = getDb();
    if (db && user) {
      try {
        await db.insert(schema.aiGenerations).values({
          id: crypto.randomUUID(),
          workosUserId: user.workosUserId,
          provider: audit.provider,
          model: audit.model,
          generationType: "account_audit",
          inputMetadata: { username: analytics.account.username },
          output: JSON.stringify(audit),
        });
      } catch (err) {
        console.warn("DB save audit error:", err);
      }
    }

    return NextResponse.json({
      audit,
      account: analytics.account,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Account audit API error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate AI account analysis." },
      { status: 500 }
    );
  }
}
