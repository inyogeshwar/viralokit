import { NextResponse } from "next/server";
import { fetchAccountAnalytics } from "@/lib/meta/insights";

export async function GET() {
  try {
    const analytics = await fetchAccountAnalytics();
    if (!analytics) {
      return NextResponse.json(
        { error: "Unable to retrieve Instagram analytics. Check account connection." },
        { status: 404 }
      );
    }
    return NextResponse.json(analytics);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch Instagram analytics." },
      { status: 500 }
    );
  }
}
