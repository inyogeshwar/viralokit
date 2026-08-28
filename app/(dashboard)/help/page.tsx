import Link from "next/link";
import {
  HelpCircle,
  BookOpen,
  Sparkles,
  Mail,
  Code2,
  Compass,
  Calendar,
  PenSquare,
  MessageCircle,
  Zap,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LEGAL_CONTACTS, PRODUCT_NAME } from "@/lib/legal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Help center · ${PRODUCT_NAME}`,
  description: "Guides, FAQ, and ways to get in touch.",
};

type Faq = { q: string; a: string };

const FAQ: { section: string; items: Faq[] }[] = [
  {
    section: "Getting started",
    items: [
      {
        q: "How do I connect an Instagram account?",
        a: "Open Accounts in the dashboard, click \"Connect account\", and complete the Instagram authorization flow. We only request the permissions we need to publish on your behalf.",
      },
      {
        q: "Do you support personal Instagram accounts?",
        a: "We support Instagram Business and Creator accounts. Personal accounts aren't supported by the Instagram Graph API for publishing — switch your account type in the Instagram app if needed.",
      },
    ],
  },
  {
    section: "Daily use",
    items: [
      {
        q: "How do I schedule a Reel?",
        a: "Open the composer, drop in your video, write a caption, and choose a date and time. Reels are published through the REELS media type on Instagram.",
      },
      {
        q: "What happens if a post fails to publish?",
        a: "We retry automatically and log the reason. Open the post, review the error, fix it (caption, media, or permissions), then click \"Retry\".",
      },
    ],
  },
  {
    section: "Advanced",
    items: [
      {
        q: "Can I run automations across multiple accounts?",
        a: "Yes. Each automation is scoped to a single account. Create one automation per account, or use the same rules on each account you manage.",
      },
      {
        q: "How do I export or delete my data?",
        a: "Open Settings → Your data. You can download a JSON export of your workspace or delete it permanently. Deletion is irreversible.",
      },
    ],
  },
];

const GUIDES = [
  {
    icon: Compass,
    title: "Tour the dashboard",
    desc: "Where to find accounts, posts, and automations.",
    href: "/onboarding",
  },
  {
    icon: PenSquare,
    title: "Write a post",
    desc: "Composer, media tips, hashtag guidance.",
    href: "/dashboard/compose",
  },
  {
    icon: Calendar,
    title: "Schedule a Reel",
    desc: "Pick a time, queue it up, watch it publish.",
    href: "/dashboard/calendar",
  },
  {
    icon: MessageCircle,
    title: "Set up comment replies",
    desc: "Auto-reply to matching comments with care.",
    href: "/dashboard/automations",
  },
  {
    icon: Zap,
    title: "Run an automation",
    desc: "Hashtag reposting, smart filters, schedules.",
    href: "/dashboard/automations",
  },
  {
    icon: BookOpen,
    title: "Acceptable use",
    desc: "What's allowed (and what's not) on the platform.",
    href: "/acceptable-use",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 p-4 sm:p-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <HelpCircle className="size-4" />
          Help center
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          How can we help?
        </h1>
        <p className="text-sm text-muted-foreground">
          Skim a guide below, jump to the FAQ, or contact us — we usually reply within
          one business day.
        </p>
      </header>

      <section aria-labelledby="guides" className="space-y-3">
        <h2 id="guides" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick guides
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {GUIDES.map((g) => {
            const Icon = g.icon;
            return (
              <Link
                key={g.title}
                href={g.href}
                className="group flex items-start gap-3 rounded-lg border bg-card p-4 transition hover:border-foreground/20 hover:bg-accent/40"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium leading-tight">{g.title}</p>
                  <p className="text-sm text-muted-foreground">{g.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="faq" className="space-y-6">
        <h2 id="faq" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Frequently asked
        </h2>
        {FAQ.map((group) => (
          <div key={group.section} className="space-y-3">
            <h3 className="text-base font-semibold">{group.section}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.items.map((f) => (
                <Card key={f.q}>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-base">{f.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {f.a}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section
        aria-labelledby="contact"
        className="flex flex-col items-start gap-4 rounded-lg border bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="size-6 shrink-0 text-primary" />
          <div>
            <h2 id="contact" className="text-base font-semibold">
              Still stuck?
            </h2>
            <p className="text-sm text-muted-foreground">
              We read every message. Real humans, no chatbots.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/contact">
              <Mail className="mr-2 size-4" />
              Contact support
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a href={`mailto:${LEGAL_CONTACTS.general}`}>
              <Mail className="mr-2 size-4" />
              {LEGAL_CONTACTS.general}
            </a>
          </Button>
          <Button variant="ghost" asChild>
            <a
              href="https://github.com/inyogeshwar/viralo-kit/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Code2 className="mr-2 size-4" />
              Report a bug
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
