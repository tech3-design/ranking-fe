import { Skeleton } from "@/components/ui/skeleton";

export function BillingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Subscription status card */}
      <div className="rounded-sm border border-black/8 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-sm" />
            <div className="space-y-1.5">
              <Skeleton className="h-[14px] w-44 rounded" />
              <Skeleton className="h-[12px] w-36 rounded" />
            </div>
          </div>
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </div>

      {/* Usage card */}
      <div className="rounded-sm border border-black/8 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-[14px] w-32 rounded" />
        </div>

        {/* usage bars */}
        {[1, 2].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-[12px] w-24 rounded" />
              <Skeleton className="h-[12px] w-16 rounded" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}

        {/* engines */}
        <div className="space-y-2">
          <Skeleton className="h-[12px] w-28 rounded" />
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-black/8 pt-3">
          <Skeleton className="h-[12px] w-36 rounded" />
          <Skeleton className="h-[12px] w-20 rounded" />
        </div>
      </div>

      {/* Plan features card */}
      <div className="rounded-sm border border-black/8 bg-white p-6 shadow-sm space-y-4">
        <Skeleton className="h-[14px] w-48 rounded" />
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 shrink-0 rounded-full" />
              <Skeleton className="h-[13px] w-56 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade banner */}
      <div className="flex items-center justify-between rounded-sm border border-black/8 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-sm" />
          <div className="space-y-1">
            <Skeleton className="h-[14px] w-36 rounded" />
            <Skeleton className="h-[12px] w-48 rounded" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-sm" />
      </div>
    </div>
  );
}
