import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteInstagramMedia, bulkDeleteInstagramMedia } from "@/lib/meta/deletion";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb, schema } from "@/db";
import { eq, and } from "drizzle-orm";

const deleteSchema = z.object({
  mediaId: z.string().optional(),
  mediaIds: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const validated = deleteSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    const { mediaId, mediaIds } = validated.data;
    const db = getDb();

    // 1. Bulk deletion
    if (mediaIds && mediaIds.length > 0) {
      const summary = await bulkDeleteInstagramMedia(mediaIds);

      // Update local DB for successful items strictly scoped to authenticated user
      if (db && user) {
        for (const item of summary.results) {
          if (item.status === "deleted") {
            try {
              await db
                .update(schema.posts)
                .set({ status: "deleted", updatedAt: new Date() })
                .where(
                  and(
                    eq(schema.posts.instagramMediaId, item.mediaId),
                    eq(schema.posts.workosUserId, user.workosUserId)
                  )
                );
            } catch (err) {
              console.warn("DB update failed for deleted post:", err);
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        summary,
      });
    }

    // 2. Single deletion
    if (mediaId) {
      const outcome = await deleteInstagramMedia(mediaId);

      if (outcome.success) {
        if (db && user) {
          try {
            await db
              .update(schema.posts)
              .set({ status: "deleted", updatedAt: new Date() })
              .where(
                and(
                  eq(schema.posts.instagramMediaId, mediaId),
                  eq(schema.posts.workosUserId, user.workosUserId)
                )
              );
          } catch (err) {
            console.warn("DB update failed for single deleted post:", err);
          }
        }

        return NextResponse.json({
          success: true,
          mediaId,
          status: "deleted",
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            mediaId,
            status: "delete_failed",
            reason: outcome.reason || "Deletion failed on Instagram Graph API.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ error: "Must provide either mediaId or mediaIds." }, { status: 400 });
  } catch (err: any) {
    console.error("Deletion API error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process deletion." },
      { status: 500 }
    );
  }
}
