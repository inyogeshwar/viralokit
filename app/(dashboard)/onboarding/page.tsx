import Link from "next/link";
import { CheckCircle2, Circle, AtSign, PenSquare, Calendar, Zap, ArrowRight } from "lucide-react";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { ensureWorkspace } from "@/lib/workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PRODUCT_NAME } from "@/lib/legal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Get started · ${PRODUCT_NAME}`,
  description: "Set up your account in four quick steps.",
};

type Step = {
  key: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: React.ComponentType<{ className?: string }>;
  done: boolean;
};

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const db = getDb();
  const workspace = await ensureWorkspace(userId, {});

  let hasAccount = false;
  let hasPost = false;
  let hasRule = false;
  let hasScheduled = false;

  if (db) {
    const acct = await db
      .select({ id: schema.socialAccounts.id })
      .from(schema.socialAccounts)
      .where(eq(schema.socialAccounts.workspaceId, workspace.id))
      .limit(1);
    hasAccount = acct.length > 0;

    if (hasAccount) {
      const postRows = await db
        .select({ id: schema.posts.id })
        .from(schema.posts)
        .where(eq(schema.posts.workspaceId, workspace.id))
        .limit(1);
      hasPost = postRows.length > 0;

      const schedRows = await db
        .select({ id: schema.posts.id })
        .from(schema.posts)
        .where(
          and(
            eq(schema.posts.workspaceId, workspace.id),
            eq(schema.posts.status, "scheduled"),
          ),
        )
        .limit(1);
      hasScheduled = schedRows.length > 0;

      const ruleRows = await db
        .select({ id: schema.autoReplyRules.id })
        .from(schema.autoReplyRules)
        .where(eq(schema.autoReplyRules.workspaceId, workspace.id))
        .limit(1);
      hasRule = ruleRows.length > 0;
    }
  }

  const steps: Step[] = [
    {
      key: "connect",
      title: "Connect your Instagram",
      description:
        "Link the Instagram business account you want to publish to. You can add more later.",
      href: "/dashboard/accounts",
      cta: "Connect account",
      icon: AtSign,
      done: hasAccount,
    },
    {
      key: "compose",
      title: "Write your first post",
      description:
        "Draft a caption and drop in an image or short video. The composer saves as a draft automatically.",
      href: "/dashboard/compose",
      cta: "Open composer",
      icon: PenSquare,
      done: hasPost,
    },
    {
      key: "schedule",
      title: "Schedule a post",
      description:
        "Pick a date and time — we will publish it for you. Times are shown in your local timezone.",
      href: "/dashboard/calendar",
      cta: "Open calendar",
      icon: Calendar,
      done: hasScheduled,
    },
    {
      key: "automate",
      title: "Turn on an automation",
      description:
        "Auto-publish new posts by hashtag, or auto-reply to comments that match a rule.",
      href: "/dashboard/automations",
      cta: "Browse automations",
      icon: Zap,
      done: hasRule,
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const allDone = completed === total;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Onboarding
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {allDone ? "You&apos;re all set" : "Let&apos;s get you posting in 4 steps"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {allDone
            ? "Your workspace is fully configured. You can revisit any step below."
            : "Each step takes under a minute. Progress is saved automatically."}
        </p>
      </header>

      <div className="rounded-lg border bg-muted/20 p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {completed} of {total} complete
          </span>
          <span>{pct}%</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Onboarding progress"
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <ol className="grid gap-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.key}>
              <Card>
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  <div
                    className={`mt-1 flex size-9 shrink-0 items-center justify-center rounded-full ${
                      step.done
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <Circle className="size-5" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="text-muted-foreground">{i + 1}.</span> {step.title}
                    </CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                  <Icon className="size-5 shrink-0 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Button asChild variant={step.done ? "outline" : "default"}>
                    <Link href={step.href}>
                      {step.done ? "Review" : step.cta}
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ol>

      <p className="text-center text-xs text-muted-foreground">
        Need a hand?{" "}
        <Link href="/help" className="underline underline-offset-2">
          Visit the help center
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="underline underline-offset-2">
          contact support
        </Link>
        .
      </p>
    </div>
  );
}
