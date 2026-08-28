import crypto from "node:crypto";

/**
 * Verifies the `X-Hub-Signature-256` header from a Meta webhook payload.
 *
 * Meta signs every webhook POST body with HMAC-SHA256 using the App Secret
 * from the Meta App dashboard. The signature is sent as:
 *
 *   X-Hub-Signature-256: sha256=<hex-digest>
 *
 * The body MUST be the raw, unparsed request body — JSON.parse followed by
 * JSON.stringify will not produce the same byte sequence and verification
 * will fail.
 *
 * Reference:
 *   https://developers.facebook.com/documentation/business-messaging/instagram-messaging/webhooks
 *
 * @param rawBody   The exact bytes Meta sent in the request body.
 * @param header    The full `X-Hub-Signature-256` header value (or null/undefined).
 * @param appSecret The META_APP_SECRET configured in the Meta App dashboard.
 * @returns `true` if the signature is valid, `false` otherwise (including when
 *          the header is missing, malformed, or computed against a different
 *          secret).
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  header: string | null | undefined,
  appSecret: string,
): boolean {
  if (!appSecret) return false;
  if (!header || typeof header !== "string") return false;
  if (!rawBody) return false;

  // Header format: "sha256=<hex>" — accept any case for the prefix.
  const trimmed = header.trim().toLowerCase();
  if (!trimmed.startsWith("sha256=")) return false;
  const provided = trimmed.slice("sha256=".length).trim();
  if (!provided || !/^[0-9a-f]+$/.test(provided)) return false;

  const body =
    typeof rawBody === "string"
      ? Buffer.from(rawBody, "utf8")
      : rawBody;

  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(body)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks.
  // crypto.timingSafeEqual requires equal-length buffers, so guard length.
  if (provided.length !== expected.length) return false;
  const providedBuf = Buffer.from(provided, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * Convenience helper for testing — produces the exact `X-Hub-Signature-256`
 * header value Meta would send for a given body and secret.
 */
export function signWebhookBody(
  rawBody: string | Buffer,
  appSecret: string,
): string {
  const body =
    typeof rawBody === "string"
      ? Buffer.from(rawBody, "utf8")
      : rawBody;
  const digest = crypto
    .createHmac("sha256", appSecret)
    .update(body)
    .digest("hex");
  return `sha256=${digest}`;
}
