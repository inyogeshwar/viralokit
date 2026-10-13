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
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash (Fast, Multimodal — Recommended)",
    description: "High-speed Google multimodal model with deep visual understanding and fast generation.",
    contextLength: 1048576,
    isFree: true,
    supportsVision: true,
    supportsText: true,
  },
  {
    id: "gemini-3-flash-preview",
    name: "Gemini 3 Flash Preview (Ultra-Low Latency)",
    description: "Google's latest low-latency flash preview model for rapid caption ideation.",
    contextLength: 1048576,
    isFree: true,
    supportsVision: true,
    supportsText: true,
  },
  {
    id: "gemini-flash-latest",
    name: "Gemini Flash Latest (Active Pointer)",
    description: "Automatically points to Google's latest production flash model release.",
    contextLength: 1048576,
    isFree: true,
    supportsVision: true,
    supportsText: true,
  },
];

export async function fetchFreeModels(_forceRefresh = false): Promise<ModelsResponse> {
  return {
    autoModel: "gemini-3.5-flash",
    freeTextModels: GEMINI_MODELS,
    freeVisionModels: GEMINI_MODELS,
    totalAvailable: GEMINI_MODELS.length,
    cachedAt: new Date().toISOString(),
  };
}
