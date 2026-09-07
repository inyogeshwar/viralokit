import { NextResponse } from "next/server";
import { fetchRecentMedia } from "@/lib/meta/insights";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 25, 50) : 25;

  try {
    const posts = await fetchRecentMedia(limit);
    return NextResponse.json({
      posts,
      total: posts.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch Instagram posts." },
      { status: 500 }
    );
  }
}
