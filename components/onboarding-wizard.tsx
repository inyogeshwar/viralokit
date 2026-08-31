"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { staggerContainer, staggerChild } from "@/lib/motion";

export type WizardStep = {
  key: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  done: boolean;
};

export function OnboardingWizard({
  steps,
  completed,
  total,
  pct,
  allDone,
}: {
  steps: WizardStep[];
  completed: number;
  total: number;
  pct: number;
  allDone: boolean;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      <motion.div variants={staggerChild} className="rounded-lg border bg-muted/20 p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {completed} of {total} complete
          </span>
          <span>{pct}%</span>
        </div>
        <Progress value={pct} className="h-2" />
      </motion.div>

      <ol className="grid gap-4">
        {steps.map((step, i) => {
          return (
            <motion.li key={step.key} variants={staggerChild}>
              <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
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
            </motion.li>
          );
        })}
      </ol>
    </motion.div>
  );
}
