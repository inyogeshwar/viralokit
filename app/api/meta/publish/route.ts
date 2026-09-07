import { NextResponse } from "next/server";
import { z } from "zod";
import { publishSingleImage, publishCarousel } from "@/lib/meta/publishing";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb, schema } from "@/db";

const publishSchema = z.object({
  mediaType: z.enum(["IMAGE", "CAROUSEL"]),
  caption: z.string().max(2200).default(""),
  imageUrls: z.array(z.string().url()).min(1),
});

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const validated = publishSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { mediaType, caption, imageUrls } = validated.data;

    let result;
    if (mediaType === "IMAGE") {
      if (imageUrls.length < 1) {
        return NextResponse.json({ error: "Single image post requires 1 image URL." }, { status: 400 });
      }
      result = await publishSingleImage(imageUrls[0], caption);
    } else {
      if (imageUrls.length < 2 || imageUrls.length > 10) {
        return NextResponse.json(
          { error: "Instagram carousel requires between 2 and 10 images." },
          { status: 400 }
        );
      }
      result = await publishCarousel(imageUrls, caption);
    }

    // Save to Neon DB if configured
    const db = getDb();
    if (db && user) {
      try {
        const postId = crypto.randomUUID();
        await db.insert(schema.posts).values({
          id: postId,
          workosUserId: user.workosUserId,
          instagramMediaId: result.mediaId,
          mediaType,
          caption,
          status: "published",
          permalink: result.permalink || null,
          publishedAt: new Date(result.publishedAt),
        });

        // Insert media items
        for (let i = 0; i < result.publicUrls.length; i++) {
          await db.insert(schema.postMedia).values({
            id: crypto.randomUUID(),
            postId,
            cloudinaryPublicId: "direct_url",
            secureUrl: result.publicUrls[i],
            position: i,
          });
        }
      } catch (dbErr) {
        console.warn("Neon DB post save error (non-fatal):", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      post: result,
      status: "published",
    });
  } catch (err: any) {
    console.error("Publishing error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Failed to publish media to Instagram.",
        status: "failed",
      },
      { status: 500 }
    );
  }
}
