"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string | null | undefined;
  icon: LucideIcon;
  gradient: string;
  delay?: number;
}

export function StatCard({ label, value, icon: Icon, gradient, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="relative overflow-hidden py-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", gradient)} />
        <CardContent className="relative flex flex-col gap-1 px-4">
          <span className="flex items-center gap-2">
            <Icon className="size-4 text-muted-foreground" />
          </span>
          <span className="text-2xl font-bold tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value ?? "—"}
          </span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </CardContent>
      </Card>
    </motion.div>
  );
}
