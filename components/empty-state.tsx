"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center",
        className,
      )}
      role="status"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actionLabel ? (
        actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {actionLabel}
          </button>
        )
      ) : null}
      {secondaryLabel && secondaryHref ? (
        <Link
          href={secondaryHref}
          className="text-sm text-muted-foreground underline hover:text-foreground"
        >
          {secondaryLabel}
        </Link>
      ) : null}
    </motion.div>
  );
}
