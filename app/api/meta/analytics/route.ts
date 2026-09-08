import { NextResponse } from "next/server";
import { fetchAccountAnalytics } from "@/lib/meta/insights";
import { getCurrentUser } from "@/lib/auth/current-user";

import { sanitizeErrorMessage } from "@/lib/security/sanitize";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to view analytics.", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

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
      { error: sanitizeErrorMessage(err, "Failed to fetch Instagram analytics.") },
      { status: 500 }
    );
  }
}
