import { NextResponse } from "next/server";
import { detectAccountCapabilities } from "@/lib/meta/capabilities";

export async function GET() {
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
