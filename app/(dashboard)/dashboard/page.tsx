import Link from "next/link";
import { Eye, Heart, Image, Megaphone, PenSquare, TrendingUp, Users, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentPostsCard } from "@/components/dashboard/recent-posts";
import { getAccountAnalytics, listPosts } from "@/lib/analytics";
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

export default async function DashboardPage() {
  const ctx = await getDashboardContext();
  const { activeAccount, workspace } = ctx;

  const analytics = activeAccount ? await getAccountAnalytics(activeAccount) : null;
  const posts = await listPosts(workspace.id, 10);

  const account = (analytics?.account ?? {}) as Record<string, unknown>;
  const insights = (analytics?.insights ?? {}) as Record<string, unknown>;

  const stats = [
    { label: "Followers", value: account["followersCount"], icon: Users, gradient: statColors[0] },
    { label: "Posts", value: account["mediaCount"], icon: Image, gradient: statColors[1] },
    { label: "Reach", value: insights["reach"], icon: Eye, gradient: statColors[2] },
    { label: "Profile views", value: insights["profileViews"], icon: TrendingUp, gradient: statColors[3] },
    { label: "Total interactions", value: insights["totalInteractions"], icon: Heart, gradient: statColors[4] },
    { label: "Accounts engaged", value: insights["accountsEngaged"], icon: Megaphone, gradient: statColors[5] },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {activeAccount
              ? `Overview for @${activeAccount.username ?? activeAccount.igUserId}`
              : "Connect an Instagram account to see analytics."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/compose">
              <PenSquare className="mr-1.5 size-3.5" />
              New post
            </Link>
          </Button>
          {!activeAccount && (
            <Button asChild size="sm">
              <Link href="/accounts">
                <Zap className="mr-1.5 size-3.5" />
                Connect account
              </Link>
            </Button>
          )}
        </div>
      </div>

      {activeAccount ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {stats.map((stat, i) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={formatNumber(stat.value as number | null | undefined)}
                icon={stat.icon}
                gradient={stat.gradient}
                delay={i * 0.05}
              />
            ))}
          </div>

          <RecentPostsCard posts={posts} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center">
          <Users className="size-10 text-muted-foreground" />
          <div>
            <p className="font-semibold">No Instagram account connected</p>
            <p className="text-sm text-muted-foreground">
              Connect via Instagram OAuth or paste a dev token to get started.
            </p>
          </div>
          <Button asChild>
            <Link href="/connect">Connect an account</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
