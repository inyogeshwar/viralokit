import { NextResponse } from "next/server";
import { fetchRecentMedia } from "@/lib/meta/insights";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required.", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

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
