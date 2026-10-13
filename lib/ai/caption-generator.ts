import { config } from "@/lib/config";
import { generateWithGemini } from "./gemini";
import { HOOK_FORMULAS, HookFormula, HookScoreBreakdown, scoreHook } from "./hooks-data";
import { humanizeCaption } from "./humanizer";
import { lintInstagramCaption, CaptionLintReport } from "./caption-linter";

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
  feedCutoffText: string;
  hookScore: HookScoreBreakdown;
  lintReport: CaptionLintReport;
  provider: string;
  model: string;
}

export async function generateCaptionWithAi({
  context = "",
  tone = "Creator",
  action = "generate",
  currentCaption = "",
  modelId = "openrouter/free",
  enableGeminiFallback = true,
  hookFormulaId,
  imageUrl,
  customPrompt = "",
}: {
  context?: string;
  tone?: CaptionTone;
  action?: CaptionAction;
  currentCaption?: string;
  modelId?: string;
  enableGeminiFallback?: boolean;
  hookFormulaId?: number;
  imageUrl?: string;
  customPrompt?: string;
}): Promise<CaptionGenerationResult> {
  let jsonText = "";
  let chosenProvider = "Gemini Flash Vision";
  let chosenModel = "gemini-1.5-flash";

  // 1. If Image is provided, try direct Google Gemini Multimodal Vision first!
  if (imageUrl && config.ai.geminiKey) {
    try {
      const imgRes = await fetch(imageUrl);
      if (imgRes.ok) {
        const imgBuffer = await imgRes.arrayBuffer();
        const base64Data = Buffer.from(imgBuffer).toString("base64");
        const mimeType = imgRes.headers.get("content-type") || "image/jpeg";

        const visionPrompt = `
You are an expert Instagram creator. Look closely at this image.
Write a clean, aesthetic, high-engagement Instagram caption matching this exact visual and vibe.

CREATOR CUSTOM THEME / INSTRUCTIONS:
"${customPrompt || context || "Generate a natural, high-engagement aesthetic caption tailored to this photo."}"

TONE: ${tone}
${currentCaption ? `CURRENT DRAFT: "${currentCaption}"` : ""}

CRITICAL RULES:
1. Write like a real creator, NOT a robot. Keep it simple, natural, punchy.
2. If this is an aesthetic DP, wallpaper, vector art, or matching PFP:
   - Make it aesthetic and relatable (e.g., "Faceless but priceless 🤍✨ 1-9 which is your vibe?", "Upgrade your feed aesthetic 🍂").
   - Include 1 simple interactive question or save prompt.
3. NO generic robotic buzzwords ("delve", "elevate", "unlock", "testament", "tapestry", "game changer", "in today's digital world").
4. Output 4 to 6 relevant hashtags.

Return ONLY a valid JSON object matching this schema without markdown:
{
  "caption": "Your clean, aesthetic caption here",
  "hashtags": ["#aesthetic", "#pfp", "#explorepage"],
  "cta": "Single action prompt"
}
`;

        jsonText = await generateWithGemini(
          visionPrompt,
          { data: base64Data, mimeType },
          { maxOutputTokens: 1000, temperature: 0.6 }
        );
        chosenProvider = "Google Gemini Vision";
        chosenModel = "gemini-1.5-flash";
      }
    } catch (visionErr) {
      console.warn("Direct Gemini Vision error, falling back to text prompt:", visionErr);
    }
  }

  // 2. Text-based prompt if vision not available or failed
  if (!jsonText) {
    const selectedFormula: HookFormula | undefined = hookFormulaId
      ? HOOK_FORMULAS.find((f) => f.id === hookFormulaId)
      : undefined;

    const hookInstruction = selectedFormula
      ? `Hook Formula to inspire Line 1: "${selectedFormula.name}" (${selectedFormula.template})`
      : `Line 1 must be under 125 characters, punchy and stop the scroll.`;

    const prompt = `
You are an authentic Instagram creator copywriter.
Generate a clean, high-engagement caption.

CREATOR THEME / CUSTOM PROMPT:
"${customPrompt || context || "Aesthetic creator post"}"

TONE: ${tone}
ACTION: ${action}
${currentCaption ? `CURRENT DRAFT TO IMPROVE: "${currentCaption}"` : ""}
${hookInstruction}

RULES:
1. Keep the caption simple, natural, and aesthetic. Avoid 5 paragraphs of corporate advice.
2. First line must stop the scroll before 125 characters.
3. NO generic AI buzzwords ("delve", "elevate", "tapestry", "beacon", "game changer", "harness").
4. Provide 4-6 targeted niche hashtags.

Return ONLY a valid JSON object:
{
  "caption": "Your caption here",
  "hashtags": ["#aesthetic", "#creator"],
  "cta": "Quick action prompt"
}
`;

    // Attempt OpenRouter
    if (config.ai.openRouterKey) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          signal: AbortSignal.timeout(12000),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.ai.openRouterKey}`,
            "HTTP-Referer": config.app.url,
            "X-Title": "ViraloKit Creator",
          },
          body: JSON.stringify({
            model: modelId,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.6,
            max_tokens: 1000,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            jsonText = content;
            chosenProvider = "OpenRouter";
            chosenModel = modelId;
          }
        }
      } catch (err) {
        console.warn("OpenRouter text caption error:", err);
      }
    }

    // Gemini Fallback
    if (!jsonText && enableGeminiFallback && config.ai.geminiKey) {
      try {
        chosenProvider = "Google Gemini";
        chosenModel = "gemini-1.5-flash";
        jsonText = await generateWithGemini(prompt, undefined, { maxOutputTokens: 1000, temperature: 0.6 });
      } catch (err) {
        console.warn("Gemini text caption error:", err);
      }
    }
  }

  // 3. Heuristic Fallback if offline
  if (!jsonText) {
    const isAesthetic = /dp|pfp|aesthetic|vector|art|wall|vibe|pinterest/i.test(customPrompt || context || "");
    const defaultCaption = isAesthetic
      ? "Faceless but priceless 🤍✨ 1-9 which is your vibe? dp collection drop 🍂\n\nSave this post before it's gone."
      : `${customPrompt || "Clean creator post"}\n\nConsistency is built in the daily reps, not the highlight reel.\n\nSave this for your next post.`;
    const defaultTags = isAesthetic
      ? ["#aestheticdp", "#pfp", "#vectorart", "#matchingpfp", "#explorepage"]
      : ["#creator", "#contentcreator", "#viralokit", "#aesthetic"];

    const lint = lintInstagramCaption(defaultCaption);
    return {
      caption: defaultCaption,
      hashtags: defaultTags,
      cta: "Save this post before it's gone.",
      charCount: defaultCaption.length,
      hashtagCount: defaultTags.length,
      feedCutoffText: lint.feedVisibleWindow,
      hookScore: lint.hookScore,
      lintReport: lint,
      provider: "ViraloKit Engine",
      model: "Aesthetic Smart Generator",
    };
  }

  // Parse and Humanize
  const parsed = parseAiCaptionResponse(jsonText, currentCaption);
  const humanized = humanizeCaption(parsed.caption);
  const finalCaption = humanized.humanized;
  const lintReport = lintInstagramCaption(finalCaption);

  return {
    caption: finalCaption,
    hashtags: parsed.hashtags.slice(0, 6),
    cta: parsed.cta,
    charCount: finalCaption.length,
    hashtagCount: parsed.hashtags.slice(0, 6).length,
    feedCutoffText: lintReport.feedVisibleWindow,
    hookScore: lintReport.hookScore,
    lintReport,
    provider: chosenProvider,
    model: chosenModel,
  };
}

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
      caption: currentCaption || "Capturing moments that matter.",
      hashtags: ["#aesthetic", "#creator", "#viralokit"],
      cta: "",
    };
  }

  try {
    const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      caption: parsed.caption || currentCaption || rawText,
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ["#aesthetic", "#creator"],
      cta: parsed.cta || "",
    };
  } catch {
    // If not valid JSON, extract clean text
    const cleanLines = rawText
      .split("\n")
      .filter((l) => !l.startsWith("```") && !l.includes('"caption":'))
      .join("\n")
      .trim();

    return {
      caption: cleanLines || currentCaption,
      hashtags: ["#aesthetic", "#explorepage", "#viralokit"],
      cta: "",
    };
  }
}
