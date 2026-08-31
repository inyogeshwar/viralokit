"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/lib/utils";

export function EngagementBreakdown({
  totalLikes,
  totalComments,
  totalShares,
  totalSaved,
}: {
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaved: number;
}) {
  const max = Math.max(totalLikes, totalComments, totalShares, totalSaved, 1);
  const bars = [
    { label: "Likes", value: totalLikes, color: "bg-rose-500" },
    { label: "Comments", value: totalComments, color: "bg-sky-500" },
    { label: "Shares", value: totalShares, color: "bg-amber-500" },
    { label: "Saved", value: totalSaved, color: "bg-emerald-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Engagement breakdown</CardTitle>
          <CardDescription>Likes vs comments vs shares vs saved across your posts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {bars.map((bar) => {
            const pct = max > 0 ? Math.round((bar.value / max) * 100) : 0;
            return (
              <div key={bar.label} className="flex items-center gap-3">
                <span className="w-20 text-xs font-medium text-muted-foreground">{bar.label}</span>
                <Progress value={pct} className="h-1.5 flex-1" indicatorClassName={bar.color} />
                <span className="w-12 text-right text-xs font-bold tabular-nums">
                  {formatNumber(bar.value)}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
