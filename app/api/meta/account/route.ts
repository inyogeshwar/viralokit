import { NextResponse } from "next/server";
import { detectAccountCapabilities } from "@/lib/meta/capabilities";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to view account capabilities.", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  try {
    const capabilities = await detectAccountCapabilities();
    return NextResponse.json(capabilities);
  } catch (err: any) {
    return NextResponse.json(
      {
        connected: false,
        reason: err?.message || "Failed to detect Instagram capabilities.",
      },
      { status: 500 }
    );
  }
}
