import Link from "next/link";
import { Eye, Heart, Images, Share2, TrendingUp, Users, MessageCircle, Bookmark } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { EngagementBreakdown } from "@/components/dashboard/engagement-breakdown";
import { getAccountAnalytics, getMediaAnalytics } from "@/lib/analytics";
import { getDashboardContext } from "@/lib/context";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statColors = [
  "from-violet-500/10 to-violet-500/5 text-violet-600 dark:text-violet-400",
  "from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400",
  "from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400",
  "from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
  "from-sky-500/10 to-sky-500/5 text-sky-600 dark:text-sky-400",
  "from-pink-500/10 to-pink-500/5 text-pink-600 dark:text-pink-400",
];

const statIcons = [Users, Images, Eye, TrendingUp, Heart, Heart];
const statLabels = ["Followers", "Posts", "Reach", "Profile views", "Accounts engaged", "Total interactions"];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>;
}) {
  const ctx = await getDashboardContext();
  const { activeAccount } = ctx;
  const params = await searchParams;
  const limit = Math.min(Math.max(Number(params.limit) || 10, 1), 25);

  if (!activeAccount) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <TrendingUp className="size-10 text-muted-foreground" />
          <div>
            <p className="font-semibold">No account to analyze</p>
            <p className="text-sm text-muted-foreground">Connect an Instagram account first.</p>
          </div>
          <Button asChild>
            <Link href="/accounts">Connect an account</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const analytics = await getAccountAnalytics(activeAccount);
  const media = await getMediaAnalytics(activeAccount, limit);

  const account = (analytics.account ?? {}) as Record<string, unknown>;
  const insights = (analytics.insights ?? {}) as Record<string, unknown>;

  const statValues = [
    account["followersCount"],
    account["mediaCount"],
    insights["reach"],
    insights["profileViews"],
    insights["accountsEngaged"],
    insights["totalInteractions"],
  ];

  // Compute engagement summary
  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;
  let totalSaved = 0;
  for (const item of media) {
    const ins = ((item as Record<string, unknown>)["insights"] as Record<string, unknown>) ?? {};
    totalLikes += (ins["likes"] as number) ?? 0;
    totalComments += (ins["comments"] as number) ?? 0;
    totalShares += (ins["shares"] as number) ?? 0;
    totalSaved += (ins["saved"] as number) ?? 0;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Latest available API data for @{activeAccount.username ?? activeAccount.igUserId}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {statLabels.map((label, i) => {
          const Icon = statIcons[i];
          return (
            <StatCard
              key={label}
              label={label}
              value={formatNumber(statValues[i] as number | null | undefined)}
              icon={Icon}
              gradient={statColors[i]}
              delay={i * 0.05}
            />
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total likes", value: totalLikes, icon: Heart, color: "text-rose-500" },
          { label: "Total comments", value: totalComments, icon: MessageCircle, color: "text-sky-500" },
          { label: "Total shares", value: totalShares, icon: Share2, color: "text-amber-500" },
          { label: "Total saved", value: totalSaved, icon: Bookmark, color: "text-emerald-500" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-3 px-4 py-3">
              <item.icon className={`size-5 ${item.color}`} />
              <div>
                <p className="text-lg font-bold tabular-nums">{formatNumber(item.value)}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EngagementBreakdown
        totalLikes={totalLikes}
        totalComments={totalComments}
        totalShares={totalShares}
        totalSaved={totalSaved}
      />

      <Card>
        <CardHeader>
          <CardTitle>Per-post insights</CardTitle>
          <CardDescription>Reach, likes, comments, shares, saved, and total interactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium text-muted-foreground">Post</th>
                  <th className="hidden pb-2 text-left font-medium text-muted-foreground sm:table-cell">Type</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Reach</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Likes</th>
                  <th className="hidden pb-2 text-right font-medium text-muted-foreground md:table-cell">Comments</th>
                  <th className="hidden pb-2 text-right font-medium text-muted-foreground md:table-cell">Shares</th>
                  <th className="hidden pb-2 text-right font-medium text-muted-foreground lg:table-cell">Saved</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {media.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">No posts found.</td>
                  </tr>
                ) : (
                  media.map((item) => {
                    const row = item as Record<string, unknown>;
                    const ins = (row["insights"] as Record<string, unknown>) ?? {};
                    const type = (row["media_type"] ?? row["mediaType"]) as string;
                    const caption = ((row["caption"] as string) ?? "").slice(0, 50);
                    return (
                      <tr key={row["id"] as string} className="border-b last:border-0">
                        <td className="max-w-[180px] truncate py-2.5 font-medium sm:max-w-[240px]">
                          {row["permalink"] ? (
                            <a href={row["permalink"] as string} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {caption || "(no caption)"}
                            </a>
                          ) : (
                            caption || "(no caption)"
                          )}
                        </td>
                        <td className="hidden py-2.5 sm:table-cell">
                          <Badge variant="secondary" className="text-[10px]">{type?.toUpperCase()}</Badge>
                        </td>
                        <td className="py-2.5 text-right tabular-nums">{formatNumber(ins["reach"] as number)}</td>
                        <td className="py-2.5 text-right tabular-nums">{formatNumber(ins["likes"] as number)}</td>
                        <td className="hidden py-2.5 text-right tabular-nums md:table-cell">{formatNumber(ins["comments"] as number)}</td>
                        <td className="hidden py-2.5 text-right tabular-nums md:table-cell">{formatNumber(ins["shares"] as number)}</td>
                        <td className="hidden py-2.5 text-right tabular-nums lg:table-cell">{formatNumber(ins["saved"] as number)}</td>
                        <td className="py-2.5 text-right font-bold tabular-nums">{formatNumber(ins["total_interactions"] as number)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Insight values can be 0 or missing on new accounts/posts — that is the API&apos;s real data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
