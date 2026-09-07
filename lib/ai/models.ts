import { config } from "@/lib/config";

export interface AIModelInfo {
  id: string;
  name: string;
  description?: string;
  contextLength?: number;
  isFree: boolean;
  supportsVision: boolean;
  supportsText: boolean;
}

export interface ModelsResponse {
  autoModel: string;
  freeTextModels: AIModelInfo[];
  freeVisionModels: AIModelInfo[];
  totalAvailable: number;
  cachedAt: string;
}

let cachedModels: ModelsResponse | null = null;
let cacheExpiresAt = 0;

export async function fetchFreeModels(forceRefresh = false): Promise<ModelsResponse> {
  const now = Date.now();
  if (!forceRefresh && cachedModels && now < cacheExpiresAt) {
    return cachedModels;
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.ai.openRouterKey) {
      headers["Authorization"] = `Bearer ${config.ai.openRouterKey}`;
    }

    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers,
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API responded with status ${res.status}`);
    }

    const data = await res.json();
    const allModels: any[] = data.data || [];

    const freeTextModels: AIModelInfo[] = [];
    const freeVisionModels: AIModelInfo[] = [];

    for (const m of allModels) {
      const promptPrice = m.pricing?.prompt;
      const completionPrice = m.pricing?.completion;
      const isPriceZero = (promptPrice === "0" || promptPrice === 0) && (completionPrice === "0" || completionPrice === 0);
      const isFreeId = m.id.endsWith(":free") || m.is_free === true;
      const isFree = isPriceZero || isFreeId;

      if (!isFree) continue;

      const inputMods: string[] = m.architecture?.input_modalities || m.input_modalities || ["text"];
      const outputMods: string[] = m.architecture?.output_modalities || m.output_modalities || ["text"];

      const supportsVision = inputMods.includes("image");
      const supportsText = outputMods.includes("text");

      const modelInfo: AIModelInfo = {
        id: m.id,
        name: m.name || m.id,
        description: m.description,
        contextLength: m.context_length,
        isFree: true,
        supportsVision,
        supportsText,
      };

      if (supportsText) {
        freeTextModels.push(modelInfo);
      }
      if (supportsVision) {
        freeVisionModels.push(modelInfo);
      }
    }

    // Sort models cleanly: popular ones first
    const sorter = (a: AIModelInfo, b: AIModelInfo) => a.name.localeCompare(b.name);
    freeTextModels.sort(sorter);
    freeVisionModels.sort(sorter);

    const result: ModelsResponse = {
      autoModel: "openrouter/free",
      freeTextModels,
      freeVisionModels,
      totalAvailable: freeTextModels.length + freeVisionModels.length,
      cachedAt: new Date().toISOString(),
    };

    cachedModels = result;
    cacheExpiresAt = now + 10 * 60 * 1000; // 10 minutes cache
    return result;
  } catch (err) {
    console.error("Error fetching OpenRouter models:", err);
    // Safe fallback if OpenRouter is unreachable
    return (
      cachedModels || {
        autoModel: "openrouter/free",
        freeTextModels: [
          {
            id: "openrouter/free",
            name: "Auto — Best Free Model (OpenRouter)",
            isFree: true,
            supportsVision: true,
            supportsText: true,
          },
          {
            id: "meta-llama/llama-3.2-3b-instruct:free",
            name: "Meta Llama 3.2 3B Instruct (Free)",
            isFree: true,
            supportsVision: false,
            supportsText: true,
          },
          {
            id: "google/gemini-2.0-flash-exp:free",
            name: "Google Gemini 2.0 Flash (Free)",
            isFree: true,
            supportsVision: true,
            supportsText: true,
          },
        ],
        freeVisionModels: [
          {
            id: "openrouter/free",
            name: "Auto — Best Free Model (OpenRouter)",
            isFree: true,
            supportsVision: true,
            supportsText: true,
          },
          {
            id: "google/gemini-2.0-flash-exp:free",
            name: "Google Gemini 2.0 Flash (Free)",
            isFree: true,
            supportsVision: true,
            supportsText: true,
          },
        ],
        totalAvailable: 2,
        cachedAt: new Date().toISOString(),
      }
    );
  }
}
