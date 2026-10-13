import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "@/lib/config";

export function getGeminiClient(customApiKey?: string): GoogleGenerativeAI | null {
  const activeKey = customApiKey?.trim() || config.ai.geminiKey;
  if (!activeKey) return null;
  return new GoogleGenerativeAI(activeKey);
}

// Recommended active models in Google AI Studio v1beta
const DEFAULT_CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-flash-latest",
  "gemini-2.5-flash",
];

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

  // Clean and prepare candidate models list
  const requestedModel = options?.model
    ? options.model.replace(/^(google\/|openrouter\/)/i, "").split(":")[0]
    : undefined;

  const candidateModels: string[] = [];
  if (requestedModel) candidateModels.push(requestedModel);
  for (const m of DEFAULT_CANDIDATE_MODELS) {
    if (!candidateModels.includes(m)) candidateModels.push(m);
  }

  let lastError: any = null;

  for (const currentModel of candidateModels) {
    try {
      const model = client.getGenerativeModel({
        model: currentModel,
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
      lastError = err;
      const msg = err?.message || "";

      // If the model is 404 Not Found, no longer available, or deprecated, try the next model candidate!
      const isModelNotFound =
        msg.includes("404") ||
        msg.includes("not found") ||
        msg.includes("no longer available") ||
        msg.includes("is not supported for generateContent");

      if (isModelNotFound) {
        console.warn(`Model ${currentModel} not available on Gemini API. Trying next fallback model...`);
        continue;
      }

      // If key is invalid or quota is exhausted, rethrow with friendly message
      if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid")) {
        throw new Error("Invalid Gemini API key. Please check your API key in Settings.");
      }
      if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
        throw new Error("Gemini API rate limit exceeded (15 RPM free tier limit). Please wait a few seconds and try again.");
      }

      // For 503 high demand spikes, try next candidate model
      if (msg.includes("503") || msg.includes("high demand")) {
        console.warn(`Model ${currentModel} experiencing high demand (503). Trying fallback...`);
        continue;
      }

      throw new Error(msg || "Gemini execution failed.");
    }
  }

  console.error("All Gemini candidate models failed:", lastError);
  throw new Error(
    lastError?.message || "All Gemini models unavailable. Please try again in a few moments."
  );
}
