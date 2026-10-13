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

const GEMINI_MODELS: AIModelInfo[] = [
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash (Fast & Free — Recommended)",
    description: "High-speed multimodal model with 1M token context. Ideal for captions & visual analysis.",
    contextLength: 1048576,
    isFree: true,
    supportsVision: true,
    supportsText: true,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash (Next-Gen Speed & Accuracy)",
    description: "Google's next-generation multimodal model with ultra-fast generation and low latency.",
    contextLength: 1048576,
    isFree: true,
    supportsVision: true,
    supportsText: true,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro (Deep Creative Reasoning)",
    description: "Maximum intelligence and reasoning power for deep account audits and complex prompts.",
    contextLength: 2097152,
    isFree: true,
    supportsVision: true,
    supportsText: true,
  },
];

export async function fetchFreeModels(_forceRefresh = false): Promise<ModelsResponse> {
  return {
    autoModel: "gemini-1.5-flash",
    freeTextModels: GEMINI_MODELS,
    freeVisionModels: GEMINI_MODELS,
    totalAvailable: GEMINI_MODELS.length,
    cachedAt: new Date().toISOString(),
  };
}
