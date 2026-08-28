import { cn } from "@/lib/utils";

/**
 * Loading placeholder. Pulses with the existing theme tokens.
 * Used by `app/(dashboard)/loading.tsx` and `app/(legal)/loading.tsx`.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
