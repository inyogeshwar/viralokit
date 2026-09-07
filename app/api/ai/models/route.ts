import { NextResponse } from "next/server";
import { fetchFreeModels } from "@/lib/ai/models";

export async function GET(request: Request) {
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
