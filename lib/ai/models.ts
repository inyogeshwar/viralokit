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
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash (Recommended)",
    description: "General text and multimodal understanding model.",
    contextLength: 1048576,
    isFree: true,
    supportsVision: true,
    supportsText: true,
  },
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    description: "General text and multimodal understanding model.",
    contextLength: 1048576,
    isFree: true,
    supportsVision: true,
    supportsText: true,
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash-Lite",
    description: "Cost-efficient model for high-throughput text generation.",
    contextLength: 1048576,
    isFree: true,
    supportsVision: true,
    supportsText: true,
  },
];

export async function fetchFreeModels(_forceRefresh = false): Promise<ModelsResponse> {
  return {
    autoModel: "gemini-3.8-flash",
    freeTextModels: GEMINI_MODELS,
    freeVisionModels: GEMINI_MODELS,
    totalAvailable: GEMINI_MODELS.length,
    cachedAt: new Date().toISOString(),
  };
}
