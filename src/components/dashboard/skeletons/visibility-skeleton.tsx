import { Skeleton } from "@/components/ui/skeleton";

export function VisibilitySkeleton() {
  return (
    <div className="space-y-4">

      {/* ── Row 1: KPI strip ─────────────────────────────────────────────── */}
      {/* mirrors: grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

        {/* Overall score card — col-span-2 sm:col-span-3 lg:col-span-2 */}
        <div
          className="col-span-2 flex items-center gap-4 rounded-xl border border-border/60 px-5 py-4 sm:col-span-3 lg:col-span-2"
          style={{ backgroundColor: "rgba(var(--primary-rgb,99,102,241),.04)" }}
        >
          {/* ScoreGauge placeholder: circular SVG area */}
          <Skeleton className="size-[76px] shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-[10px] w-24 rounded" />
            <Skeleton className="h-[13px] w-32 rounded" />
            <Skeleton className="h-9 w-16 rounded" />
            <Skeleton className="h-[11px] w-36 rounded" />
          </div>
        </div>

        {/* 4 KPI tiles */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-border/60 bg-card px-4 py-3.5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-[10px] w-20 rounded" />
              <Skeleton className="size-3.5 rounded" />
            </div>
            <Skeleton className="mt-2 h-8 w-14 rounded" />
            <Skeleton className="mt-2.5 h-1 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* ── Row 2: Insights row ──────────────────────────────────────────── */}
      {/* mirrors: overflow-hidden rounded-xl border border-border/60 bg-card */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)]">

        {/* Header bar */}
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3">
          <Skeleton className="h-3.5 w-3.5 rounded" />
          <Skeleton className="h-[10px] w-40 rounded" />
          <div className="ml-auto flex items-center gap-3">
            <Skeleton className="h-[11px] w-24 rounded" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
        </div>

        {/* 3-column body: lg:grid-cols-12 */}
        <div className="grid grid-cols-1 divide-y divide-border/40 lg:grid-cols-12 lg:divide-x lg:divide-y-0">

          {/* Column 1 — Share of Voice bar chart (lg:col-span-5) */}
          <div className="p-4 lg:col-span-5">
            <Skeleton className="mb-2 h-[10px] w-24 rounded" />
            {/* Bar chart: height 192, 6 bars */}
            <div className="flex items-end gap-2 px-2" style={{ height: 192 }}>
              {[55, 80, 45, 70, 35, 60].map((pct, i) => (
                <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1.5">
                  <Skeleton
                    className="w-full rounded-t-sm"
                    style={{ height: Math.round((pct / 100) * 160) }}
                  />
                  <Skeleton className="h-[9px] w-10 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Column 2 — Mention Split donut (lg:col-span-3) */}
          <div className="flex flex-col items-center p-4 lg:col-span-3">
            <Skeleton className="mb-3 h-[10px] w-24 self-start rounded" />
            {/* Donut: size 128 */}
            <div className="relative flex size-[128px] shrink-0 items-center justify-center">
              <Skeleton className="size-full rounded-full" />
              {/* hollow centre */}
              <div className="absolute size-[68px] rounded-full bg-card" />
              <div className="absolute flex flex-col items-center gap-0.5">
                <Skeleton className="h-5 w-8 rounded" />
                <Skeleton className="h-[9px] w-12 rounded" />
              </div>
            </div>
            {/* legend rows */}
            <div className="mt-3 w-full space-y-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="size-2 shrink-0 rounded-full" />
                  <Skeleton className="h-[10px] flex-1 rounded" />
                  <Skeleton className="h-[10px] w-5 shrink-0 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Column 3 — Platform Reach list (lg:col-span-4) */}
          <div className="p-4 lg:col-span-4">
            <div className="mb-2.5 flex items-center gap-1.5">
              <Skeleton className="size-3 rounded" />
              <Skeleton className="h-[10px] w-24 rounded" />
            </div>
            {/* 7 platform rows */}
            <div className="space-y-1">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-lg border border-border/30 px-2.5 py-1.5"
                >
                  <Skeleton className="size-3.5 shrink-0 rounded-full" />
                  <Skeleton className="h-[11px] flex-1 rounded" />
                  <Skeleton className="h-[10px] w-5 shrink-0 rounded" />
                  <Skeleton className="size-3 shrink-0 rounded-full" />
                </div>
              ))}
            </div>

            {/* Coverage bar */}
            <div className="mt-3 space-y-2.5 border-t border-border/40 pt-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-[10px] w-16 rounded" />
                  <Skeleton className="h-[11px] w-8 rounded" />
                </div>
                <Skeleton className="h-1 w-full rounded-full" />
              </div>
              <div className="flex flex-wrap gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-5 w-14 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Platform Deep Dives ───────────────────────────────────── */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="size-3.5 rounded" />
          <Skeleton className="h-[10px] w-32 rounded" />
        </div>

        {/* lg:grid-cols-3 — left col stacks Google+Reddit, right 2 cols = Web */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          {/* Left column: Google card + Reddit card */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            {/* Google Details card */}
            <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
              <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-5 rounded" />
                  <Skeleton className="h-[13px] w-24 rounded" />
                </div>
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="size-3.5 shrink-0 rounded-full" />
                    <Skeleton className="h-[11px] flex-1 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Reddit Details card */}
            <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
              <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-5 rounded" />
                  <Skeleton className="h-[13px] w-24 rounded" />
                </div>
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <div className="space-y-3 p-4">
                {/* sentiment bars */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-[10px] w-14 rounded" />
                      <Skeleton className="h-[10px] w-8 rounded" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-lg border border-border/40 p-2 space-y-1">
                      <Skeleton className="h-[10px] w-12 rounded" />
                      <Skeleton className="h-5 w-10 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right 2 cols: Web Mentions panel */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-5 rounded" />
                <Skeleton className="h-[13px] w-32 rounded" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="p-4 space-y-4">
              {/* top stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border border-border/40 p-3 space-y-1.5">
                    <Skeleton className="h-[10px] w-16 rounded" />
                    <Skeleton className="h-7 w-10 rounded" />
                    <Skeleton className="h-[10px] w-12 rounded" />
                  </div>
                ))}
              </div>
              {/* mention rows */}
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-border/30 p-2.5">
                    <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <Skeleton className="h-[11px] w-4/5 rounded" />
                      <Skeleton className="h-[10px] w-1/2 rounded" />
                    </div>
                    <Skeleton className="h-4 w-12 shrink-0 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
