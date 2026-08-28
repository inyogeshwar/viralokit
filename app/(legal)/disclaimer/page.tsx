import type { Metadata } from "next";

import { LAST_UPDATED, LEGAL_CONTACTS, PRODUCT_NAME } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Disclaimer — ViraloKit",
  description: "Disclaimer for ViraloKit — important limits of liability and AI output.",
};

export default function DisclaimerPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>Disclaimer</h1>
      <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <h2>1. General information</h2>
      <p>
        The information and services provided by {PRODUCT_NAME} (&quot;the Service&quot;) are
        for general informational and operational purposes only. We make no warranties about
        the completeness, reliability, or accuracy of this information. Any action you take
        based on the Service is strictly at your own risk.
      </p>

      <h2>2. AI-generated content</h2>
      <p>
        The Service uses third-party artificial intelligence models (currently Google Gemini)
        to generate captions, hashtags, and content suggestions. AI-generated output may be
        inaccurate, biased, or unsuitable for your audience. You are solely responsible for
        reviewing AI-generated content before publishing it to your social media accounts.
      </p>

      <h2>3. Third-party services</h2>
      <p>
        The Service depends on third-party platforms including but not limited to Meta
        (Instagram), Cloudinary, Google Gemini, Neon, Clerk, and Vercel. We are not
        responsible for downtime, policy changes, or actions taken by these third parties
        that affect your use of the Service.
      </p>

      <h2>4. No professional advice</h2>
      <p>
        {PRODUCT_NAME} does not provide legal, financial, medical, or other professional
        advice. Any content generated or suggested by the Service is for informational
        purposes only and should not be relied on as a substitute for advice from a
        qualified professional.
      </p>

      <h2>5. Service availability</h2>
      <p>
        We strive for high availability but do not guarantee uninterrupted access. Features,
        APIs, and third-party integrations may change, break, or be deprecated with or
        without notice.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, {PRODUCT_NAME}, its operators, and
        contributors will not be liable for any indirect, incidental, special, or
        consequential damages arising from your use of the Service.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about this disclaimer? Email{" "}
        <a href={`mailto:${LEGAL_CONTACTS.legal}`}>{LEGAL_CONTACTS.legal}</a>.
      </p>
    </article>
  );
}
