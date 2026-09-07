import { config } from "@/lib/config";
import { generateWithGemini } from "./gemini";

export type CaptionTone =
  | "Professional"
  | "Aesthetic"
  | "Casual"
  | "Minimal"
  | "Creator"
  | "Hinglish"
  | "Hindi"
  | "English";

export type CaptionAction =
  | "generate"
  | "shorten"
  | "improve"
  | "add_cta"
  | "add_hashtags";

export interface CaptionGenerationResult {
  caption: string;
  hashtags: string[];
  cta: string;
  charCount: number;
  hashtagCount: number;
  provider: string;
  model: string;
}

export async function generateCaptionWithAi({
  context,
  tone = "Creator",
  action = "generate",
  currentCaption = "",
  modelId = "openrouter/free",
  enableGeminiFallback = true,
}: {
  context: string;
  tone?: CaptionTone;
  action?: CaptionAction;
  currentCaption?: string;
  modelId?: string;
  enableGeminiFallback?: boolean;
}): Promise<CaptionGenerationResult> {
  const prompt = `
You are a world-class Instagram copywriter and social media strategist.
Create or optimize an Instagram post caption based on these instructions:

TONE: ${tone}
ACTION REQUESTED: ${action}
ADDITIONAL CONTEXT / KEYWORDS / IMAGE INFO: ${context || "None provided"}
${currentCaption ? `EXISTING CAPTION TO MODIFY: "${currentCaption}"` : ""}

CRITICAL RULES:
1. Instagram captions have a maximum limit of 2,200 characters. Keep it well within limits.
2. Instagram allows at most 30 hashtags. Provide between 5 and 15 highly targeted, non-spammy hashtags.
3. If tone is "Hinglish", blend natural conversational Hindi words written in English alphabet with modern English phrasing (e.g. "Aaj ka vibe check!", "Kaam karo aisa jo yaad rahe").
4. If tone is "Minimal", output a short, punchy 1-2 sentence caption with subtle emojis.
5. If action is "shorten", trim the caption to essential words without losing the hook.
6. If action is "add_cta", append a compelling engagement question or call-to-action (e.g. "Save this for later", "Drop your thoughts below 👇").

Return ONLY a valid JSON object matching this schema without any markdown backticks or commentary:
{
  "caption": "The main caption text ready to paste on Instagram",
  "cta": "The specific call to action line used",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}
`;

  let jsonText = "";
  let chosenProvider = "OpenRouter";
  let chosenModel = modelId;

  // 1. Attempt OpenRouter Free
  if (config.ai.openRouterKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.ai.openRouterKey}`,
          "HTTP-Referer": config.app.url,
          "X-Title": "PostGram Creator",
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1200,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) jsonText = content;
      }
    } catch (err) {
      console.warn("OpenRouter caption generation error:", err);
    }
  }

  // 2. Gemini Fallback
  if (!jsonText && enableGeminiFallback && config.ai.geminiKey) {
    try {
      chosenProvider = "Gemini Fallback";
      chosenModel = "gemini-1.5-flash";
      jsonText = await generateWithGemini(prompt);
    } catch (err) {
      console.warn("Gemini caption fallback error:", err);
    }
  }

  // 3. Fallback heuristic if offline / no keys
  if (!jsonText) {
    const defaultCaption = currentCaption
      ? `${currentCaption}\n\n✨ Crafted with intention.`
      : `Behind every great shot is a story waiting to be shared. 📸\n\nWhat are you creating today? Let me know in the comments below!`;
    const defaultTags = ["#creator", "#postgram", "#instagramgrowth", "#visualcontent", "#creativelife"];

    return {
      caption: defaultCaption,
      hashtags: defaultTags,
      cta: "Let me know in the comments below!",
      charCount: defaultCaption.length,
      hashtagCount: defaultTags.length,
      provider: "Offline Engine",
      model: "Heuristic Generator",
    };
  }

  const { caption, hashtags, cta } = parseAiCaptionResponse(jsonText, currentCaption);

  return {
    caption,
    hashtags,
    cta,
    charCount: caption.length,
    hashtagCount: hashtags.length,
    provider: chosenProvider,
    model: chosenModel,
  };
}

/**
 * Robustly parses caption, hashtags, and CTA from AI output.
 * Handles valid JSON, markdown blocks, truncated JSON strings, unescaped newlines,
 * and ensures raw JSON syntax is never returned as caption text.
 */
export function parseAiCaptionResponse(
  rawText: string,
  currentCaption: string = ""
): {
  caption: string;
  hashtags: string[];
  cta: string;
} {
  if (!rawText || !rawText.trim()) {
    return {
      caption: currentCaption || "Capturing moments that inspire.",
      hashtags: ["#creator", "#postgram"],
      cta: "",
    };
  }

  // Strip markdown code fences if present
  let cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

  // 1. Try standard JSON.parse
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object") {
      const cap = typeof parsed.caption === "string" ? parsed.caption.trim() : "";
      const cta = typeof parsed.cta === "string" ? parsed.cta.trim() : "";
      let tags: string[] = [];
      if (Array.isArray(parsed.hashtags)) {
        tags = parsed.hashtags
          .map((t: any) => String(t).trim())
          .filter((t: string) => t.length > 0);
      }
      if (cap) {
        return { caption: cap, hashtags: tags, cta };
      }
    }
  } catch {
    // Proceed to robust extraction
  }

  // 2. Try parsing candidate between outermost braces { ... }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object" && parsed.caption) {
        return {
          caption: String(parsed.caption).trim(),
          hashtags: Array.isArray(parsed.hashtags)
            ? parsed.hashtags.map(String).filter(Boolean)
            : [],
          cta: parsed.cta ? String(parsed.cta).trim() : "",
        };
      }
    } catch {
      // Continue to regex
    }
  }

  // 3. Robust Regex Extraction (handles truncated JSON, unescaped newlines inside strings)
  let extractedCaption = "";
  let extractedCta = "";
  const extractedTags: string[] = [];

  // Match "caption": "..."
  const captionMatch = cleaned.match(
    /"caption"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"(?:cta|hashtags)"|"$|(?<!\\)")/
  );
  if (captionMatch && captionMatch[1]) {
    extractedCaption = captionMatch[1]
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\")
      .trim();
  }

  // Match "cta": "..."
  const ctaMatch = cleaned.match(
    /"cta"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"(?:hashtags|caption)"|"$|(?<!\\)")/
  );
  if (ctaMatch && ctaMatch[1]) {
    extractedCta = ctaMatch[1]
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\")
      .trim();
  }

  // Extract all hashtags from the text (e.g. #AestheticVibes)
  const tagMatches = cleaned.match(/#[a-zA-Z0-9_\u0900-\u097F]+/g);
  if (tagMatches) {
    for (const tag of tagMatches) {
      if (!extractedTags.includes(tag)) {
        extractedTags.push(tag);
      }
    }
  }

  // 4. Fallback if regex failed to find "caption" property
  if (!extractedCaption) {
    if (!cleaned.startsWith("{")) {
      extractedCaption = cleaned;
    } else {
      extractedCaption = cleaned
        .replace(/\{[\s\S]*?"caption"\s*:\s*"/, "")
        .replace(/"\s*,\s*"cta"[\s\S]*$/, "")
        .replace(/"\s*,\s*"hashtags"[\s\S]*$/, "")
        .replace(/["}]/g, "")
        .replace(/\\n/g, "\n")
        .trim();
    }
  }

  // Final sanity check: if extractedCaption still contains JSON keys, sanitize
  if (extractedCaption.startsWith("{") || extractedCaption.includes('"caption":')) {
    extractedCaption = extractedCaption
      .replace(/^[^{]*\{/, "")
      .replace(/"caption"\s*:\s*"?/g, "")
      .replace(/"cta"\s*:\s*"?/g, "")
      .replace(/"hashtags"\s*:\s*\[[\s\S]*?\]/g, "")
      .replace(/["}]/g, "")
      .replace(/\\n/g, "\n")
      .trim();
  }

  return {
    caption: extractedCaption || currentCaption || "Capturing moments that matter.",
    hashtags: extractedTags.length > 0 ? extractedTags : ["#creator", "#postgram"],
    cta: extractedCta,
  };
}
