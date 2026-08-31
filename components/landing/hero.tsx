"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Star, Sparkles, TrendingUp, Heart, MessageCircle, Eye } from "lucide-react";

import { CTAButton } from "./cta-button";
import { fadeIn, slideUp, staggerContainer, staggerChild } from "@/lib/motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-amber-500/10" />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.7 0.15 340 / 0.35), transparent 60%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={staggerChild}>
            <Badge variant="secondary" className="mb-6 gap-1.5 px-4 py-1.5">
              <Sparkles className="size-3.5 text-amber-500" />
              AI-Powered Social Media Management
            </Badge>
          </motion.div>

          <motion.h1
            variants={staggerChild}
            className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl"
          >
            Publish. Schedule.{" "}
            <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">
              Automate.
            </span>{" "}
            Analyze.
          </motion.h1>

          <motion.p
            variants={staggerChild}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Manage multiple Instagram accounts from one beautiful dashboard. AI captions, smart
            scheduling, DM automation, and real analytics — all completely free.
          </motion.p>

          <motion.div
            variants={staggerChild}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <CTAButton />
            <a
              href="#features"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-6 text-base shadow-sm transition-colors hover:bg-accent"
            >
              See Features
            </a>
          </motion.div>

          <motion.p variants={staggerChild} className="mt-4 text-sm text-muted-foreground">
            No credit card required · Free forever · Open source
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
