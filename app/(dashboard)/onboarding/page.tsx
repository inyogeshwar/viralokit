import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Sparkles,
  Globe,
  PenSquare,
  CalendarDays,
  Bot,
  ArrowRight,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardContext } from "@/lib/context";
import { listAccounts } from "@/lib/workspace";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Welcome — ViraloKit",
};

const steps = [
  {
    key: "connect",
    title: "Connect your Instagram account",
    description:
      "Link a Business or Creator Instagram account using the official Instagram Login flow, or paste a long-lived dev token if you don't have a Meta app yet.",
    icon: Users,
    cta: { href: "/accounts", label: "Add account" },
  },
  {
    key: "compose",
    title: "Write your first post",
    description:
      "Upload an image, carousel, or reel. Use the AI caption generator for a first draft, then edit before publishing.",
    icon: PenSquare,
    cta: { href: "/compose", label: "Open composer" },
  },
  {
    key: "schedule",
    title: "Schedule it for the perfect time",
    description:
      "Drag the post onto a day in the calendar. The Inngest scheduler publishes at the exact time, even if your computer is off.",
    icon: CalendarDays,
    cta: { href: "/calendar", label: "Open calendar" },
  },
  {
    key: "automate",
    title: "Set up a reply rule (optional)",
    description:
      "Auto-reply to DMs or comments using keyword matching. Use sparingly — Meta enforces a 24-hour window for human-agent messages.",
    icon: Bot,
    cta: { href: "/automation", label: "Add automation" },
  },
];

export default async function OnboardingPage() {
  const ctx = await getDashboardContext();
  const accounts = await listAccounts(ctx.workspace.id);
  const hasAccount = accounts.length > 0;

  // Lightweight progress model. Once the user has at least one account
  // and one of the steps below is completed, we mark them done. We don't
  // persist onboarding state today; this is a "tip" page, not a gate.
  const progress: { key: string; done: boolean }[] = [
    { key: "account-created", done: true },
    { key: "connect", done: hasAccount },
    { key: "compose", done: false },
    { key: "schedule", done: false },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="secondary" className="mb-2 gap-1.5">
            <Sparkles className="size-3.5 text-amber-500" />
            Welcome to ViraloKit
          </Badge>
          <h1 className="text-2xl font-bold">Let&apos;s get you set up</h1>
          <p className="text-sm text-muted-foreground">
            Hi {ctx.workspace.name.split(" ")[0] || "there"} — these four steps will
            take you from a fresh account to your first scheduled post.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">Skip to dashboard →</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your progress</CardTitle>
          <CardDescription>
            {progress.filter((p) => p.done).length} of {progress.length} steps complete.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {progress.map((p) => (
            <div key={p.key} className="flex items-center gap-2 text-sm">
              {p.done ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <Circle className="size-4 text-muted-foreground" />
              )}
              <span className={p.done ? "line-through text-muted-foreground" : ""}>
                {p.key === "account-created"
                  ? "Create your account"
                  : steps.find((s) => s.key === p.key)?.title}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {steps.map((step, i) => (
          <Card key={step.key} className="relative overflow-hidden">
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                  <step.icon className="size-5" />
                </div>
                <Badge variant="outline">Step {i + 1}</Badge>
              </div>
              <CardTitle className="text-base">{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm">
                <Link href={step.cta.href}>
                  {step.cta.label}
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="size-4 text-blue-500" />
            Need help?
          </CardTitle>
          <CardDescription>
            Check the Help Center, or follow the full Instagram setup walkthrough.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/help">Help Center</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/about">About ViraloKit</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/contact">Contact support</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
