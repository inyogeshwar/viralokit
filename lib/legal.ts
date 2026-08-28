/**
 * Single source of truth for legal-page constants.
 * Keeps effective dates and contact details consistent across pages.
 *
 * NOTE: These values are placeholders pending the operating entity
 * disclosure. See docs/PRODUCTION_PAGE_AUDIT.md → "Items the user
 * must answer before any legal page can be considered 'final'".
 */

export const LAST_UPDATED = "August 28, 2026";

export const LEGAL_CONTACTS = {
  general: "support@viralo-kit.app",
  privacy: "privacy@viralo-kit.app",
  legal: "legal@viralo-kit.app",
  billing: "billing@viralo-kit.app",
  security: "security@viralo-kit.app",
  business: "hello@viralo-kit.app",
  feedback: "feedback@viralo-kit.app",
} as const;

export const PRODUCT_NAME = "ViraloKit";
export const MIN_AGE = 13;
