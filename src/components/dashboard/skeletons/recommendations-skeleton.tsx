import { Skeleton } from "@/components/ui/skeleton";

export function RecommendationsSkeleton() {
  return (
    <div className="space-y-6 px-2 py-2">
      {/* header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-[11px] w-48 rounded" />
        </div>
        {/* filter bar */}
        <div className="flex w-full min-w-0 flex-nowrap items-center gap-2 overflow-hidden md:justify-end">
          <Skeleton className="h-9 w-40 shrink-0 rounded-md" />
          <Skeleton className="h-9 w-32 shrink-0 rounded-md" />
          <Skeleton className="h-9 w-28 shrink-0 rounded-md" />
          <Skeleton className="h-9 w-32 shrink-0 rounded-md" />
        </div>
      </div>

      {/* recommendation cards */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-neutral-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-[18px] w-14 rounded-full" />
                <Skeleton className="h-[18px] w-16 rounded-full" />
              </div>
              <Skeleton className="h-[15px] w-3/4 rounded" />
              <Skeleton className="h-[13px] w-full rounded" />
              <Skeleton className="h-[13px] w-5/6 rounded" />
              <div className="flex items-center gap-3 pt-1">
                <Skeleton className="h-7 w-20 rounded-md" />
                <Skeleton className="h-7 w-24 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
