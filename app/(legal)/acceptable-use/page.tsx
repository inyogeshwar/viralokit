import { LAST_UPDATED, LEGAL_CONTACTS, PRODUCT_NAME } from "@/lib/legal";

export const metadata = {
  title: `Acceptable use · ${PRODUCT_NAME}`,
  description: `Rules and limits for using ${PRODUCT_NAME}.`,
};

export default function AcceptableUsePage() {
  return (
    <article className="prose prose-slate max-w-none dark:prose-invert">
      <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
      <h1>Acceptable use policy</h1>
      <p>
        This policy describes the rules that apply when you use {PRODUCT_NAME}.
        It supplements, and does not replace, our Terms of Service. By using the
        service you agree to follow these rules.
      </p>

      <h2>1. Your account</h2>
      <p>
        You are responsible for everything that happens under your account. Keep
        your password and connected Instagram credentials secure. Tell us
        immediately at{" "}
        <a href={`mailto:${LEGAL_CONTACTS.security}`}>{LEGAL_CONTACTS.security}</a>{" "}
        if you suspect unauthorised access.
      </p>

      <h2>2. Automation rules</h2>
      <ul>
        <li>Do not use the service to spam, harass, or impersonate others.</li>
        <li>Do not use the service to publish content that violates Instagram&apos;s Community Guidelines or Terms of Use.</li>
        <li>Respect rate limits. We throttle abusive clients automatically.</li>
        <li>Auto-replies must be clearly opt-in for the recipient where required by law.</li>
      </ul>

      <h2>3. Content uploads</h2>
      <p>
        You retain ownership of the content you upload. You confirm that you
        have the right to publish every caption, image, video, and audio file
        you submit, and that doing so does not infringe any third-party rights.
      </p>

      <h2>4. Prohibited content</h2>
      <p>
        You may not use {PRODUCT_NAME} to distribute content that is illegal,
        sexually explicit involving minors, hateful, violent, or that promotes
        self-harm. We will remove such content and may suspend the account.
      </p>

      <h2>5. Enforcement</h2>
      <p>
        We may, at our sole discretion, suspend or terminate access for
        violations of this policy. Where practical, we will warn you first and
        give you a chance to fix the issue. Serious violations may result in
        immediate suspension without notice.
      </p>
    </article>
  );
}
