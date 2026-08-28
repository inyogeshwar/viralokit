/**
 * Unit tests for lib/webhook-signature.ts
 *
 * Verifies HMAC-SHA256 signing/verification logic against the contract Meta
 * uses for Instagram webhook delivery. These tests use real Meta sample
 * payloads (anonymized) and exercise:
 *
 *   - valid signature round-trip
 *   - invalid signature rejection
 *   - missing / malformed signature header rejection
 *   - empty body / empty secret rejection
 *   - signature produced by a different secret fails
 *   - buffer vs string body equivalence
 *
 * Run with:    npm test
 * Or directly: node --import tsx --test tests/webhook-signature.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  signWebhookBody,
  verifyWebhookSignature,
} from "../lib/webhook-signature";

const TEST_SECRET = "test-app-secret-do-not-use-in-prod-12345";

const SAMPLE_DM_BODY = JSON.stringify({
  object: "instagram",
  entry: [
    {
      id: "17841405822304914",
      time: 1700000000,
      messaging: [
        {
          sender: { id: "1234567890" },
          recipient: { id: "17841405822304914" },
          timestamp: 1700000000,
          message: {
            mid: "m_abc123",
            text: "Hello, world!",
          },
        },
      ],
    },
  ],
});

const SAMPLE_COMMENT_BODY = JSON.stringify({
  object: "instagram",
  entry: [
    {
      id: "17841405822304914",
      time: 1700000000,
      changes: [
        {
          field: "comments",
          value: {
            id: "17890000000000001",
            text: "Great post!",
            from: { id: "9876543210", username: "tester" },
            media_id: "17880000000000001",
          },
        },
      ],
    },
  ],
});

test("verifyWebhookSignature: accepts a valid signature", () => {
  const signature = signWebhookBody(SAMPLE_DM_BODY, TEST_SECRET);
  assert.equal(verifyWebhookSignature(SAMPLE_DM_BODY, signature, TEST_SECRET), true);
});

test("verifyWebhookSignature: accepts a valid signature for a comment payload", () => {
  const signature = signWebhookBody(SAMPLE_COMMENT_BODY, TEST_SECRET);
  assert.equal(verifyWebhookSignature(SAMPLE_COMMENT_BODY, signature, TEST_SECRET), true);
});

test("verifyWebhookSignature: accepts Buffer body equivalently", () => {
  const signature = signWebhookBody(SAMPLE_DM_BODY, TEST_SECRET);
  assert.equal(
    verifyWebhookSignature(Buffer.from(SAMPLE_DM_BODY, "utf8"), signature, TEST_SECRET),
    true,
  );
});

test("verifyWebhookSignature: rejects a signature from a different secret", () => {
  const evilSignature = signWebhookBody(SAMPLE_DM_BODY, "attacker-secret");
  assert.equal(verifyWebhookSignature(SAMPLE_DM_BODY, evilSignature, TEST_SECRET), false);
});

test("verifyWebhookSignature: rejects when body is tampered", () => {
  const signature = signWebhookBody(SAMPLE_DM_BODY, TEST_SECRET);
  const tampered = SAMPLE_DM_BODY.replace("Hello, world!", "malicious payload");
  assert.equal(verifyWebhookSignature(tampered, signature, TEST_SECRET), false);
});

test("verifyWebhookSignature: rejects when signature is missing", () => {
  assert.equal(verifyWebhookSignature(SAMPLE_DM_BODY, null, TEST_SECRET), false);
  assert.equal(verifyWebhookSignature(SAMPLE_DM_BODY, undefined, TEST_SECRET), false);
  assert.equal(verifyWebhookSignature(SAMPLE_DM_BODY, "", TEST_SECRET), false);
});

test("verifyWebhookSignature: rejects malformed signature header", () => {
  assert.equal(
    verifyWebhookSignature(SAMPLE_DM_BODY, "no-prefix", TEST_SECRET),
    false,
  );
  assert.equal(
    verifyWebhookSignature(SAMPLE_DM_BODY, "sha1=abc", TEST_SECRET),
    false,
  );
  assert.equal(
    verifyWebhookSignature(SAMPLE_DM_BODY, "sha256=not-hex-zzz", TEST_SECRET),
    false,
  );
  // Wrong-length hex
  assert.equal(
    verifyWebhookSignature(SAMPLE_DM_BODY, "sha256=abcd", TEST_SECRET),
    false,
  );
});

test("verifyWebhookSignature: rejects when app secret is empty", () => {
  const signature = signWebhookBody(SAMPLE_DM_BODY, TEST_SECRET);
  assert.equal(verifyWebhookSignature(SAMPLE_DM_BODY, signature, ""), false);
});

test("verifyWebhookSignature: rejects when body is empty", () => {
  const signature = signWebhookBody("", TEST_SECRET);
  assert.equal(verifyWebhookSignature("", signature, TEST_SECRET), false);
  assert.equal(verifyWebhookSignature("", "sha256=anything", TEST_SECRET), false);
});

test("signWebhookBody: produces a `sha256=` prefixed hex digest", () => {
  const sig = signWebhookBody(SAMPLE_DM_BODY, TEST_SECRET);
  assert.match(sig, /^sha256=[0-9a-f]{64}$/);
});

test("signWebhookBody: is case-insensitive when verifying", () => {
  const sig = signWebhookBody(SAMPLE_DM_BODY, TEST_SECRET);
  const upperHex = sig.toUpperCase();
  assert.equal(verifyWebhookSignature(SAMPLE_DM_BODY, upperHex, TEST_SECRET), true);
});

test("signWebhookBody: different secrets produce different signatures", () => {
  const a = signWebhookBody(SAMPLE_DM_BODY, "secret-a");
  const b = signWebhookBody(SAMPLE_DM_BODY, "secret-b");
  assert.notEqual(a, b);
});

test("signWebhookBody: buffer and string body produce the same signature", () => {
  const fromString = signWebhookBody(SAMPLE_DM_BODY, TEST_SECRET);
  const fromBuffer = signWebhookBody(Buffer.from(SAMPLE_DM_BODY, "utf8"), TEST_SECRET);
  assert.equal(fromString, fromBuffer);
});

test("end-to-end: typical Meta X-Hub-Signature-256 header round-trips", () => {
  // Simulate what the Meta webhook delivery service would send.
  const body = SAMPLE_DM_BODY;
  const sig = signWebhookBody(body, TEST_SECRET);
  // Server side: pass through req.headers.get("x-hub-signature-256")
  // which may lowercase or preserve the header value. Verify both.
  assert.equal(verifyWebhookSignature(body, sig, TEST_SECRET), true);
  assert.equal(verifyWebhookSignature(body, sig.toLowerCase(), TEST_SECRET), true);
});
