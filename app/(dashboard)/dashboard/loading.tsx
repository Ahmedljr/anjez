import { Skeleton } from "@/components/ui";

/** Instant skeleton shown while the dashboard's server data streams in. */
export default function DashboardLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      {/* Hero */}
      <Skeleton className="h-28 rounded-2xl" />

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-12 lg:items-start lg:gap-6">
        {/* Primary column */}
        <div className="flex flex-col gap-3 lg:col-span-7">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>

        {/* Secondary column */}
        <div className="flex flex-col gap-3 lg:col-span-5">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
