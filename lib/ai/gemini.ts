import { GoogleGenAI } from "@google/genai";
import { config } from "@/lib/config";

const DEFAULT_CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
] as const;

function normalizeModelId(model?: string): string | undefined {
  if (!model) return undefined;
  const id = model.replace(/^(google\/|openrouter\/)/i, "").split(":")[0].trim();
  const legacyAliases: Record<string, string> = {
    "gemini-1.5-flash": "gemini-3.8-flash",
    "gemini-2.0-flash": "gemini-3.8-flash",
    "gemini-2.5-flash": "gemini-3.8-flash",
    "gemini-3.5-flash": "gemini-3.8-flash",
    "gemini-3-flash-preview": "gemini-3.6-flash",
    "gemini-flash-latest": "gemini-3.8-flash",
  };
  return legacyAliases[id] || id;
}

export async function generateWithGemini(
  prompt: string,
  imageBuffer?: { data: string; mimeType: string },
  options?: {
    maxOutputTokens?: number;
    temperature?: number;
    model?: string;
    apiKey?: string;
    thinkingLevel?: "minimal" | "low" | "medium" | "high";
  }
): Promise<string> {
  const apiKey = options?.apiKey?.trim() || config.ai.geminiKey;
  if (!apiKey) {
    throw new Error(
      "Google Gemini API key is missing. Add a Gemini API key in ViraloKit Settings or configure GEMINI_API_KEY."
    );
  }

  const client = new GoogleGenAI({ apiKey });
  const requestedModel = normalizeModelId(options?.model);
  const candidateModels = [
    ...(requestedModel ? [requestedModel] : []),
    ...DEFAULT_CANDIDATE_MODELS,
  ].filter((model, index, all) => all.indexOf(model) === index);

  let lastError: unknown;
  for (const model of candidateModels) {
    try {
      const input = imageBuffer
        ? [
            { type: "text" as const, text: prompt },
            {
              type: "image" as const,
              data: imageBuffer.data,
              mime_type: imageBuffer.mimeType,
            },
          ]
        : prompt;

      const response = await client.interactions.create({
        model,
        input,
        generation_config: {
          max_output_tokens: options?.maxOutputTokens ?? 2500,
          thinking_level: options?.thinkingLevel ?? "low",
        },
      });

      const output = response.output_text?.trim();
      if (output) return output;
      throw new Error("Gemini returned an empty text response.");
    } catch (err: unknown) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      const lower = message.toLowerCase();

      if (lower.includes("404") || lower.includes("not found") || lower.includes("unknown model") || lower.includes("unsupported model")) {
        console.warn(`Gemini model ${model} unavailable; trying fallback model.`);
        continue;
      }
      if (lower.includes("api_key_invalid") || lower.includes("api key not valid") || lower.includes("invalid api key")) {
        throw new Error("Invalid Gemini API key. Check the key in ViraloKit Settings.");
      }
      if (lower.includes("resource_exhausted") || lower.includes("429") || lower.includes("quota")) {
        throw new Error("Gemini rate/quota limit reached. Check active limits in Google AI Studio and retry after the quota resets.");
      }
      if (lower.includes("503") || lower.includes("high demand") || lower.includes("temporarily unavailable")) {
        console.warn(`Gemini model ${model} temporarily unavailable; trying fallback model.`);
        continue;
      }
      throw new Error(message || "Gemini generation failed.");
    }
  }

  const lastMessage = lastError instanceof Error ? lastError.message : String(lastError ?? "");
  throw new Error(lastMessage || "All configured Gemini models failed. Check the model availability and API key in Google AI Studio.");
}
