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
  modelId = "gemini-3.5-flash",
  apiKey,
  hookFormulaId,
  imageUrl,
  customPrompt = "",
}: {
  context?: string;
  tone?: CaptionTone;
  action?: CaptionAction;
  currentCaption?: string;
  modelId?: string;
  apiKey?: string;
  hookFormulaId?: number;
  imageUrl?: string;
  customPrompt?: string;
}): Promise<CaptionGenerationResult> {
  let jsonText = "";
  const chosenProvider = "Google Gemini";
  const chosenModel = modelId || "gemini-3.5-flash";

  // 1. If Image is provided, use Google Gemini Multimodal Vision!
  if (imageUrl) {
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
          { maxOutputTokens: 1000, temperature: 0.6, model: chosenModel, apiKey }
        );
      }
    } catch (visionErr: any) {
      console.warn("Direct Gemini Vision error, falling back to text prompt:", visionErr);
      if (visionErr?.message?.includes("API key")) {
        throw visionErr;
      }
    }
  }

  // 2. Text-based prompt via Gemini if vision not used or image not supplied
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
1. Keep the caption simple, natural, and aesthetic. Avoid corporate jargon.
2. First line must stop the scroll before 125 characters.
3. NO generic AI buzzwords ("delve", "elevate", "tapestry", "beacon", "game changer", "harness").
4. Provide 4-6 targeted niche hashtags.

Return ONLY a valid JSON object without markdown:
{
  "caption": "Your caption here",
  "hashtags": ["#aesthetic", "#creator"],
  "cta": "Quick action prompt"
}
`;

    try {
      jsonText = await generateWithGemini(prompt, undefined, {
        maxOutputTokens: 1000,
        temperature: 0.6,
        model: chosenModel,
        apiKey,
      });
    } catch (geminiErr: any) {
      console.warn("Gemini text caption error:", geminiErr);
      if (geminiErr?.message?.includes("API key") || geminiErr?.message?.includes("missing")) {
        throw geminiErr;
      }
    }
  }

  // 3. Fallback only if offline/no response
  if (!jsonText) {
    const isAesthetic = /dp|pfp|aesthetic|vector|art|wall|vibe|pinterest/i.test(customPrompt || context || "");
    const defaultCaption = isAesthetic
      ? "Faceless but priceless 🤍✨ 1-9 which is your vibe? dp collection drop 🍂\n\nSave this post before it's gone."
      : `${customPrompt || "Clean creator post"}\n\nConsistency is built in the daily reps, not the highlight reel.\n\nSave this for your next post.`;
    const defaultTags = isAesthetic
      ? ["#aestheticdp", "#pfp", "#vectorart", "#matchingpfp", "#explorepage"]
      : ["#creator", "#contentcreator", "#viralokit", "#aesthetic"];

    return {
      caption: defaultCaption,
      hashtags: defaultTags,
      cta: "Save this post",
      charCount: defaultCaption.length,
      hashtagCount: defaultTags.length,
      feedCutoffText: defaultCaption.slice(0, 125),
      hookScore: scoreHook(defaultCaption.split("\n")[0]),
      lintReport: lintInstagramCaption(defaultCaption),
      provider: "Offline Engine",
      model: "Heuristic Fallback",
    };
  }

  try {
    const cleaned = jsonText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    const rawCaption = parsed.caption || "Clean creator post";
    const humanized = humanizeCaption(rawCaption).humanized;
    const finalCaption = humanized;

    const rawHashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags : ["#creator", "#viralokit"];
    const cleanedHashtags = rawHashtags.map((h: string) => (h.startsWith("#") ? h : `#${h}`));

    const firstLine = finalCaption.split("\n")[0] || finalCaption;
    const hookScore = scoreHook(firstLine);
    const lintReport = lintInstagramCaption(finalCaption);

    return {
      caption: finalCaption,
      hashtags: cleanedHashtags,
      cta: parsed.cta || "Save this post",
      charCount: finalCaption.length,
      hashtagCount: cleanedHashtags.length,
      feedCutoffText: firstLine.slice(0, 125),
      hookScore,
      lintReport,
      provider: chosenProvider,
      model: chosenModel,
    };
  } catch (parseErr) {
    console.error("Failed to parse AI JSON caption:", jsonText);
    const rawCaption = jsonText.slice(0, 300);
    return {
      caption: rawCaption,
      hashtags: ["#creator", "#viralokit"],
      cta: "Save this post",
      charCount: rawCaption.length,
      hashtagCount: 2,
      feedCutoffText: rawCaption.slice(0, 125),
      hookScore: scoreHook(rawCaption),
      lintReport: lintInstagramCaption(rawCaption),
      provider: chosenProvider,
      model: chosenModel,
    };
  }
}
