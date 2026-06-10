import { Skeleton } from "@/components/ui";

/** Instant skeleton shown while the tasks list streams in. */
export default function TasksLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Tabs */}
      <Skeleton className="h-12 rounded-xl" />

      {/* Quick add */}
      <Skeleton className="h-11 rounded-xl" />

      {/* Rows */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
