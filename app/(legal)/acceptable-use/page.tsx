import type { Metadata } from "next";

import { LAST_UPDATED, LEGAL_CONTACTS, PRODUCT_NAME } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Acceptable Use Policy — ViraloKit",
  description: `Acceptable Use Policy for ${PRODUCT_NAME}.`,
};

export default function AcceptableUsePage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>Acceptable Use Policy</h1>
      <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <p>
        This Acceptable Use Policy (&quot;AUP&quot;) describes the rules for using {PRODUCT_NAME}.
        It forms part of our Terms of Service. By using the Service you agree to follow this AUP.
      </p>

      <h2>1. You may not use the Service to</h2>
      <ul>
        <li>Send spam, unsolicited bulk messages, or repetitive content on Instagram (DMs or comments)</li>
        <li>Harass, bully, threaten, or harm any person</li>
        <li>Distribute malware, phishing links, or other harmful content</li>
        <li>Publish or promote content that is illegal in your jurisdiction</li>
        <li>Misrepresent your identity or impersonate any other person or brand</li>
        <li>Scrape, crawl, or attempt to extract data from the Service other than via official APIs</li>
        <li>Bypass, circumvent, or attempt to circumvent rate limits or other technical safeguards</li>
        <li>Reverse engineer, decompile, or otherwise attempt to derive source code from the Service</li>
        <li>Resell, sublicense, or commercially redistribute the Service without written permission</li>
        <li>Use automation on Instagram in ways that violate Meta&apos;s Platform Terms or Automation Guidelines</li>
      </ul>

      <h2>2. Automation rules</h2>
      <p>
        The Service lets you configure automatic replies to Instagram direct messages and
        comments. When using these features you must:
      </p>
      <ul>
        <li>Only automate replies on Instagram accounts you legitimately own or operate</li>
        <li>Ensure that automated replies do not violate Meta&apos;s Messaging Policy (including the 24-hour response window rule for human-agent messages)</li>
        <li>Provide a way for recipients to opt out of automated messages where required by local law</li>
        <li>Not use automation to send promotional messages outside of compliant templates</li>
      </ul>

      <h2>3. Content you upload</h2>
      <p>
        You are responsible for all content (images, videos, captions, hashtags) that you
        upload, schedule, or publish through the Service. You confirm that you have the
        right to use and publish such content, and that it does not violate the rights of
        any third party or any applicable law.
      </p>

      <h2>4. Enforcement</h2>
      <p>
        We may investigate suspected violations of this AUP. If we determine (in our reasonable
        judgment) that a violation has occurred, we may suspend or terminate the affected
        accounts, remove offending content, or take other steps we consider appropriate.
      </p>

      <h2>5. Reporting a violation</h2>
      <p>
        If you believe a user is violating this AUP, please report it to{" "}
        <a href={`mailto:${LEGAL_CONTACTS.general}`}>{LEGAL_CONTACTS.general}</a> with
        the account, post, or message in question and a brief description of the issue.
      </p>
    </article>
  );
}
