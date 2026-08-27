import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { jsonError, requireUserId } from "@/lib/http";
import { decryptToken } from "@/lib/crypto";
import { mockPublishResult } from "@/lib/mock";
import { InstagramError, InstagramProvider } from "@/lib/providers/instagram";
import { MediaHostError, uploadBuffer } from "@/lib/providers/cloudinary";
import { getDashboardContext } from "@/lib/context";
import { listAccounts } from "@/lib/workspace";
import { formatDateTime } from "@/lib/utils";
import { enqueuePostPublish } from "@/lib/inngest";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const formData = await req.formData();
  const mediaType = (formData.get("mediaType") as string) ?? "image";
  const caption = (formData.get("caption") as string) ?? "";
  const scheduledAtRaw = (formData.get("scheduledAt") as string) ?? "";
  const thumbnailUrl = (formData.get("thumbnailUrl") as string) ?? "";
  const durationSec = (formData.get("durationSec") as string) ?? "";
  const files = formData.getAll("images").filter((f): f is File => f instanceof File);

  if (mediaType !== "image" && mediaType !== "carousel" && mediaType !== "reel") {
    return jsonError("mediaType must be 'image', 'carousel', or 'reel'.");
  }
  if (!files.length) return jsonError("Select at least one file.");
  if (mediaType === "image" && files.length !== 1) {
    return jsonError("A single image post takes exactly one image.");
  }
  if (mediaType === "carousel" && (files.length < 2 || files.length > 10)) {
    return jsonError("A carousel needs between 2 and 10 images.");
  }
  if (mediaType === "reel" && files.length !== 1) {
    return jsonError("A reel takes exactly one video file.");
  }

  const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw) : null;
  const isScheduled = scheduledAt instanceof Date && !Number.isNaN(scheduledAt.getTime()) && scheduledAt.getTime() > Date.now();

  const ctx = await getDashboardContext();
  const { workspace } = ctx;

  const requestedAccountId = (formData.get("accountId") as string) ?? "";
  const accounts = await listAccounts(workspace.id);
  const account =
    (requestedAccountId
      ? accounts.find((a) => a.id === requestedAccountId)
      : undefined) ??
    accounts.find((a) => a.isActive) ??
    accounts[0] ??
    null;

  if (!account) return jsonError("Connect an Instagram account first.");

  // Mock mode: produce a fake result, but still save the post row so the
  // calendar / dashboard have something to render.
  if (env.mockMode) {
    const urls = files.map((f, i) =>
      `https://res.cloudinary.com/mock/image/upload/social-copilot/mock-${i + 1}-${f.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
    );
    const result = mockPublishResult(mediaType as "image" | "carousel" | "reel", urls);
    const status = isScheduled ? "scheduled" : "published";

    const db = getDb();
    if (db) {
      await db.insert(schema.posts).values({
        workspaceId: workspace.id,
        accountId: account.id,
        platform: "instagram",
        mediaType: mediaType as "image" | "carousel" | "reel",
        caption,
        mediaUrls: urls,
        status,
        scheduledAt: scheduledAt ?? null,
        publishedAt: status === "published" ? new Date() : null,
        containerId: (result.containerId as string) ?? null,
        mediaId: (result.mediaId as string) ?? null,
        permalink: (result.permalink as string) ?? null,
        thumbnailUrl: thumbnailUrl || null,
        durationSec: durationSec || null,
      });
    }

    return NextResponse.json({
      ok: true,
      mock: true,
      scheduled: isScheduled,
      message: isScheduled
        ? `Scheduled (mock) for ${formatDateTime(scheduledAt!.toISOString())}`
        : "Published (mock) to Instagram",
      result,
    });
  }

  const db = getDb();
  if (!db) return jsonError("Database is not configured (set DATABASE_URL).");

  const token = decryptToken(account.accessToken);
  const provider = new InstagramProvider({ igUserId: account.igUserId, accessToken: token });

  let mediaUrls: string[];
  try {
    const uploaded = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const resourceType = mediaType === "reel" ? "video" : "image";
      uploaded.push(await uploadBuffer(buffer, file.name, "social-copilot", resourceType));
    }
    mediaUrls = uploaded.map((u) => u.url);
  } catch (err) {
    if (err instanceof MediaHostError) return jsonError(err.message, 502);
    throw err;
  }

  let publishResult: Record<string, unknown> | null = null;
  let status: "published" | "scheduled" | "failed" = isScheduled ? "scheduled" : "published";
  let error: string | null = null;

  if (!isScheduled) {
    try {
      if (mediaType === "reel") {
        publishResult = (await provider.publishReel(mediaUrls[0], caption)) as unknown as Record<string, unknown>;
      } else if (mediaType === "image") {
        publishResult = (await provider.publishImage(mediaUrls[0], caption)) as unknown as Record<string, unknown>;
      } else {
        publishResult = (await provider.publishCarousel(mediaUrls, caption)) as unknown as Record<string, unknown>;
      }
    } catch (err) {
      status = "failed";
      error = err instanceof InstagramError ? err.message : String(err);
    }
  }

  const values: typeof schema.posts.$inferInsert = {
    workspaceId: workspace.id,
    accountId: account.id,
    platform: "instagram",
    mediaType: mediaType as "image" | "carousel" | "reel",
    caption,
    mediaUrls,
    status,
    scheduledAt: scheduledAt ?? null,
    publishedAt: status === "published" ? new Date() : null,
    containerId: (publishResult?.containerId as string) ?? null,
    mediaId: (publishResult?.mediaId as string) ?? null,
    permalink: (publishResult?.permalink as string) ?? null,
    thumbnailUrl: thumbnailUrl || null,
    durationSec: durationSec || null,
    error,
  };
  const inserted = await db.insert(schema.posts).values(values).returning();
  const postId = inserted[0]?.id;

  // Schedule the post for publish via Inngest — the function will sleep until
  // scheduledAt, then publish. The cron sweep is a safety net.
  if (isScheduled && postId) {
    try {
      await enqueuePostPublish(postId, scheduledAt!);
    } catch (err) {
      // If Inngest is misconfigured, mark the post so the user knows.
      await db
        .update(schema.posts)
        .set({ error: `Inngest queue failed: ${err instanceof Error ? err.message : String(err)}` })
        .where(eq(schema.posts.id, postId));
    }
  }

  const message = error
    ? `Publish failed: ${error}`
    : isScheduled
      ? `Scheduled for ${formatDateTime(scheduledAt!.toISOString())}`
      : "Published to Instagram";

  return NextResponse.json({
    ok: true,
    result: publishResult,
    post: inserted[0],
    message,
    scheduled: isScheduled,
  });
}
