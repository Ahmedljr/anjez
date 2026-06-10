import { cn } from "@/lib/utils";

/** A pulsing placeholder block used while server data streams in. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-lg bg-slate-200/80", className)}
    />
  );
}
