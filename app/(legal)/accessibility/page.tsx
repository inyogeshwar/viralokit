import type { Metadata } from "next";

import { LAST_UPDATED, LEGAL_CONTACTS, PRODUCT_NAME } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Accessibility — ViraloKit",
  description: `Accessibility statement for ${PRODUCT_NAME}.`,
};

export default function AccessibilityPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>Accessibility Statement</h1>
      <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <h2>1. Our commitment</h2>
      <p>
        {PRODUCT_NAME} aims to make its web application usable by as many people as possible,
        including people with disabilities. We follow the Web Content Accessibility Guidelines
        (WCAG) 2.2 as a design reference, with a focus on perceivable, operable, understandable,
        and robust content.
      </p>

      <h2>2. Current state</h2>
      <p>
        As of the date above, we have implemented the following accessibility practices:
      </p>
      <ul>
        <li>Semantic HTML (headings, landmarks, lists, buttons) throughout the app</li>
        <li>Keyboard-navigable forms, dialogs, and drag-and-drop calendar (with keyboard fallbacks)</li>
        <li>Visible focus indicators on interactive elements</li>
        <li>Color contrast that meets at least AA contrast ratio for body text</li>
        <li>Respect for the <code>prefers-reduced-motion</code> media query for animations</li>
        <li>Light and dark themes, with the user&apos;s preference respected on every page</li>
        <li>Alternative text for meaningful images and icons</li>
        <li>Status messages announced via <code>aria-live</code> for loading, error, and success states</li>
      </ul>

      <h2>3. Known limitations</h2>
      <p>
        We have <strong>not</strong> commissioned a formal third-party accessibility audit.
        Some content may not yet meet the full WCAG 2.2 AA standard. Known gaps include:
      </p>
      <ul>
        <li>Drag-and-drop interactions on the calendar currently rely on pointer events; a keyboard reorder shortcut is planned</li>
        <li>Some third-party embedded components (Clerk sign-in, Instagram previews) may not match our full accessibility targets</li>
      </ul>

      <h2>4. Conformance claim</h2>
      <p>
        We do <strong>not</strong> claim full WCAG 2.2 AA conformance. This statement is a
        description of our current practices and ongoing work, not a formal certification.
      </p>

      <h2>5. Reporting an accessibility issue</h2>
      <p>
        If you encounter a barrier or have a suggestion for improving accessibility, please
        email us at{" "}
        <a href={`mailto:${LEGAL_CONTACTS.general}`}>{LEGAL_CONTACTS.general}</a> with the
        page URL, a description of the issue, and (if helpful) the assistive technology and
        browser you are using. We will respond as soon as we can.
      </p>

      <h2>6. Feedback</h2>
      <p>
        We review accessibility feedback as part of our regular product updates. Thank you
        for helping us improve.
      </p>
    </article>
  );
}
