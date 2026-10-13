/**
 * Anti-AI Slop Humanizer Engine
 * Strips giveaway AI clichés, corporate corporate-speak, and em dashes
 * to produce organic, natural creator copy that sounds like a human speaking out loud.
 */

export const AI_SLOP_VOCABULARY = [
  "delve",
  "delving",
  "testament",
  "tapestry",
  "elevate",
  "elevating",
  "unlock",
  "unlocking",
  "seamless",
  "seamlessly",
  "dive deep",
  "diving deep",
  "beacon",
  "game changer",
  "game-changer",
  "harness",
  "harnessing",
  "foster",
  "fostering",
  "leverage",
  "leveraging",
  "vibrant",
  "moreover",
  "in conclusion",
  "furthermore",
  "tailored",
  "paramount",
  "pivotal",
  "utmost",
  "revolutionize",
  "revolutionizing",
  "unleash",
  "unleashing",
  "embark",
  "embarking",
  "in today's fast-paced world",
  "in an ever-evolving world",
  "plethora",
  "myriad",
  "synergy",
];

export interface HumanizeResult {
  humanized: string;
  flaggedWords: string[];
  changed: boolean;
  score: number; // 0-100 (100 = 100% human, 0 = pure AI slop)
}

/**
 * Humanizes caption copy by purging AI clichés, excessive em dashes,
 * and unnatural bot cadences.
 */
export function humanizeCaption(text: string): HumanizeResult {
  if (!text) {
    return { humanized: "", flaggedWords: [], changed: false, score: 100 };
  }

  let result = text;
  const flaggedWords: string[] = [];

  // 1. Strip invisible zero-width unicode characters
  result = result.replace(/[\u200B-\u200D\uFEFF]/g, "");

  // 2. Replace em dashes (—) and en dashes (–) with natural punctuation
  if (/—|–/.test(result)) {
    result = result.replace(/\s*[—–]\s*/g, " - ");
    flaggedWords.push("em dash (—)");
  }

  // 3. Scan and replace AI slop vocabulary
  for (const slop of AI_SLOP_VOCABULARY) {
    const regex = new RegExp(`\\b${slop}\\b`, "gi");
    if (regex.test(result)) {
      flaggedWords.push(slop);
      // Smart contextual replacements for common words
      result = result.replace(regex, (match) => {
        const lower = match.toLowerCase();
        if (lower === "delve" || lower === "delving") return "look into";
        if (lower === "testament") return "proof";
        if (lower === "tapestry") return "collection";
        if (lower === "elevate") return "improve";
        if (lower === "unlock") return "learn";
        if (lower === "seamless" || lower === "seamlessly") return "smooth";
        if (lower === "dive deep") return "break down";
        if (lower === "game changer" || lower === "game-changer") return "major shift";
        if (lower === "leverage") return "use";
        if (lower === "harness") return "use";
        if (lower === "foster") return "build";
        if (lower === "vibrant") return "active";
        if (lower === "moreover" || lower === "furthermore") return "also";
        if (lower === "in conclusion") return "in short";
        if (lower === "unleash") return "release";
        if (lower === "revolutionize") return "change";
        return "";
      });
    }
  }

  // 4. Remove opening fluff if present
  result = result.replace(
    /^(in today's fast-paced (?:world|digital landscape),?\s*)/i,
    ""
  );

  // 5. Clean up duplicate spaces or punctuation artifacts
  result = result
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const penalty = Math.min(60, flaggedWords.length * 15);
  const score = Math.max(40, 100 - penalty);

  return {
    humanized: result,
    flaggedWords: Array.from(new Set(flaggedWords)),
    changed: result !== text,
    score,
  };
}
