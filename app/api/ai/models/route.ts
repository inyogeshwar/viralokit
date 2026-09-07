import { NextResponse } from "next/server";
import { fetchFreeModels } from "@/lib/ai/models";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to query AI models.", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const refresh = searchParams.get("refresh") === "true";

  try {
    const modelsData = await fetchFreeModels(refresh);
    return NextResponse.json(modelsData);
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Unable to load AI models. Please try again.",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}
