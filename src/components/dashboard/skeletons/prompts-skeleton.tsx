import { Skeleton } from "@/components/ui/skeleton";

export function PromptsSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* page header */}
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-40 rounded" />
        <Skeleton className="h-[13px] w-96 rounded" />
      </div>

      {/* add prompt input bar */}
      <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 w-24 shrink-0 rounded-md" />
      </div>

      {/* prompt track cards */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
        >
          {/* card header */}
          <div className="flex items-start justify-between border-b border-neutral-50 px-4 py-3.5">
            <div className="space-y-1.5">
              <Skeleton className="h-[14px] w-64 rounded" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-[11px] w-16 rounded" />
                <Skeleton className="h-[11px] w-20 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-20 rounded-md" />
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>
          </div>

          {/* engine rows */}
          {[1, 2, 3].map((j) => (
            <div
              key={j}
              className="flex items-center gap-4 border-b border-neutral-50 px-4 py-3 last:border-0"
            >
              <div className="flex shrink-0 items-center gap-2" style={{ minWidth: 100 }}>
                <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                <Skeleton className="h-[11px] w-16 rounded" />
              </div>
              <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-[11px] w-full rounded" />
                <Skeleton className="h-[11px] w-3/4 rounded" />
              </div>
              <Skeleton className="h-[10px] w-16 shrink-0 rounded" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
