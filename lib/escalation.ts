/**
 * Human-escalation handoff.
 *
 * Detects when an inbound DM should be handed to a human agent and pauses
 * automation for that conversation. Detection is keyword-based; admins
 * configure the keywords (default: "help", "human", "agent", "support",
 * "representative", "talk to a person", "real person").
 *
 * When triggered, the caller is expected to:
 *   1. Send a polite acknowledgment to the user ("A team member will be
 *      with you shortly")
 *   2. Use the Handover Protocol (passThreadControl) if a target app is
 *      configured
 *   3. Persist the escalated state so future messages from the same
 *      sender skip automation
 *
 * Reference:
 *   https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/human-agent-escalation
 */

export const DEFAULT_ESCALATION_KEYWORDS: readonly string[] = [
  "help",
  "human",
  "agent",
  "support",
  "representative",
  "talk to a person",
  "real person",
  "speak to someone",
  "operator",
  "customer service",
];

const ESCALATION_PATTERN = new RegExp(
  // Match a keyword as a whole word OR a leading verb ("talk to a person",
  // "speak to someone") OR the keyword appearing in a short "I need …" form.
  String.raw`(?:\b(?:${DEFAULT_ESCALATION_KEYWORDS.map((k) =>
    k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  ).join("|")})\b)`,
  "i",
);

export interface EscalationCheckResult {
  /** True if the message triggers escalation. */
  shouldEscalate: boolean;
  /** The keyword (normalized) that triggered escalation, if any. */
  matchedKeyword: string | null;
}

export interface EscalationOptions {
  /** Override the keyword list. Each entry is matched as a whole word. */
  keywords?: readonly string[];
}

/**
 * Returns true if `text` contains a human-handoff keyword. The match is
 * case-insensitive and whole-word (so "humanize" doesn't match "human").
 * The default keyword list is in DEFAULT_ESCALATION_KEYWORDS.
 */
export function shouldEscalateToHuman(
  text: string,
  options: EscalationOptions = {},
): EscalationCheckResult {
  if (!text || typeof text !== "string") {
    return { shouldEscalate: false, matchedKeyword: null };
  }

  const keywords = options.keywords ?? DEFAULT_ESCALATION_KEYWORDS;
  if (keywords.length === 0) {
    return { shouldEscalate: false, matchedKeyword: null };
  }

  // Build a whole-word regex from the provided keywords, escaping
  // regex metachars.
  const pattern = new RegExp(
    String.raw`\b(?:${keywords
      .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})\b`,
    "i",
  );

  const m = pattern.exec(text.trim());
  if (!m) {
    return { shouldEscalate: false, matchedKeyword: null };
  }
  return { shouldEscalate: true, matchedKeyword: m[0].toLowerCase() };
}

/**
 * Returns the default human-acknowledgment message. Caller may override.
 */
export function defaultEscalationAck(accountName?: string): string {
  const who = accountName ? `${accountName}'s team` : "our team";
  return `Thanks for your message! ${who} has been notified and a real person will be with you shortly. While you wait, your message is flagged so we don't auto-reply again.`;
}

export { ESCALATION_PATTERN };
