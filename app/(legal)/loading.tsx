import { Skeleton } from "@/components/ui/skeleton";

export default function LegalLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12" role="status" aria-live="polite">
      <Skeleton className="mb-3 h-9 w-2/3" />
      <Skeleton className="mb-8 h-4 w-40" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={`b-${i}`} className="h-4 w-5/6" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
