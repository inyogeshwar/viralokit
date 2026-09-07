import { NextResponse } from "next/server";
import { z } from "zod";
import { generateCaptionWithAi, CaptionTone, CaptionAction } from "@/lib/ai/caption-generator";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb, schema } from "@/db";

const captionSchema = z.object({
  context: z.string().default(""),
  tone: z
    .enum(["Professional", "Aesthetic", "Casual", "Minimal", "Creator", "Hinglish", "Hindi", "English"])
    .default("Creator"),
  action: z.enum(["generate", "shorten", "improve", "add_cta", "add_hashtags"]).default("generate"),
  currentCaption: z.string().default(""),
  modelId: z.string().default("openrouter/free"),
  enableGeminiFallback: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to generate captions.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = captionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    const { context, tone, action, currentCaption, modelId, enableGeminiFallback } = validated.data;

    const result = await generateCaptionWithAi({
      context,
      tone: tone as CaptionTone,
      action: action as CaptionAction,
      currentCaption,
      modelId,
      enableGeminiFallback,
    });

    // Record in DB if available
    const db = getDb();
    if (db && user) {
      try {
        await db.insert(schema.aiGenerations).values({
          id: crypto.randomUUID(),
          workosUserId: user.workosUserId,
          provider: result.provider,
          model: result.model,
          generationType: "caption",
          inputMetadata: { tone, action, contextLength: context.length },
          output: JSON.stringify(result),
        });
      } catch (err) {
        console.warn("DB save caption error:", err);
      }
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Caption generation error:", err);
    return NextResponse.json(
      { error: err?.message || "AI caption generator temporarily unavailable." },
      { status: 500 }
    );
  }
}
