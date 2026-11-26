/**
 * Production Security & Sanitization Utilities
 * 
 * - Prompt injection defensive filtering for LLM requests
 * - Server-Side Request Forgery (SSRF) URL validation
 * - Sanitized API error response helper
 */

/**
 * Sanitize user input before interpolating into LLM prompts.
 * Strips known injection markers, control characters, and enforces strict length caps.
 */
export function sanitizePromptInput(input: unknown, maxLength = 1000): string {
  if (typeof input !== "string") {
    return "";
  }

  // 1. Enforce length cap
  let sanitized = input.slice(0, maxLength);

  // 2. Remove null bytes and non-printable control characters (except newline, tab, carriage return)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 3. Neutralize common prompt injection delimiter overrides
  const injectionPatterns = [
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /<<SYS>>/gi,
    /<\/SYS>>/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
    /system\s*:\s*/gi,
    /human\s*:\s*/gi,
    /assistant\s*:\s*/gi,
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
    /disregard\s+(all\s+)?(previous|prior)\s+instructions/gi,
  ];

  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, "[filtered]");
  }

  return sanitized.trim();
}

/**
 * Returns true for private, loopback, link-local, metadata or unspecified addresses.
 * Shared by literal IPs and DNS results so hostnames resolving internally are rejected.
 */
function isForbiddenAddress(address: string): boolean {
  const ip = address.toLowerCase().replace(/^\[|\]$/g, "");

  if (ip === "::1" || ip === "::" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) {
    return true;
  }

  const parts = ip.split(".");
  if (parts.length !== 4 || parts.some((p) => !/^\d+$/.test(p))) return false;

  const [o1, o2] = parts.map(Number);
  return (
    o1 === 0 ||
    o1 === 127 ||
    o1 === 10 ||
    (o1 === 172 && o2 >= 16 && o2 <= 31) ||
    (o1 === 192 && o2 === 168) ||
    (o1 === 169 && o2 === 254) ||
    o1 >= 224
  );
}

/**
 * Validate that an external URL is safe for server-side fetching (SSRF protection).
 * Rejects private networks, loopbacks, link-local addresses, and cloud metadata APIs.
 * Resolves DNS names and validates every returned address to limit rebinding risk.
 */
export async function isSafePublicUrl(urlString: string): Promise<boolean> {
  try {
    const parsed = new URL(urlString);

    // 1. Enforce HTTPS only
    if (parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // 2. Reject localhost and local domain names
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".lan")
    ) {
      return false;
    }

    // 3. Literal IP addresses
    if (isForbiddenAddress(hostname)) return false;

    // 4. Resolve DNS names and reject if any answer is internal.
    const { lookup } = await import("node:dns/promises");
    const addresses = await lookup(hostname, { all: true });
    if (!addresses.length || addresses.some((a) => isForbiddenAddress(a.address))) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Return a safe error message without exposing database schema, internal file paths, or stack traces.
 */
export function sanitizeErrorMessage(err: unknown, fallbackMessage = "An unexpected error occurred."): string {
  if (!err) return fallbackMessage;

  const rawMessage = typeof err === "object" && err !== null && "message" in err
    ? String((err as any).message)
    : String(err);

  // In production, mask database connection strings, paths, and internal stack keywords
  const sensitivePatterns = [
    /postgresql:\/\//i,
    /ep-.*\.aws\.neon\.tech/i,
    /password=/i,
    /select .* from/i,
    /syntax error at or near/i,
    /relation .* does not exist/i,
    /node_modules/i,
    /webpack-internal/i,
    /at (async )?(\w|\.|\/|\\)+:\d+:\d+/i,
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(rawMessage)) {
      return fallbackMessage;
    }
  }

  // If the message is safe and reasonably short, return it
  if (rawMessage.length > 0 && rawMessage.length < 200) {
    return rawMessage;
  }

  return fallbackMessage;
}
