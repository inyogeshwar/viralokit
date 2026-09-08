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
 * Validate that an external URL is safe for server-side fetching (SSRF protection).
 * Rejects private networks, loopbacks, link-local addresses, and cloud metadata APIs.
 */
export function isSafePublicUrl(urlString: string): boolean {
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

    // 3. Reject IPv4 loopback, private subnets, link-local, and cloud metadata
    // RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
    // Loopback: 127.0.0.0/8
    // Link-local: 169.254.0.0/16 (includes 169.254.169.254 AWS/GCP metadata)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    if (match) {
      const o1 = parseInt(match[1], 10);
      const o2 = parseInt(match[2], 10);

      if (o1 === 127) return false; // Loopback
      if (o1 === 10) return false; // 10.0.0.0/8
      if (o1 === 172 && o2 >= 16 && o2 <= 31) return false; // 172.16.0.0/12
      if (o1 === 192 && o2 === 168) return false; // 192.168.0.0/16
      if (o1 === 169 && o2 === 254) return false; // 169.254.0.0/16 (Metadata)
      if (o1 === 0) return false; // 0.0.0.0
    }

    // 4. Reject IPv6 loopbacks and local scopes
    if (hostname.includes(":") || hostname === "[::1]") {
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
