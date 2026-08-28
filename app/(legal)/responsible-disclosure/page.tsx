import type { Metadata } from "next";

import { LAST_UPDATED, LEGAL_CONTACTS, PRODUCT_NAME } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Responsible Disclosure — ViraloKit",
  description: `How to report a security vulnerability to ${PRODUCT_NAME}.`,
};

export default function ResponsibleDisclosurePage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>Responsible Disclosure</h1>
      <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <p>
        We welcome reports from independent security researchers and from our users. If
        you have found a vulnerability in {PRODUCT_NAME}, please contact us before
        disclosing it publicly so we can investigate and fix the issue.
      </p>

      <h2>1. How to report</h2>
      <p>
        Email <a href={`mailto:${LEGAL_CONTACTS.security}`}>{LEGAL_CONTACTS.security}</a>{" "}
        with:
      </p>
      <ul>
        <li>A clear description of the issue and its impact</li>
        <li>Steps to reproduce (proof-of-concept code or screenshots are very helpful)</li>
        <li>The URL, component, or API endpoint affected</li>
        <li>Your name and how you would like to be credited (or &quot;anonymous&quot;)</li>
      </ul>
      <p>
        We will acknowledge new reports within <strong>5 business days</strong>.
      </p>

      <h2>2. Scope</h2>
      <p>The following are in scope:</p>
      <ul>
        <li>Authentication, authorization, or session-handling defects in {PRODUCT_NAME}</li>
        <li>Cross-tenant data exposure (one user seeing another user&apos;s data)</li>
        <li>Server-side request forgery, SQL injection, or other injection vulnerabilities</li>
        <li>Cross-site scripting (XSS) that bypasses our sanitization</li>
        <li>Secrets, keys, or credentials that are exposed by the deployed app</li>
      </ul>
      <p>The following are <strong>not</strong> in scope:</p>
      <ul>
        <li>Issues in third-party services (Vercel, Clerk, Cloudinary, Neon, Meta, Google) — please report those to the third party</li>
        <li>Vulnerabilities that require physical access to a user&apos;s device</li>
        <li>Self-XSS or content the user themself can inject into their own account</li>
        <li>Rate limiting that is below industry norms but does not enable abuse</li>
        <li>Missing security headers on non-production environments</li>
      </ul>

      <h2>3. What to avoid</h2>
      <ul>
        <li>Do not access, modify, retain, or transfer data that does not belong to you</li>
        <li>Do not degrade the Service for other users</li>
        <li>Do not use social engineering against our staff or users</li>
        <li>Do not publicly disclose the issue until we have either shipped a fix or agreed on a coordinated disclosure date</li>
      </ul>

      <h2>4. Safe harbour</h2>
      <p>
        We will not pursue legal action against researchers who, in good faith, follow
        this Responsible Disclosure policy. We consider such research to be authorized
        access for the purpose of applicable computer-misuse laws.
      </p>

      <h2>5. Recognition</h2>
      <p>
        We maintain an internal list of researchers who have helped us improve. With your
        permission, we will credit you when an issue is fixed.
      </p>
    </article>
  );
}
