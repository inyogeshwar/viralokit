import { AlertTriangle } from "lucide-react";

/**
 * Top-of-page banner on every legal page. Reminds reviewers (and the public)
 * that the policy is a draft pending professional legal review.
 */
export function LegalAuditBanner() {
  return (
    <div
      role="note"
      className="border-b border-amber-300/60 bg-amber-100/70 px-4 py-2 text-amber-900"
    >
      <div className="mx-auto flex max-w-4xl items-start gap-2 text-xs sm:text-sm">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          <strong>Draft for review.</strong> This page describes the current ViraloKit
          product. It has not yet been reviewed by a qualified legal professional.
          Information about the operating entity, contact channels, and jurisdiction
          is not yet final — please rely on the contact methods listed on this page
          for the most accurate support details.
        </p>
      </div>
    </div>
  );
}
