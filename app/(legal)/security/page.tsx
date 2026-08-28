import { LAST_UPDATED, LEGAL_CONTACTS, PRODUCT_NAME } from "@/lib/legal";

export const metadata = {
  title: `Security · ${PRODUCT_NAME}`,
  description: `How we protect your data and how to report a vulnerability.`,
};

export default function SecurityPage() {
  return (
    <article className="prose prose-slate max-w-none dark:prose-invert">
      <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
      <h1>Security</h1>
      <p>
        Security is a baseline requirement at {PRODUCT_NAME}. This page
        describes the technical and organisational measures we have in place,
        and how you can report a vulnerability.
      </p>

      <h2>1. Encryption</h2>
      <ul>
        <li>All traffic is served over HTTPS with TLS 1.2+.</li>
        <li>OAuth access and refresh tokens for connected Instagram accounts are encrypted at rest with AES-256-GCM before being stored.</li>
        <li>Database connections use TLS in production.</li>
      </ul>

      <h2>2. Infrastructure</h2>
      <ul>
        <li>Application code is deployed on a managed platform with isolated build and runtime environments.</li>
        <li>Secrets are stored as environment variables and never committed to source control.</li>
        <li>Background jobs run with per-function isolation and per-account rate limits.</li>
      </ul>

      <h2>3. Your responsibilities</h2>
      <ul>
        <li>Use a strong, unique password for your {PRODUCT_NAME} account.</li>
        <li>Enable two-factor authentication on your connected Instagram account where available.</li>
        <li>Sign out of shared or public devices.</li>
        <li>Treat your dashboard as if it controls a public Instagram presence — it does.</li>
      </ul>

      <h2>4. Reporting a vulnerability</h2>
      <p>
        If you believe you have found a security issue, please email{" "}
        <a href={`mailto:${LEGAL_CONTACTS.security}`}>{LEGAL_CONTACTS.security}</a>{" "}
        with a clear description and a proof of concept. We aim to acknowledge
        within five business days. See our{" "}
        <a href="/responsible-disclosure">responsible disclosure policy</a> for
        scope and safe-harbour terms.
      </p>

      <h2>5. Certifications</h2>
      <p>
        {PRODUCT_NAME} does not currently hold a third-party security
        certification (such as SOC 2 or ISO 27001). We follow security
        best practices in our architecture and operations, and we will
        update this page if that changes.
      </p>
    </article>
  );
}
