import type { Metadata } from "next";

import { LAST_UPDATED, LEGAL_CONTACTS, PRODUCT_NAME } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Security — ViraloKit",
  description: `Security practices for ${PRODUCT_NAME}.`,
};

export default function SecurityPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>Security</h1>
      <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <h2>1. How we protect your data</h2>
      <ul>
        <li>
          <strong>Encryption at rest:</strong> Instagram access tokens are encrypted using
          AES-256-GCM before they are written to the database. The encryption key is read
          only from a server-side environment variable and is never sent to the client.
        </li>
        <li>
          <strong>Encryption in transit:</strong> All traffic to and from the Service is
          served over HTTPS/TLS. Database connections use SSL/TLS.
        </li>
        <li>
          <strong>Authentication:</strong> Sign-in and session management are handled by
          Clerk, an established identity provider that supports multi-factor authentication,
          session timeouts, and device management.
        </li>
        <li>
          <strong>Authorization:</strong> Every authenticated API route verifies the
          caller&apos;s identity and the workspace they belong to before returning data.
        </li>
        <li>
          <strong>Rate limiting:</strong> Per-account rate limits are enforced before
          calling the Instagram API, to keep usage within Meta&apos;s quotas.
        </li>
        <li>
          <strong>Error monitoring:</strong> Unhandled errors are reported to Sentry so we
          can investigate and fix them. Error payloads are sanitized to avoid leaking
          secrets.
        </li>
      </ul>

      <h2>2. Infrastructure</h2>
      <p>
        The Service is hosted on Vercel (serverless runtime) and uses Neon (managed
        PostgreSQL) and Cloudinary (media storage) as managed third-party providers.
      </p>

      <h2>3. Your responsibilities</h2>
      <ul>
        <li>Keep your sign-in credentials secure and enable two-factor authentication where possible</li>
        <li>Use a strong, unique password for your {PRODUCT_NAME} account</li>
        <li>Revoke access to any Instagram account you no longer want managed by the Service</li>
        <li>Do not share account access with people you do not trust</li>
      </ul>

      <h2>4. Reporting a security issue</h2>
      <p>
        If you have found a security vulnerability in the Service, please report it
        privately to{" "}
        <a href={`mailto:${LEGAL_CONTACTS.security}`}>{LEGAL_CONTACTS.security}</a>.
        See our <a href="/responsible-disclosure">Responsible Disclosure</a> page for
        scope, safe-harbour, and how we handle reports.
      </p>

      <h2>5. What we will not do</h2>
      <p>
        We will not request your password, recovery codes, or Instagram credentials by
        email. If you receive a message asking for these, treat it as suspicious.
      </p>

      <h2>6. No certifications claimed</h2>
      <p>
        {PRODUCT_NAME} has not been audited under SOC 2, ISO 27001, PCI-DSS, HIPAA, or
        similar third-party security certification programs. The controls described above
        describe our current practices, not a formal certification.
      </p>
    </article>
  );
}
