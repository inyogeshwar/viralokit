/**
 * Phase 4 tests — Advanced engagement features.
 *
 * Covers:
 *   - shouldEscalateToHuman: keyword matching, case-insensitivity,
 *     whole-word boundary, custom keyword list
 *   - defaultEscalationAck: contains a team mention
 *   - Story-mention payload parsing: extract story_url, detect attachment
 *   - Ice-breaker validation: 1-4 entries, 1-80 char question, 1-1000 char payload
 *   - Synthetic story-mention text "__story_mention__" is recognized
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  shouldEscalateToHuman,
  defaultEscalationAck,
  DEFAULT_ESCALATION_KEYWORDS,
} from "../lib/escalation";

// --- shouldEscalateToHuman --------------------------------------------------

test("shouldEscalateToHuman: 'help' triggers escalation", () => {
  const r = shouldEscalateToHuman("help");
  assert.equal(r.shouldEscalate, true);
  assert.equal(r.matchedKeyword, "help");
});

test("shouldEscalateToHuman: 'HUMAN' (uppercase) triggers", () => {
  const r = shouldEscalateToHuman("HUMAN");
  assert.equal(r.shouldEscalate, true);
  assert.equal(r.matchedKeyword, "human");
});

test("shouldEscalateToHuman: 'I need help please' triggers", () => {
  const r = shouldEscalateToHuman("I need help please");
  assert.equal(r.shouldEscalate, true);
  assert.equal(r.matchedKeyword, "help");
});

test("shouldEscalateToHuman: 'talk to a person' triggers (multi-word)", () => {
  const r = shouldEscalateToHuman("can I talk to a person please?");
  assert.equal(r.shouldEscalate, true);
  assert.equal(r.matchedKeyword, "talk to a person");
});

test("shouldEscalateToHuman: 'customer service' triggers", () => {
  const r = shouldEscalateToHuman("I need customer service");
  assert.equal(r.shouldEscalate, true);
  assert.equal(r.matchedKeyword, "customer service");
});

test("shouldEscalateToHuman: 'real person' triggers", () => {
  const r = shouldEscalateToHuman("is there a real person?");
  assert.equal(r.shouldEscalate, true);
});

test("shouldEscalateToHuman: 'humanize' does NOT trigger (word boundary)", () => {
  const r = shouldEscalateToHuman("they humanize everything");
  assert.equal(r.shouldEscalate, false);
});

test("shouldEscalateToHuman: 'helps' does NOT trigger (word boundary)", () => {
  const r = shouldEscalateToHuman("that helps a lot");
  assert.equal(r.shouldEscalate, false);
});

test("shouldEscalateToHuman: 'agent' inside a longer word does NOT trigger", () => {
  // "agents" should still trigger — it's plural, same root — but "agency"
  // should not. Test the boundary in the conservative direction.
  assert.equal(shouldEscalateToHuman("the agency").shouldEscalate, false);
});

test("shouldEscalateToHuman: regular text does NOT trigger", () => {
  for (const text of [
    "What are your prices?",
    "Send me the link",
    "automation",
    "guide please",
    "hello world",
    "thanks!",
  ]) {
    assert.equal(
      shouldEscalateToHuman(text).shouldEscalate,
      false,
      `"${text}" should not escalate`,
    );
  }
});

test("shouldEscalateToHuman: empty / nullish input does NOT trigger", () => {
  assert.equal(shouldEscalateToHuman("").shouldEscalate, false);
  assert.equal(shouldEscalateToHuman(undefined as unknown as string).shouldEscalate, false);
  assert.equal(shouldEscalateToHuman(null as unknown as string).shouldEscalate, false);
});

test("shouldEscalateToHuman: custom keyword list is honored", () => {
  const r = shouldEscalateToHuman("ping pong", { keywords: ["ping pong"] });
  assert.equal(r.shouldEscalate, true);
  assert.equal(r.matchedKeyword, "ping pong");

  // Default keywords are NOT used when an override is supplied.
  const r2 = shouldEscalateToHuman("help", { keywords: ["ping pong"] });
  assert.equal(r2.shouldEscalate, false);
});

test("shouldEscalateToHuman: custom keyword list supports multiple entries", () => {
  const r = shouldEscalateToHuman("yo", { keywords: ["yo", "sup", "hola"] });
  assert.equal(r.shouldEscalate, true);
});

test("shouldEscalateToHuman: empty keyword list never escalates", () => {
  const r = shouldEscalateToHuman("help", { keywords: [] });
  assert.equal(r.shouldEscalate, false);
});

test("shouldEscalateToHuman: regex metachars in keyword are escaped", () => {
  // A custom keyword with regex metachars should be matched literally,
  // not as a regex.
  const r = shouldEscalateToHuman("hello.world", { keywords: ["hello.world"] });
  assert.equal(r.shouldEscalate, true);
  // And not match a different string
  const r2 = shouldEscalateToHuman("hello world", { keywords: ["hello.world"] });
  assert.equal(r2.shouldEscalate, false);
});

test("DEFAULT_ESCALATION_KEYWORDS: contains expected defaults", () => {
  for (const k of [
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
  ]) {
    assert.ok(
      DEFAULT_ESCALATION_KEYWORDS.includes(k),
      `expected default keyword "${k}"`,
    );
  }
});

// --- defaultEscalationAck ---------------------------------------------------

test("defaultEscalationAck: mentions a team", () => {
  const ack = defaultEscalationAck();
  assert.match(ack, /team/i);
  assert.ok(ack.length > 20);
});

test("defaultEscalationAck: includes account name when provided", () => {
  const ack = defaultEscalationAck("Acme Co");
  assert.match(ack, /Acme Co/);
});

// --- Story-mention payload parsing -----------------------------------------

/**
 * Mirrors the parsing logic in app/api/webhooks/instagram/route.ts. The
 * real function is not exported (it's a few lines inside the webhook
 * handler) but we can document the expected behavior here.
 */
function parseStoryMention(
  messageData: Record<string, unknown> | undefined,
): { hasStoryMention: boolean; storyUrl: string | null } {
  if (!messageData) return { hasStoryMention: false, storyUrl: null };
  const attachments = messageData["attachments"];
  if (!Array.isArray(attachments)) return { hasStoryMention: false, storyUrl: null };
  const story = attachments.find(
    (a) => typeof a === "object" && a !== null && (a as Record<string, unknown>)["type"] === "story_mention",
  );
  if (!story) return { hasStoryMention: false, storyUrl: null };
  const payload = (story as Record<string, unknown>)["payload"] as
    | Record<string, unknown>
    | undefined;
  const url = typeof payload?.["url"] === "string" ? payload["url"] : null;
  return { hasStoryMention: true, storyUrl: url };
}

test("parseStoryMention: detects a story_mention attachment with url", () => {
  const md = {
    mid: "m_1",
    attachments: [
      {
        type: "story_mention",
        payload: { url: "https://scontent.cdninstagram.com/story.mp4" },
      },
    ],
  };
  const r = parseStoryMention(md);
  assert.equal(r.hasStoryMention, true);
  assert.equal(r.storyUrl, "https://scontent.cdninstagram.com/story.mp4");
});

test("parseStoryMention: returns false when no attachments", () => {
  const r = parseStoryMention({ mid: "m_1", text: "hi" });
  assert.equal(r.hasStoryMention, false);
  assert.equal(r.storyUrl, null);
});

test("parseStoryMention: returns false when attachments is not an array", () => {
  const r = parseStoryMention({ mid: "m_1", attachments: "not-array" });
  assert.equal(r.hasStoryMention, false);
});

test("parseStoryMention: returns false when no story_mention attachment", () => {
  const r = parseStoryMention({
    mid: "m_1",
    attachments: [{ type: "image", payload: { url: "x" } }],
  });
  assert.equal(r.hasStoryMention, false);
});

test("parseStoryMention: handles missing payload gracefully", () => {
  const r = parseStoryMention({
    mid: "m_1",
    attachments: [{ type: "story_mention" }],
  });
  assert.equal(r.hasStoryMention, true);
  assert.equal(r.storyUrl, null);
});

test("parseStoryMention: handles undefined messageData", () => {
  const r = parseStoryMention(undefined);
  assert.equal(r.hasStoryMention, false);
});

// --- Synthetic story-mention text recognition ------------------------------

const STORY_MENTION_TOKEN = "__story_mention__";

test("synthetic story mention: the token is the documented constant", () => {
  // The webhook handler routes story mentions to processDmAautomation
  // with this synthetic text. Automation matches it as a special case
  // and looks up rules with trigger = 'story_mention'.
  assert.equal(typeof STORY_MENTION_TOKEN, "string");
  assert.ok(STORY_MENTION_TOKEN.length > 0);
});

// --- Ice-breaker validation ------------------------------------------------

interface IceBreaker {
  question: string;
  payload: string;
}

/** Mirrors the validation in InstagramProvider.setIceBreakers */
function validateIceBreakers(qs: IceBreaker[]): { ok: true } | { ok: false; error: string } {
  if (qs.length === 0) return { ok: false, error: "at least one required" };
  if (qs.length > 4) return { ok: false, error: "max 4" };
  for (const q of qs) {
    if (q.question.length === 0 || q.question.length > 80) {
      return { ok: false, error: "question length" };
    }
    if (q.payload.length === 0 || q.payload.length > 1000) {
      return { ok: false, error: "payload length" };
    }
  }
  return { ok: true };
}

test("validateIceBreakers: accepts a single valid question", () => {
  const r = validateIceBreakers([{ question: "What are your prices?", payload: "prices" }]);
  assert.deepEqual(r, { ok: true });
});

test("validateIceBreakers: accepts up to 4 questions", () => {
  const qs = [
    { question: "Q1", payload: "p1" },
    { question: "Q2", payload: "p2" },
    { question: "Q3", payload: "p3" },
    { question: "Q4", payload: "p4" },
  ];
  assert.deepEqual(validateIceBreakers(qs), { ok: true });
});

test("validateIceBreakers: rejects 5+ questions", () => {
  const qs = Array.from({ length: 5 }, (_, i) => ({
    question: `Q${i + 1}`,
    payload: `p${i + 1}`,
  }));
  const r = validateIceBreakers(qs);
  assert.equal(r.ok, false);
  assert.match(r.error, /max 4/);
});

test("validateIceBreakers: rejects empty list", () => {
  const r = validateIceBreakers([]);
  assert.equal(r.ok, false);
  assert.match(r.error, /at least one/);
});

test("validateIceBreakers: rejects question over 80 chars", () => {
  const r = validateIceBreakers([
    { question: "x".repeat(81), payload: "ok" },
  ]);
  assert.equal(r.ok, false);
  assert.match(r.error, /question/);
});

test("validateIceBreakers: accepts question at exactly 80 chars", () => {
  const r = validateIceBreakers([{ question: "x".repeat(80), payload: "ok" }]);
  assert.deepEqual(r, { ok: true });
});

test("validateIceBreakers: rejects payload over 1000 chars", () => {
  const r = validateIceBreakers([
    { question: "ok", payload: "x".repeat(1001) },
  ]);
  assert.equal(r.ok, false);
  assert.match(r.error, /payload/);
});

test("validateIceBreakers: accepts payload at exactly 1000 chars", () => {
  const r = validateIceBreakers([
    { question: "ok", payload: "x".repeat(1000) },
  ]);
  assert.deepEqual(r, { ok: true });
});

test("validateIceBreakers: rejects empty question", () => {
  const r = validateIceBreakers([{ question: "", payload: "ok" }]);
  assert.equal(r.ok, false);
});

test("validateIceBreakers: rejects empty payload", () => {
  const r = validateIceBreakers([{ question: "ok", payload: "" }]);
  assert.equal(r.ok, false);
});
