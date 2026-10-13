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
  context,
  tone = "Creator",
  action = "generate",
  currentCaption = "",
  modelId = "openrouter/free",
  enableGeminiFallback = true,
  hookFormulaId,
}: {
  context: string;
  tone?: CaptionTone;
  action?: CaptionAction;
  currentCaption?: string;
  modelId?: string;
  enableGeminiFallback?: boolean;
  hookFormulaId?: number;
}): Promise<CaptionGenerationResult> {
  const selectedFormula: HookFormula | undefined = hookFormulaId
    ? HOOK_FORMULAS.find((f) => f.id === hookFormulaId)
    : undefined;

  const hookInstruction = selectedFormula
    ? `
MANDATORY HOOK FORMULA TO USE FOR LINE 1:
- Formula Name: "${selectedFormula.name}" (${selectedFormula.category})
- Formula Structure: "${selectedFormula.template}"
- Formula Example: "${selectedFormula.example}"
- Why it works: "${selectedFormula.bestFor}"
- Trap to avoid: "${selectedFormula.trap}"
Craft Line 1 strictly based on this formula.`
    : `
HOOK INSTRUCTION FOR LINE 1:
Select one high-retention hook angle (e.g. Cost Confession, Nobody Tells You, The Replacement, The Receipt, Negative Command). Line 1 MUST be concrete, have high stakes or open a curiosity loop, and fit inside 125 characters.`;

  const prompt = `
You are a top 1% Instagram creator copywriter and growth engineer.
You follow strict creator psychology: The caption's primary goal is to pass the 125-character visible feed cutoff, deliver immediate value, and trigger a single high-converting action.

TONE: ${tone}
ACTION: ${action}
CONTENT CONTEXT / TOPIC / IMAGE DETAILS: ${context || "None provided"}
${currentCaption ? `EXISTING DRAFT TO REFINE: "${currentCaption}"` : ""}
${hookInstruction}

CORE ARCHITECTURAL RULES (CRITICAL):
1. THE 125-CHARACTER VISIBLE FEED CUTOFF RULE:
   - Line 1 is what strangers see before Instagram cuts it off with "... more".
   - Line 1 MUST be under 125 characters.
   - Line 1 must NEVER start with a greeting ("Hey guys"), an emoji as the first character, or generic fluff ("Stop scrolling", "Are you ready").
   - Line 1 must end on a natural curiosity cliffhanger or punchy complete statement, NOT cut mid-word.

2. ZERO AI SLOP / HUMAN VOICE (MANDATORY):
   - You MUST NOT use giveaway bot words: "delve", "testament", "tapestry", "elevate", "unlock", "seamless", "dive deep", "game changer", "beacon", "in today's fast-paced world", "harness", "leverage".
   - DO NOT use em dashes ("—"). Use natural pauses, commas, or clean hyphens.
   - Write like a human speaking out loud to a colleague or peer.

3. THE BODY:
   - 2 to 4 short, crisp paragraphs with clean blank line spacing between them.
   - Include natural keywords that users search on Instagram Explore.

4. THE ASK (EXACTLY ONE CTA):
   - Exactly ONE call to action (e.g. "Save this before your next shoot", "Comment [KEYWORD] and I'll send you the link", "What's your biggest bottleneck?").
   - NEVER ask for multiple actions at once.

5. HASHTAGS (STRICT 3 TO 5 TAGS):
   - Provide between 3 and 5 hyper-targeted niche keywords at the bottom.
   - NEVER provide 10 or 30 hashtags (Instagram penalizes large hashtag spam).

6. LANGUAGE BLEND:
   - If TONE is "Hinglish", write natural conversational Hinglish using English alphabet (e.g. "Yeh 1 galti har creator karta hai...", "Save kar lo baad me kaam aayega").

Return ONLY a valid JSON object matching this schema without markdown code blocks or commentary:
{
  "caption": "Full formatted caption with line breaks and the single CTA",
  "cta": "The single call to action sentence",
  "hashtags": ["#keyword1", "#keyword2", "#keyword3", "#keyword4"]
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
          "X-Title": "ViraloKit Creator",
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

  // 3. Heuristic Fallback if offline
  if (!jsonText) {
    const defaultHook = selectedFormula
      ? selectedFormula.example
      : "Nobody tells you that your first 30 posts are supposed to feel like testing.";
    const defaultBody = `${defaultHook}\n\nThe difference between accounts that grow and accounts that stall isn't luck. It's understanding that line 1 earns the tap.\n\nSave this for your next post checklist.`;
    const defaultTags = ["#creatorgrowth", "#instagramtips", "#contentstrategy", "#viralokit"];

    const lint = lintInstagramCaption(defaultBody);
    return {
      caption: defaultBody,
      hashtags: defaultTags,
      cta: "Save this for your next post checklist.",
      charCount: defaultBody.length,
      hashtagCount: defaultTags.length,
      feedCutoffText: lint.feedVisibleWindow,
      hookScore: lint.hookScore,
      lintReport: lint,
      provider: "Offline Engine",
      model: "Heuristic Generator",
    };
  }

  // Parse and Humanize
  const parsed = parseAiCaptionResponse(jsonText, currentCaption);

  // Apply Humanizer filter to strip AI buzzwords and em dashes
  const humanized = humanizeCaption(parsed.caption);
  const finalCaption = humanized.humanized;

  // Lint the final caption
  const lintReport = lintInstagramCaption(finalCaption);

  return {
    caption: finalCaption,
    hashtags: parsed.hashtags.slice(0, 5),
    cta: parsed.cta,
    charCount: finalCaption.length,
    hashtagCount: parsed.hashtags.slice(0, 5).length,
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
      hashtags: ["#creator", "#viralokit"],
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
        return { caption: cap, hashtags: tags.slice(0, 5), cta };
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
            ? parsed.hashtags.map(String).filter(Boolean).slice(0, 5)
            : [],
          cta: parsed.cta ? String(parsed.cta).trim() : "",
        };
      }
    } catch {
      // Continue to regex
    }
  }

  // 3. Robust Regex Extraction
  let extractedCaption = "";
  let extractedCta = "";
  const extractedTags: string[] = [];

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

  const tagMatches = cleaned.match(/#[a-zA-Z0-9_\u0900-\u097F]+/g);
  if (tagMatches) {
    for (const tag of tagMatches) {
      if (!extractedTags.includes(tag) && extractedTags.length < 5) {
        extractedTags.push(tag);
      }
    }
  }

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

  return {
    caption: extractedCaption || currentCaption || "Capturing moments that matter.",
    hashtags: extractedTags.length > 0 ? extractedTags : ["#creator", "#viralokit"],
    cta: extractedCta,
  };
}
