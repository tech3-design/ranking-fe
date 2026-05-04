import { Skeleton } from "@/components/ui/skeleton";

// ── Shared skeleton for Actions / Backlinks / Wikipedia prompt pages ──────────
// Mirrors the PromptTracker layout: toolbar → KPI card → prompt cards

export function PromptPageSkeleton() {
  return (
    <div className="space-y-2.5">

      {/* ── Toolbar row ──────────────────────────────────────────────────── */}
      {/* mirrors: flex justify-between with count text on left, buttons on right */}
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Skeleton className="h-[13px] w-32 rounded" />

        <div className="flex flex-nowrap items-center gap-2 overflow-hidden py-2">
          {/* Recheck all */}
          <Skeleton className="h-9 w-28 shrink-0 rounded-md" />
          {/* Search */}
          <Skeleton className="h-9 w-48 shrink-0 rounded-md" />
          {/* Strength filter */}
          <Skeleton className="h-9 w-32 shrink-0 rounded-md" />
          {/* Sort filter */}
          <Skeleton className="h-9 w-28 shrink-0 rounded-md" />
          {/* New prompt */}
          <Skeleton className="h-9 w-28 shrink-0 rounded-md" />
        </div>
      </div>

      {/* ── KPI / stats card ─────────────────────────────────────────────── */}
      {/* mirrors: overflow-hidden rounded-lg border border-border bg-card */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid grid-cols-2 gap-1.5 p-3 sm:grid-cols-4 sm:p-3.5 lg:p-4">
          {/* 4 StatTile skeletons */}
          {["Avg score", "Visibility", "Strong", "Runs"].map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-1 rounded-md border border-border/60 bg-card px-3 py-2.5"
            >
              <Skeleton className="h-[10px] w-16 rounded" />
              <Skeleton className="h-6 w-12 rounded" />
              <Skeleton className="h-[10px] w-20 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Prompt cards ─────────────────────────────────────────────────── */}
      {/* mirrors: space-y-1.5 with overflow-hidden rounded-md border bg-card */}
      <div className="space-y-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-md border border-border/80 bg-card"
          >
            {/* Card header row */}
            {/* mirrors: flex items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-3.5 sm:py-3 */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-3.5 sm:py-3">

              {/* Chevron icon */}
              <Skeleton className="size-4 shrink-0 rounded" />

              {/* Score badge — size-10 rounded-md */}
              <Skeleton className="size-10 shrink-0 rounded-md" />

              {/* Prompt text + meta badges */}
              <div className="min-w-0 flex-1 space-y-1.5">
                {/* prompt text line — varies width per card */}
                <Skeleton
                  className="h-[14px] rounded"
                  style={{ width: `${55 + (i * 11) % 35}%` }}
                />
                {/* intent + type + score badges row */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-[14px] w-14 rounded-sm" />
                  <Skeleton className="h-[14px] w-16 rounded-sm" />
                  <Skeleton className="h-[10px] w-20 rounded" />
                </div>
              </div>

              {/* Engine logos — hidden on mobile, 6 icons */}
              <div className="hidden shrink-0 items-center gap-1 sm:flex">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <Skeleton key={j} className="size-6 rounded-full" />
                ))}
              </div>

              {/* Actions dropdown placeholder */}
              <Skeleton className="hidden h-7 w-7 shrink-0 rounded-md sm:block" />

              {/* Refresh button */}
              <Skeleton className="size-7 shrink-0 rounded-md" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
