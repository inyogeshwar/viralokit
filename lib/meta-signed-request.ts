/**
 * Parse and verify a Meta `signed_request` blob.
 *
 * Meta uses this for the Data Deletion Callback and a handful of
 * auth-related webhooks. The format is `<base64url-hmac-sha256>.<base64url-json>`.
 *
 * Verification:
 *   - HMAC-SHA256 the payload with the app secret
 *   - Compare against the provided signature using a constant-time
 *     compare
 *
 * Reference:
 *   https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */

import crypto from "node:crypto";

export interface ParsedSignedRequest {
  user_id: string;
  algorithm?: string;
  issued_at?: number;
}

/**
 * @param signedRequest The full `signed_request` value from Meta
 * @param appSecret  Your Meta app secret. When `null` (e.g. dev / mock
 *   mode) the signature is NOT verified and the payload is parsed as-is.
 * @returns The parsed JSON payload, or `null` if the format is wrong
 *   or the signature fails verification.
 */
export function parseSignedRequest(
  signedRequest: string,
  appSecret: string | null | undefined,
): ParsedSignedRequest | null {
  const parts = signedRequest.split(".");
  if (parts.length !== 2) return null;
  const [encodedSig, encodedPayload] = parts;

  if (!appSecret) {
    try {
      const json = JSON.parse(
        Buffer.from(encodedPayload, "base64url").toString("utf8"),
      );
      return json as ParsedSignedRequest;
    } catch {
      return null;
    }
  }

  let expectedSig: Buffer;
  try {
    expectedSig = crypto
      .createHmac("sha256", appSecret)
      .update(encodedPayload)
      .digest();
  } catch {
    return null;
  }

  let providedSig: Buffer;
  try {
    providedSig = Buffer.from(encodedSig, "base64url");
  } catch {
    return null;
  }

  if (providedSig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(providedSig, expectedSig)) return null;

  try {
    const json = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
    return json as ParsedSignedRequest;
  } catch {
    return null;
  }
}

/** Generate a short URL-safe random confirmation code for the deletion
 *  callback. Meta's documentation calls for a string the user can use
 *  to check the deletion status. */
export function generateConfirmationCode(): string {
  return crypto.randomBytes(18).toString("base64url");
}
