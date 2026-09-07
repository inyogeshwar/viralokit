import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeImageWithAi } from "@/lib/ai/image-analysis";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb, schema } from "@/db";

const requestSchema = z.object({
  imageUrl: z.string().url(),
  modelId: z.string().default("openrouter/free"),
  enableGeminiFallback: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const validated = requestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    const { imageUrl, modelId, enableGeminiFallback } = validated.data;
    const analysis = await analyzeImageWithAi(imageUrl, modelId, enableGeminiFallback);

    // Save record to Neon if DB available
    const db = getDb();
    if (db && user) {
      try {
        await db.insert(schema.aiGenerations).values({
          id: crypto.randomUUID(),
          workosUserId: user.workosUserId,
          provider: analysis.provider,
          model: analysis.model,
          generationType: "image_analysis",
          inputMetadata: { imageUrl },
          output: JSON.stringify(analysis),
        });
      } catch (err) {
        console.warn("Neon DB ai_generation save error:", err);
      }
    }

    return NextResponse.json(analysis);
  } catch (err: any) {
    console.error("AI image analysis error:", err);
    return NextResponse.json(
      { error: err?.message || "AI image analysis service temporarily unavailable." },
      { status: 500 }
    );
  }
}
