/**
 * Caption Linter & Feed Window Inspector
 * Implements Jake Schincariol's Instagram linter logic.
 * Checks the exact 125-char visible feed window, hashtag caps, and single-ask conversion rules.
 */

import { scoreHook, HookScoreBreakdown } from "./hooks-data";
import { humanizeCaption, HumanizeResult } from "./humanizer";

export interface CaptionLintReport {
  feedVisibleWindow: string; // The ~125 characters displayed before "... more"
  charCount: number;
  wordCount: number;
  hashtagCount: number;
  extractedHashtags: string[];
  singleAskDetected: boolean;
  askText: string;
  passes: string[];
  warnings: string[];
  hookScore: HookScoreBreakdown;
  humanizeScore: HumanizeResult;
}

export function lintInstagramCaption(captionText: string): CaptionLintReport {
  const clean = (captionText || "").trim();
  const passes: string[] = [];
  const warnings: string[] = [];

  // 1. Feed Visible Window (First 125 characters)
  const feedVisibleWindow = clean.slice(0, 125);
  const words = clean.split(/\s+/).filter(Boolean);

  // 2. Length check (Max 2,200 chars)
  if (clean.length <= 2200) {
    passes.push(`Length: ${clean.length} / 2200 chars (Compliant)`);
  } else {
    warnings.push(`Length: ${clean.length} exceeds Instagram's 2,200 character limit!`);
  }

  // 3. Line 1 / Feed Cutoff analysis
  const firstNewlineIndex = clean.indexOf("\n");
  const firstLine = firstNewlineIndex !== -1 ? clean.slice(0, firstNewlineIndex).trim() : clean;

  if (firstLine.length <= 125 && firstLine.length > 0) {
    passes.push("First line fits cleanly inside the feed's 125-char visible box.");
  } else if (clean.length > 125) {
    warnings.push(
      "Line 1 exceeds 125 characters and will be cut by '... more' mid-thought. Put the core curiosity hook at the very start."
    );
  }

  // 4. Hashtag cap check (Instagram's 3-5 hashtag recommendation)
  const tagMatches = clean.match(/#[a-zA-Z0-9_\u0900-\u097F]+/g) || [];
  const uniqueTags = Array.from(new Set(tagMatches));

  if (uniqueTags.length >= 1 && uniqueTags.length <= 5) {
    passes.push(`Hashtags: ${uniqueTags.length} tags (Optimal 3-5 keyword distribution)`);
  } else if (uniqueTags.length > 5) {
    warnings.push(
      `Hashtags: ${uniqueTags.length} tags found. Instagram's search algorithm prioritizes 3-5 focused search terms. Excess tags get flagged as spam.`
    );
  } else {
    warnings.push("No hashtags found. Add 3 to 5 targeted niche keywords for search indexing.");
  }

  // 5. Single Ask (CTA) Detection
  const ctaPatterns = [
    /\b(comment|drop|dm|send|save|share|link in bio|check the link)\b/gi,
  ];
  let askCount = 0;
  let detectedAsk = "";
  for (const pattern of ctaPatterns) {
    const matches = clean.match(pattern);
    if (matches) {
      askCount += matches.length;
      detectedAsk = matches[0];
    }
  }

  if (askCount === 1) {
    passes.push("One Ask: Clean single call to action avoids overwhelming the reader.");
  } else if (askCount > 2) {
    warnings.push(
      "Multiple asks detected (e.g. comment + share + save). Asking for more than 1 action cuts conversion in half."
    );
  }

  // 6. Hook & Humanizer scoring
  const hookScore = scoreHook(firstLine || clean);
  const humanizeScore = humanizeCaption(clean);

  if (humanizeScore.flaggedWords.length > 0) {
    warnings.push(
      `AI buzzwords detected: ${humanizeScore.flaggedWords.join(", ")}. Humanize to sound natural.`
    );
  } else {
    passes.push("Zero AI slop buzzwords detected. Sounds organic.");
  }

  return {
    feedVisibleWindow,
    charCount: clean.length,
    wordCount: words.length,
    hashtagCount: uniqueTags.length,
    extractedHashtags: uniqueTags,
    singleAskDetected: askCount === 1,
    askText: detectedAsk,
    passes,
    warnings,
    hookScore,
    humanizeScore,
  };
}
