/**
 * Phase 5 — Audit, error handling, and data-deletion tests.
 *
 * Covers:
 *   1. classifyMetaError (token / rate limit / permission / parameter / not_found / unknown)
 *   2. InstagramError.isTokenExpired() / isRateLimited() / category
 *   3. parseSignedRequest (valid signature, missing secret, bad signature, malformed)
 *   4. generateConfirmationCode uniqueness
 *   5. hasUnhealthyAccount aggregator
 */

import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import {
  META_ERROR_CODES,
  classifyMetaError,
  InstagramError,
} from "../lib/providers/instagram";
import {
  parseSignedRequest,
  generateConfirmationCode,
} from "../lib/meta-signed-request";
import {
  hasUnhealthyAccount,
  _resetAccountHealthCache,
} from "../lib/social-account-status";

// --- classifyMetaError -------------------------------------------------------

test("classifyMetaError maps known codes to categories", () => {
  assert.equal(classifyMetaError(102 as number), "token_expired");
  assert.equal(classifyMetaError(190 as number), "token_expired");
  assert.equal(classifyMetaError(4 as number), "rate_limited");
  assert.equal(classifyMetaError(32 as number), "rate_limited");
  assert.equal(classifyMetaError(200 as number), "permission_denied");
  assert.equal(classifyMetaError(100 as number), "parameter");
  assert.equal(classifyMetaError(803 as number), "not_found");
  assert.equal(classifyMetaError(99999 as number), "unknown");
  assert.equal(classifyMetaError(undefined), "unknown");
  assert.equal(classifyMetaError("not-a-number"), "unknown");
});

test("META_ERROR_CODES exposes the documented Meta error codes", () => {
  // Reference: https://developers.facebook.com/docs/instagram-api/reference/error-codes
  assert.equal(META_ERROR_CODES.SESSION_INVALID, 102);
  assert.equal(META_ERROR_CODES.RATE_LIMITED, 4);
  assert.equal(META_ERROR_CODES.APP_RATE_LIMITED, 32);
  assert.equal(META_ERROR_CODES.INVALID_OAUTH, 190);
  assert.equal(META_ERROR_CODES.PERMISSION_DENIED, 200);
  assert.equal(META_ERROR_CODES.PARAMETER, 100);
  assert.equal(META_ERROR_CODES.INVALID_ID, 803);
});

// --- InstagramError predicates ----------------------------------------------

test("InstagramError.isTokenExpired() true for 102/190; false otherwise", () => {
  const expired102 = new InstagramError(102, "session");
  const expired190 = new InstagramError(190, "oauth");
  const other = new InstagramError(4, "rate");
  assert.equal(expired102.isTokenExpired(), true);
  assert.equal(expired190.isTokenExpired(), true);
  assert.equal(other.isTokenExpired(), false);
  assert.equal(other.isRateLimited(), true);
});

test("InstagramError.isRateLimited() true for 4/32", () => {
  assert.equal(new InstagramError(4, "rate").isRateLimited(), true);
  assert.equal(new InstagramError(32, "app rate").isRateLimited(), true);
  assert.equal(new InstagramError(190, "oauth").isRateLimited(), false);
});

test("InstagramError.category reflects classifyMetaError()", () => {
  assert.equal(new InstagramError(190, "x").category, "token_expired");
  assert.equal(new InstagramError(4, "x").category, "rate_limited");
  assert.equal(new InstagramError(200, "x").category, "permission_denied");
  assert.equal(new InstagramError(100, "x").category, "parameter");
  assert.equal(new InstagramError(803, "x").category, "not_found");
  assert.equal(new InstagramError(undefined as unknown as number, "x").category, "unknown");
});

// --- parseSignedRequest ------------------------------------------------------

const APP_SECRET = "test_app_secret_xyz";

function makeSignedRequest(payload: object, secret: string) {
  const json = JSON.stringify(payload);
  const encodedPayload = Buffer.from(json, "utf8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
  return `${sig}.${encodedPayload}`;
}

test("parseSignedRequest verifies a valid signature", () => {
  const signed = makeSignedRequest(
    { user_id: "IGSID_123", algorithm: "HMAC-SHA256", issued_at: 1700000000 },
    APP_SECRET,
  );
  const parsed = parseSignedRequest(signed, APP_SECRET);
  assert.ok(parsed);
  assert.equal(parsed.user_id, "IGSID_123");
  assert.equal(parsed.algorithm, "HMAC-SHA256");
});

test("parseSignedRequest rejects a tampered signature", () => {
  const signed = makeSignedRequest(
    { user_id: "IGSID_123" },
    APP_SECRET,
  );
  // Flip a single character in the signature portion.
  const [sig, payload] = signed.split(".");
  const tampered = `${sig.slice(0, -1)}${sig.endsWith("a") ? "b" : "a"}.${payload}`;
  const parsed = parseSignedRequest(tampered, APP_SECRET);
  assert.equal(parsed, null);
});

test("parseSignedRequest rejects the wrong secret", () => {
  const signed = makeSignedRequest({ user_id: "x" }, APP_SECRET);
  const parsed = parseSignedRequest(signed, "different_secret");
  assert.equal(parsed, null);
});

test("parseSignedRequest accepts unverified payload in mock mode (no secret)", () => {
  const signed = makeSignedRequest({ user_id: "mock_user" }, "anything");
  const parsed = parseSignedRequest(signed, null);
  assert.ok(parsed);
  assert.equal(parsed.user_id, "mock_user");
});

test("parseSignedRequest returns null on malformed input", () => {
  assert.equal(parseSignedRequest("", APP_SECRET), null);
  assert.equal(parseSignedRequest("not-a-signed-request", APP_SECRET), null);
  assert.equal(parseSignedRequest("abc", APP_SECRET), null);
  assert.equal(parseSignedRequest("abc.def.ghi", APP_SECRET), null);
});

test("parseSignedRequest returns null when payload isn't valid JSON", () => {
  const garbage = "sig.%%not-base64%%";
  const parsed = parseSignedRequest(garbage, null);
  assert.equal(parsed, null);
});

// --- generateConfirmationCode -----------------------------------------------

test("generateConfirmationCode returns URL-safe random strings", () => {
  const a = generateConfirmationCode();
  const b = generateConfirmationCode();
  assert.ok(a.length > 0);
  assert.notEqual(a, b, "codes should not collide");
  assert.match(a, /^[A-Za-z0-9_-]+$/);
  assert.match(b, /^[A-Za-z0-9_-]+$/);
});

test("generateConfirmationCode is unique across many calls", () => {
  const codes = new Set<string>();
  for (let i = 0; i < 100; i++) codes.add(generateConfirmationCode());
  assert.equal(codes.size, 100, "expected 100 unique confirmation codes");
});

// --- hasUnhealthyAccount aggregator -----------------------------------------

test("hasUnhealthyAccount returns true for any non-ok account", () => {
  _resetAccountHealthCache();
  assert.equal(hasUnhealthyAccount([]), false);
  assert.equal(
    hasUnhealthyAccount([
      { accountId: "1", igUserId: "1", username: "u", health: "ok" },
    ]),
    false,
  );
  assert.equal(
    hasUnhealthyAccount([
      { accountId: "1", igUserId: "1", username: "u", health: "ok" },
      { accountId: "2", igUserId: "2", username: "v", health: "expired" },
    ]),
    true,
  );
});
