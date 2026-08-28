import { LAST_UPDATED, LEGAL_CONTACTS, PRODUCT_NAME } from "@/lib/legal";

export const metadata = {
  title: `Accessibility · ${PRODUCT_NAME}`,
  description: `Our commitment to accessibility and how to report issues.`,
};

export default function AccessibilityPage() {
  return (
    <article className="prose prose-slate max-w-none dark:prose-invert">
      <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
      <h1>Accessibility</h1>
      <p>
        {PRODUCT_NAME} is committed to making the service usable by people of all
        abilities. We follow accessibility best practices in our design and code,
        and we test for keyboard navigation, screen reader compatibility, and
        sufficient color contrast.
      </p>

      <h2>1. Current state</h2>
      <p>
        We have built the service using semantic HTML, labelled form fields,
        visible focus indicators, and reduced-motion-friendly animations.
        Loading states announce their status to assistive technology, and
        errors are described in plain language.
      </p>

      <h2>2. Known limitations</h2>
      <ul>
        <li>Some third-party embeds (for example, the Instagram oEmbed preview) may not be fully accessible.</li>
        <li>Drag-and-drop reordering in the calendar has a keyboard fallback, but the experience is best with a pointer.</li>
        <li>Auto-playing media is disabled by default, but previews may still surface motion.</li>
      </ul>

      <h2>3. Conformance</h2>
      <p>
        We design against the Web Content Accessibility Guidelines (WCAG) 2.2
        Level AA as a target, but we do not currently make a formal conformance
        claim. We will publish a Voluntary Product Accessibility Template (VPAT)
        once the dashboard is audited end-to-end by a third party.
      </p>

      <h2>4. Reporting an issue</h2>
      <p>
        If you encounter a barrier using {PRODUCT_NAME}, please tell us so we can
        fix it. Include the page, the assistive technology you&apos;re using, and
        what happened. We aim to acknowledge reports within five business days.
        Email{" "}
        <a href={`mailto:${LEGAL_CONTACTS.general}`}>{LEGAL_CONTACTS.general}</a>{" "}
        with the subject line starting with &quot;Accessibility&quot;.
      </p>

      <h2>5. Feedback</h2>
      <p>
        We&apos;d love to hear what works and what doesn&apos;t. Reach us at{" "}
        <a href={`mailto:${LEGAL_CONTACTS.feedback}`}>{LEGAL_CONTACTS.feedback}</a>.
      </p>
    </article>
  );
}
