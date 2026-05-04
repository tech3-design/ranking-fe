import { Skeleton } from "@/components/ui/skeleton";

export function CompetitorsSkeleton() {
  return (
    <div className="space-y-6 px-2 py-2 sm:px-0">
      {/* page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-36 rounded" />
          <Skeleton className="h-[13px] w-56 rounded" />
        </div>
        <div className="flex flex-nowrap items-center gap-2">
          <Skeleton className="h-9 w-48 shrink-0 rounded-md" />
          <Skeleton className="h-9 w-32 shrink-0 rounded-md" />
          <Skeleton className="h-9 w-28 shrink-0 rounded-md" />
        </div>
      </div>

      {/* table shell */}
      <div className="overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        {/* table header */}
        <div className="flex items-center gap-4 border-b border-neutral-100 bg-neutral-50/60 px-4 py-3">
          {[120, 80, 60, 60, 70, 50].map((w, i) => (
            <Skeleton key={i} className="h-[10px] rounded shrink-0" style={{ width: w }} />
          ))}
        </div>

        {/* table rows */}
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-neutral-50 px-4 py-3 last:border-0"
          >
            <div className="flex shrink-0 items-center gap-2.5" style={{ minWidth: 120 }}>
              <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-[12px] w-20 rounded" />
                <Skeleton className="h-[9px] w-14 rounded" />
              </div>
            </div>
            <Skeleton className="h-[10px] w-20 shrink-0 rounded" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <Skeleton
                    className="h-full rounded-full"
                    style={{ width: `${30 + (i * 10) % 60}%` }}
                  />
                </div>
                <Skeleton className="h-[11px] w-8 shrink-0 rounded" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
            <Skeleton className="h-[10px] w-12 shrink-0 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
