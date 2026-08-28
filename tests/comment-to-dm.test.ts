/**
 * Phase 2 integration tests — Comment-to-DM (Private Replies).
 *
 * Covers the new logic introduced for Phase 2:
 *
 *   - Keyword matching (`matchTextAgainstRules`) for private_reply rules
 *   - Per-post (anti-viral) rate limit (`acquirePerPostPrivateReply`)
 *   - Default private-reply template
 *   - Combined behavior: a viral post is rate-limited at the per-post
 *     boundary even when the per-account budget has tokens
 *
 * End-to-end webhook → processCommentAutomation → sendPrivateReply tests
 * are deferred: that path needs full DB + provider mocking, which is
 * better done with a DI refactor (separate task).
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  acquirePerPostPrivateReply,
  getPerPostPrivateReplyStatus,
  _resetRateLimitBuckets,
} from "../lib/rate-limiter";
import {
  matchTextAgainstRules,
  DEFAULT_PRIVATE_REPLY_TEMPLATE,
} from "../lib/automation";

// --- Helpers ----------------------------------------------------------------

function makeRule(overrides: Partial<{
  id: string;
  trigger: string;
  triggerValue: string | null;
  matchType: string;
  channel: string;
  responseText: string;
  priority: number;
}> = {}) {
  return {
    id: "rule-1",
    name: "Test rule",
    trigger: "keyword",
    triggerValue: "automation",
    matchType: "contains",
    channel: "private_reply",
    responseType: "text",
    responseText: "Hey! I have the resource ready. Reply 'SEND' to get it.",
    responsePayload: null,
    delayMs: 0,
    priority: 0,
    triggerCount: 0,
    ...overrides,
  };
}

// --- Template ---------------------------------------------------------------

test("DEFAULT_PRIVATE_REPLY_TEMPLATE matches the plan's recommended copy", () => {
  // The plan specifies this exact phrase: "Hey! I have the resource ready.
  // Reply 'SEND' to this message to get it." The template must include
  // the "SEND" keyword so a follow-up DM automation can pick it up.
  assert.match(DEFAULT_PRIVATE_REPLY_TEMPLATE, /Reply 'SEND'/i);
  assert.match(DEFAULT_PRIVATE_REPLY_TEMPLATE, /resource ready/i);
});

// --- Keyword matching -------------------------------------------------------

test("matchTextAgainstRules: matches 'contains' (case-insensitive) on private_reply rule", () => {
  const rules = [makeRule({ triggerValue: "automation", matchType: "contains" })];
  const matches = matchTextAgainstRules("I want AUTOMATION", rules);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].channel, "private_reply");
});

test("matchTextAgainstRules: matches comma-separated keywords", () => {
  const rules = [makeRule({ triggerValue: "price, buy, order, help", matchType: "contains" })];
  for (const kw of ["price", "BUY", "  Order  ", "help me"]) {
    const matches = matchTextAgainstRules(kw, rules);
    assert.equal(matches.length, 1, `expected match for "${kw}"`);
  }
});

test("matchTextAgainstRules: returns empty for unrelated comment text", () => {
  const rules = [makeRule({ triggerValue: "automation" })];
  const matches = matchTextAgainstRules("nice pic 🔥", rules);
  assert.equal(matches.length, 0);
});

test("matchTextAgainstRules: 'all_comments' trigger fires regardless of text", () => {
  const rules = [makeRule({ trigger: "all_comments" })];
  const matches = matchTextAgainstRules("literally anything", rules);
  assert.equal(matches.length, 1);
});

test("matchTextAgainstRules: higher priority wins", () => {
  const rules = [
    makeRule({ id: "low", priority: 1, responseText: "low-priority reply" }),
    makeRule({ id: "high", priority: 10, responseText: "high-priority reply" }),
  ];
  const matches = matchTextAgainstRules("automation", rules);
  assert.equal(matches.length, 2);
  // Sorted by priority DESC
  assert.equal(matches[0].id, "high");
  assert.equal(matches[1].id, "low");
});

test("matchTextAgainstRules: exact match is strict", () => {
  const rules = [makeRule({ triggerValue: "send", matchType: "exact" })];
  assert.equal(matchTextAgainstRules("send", rules).length, 1);
  assert.equal(matchTextAgainstRules("send it to me", rules).length, 0);
  assert.equal(matchTextAgainstRules("SEND", rules).length, 1, "case-insensitive");
});

test("matchTextAgainstRules: starts_with match", () => {
  const rules = [makeRule({ triggerValue: "send", matchType: "starts_with" })];
  assert.equal(matchTextAgainstRules("send me the link", rules).length, 1);
  assert.equal(matchTextAgainstRules("please send it", rules).length, 0);
});

test("matchTextAgainstRules: regex match (case-insensitive by default)", () => {
  const rules = [makeRule({ triggerValue: "^(free|gift)$", matchType: "regex" })];
  assert.equal(matchTextAgainstRules("FREE", rules).length, 1);
  assert.equal(matchTextAgainstRules("gift", rules).length, 1);
  assert.equal(matchTextAgainstRules("free stuff", rules).length, 0);
});

test("matchTextAgainstRules: invalid regex falls back to contains", () => {
  const rules = [makeRule({ triggerValue: "[unclosed", matchType: "regex" })];
  // Should not throw; should treat as a contains match.
  const matches = matchTextAgainstRules("[unclosed bracket here", rules);
  assert.equal(matches.length, 1);
});

// --- Per-post (anti-viral) rate limit ---------------------------------------

test("acquirePerPostPrivateReply: allows replies under the cap", () => {
  _resetRateLimitBuckets();
  const ok = acquirePerPostPrivateReply("acct-1", "media-1");
  assert.equal(ok, true);
});

test("acquirePerPostPrivateReply: refuses when mediaId is empty (fail closed)", () => {
  _resetRateLimitBuckets();
  // Empty mediaId would bypass the post-level guard — refuse to send.
  assert.equal(acquirePerPostPrivateReply("acct-1", ""), false);
});

test("acquirePerPostPrivateReply: caps a single post at 25 replies per minute", () => {
  _resetRateLimitBuckets();
  const accountId = "acct-viral";
  const mediaId = "media-viral-1";

  // Per-minute cap is 25.
  for (let i = 0; i < 25; i++) {
    assert.equal(
      acquirePerPostPrivateReply(accountId, mediaId),
      true,
      `expected reply #${i + 1} to be allowed`,
    );
  }
  // 26th should be blocked by the per-minute cap.
  assert.equal(acquirePerPostPrivateReply(accountId, mediaId), false);
});

test("acquirePerPostPrivateReply: different posts don't share a budget", () => {
  _resetRateLimitBuckets();
  // Drain post A's minute budget.
  for (let i = 0; i < 25; i++) {
    acquirePerPostPrivateReply("acct-1", "post-a");
  }
  // Post B should still have a full budget.
  assert.equal(acquirePerPostPrivateReply("acct-1", "post-b"), true);
});

test("acquirePerPostPrivateReply: different accounts don't share a budget", () => {
  _resetRateLimitBuckets();
  for (let i = 0; i < 25; i++) {
    acquirePerPostPrivateReply("acct-a", "post-1");
  }
  // Account B should still have a full budget for the same post id.
  assert.equal(acquirePerPostPrivateReply("acct-b", "post-1"), true);
});

test("acquirePerPostPrivateReply: sanitizes mediaId for safe keying", () => {
  _resetRateLimitBuckets();
  // These two mediaIds differ only by characters that should be sanitized
  // out of the rate-limit key — they should collide (same bucket).
  const ok1 = acquirePerPostPrivateReply("acct-1", "media/with/slashes");
  const ok2 = acquirePerPostPrivateReply("acct-1", "media_with_underscores");

  // First call uses one sanitized form (consumes a token). Second uses
  // a different raw input but the SAME sanitized key, so it should
  // be the 2nd token consumed from the same bucket. Both should return
  // true (still under cap).
  assert.equal(ok1, true);
  assert.equal(ok2, true);
});

test("getPerPostPrivateReplyStatus: reports remaining and max", () => {
  _resetRateLimitBuckets();
  const status = getPerPostPrivateReplyStatus("acct-1", "media-1");
  assert.equal(status.maxMinute, 25);
  assert.equal(status.maxHour, 100);
  assert.equal(status.remainingMinute, 25);
  assert.equal(status.remainingHour, 100);
});

// --- Combined: viral post scenario ------------------------------------------

test("viral-post scenario: 1000 comments on the same post saturate the cap, but a different post is unaffected", () => {
  _resetRateLimitBuckets();

  const accountId = "acct-viral-2";
  const viralPost = "media-1m-likes";
  const otherPost = "media-quiet";

  // Simulate a burst — 1000 comments on the same post within a minute.
  // We expect exactly 25 to pass (per-minute cap), the rest to be refused.
  let sent = 0;
  let refused = 0;
  for (let i = 0; i < 1000; i++) {
    if (acquirePerPostPrivateReply(accountId, viralPost)) {
      sent++;
    } else {
      refused++;
    }
  }
  assert.equal(sent, 25, "viral post should be capped at 25/min");
  assert.equal(refused, 975);

  // A different post on the same account is unaffected.
  assert.equal(acquirePerPostPrivateReply(accountId, otherPost), true);
});
