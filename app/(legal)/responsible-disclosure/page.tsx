import { LAST_UPDATED, LEGAL_CONTACTS, PRODUCT_NAME } from "@/lib/legal";

export const metadata = {
  title: `Responsible disclosure · ${PRODUCT_NAME}`,
  description: `How to report a vulnerability to ${PRODUCT_NAME} safely.`,
};

export default function ResponsibleDisclosurePage() {
  return (
    <article className="prose prose-slate max-w-none dark:prose-invert">
      <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
      <h1>Responsible disclosure policy</h1>
      <p>
        We welcome reports from security researchers and the wider community.
        If you believe you have found a security issue affecting {PRODUCT_NAME},
        please tell us so we can fix it quickly and credit your work.
      </p>

      <h2>1. How to report</h2>
      <p>
        Email{" "}
        <a href={`mailto:${LEGAL_CONTACTS.security}`}>{LEGAL_CONTACTS.security}</a>{" "}
        with the subject line starting with &quot;Security&quot;. Include a clear
        description, the steps to reproduce, the impact, and any proof-of-concept
        material. We will reply within five business days.
      </p>

      <h2>2. What to avoid</h2>
      <ul>
        <li>Do not exploit a vulnerability beyond what is necessary to demonstrate it.</li>
        <li>Do not access, modify, retain, or transfer other users&apos; data.</li>
        <li>Do not degrade the service, including denial-of-service testing.</li>
        <li>Do not publicly disclose the issue until we have had a reasonable opportunity to fix it.</li>
      </ul>

      <h2>3. Scope</h2>
      <p>
        In scope: any {PRODUCT_NAME} domain, our APIs, our authenticated
        dashboard, and our mobile-friendly web experience. Out of scope: third
        party providers (for example, Instagram or our hosting platform) — please
        report those issues to the responsible vendor.
      </p>

      <h2>4. Safe harbour</h2>
      <p>
        We will not pursue legal action against researchers who, in good faith,
        follow this policy. We consider research conducted under these terms to
        be authorised access for the purposes of the Computer Fraud and Abuse
        Act and similar laws.
      </p>

      <h2>5. Recognition</h2>
      <p>
        With your permission, we will credit you on a future security hall of
        fame page. We do not currently operate a paid bug-bounty programme.
      </p>
    </article>
  );
}
