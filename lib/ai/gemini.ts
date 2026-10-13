import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "@/lib/config";

export function getGeminiClient(customApiKey?: string): GoogleGenerativeAI | null {
  const activeKey = customApiKey?.trim() || config.ai.geminiKey;
  if (!activeKey) return null;
  return new GoogleGenerativeAI(activeKey);
}

export async function generateWithGemini(
  prompt: string,
  imageBuffer?: { data: string; mimeType: string },
  options?: {
    maxOutputTokens?: number;
    temperature?: number;
    model?: string;
    apiKey?: string;
  }
): Promise<string> {
  const client = getGeminiClient(options?.apiKey);
  if (!client) {
    throw new Error(
      "Google Gemini API key is missing. Please add your free Gemini API key in Settings (get your free key at https://aistudio.google.com)."
    );
  }

  try {
    const rawModel = options?.model || "gemini-1.5-flash";
    // Normalize model name (remove prefixes like google/ or openrouter/)
    const cleanModel = rawModel.replace(/^(google\/|openrouter\/)/i, "").split(":")[0] || "gemini-1.5-flash";

    const model = client.getGenerativeModel({
      model: cleanModel,
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
    const msg = err?.message || "Gemini execution failed.";
    if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid")) {
      throw new Error("Invalid Gemini API key. Please check your API key in Settings.");
    }
    if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
      throw new Error("Gemini API rate limit exceeded (15 RPM free tier limit). Please wait a few seconds and try again.");
    }
    throw new Error(msg);
  }
}
