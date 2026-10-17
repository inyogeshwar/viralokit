import { NextResponse } from "next/server";
import { generateWithGemini } from "@/lib/ai/gemini";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to test API key.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const apiKey = body?.apiKey?.trim() || request.headers.get("x-gemini-api-key")?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "Please provide a Google Gemini API key to test." },
        { status: 400 }
      );
    }

    // Ping Gemini with a tiny test prompt
    const testReply = await generateWithGemini(
      "Respond with ONLY the exact word: OK",
      undefined,
      {
        apiKey,
        model: "gemini-3.8-flash",
        maxOutputTokens: 10,
        temperature: 0.1,
      }
    );

    if (testReply) {
      return NextResponse.json({
        success: true,
        message: "Google Gemini API key verified successfully! (Free Tier 15 RPM active)",
        model: "gemini-3.8-flash",
      });
    }

    throw new Error("No response received from Gemini.");
  } catch (err: any) {
    console.error("Test Gemini Key Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Invalid Gemini API key. Please check your key at https://aistudio.google.com",
      },
      { status: 400 }
    );
  }
}
