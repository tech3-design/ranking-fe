import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 px-2 py-2 font-sans">
      {/* page title */}
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-24 rounded" />
        <Skeleton className="h-[13px] w-56 rounded" />
      </div>

      {/* Account card */}
      <div className="rounded-sm border border-black/8 bg-white p-6 shadow-sm space-y-4">
        <Skeleton className="h-[14px] w-20 rounded" />
        <div className="flex items-center gap-5">
          <Skeleton className="size-16 shrink-0 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-[15px] w-36 rounded" />
            <Skeleton className="h-[12px] w-48 rounded" />
          </div>
        </div>
      </div>

      {/* Projects card */}
      <div className="rounded-sm border border-black/8 bg-white p-6 shadow-sm">
        <Skeleton className="mb-1 h-[14px] w-20 rounded" />
        <Skeleton className="mb-4 h-[12px] w-48 rounded" />
        <Skeleton className="mb-4 h-8 w-32 rounded-sm" />

        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-sm border border-black/8 bg-neutral-50/80 px-4 py-3"
            >
              <div className="space-y-1">
                <Skeleton className="h-[14px] w-32 rounded" />
                <Skeleton className="h-[12px] w-44 rounded" />
              </div>
              <div className="flex gap-1.5">
                <Skeleton className="h-8 w-8 rounded-sm" />
                <Skeleton className="h-8 w-8 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone card */}
      <div className="rounded-sm border border-red-500/20 bg-red-500/[0.04] p-6 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-[14px] w-24 rounded" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-sm border border-black/8 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-sm" />
              <div className="space-y-1">
                <Skeleton className="h-[14px] w-28 rounded" />
                <Skeleton className="h-[11px] w-48 rounded" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
