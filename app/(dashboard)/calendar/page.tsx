"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Image as ImageIcon,
  Layers,
  Loader2,
  Play,
  RefreshCw,
  Trash2,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PostStatus = "draft" | "scheduled" | "processing" | "published" | "partial" | "failed";
type MediaType = "image" | "carousel" | "reel" | "story";

interface CalendarPost {
  id: string;
  caption: string | null;
  mediaType: string;
  status: string;
  scheduledAt: string | null;
  accountUsername: string | null;
  thumbnailUrl: string | null;
  durationSec: string | null;
}

const statusVariant: Record<string, "success" | "warning" | "info" | "destructive" | "secondary"> = {
  published: "success",
  scheduled: "info",
  draft: "secondary",
  processing: "warning",
  partial: "warning",
  failed: "destructive",
};

const mediaTypeIcon: Record<string, typeof ImageIcon> = {
  reel: Video,
  carousel: Layers,
  image: ImageIcon,
  story: ImageIcon,
};

function MediaIcon({ type, className }: { type: string; className?: string }) {
  const Icon = mediaTypeIcon[type] ?? ImageIcon;
  return <Icon className={className} />;
}

function DraggablePost({
  post,
  compact,
}: {
  post: CalendarPost;
  compact?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: post.id,
    data: { post },
  });

  const Icon = mediaTypeIcon[post.mediaType] ?? ImageIcon;
  const variant = statusVariant[post.status] ?? "secondary";

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group flex cursor-grab select-none items-center gap-1.5 rounded-md border bg-background px-1.5 py-1 text-[11px] shadow-sm transition hover:border-primary/50 active:cursor-grabbing ${
        isDragging ? "opacity-30" : ""
      }`}
      title={post.caption ?? "(no caption)"}
    >
      <Icon className="size-3 shrink-0 text-muted-foreground" />
      {!compact && (
        <span className="truncate font-medium">
          {post.caption?.split("\n")[0]?.slice(0, 22) || "(no caption)"}
        </span>
      )}
      {compact && (
        <span className="truncate font-medium">
          {post.caption?.split("\n")[0]?.slice(0, 10) || "—"}
        </span>
      )}
      <Badge variant={variant} className="ml-auto h-4 px-1 text-[9px]">
        {post.status.slice(0, 4)}
      </Badge>
    </div>
  );
}

function DroppableDay({
  date,
  isToday,
  isOtherMonth,
  posts,
  onRetry,
  onCancel,
}: {
  date: Date;
  isToday: boolean;
  isOtherMonth: boolean;
  posts: CalendarPost[];
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const dateKey = date.toISOString().slice(0, 10);
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${dateKey}`,
    data: { date: dateKey },
  });

  return (
    <div
      ref={setNodeRef}
      className={`group relative flex min-h-[110px] flex-col gap-1 rounded-lg border p-1.5 transition ${
        isOver
          ? "border-primary bg-primary/10 ring-2 ring-primary/40"
          : isToday
            ? "border-primary/60 bg-primary/5"
            : isOtherMonth
              ? "border-border/50 bg-muted/30 text-muted-foreground"
              : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between text-[10px] font-medium">
        <span className={isToday ? "rounded-full bg-primary px-1.5 py-0.5 text-primary-foreground" : ""}>
          {date.getDate()}
        </span>
        {posts.length > 0 && (
          <span className="text-muted-foreground">{posts.length}</span>
        )}
      </div>
      <div className="flex flex-col gap-1 overflow-y-auto">
        {posts.slice(0, 4).map((p) => (
          <div key={p.id} className="group/post relative">
            <DraggablePost post={p} compact />
            {p.status === "failed" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry(p.id);
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground opacity-0 hover:bg-accent group-hover/post:opacity-100"
                title="Retry"
              >
                <RefreshCw className="size-3" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCancel(p.id);
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground opacity-0 hover:bg-accent group-hover/post:opacity-100"
              title="Cancel schedule"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
        {posts.length > 4 && (
          <span className="text-[10px] text-muted-foreground">+{posts.length - 4} more</span>
        )}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth(), // 0-indexed
  });
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState<CalendarPost | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const monthKey = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}`;

  const load = useCallback(async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?month=${key}`);
      const data = await res.json();
      if (data.ok) setPosts(data.posts ?? []);
    } catch {
      setMessage({ kind: "error", text: "Failed to load calendar" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(monthKey);
  }, [load, monthKey]);

  const handleDragStart = (event: DragStartEvent) => {
    const p = event.active.data.current?.post as CalendarPost | undefined;
    if (p) setActivePost(p);
  };

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActivePost(null);
      const { active, over } = event;
      if (!over) return;
      const postId = String(active.id);
      const dayKey = over.data.current?.date as string | undefined;
      if (!dayKey) return;

      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      // Build a new ISO date. Preserve the original time-of-day if the post had one.
      const old = post.scheduledAt ? new Date(post.scheduledAt) : new Date();
      const [y, m, d] = dayKey.split("-").map(Number);
      const next = new Date(
        Date.UTC(
          y,
          (m ?? 1) - 1,
          d ?? 1,
          old.getUTCHours(),
          old.getUTCMinutes(),
          0,
          0,
        ),
      );
      const iso = next.toISOString();

      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, scheduledAt: iso, status: "scheduled" } : p)),
      );

      try {
        const res = await fetch("/api/calendar", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, scheduledAt: iso }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
        setMessage({ kind: "ok", text: `Moved to ${dayKey}` });
      } catch (err) {
        // Roll back
        setPosts((prev) => prev.map((p) => (p.id === postId ? post : p)));
        setMessage({
          kind: "error",
          text: `Reschedule failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
      setTimeout(() => setMessage(null), 2500);
    },
    [posts],
  );

  const handleRetry = useCallback(async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/retry`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setMessage({ kind: "ok", text: "Retrying — will publish shortly" });
      load(monthKey);
    } catch (err) {
      setMessage({
        kind: "error",
        text: `Retry failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
    setTimeout(() => setMessage(null), 2500);
  }, [load, monthKey]);

  const handleCancel = useCallback(
    async (postId: string) => {
      try {
        const res = await fetch("/api/calendar", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });
        const data = await res.json();
        if (data.ok) {
          setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: "draft", scheduledAt: null } : p)));
          setMessage({ kind: "ok", text: "Schedule cancelled — moved to drafts" });
        }
      } catch {
        setMessage({ kind: "error", text: "Failed to cancel" });
      }
      setTimeout(() => setMessage(null), 2000);
    },
    [],
  );

  // Build the 6-row × 7-col grid for the visible month.
  const { weeks, monthLabel } = useMemo(() => {
    const first = new Date(viewMonth.year, viewMonth.month, 1);
    const startOffset = first.getDay(); // 0 (Sun) – 6 (Sat)
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - startOffset);

    const cells: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      cells.push(d);
    }
    const weeks: Date[][] = [];
    for (let i = 0; i < 6; i++) weeks.push(cells.slice(i * 7, i * 7 + 7));
    const monthLabel = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    return { weeks, monthLabel };
  }, [viewMonth]);

  const postsByDay = useMemo(() => {
    const map = new Map<string, CalendarPost[]>();
    for (const p of posts) {
      if (!p.scheduledAt) continue;
      const key = p.scheduledAt.slice(0, 10);
      const arr = map.get(key) ?? [];
      arr.push(p);
      map.set(key, arr);
    }
    // Sort by time
    for (const [, arr] of map) {
      arr.sort((a, b) => (a.scheduledAt ?? "").localeCompare(b.scheduledAt ?? ""));
    }
    return map;
  }, [posts]);

  const drafts = useMemo(() => posts.filter((p) => p.status === "draft" && !p.scheduledAt), [posts]);
  const todayKey = today.toISOString().slice(0, 10);

  const goPrev = () =>
    setViewMonth((v) =>
      v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 },
    );
  const goNext = () =>
    setViewMonth((v) =>
      v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 },
    );
  const goToday = () =>
    setViewMonth({ year: today.getFullYear(), month: today.getMonth() });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <CalendarDays className="size-6" />
            Calendar
          </h1>
          <p className="text-sm text-muted-foreground">
            Drag any post to a new date to reschedule. Failed posts can be retried in place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goPrev} aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </Button>
          <div className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium min-w-40 text-center">
            {monthLabel}
          </div>
          <Button variant="outline" size="icon" onClick={goNext} aria-label="Next month">
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday}>
            Today
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-2.5 text-sm ${
            message.kind === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <Tabs defaultValue="month" className="flex flex-col gap-4">
        <TabsList className="self-start">
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="mt-0">
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Month view</CardTitle>
                  <CardDescription>
                    {loading ? "Loading…" : `${posts.filter((p) => p.scheduledAt).length} posts scheduled this month`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 text-[11px] font-medium text-muted-foreground">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="px-1.5 py-1 text-center">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 grid grid-cols-7 gap-1">
                    {weeks.flat().map((date) => {
                      const key = date.toISOString().slice(0, 10);
                      return (
                        <DroppableDay
                          key={key}
                          date={date}
                          isToday={key === todayKey}
                          isOtherMonth={date.getMonth() !== viewMonth.month}
                          posts={postsByDay.get(key) ?? []}
                          onRetry={handleRetry}
                          onCancel={handleCancel}
                        />
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Drafts (no date)</CardTitle>
                <CardDescription>Drag onto a day to schedule.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    Loading…
                  </div>
                ) : drafts.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No drafts. Create one in <span className="font-medium">Compose</span>.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {drafts.map((p) => (
                      <DraggablePost key={p.id} post={p} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <ImageIcon className="size-3 text-muted-foreground" />
                  <span>Image</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="size-3 text-muted-foreground" />
                  <span>Carousel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="size-3 text-muted-foreground" />
                  <span>Reel / Video</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(["published", "scheduled", "draft", "failed"] as const).map((s) => (
                    <Badge key={s} variant={statusVariant[s]} className="text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {loading && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3 animate-spin" />
                Syncing…
              </div>
            )}
          </div>
        </div>

        <DragOverlay>
          {activePost ? (
            <div className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 text-xs shadow-xl">
              <MediaIcon type={activePost.mediaType} className="size-3.5 text-muted-foreground" />
              <span className="max-w-[180px] truncate font-medium">
                {activePost.caption?.split("\n")[0] || "(no caption)"}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">All scheduled posts</CardTitle>
              <CardDescription>
                {loading
                  ? "Loading…"
                  : `${posts.filter((p) => p.status === "scheduled").length} scheduled · ${posts.filter((p) => p.status === "draft").length} draft`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" />
                  Loading…
                </div>
              ) : posts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No posts yet. Use <span className="font-medium">Compose</span> to create one.
                </p>
              ) : (
                <div className="flex flex-col divide-y">
                  {posts
                    .slice()
                    .sort((a, b) => {
                      const aT = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity;
                      const bT = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity;
                      return aT - bT;
                    })
                    .map((p) => {
                      const Icon = mediaTypeIcon(p.mediaType);
                      const variant = statusVariant[p.status] ?? "secondary";
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-3 py-2.5"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <Icon className="size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {p.caption || "(no caption)"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {p.scheduledAt
                                  ? new Date(p.scheduledAt).toLocaleString(undefined, {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    })
                                  : "No date"}{" "}
                                · @{p.accountUsername ?? "?"}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge variant={variant}>{p.status}</Badge>
                            {p.status === "failed" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => handleRetry(p.id)}
                                title="Retry"
                              >
                                <RefreshCw className="size-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => handleCancel(p.id)}
                              title="Cancel schedule"
                            >
                              <Trash2 className="size-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
