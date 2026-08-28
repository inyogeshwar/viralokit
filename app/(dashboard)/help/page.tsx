import Link from "next/link";
import {
  HelpCircle,
  BookOpen,
  Code2,
  Mail,
  PenSquare,
  CalendarDays,
  Users,
  BarChart3,
  Bot,
  Shield,
  Image as ImageIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Help Center — ViraloKit",
  description: "Guides, FAQs, and support for ViraloKit.",
};

const sections = [
  {
    title: "Getting started",
    items: [
      {
        href: "/onboarding",
        title: "Onboarding checklist",
        desc: "Connect Instagram, write your first post, schedule it.",
        icon: BookOpen,
      },
      {
        href: "/accounts",
        title: "Connect an Instagram account",
        desc: "OAuth flow and dev-token fallback.",
        icon: Users,
      },
    ],
  },
  {
    title: "Daily use",
    items: [
      {
        href: "/compose",
        title: "Compose a post",
        desc: "Single image, carousel, or reel. AI captions and hashtags.",
        icon: PenSquare,
      },
      {
        href: "/calendar",
        title: "Calendar and drag-and-drop scheduling",
        desc: "Drag a draft onto a day to schedule it.",
        icon: CalendarDays,
      },
      {
        href: "/media",
        title: "Media library",
        desc: "Browse images and videos you have uploaded.",
        icon: ImageIcon,
      },
      {
        href: "/analytics",
        title: "Read your analytics",
        desc: "Followers, reach, profile views, and engagement.",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Advanced",
    items: [
      {
        href: "/automation",
        title: "Automation rules",
        desc: "Auto-reply to DMs and comments.",
        icon: Bot,
      },
      {
        href: "/settings",
        title: "Settings and data",
        desc: "Profile, workspace, configuration, and account deletion.",
        icon: Shield,
      },
    ],
  },
];

const faqs = [
  {
    q: "Is ViraloKit really free?",
    a: "Yes. The current service is free to use. If we ever add paid plans, existing users will be notified at least 30 days before any change.",
  },
  {
    q: "Is my Instagram account safe?",
    a: "We use only the official Instagram Graph API. Your password never touches our servers. We store a long-lived access token, encrypted with AES-256, only to publish on your behalf. You can revoke it at any time from Settings.",
  },
  {
    q: "How do I enable two-factor authentication?",
    a: "Sign-in is handled by Clerk. Use the avatar menu in the top-right and choose Manage account, then enable 2FA there.",
  },
  {
    q: "Where are my media files stored?",
    a: "Uploaded media is stored in Cloudinary. We do not store media on our application database; we only keep the public URL returned by Cloudinary.",
  },
  {
    q: "Can I export my data?",
    a: "Yes. From Settings → Your data, click Download JSON. The file contains your accounts, posts, media, comments, messages, and automation rules (without access tokens).",
  },
  {
    q: "How do I delete my account?",
    a: "From Settings → Your data, click Delete workspace. You will be asked to type your email to confirm.",
  },
];

export default function HelpCenterPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-10 text-center">
        <Badge variant="secondary" className="mb-3 gap-1.5">
          <HelpCircle className="size-3.5" />
          Help Center
        </Badge>
        <h1 className="text-3xl font-bold">How can we help?</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Quick links to the most-used features, plus answers to the questions we
          hear most often. Can&apos;t find what you need? Contact support.
        </p>
      </div>

      <div className="grid gap-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {s.title}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {s.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                    <item.icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium group-hover:underline">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Frequently asked
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {faqs.map((f) => (
            <Card key={f.q}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{f.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{f.a}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-2xl border bg-muted/30 p-6 text-center">
        <h2 className="text-xl font-semibold">Still need help?</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          We&apos;re a small team and we read every message.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/contact">
              <Mail className="mr-1.5 size-4" />
              Contact support
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a
              href="https://github.com/inyogeshwar/viralo-kit"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Code2 className="mr-1.5 size-4" />
              Open an issue
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
