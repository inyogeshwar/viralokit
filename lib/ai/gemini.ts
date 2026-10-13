import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "@/lib/config";

let genAIInstance: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI | null {
  if (!config.ai.geminiKey) return null;
  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(config.ai.geminiKey);
  }
  return genAIInstance;
}

export async function generateWithGemini(
  prompt: string,
  imageBuffer?: { data: string; mimeType: string },
  options?: { maxOutputTokens?: number; temperature?: number }
): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error("Gemini fallback quota or API key is not configured.");
  }

  try {
    const model = client.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: options?.maxOutputTokens ?? 2500,
        temperature: options?.temperature ?? 0.5,
      },
    });
    const parts: any[] = [prompt];

    if (imageBuffer) {
      parts.push({
        inlineData: {
          data: imageBuffer.data,
          mimeType: imageBuffer.mimeType,
        },
      });
    }

    const result = await model.generateContent(parts);
    const text = result.response.text();
    return text;
  } catch (err: any) {
    console.error("Gemini API error:", err);
    throw new Error(err?.message || "Gemini fallback execution failed.");
  }
}
