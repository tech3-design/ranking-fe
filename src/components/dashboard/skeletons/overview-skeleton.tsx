import { Skeleton } from "@/components/ui/skeleton";

// ─── Shared card shell ────────────────────────────────────────────────────────
function DashCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border border-neutral-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] ${className ?? ""}`}>
      {children}
    </div>
  );
}

// ─── Card header (title + optional subtitle) ──────────────────────────────────
function CardHeader({ wide = false }: { wide?: boolean }) {
  return (
    <div className="mb-3 shrink-0 space-y-1.5">
      <Skeleton className={`h-[14px] rounded ${wide ? "w-40" : "w-32"}`} />
      <Skeleton className="h-[10px] w-24 rounded" />
    </div>
  );
}

// ─── Row 1: GEO Score card ────────────────────────────────────────────────────
function GeoScoreCardSkeleton() {
  return (
    <div className="w-full shrink-0 sm:w-56">
      <DashCard className="flex h-full flex-col px-4 pb-4 pt-3.5">
        <Skeleton className="h-[14px] w-20 rounded" />
        <Skeleton className="mt-1 h-[10px] w-32 rounded" />

        {/* Gauge arc */}
        <div className="relative mx-auto mt-4 w-full max-w-[180px]" style={{ aspectRatio: "220 / 118" }}>
          {/* Arc segments simulation */}
          <Skeleton className="absolute inset-0 rounded-t-[500px] opacity-60" />
          {/* Score label */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 pb-0.5">
            <Skeleton className="h-7 w-16 rounded" />
            <Skeleton className="h-[10px] w-10 rounded" />
          </div>
        </div>

        {/* Trend badge */}
        <Skeleton className="mt-4 h-7 w-full rounded-full" />
      </DashCard>
    </div>
  );
}

// ─── Row 1: GEO Performance chart ────────────────────────────────────────────
function GeoPerformanceSkeleton() {
  const barHeights = [40, 70, 55, 85, 30, 65, 90];

  return (
    <div className="min-w-0 flex-1">
      <DashCard className="flex h-full flex-col overflow-hidden">
        {/* Date tab strip */}
        <div className="flex items-stretch border-b border-neutral-100">
          <div className="flex w-8 shrink-0 items-center justify-center border-r border-neutral-100" />
          <div className="flex flex-1 overflow-hidden">
            {[80, 72, 80, 72, 80].map((w, i) => (
              <div key={i} className="relative flex min-w-[70px] flex-1 flex-col items-center justify-center gap-1.5 border-r border-neutral-50 px-3 py-3">
                <Skeleton className="h-[9px] rounded" style={{ width: w * 0.45 }} />
                <Skeleton className="h-[11px] rounded" style={{ width: w * 0.65 }} />
                {i === 2 && <span className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full bg-primary/20" />}
              </div>
            ))}
          </div>
          <div className="flex w-8 shrink-0 items-center justify-center border-l border-neutral-100" />
        </div>

        {/* Chart header */}
        <div className="px-5 pb-3 pt-4">
          <div className="mb-4 flex items-start justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-[14px] w-36 rounded" />
              <Skeleton className="h-[10px] w-28 rounded" />
            </div>
            <div className="flex items-center gap-3">
              <div className="space-y-1.5 text-right">
                <Skeleton className="ml-auto h-[10px] w-16 rounded" />
                <Skeleton className="ml-auto h-6 w-12 rounded" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-1.5 px-6" style={{ height: 148 }}>
            {barHeights.map((pct, i) => (
              <div key={i} className="flex flex-1 flex-col justify-end">
                <Skeleton
                  className="w-full rounded-t-sm"
                  style={{ height: Math.round((pct / 100) * 130) }}
                />
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="mt-2 flex justify-between px-6">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-[8px] w-6 rounded" />
            ))}
          </div>
        </div>
      </DashCard>
    </div>
  );
}

// ─── Row 2: Visibility by Platform (col-span-4) ───────────────────────────────
function VisibilityByPlatformSkeleton() {
  return (
    <DashCard className="col-span-4 flex h-full min-h-0 flex-col p-3">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-[14px] w-36 rounded" />
        <Skeleton className="h-3.5 w-3.5 rounded" />
      </div>

      {/* 2×2 grid — featured (Google) + 3 others */}
      <div className="grid flex-1 grid-cols-2 gap-2" style={{ gridTemplateRows: "1fr 1fr" }}>
        {/* Featured card */}
        <div className="row-span-1 overflow-hidden rounded-xl">
          <Skeleton className="h-full w-full min-h-[80px]" />
        </div>

        {/* Top-right */}
        <div className="flex flex-col justify-between rounded-xl border border-neutral-100 p-2.5">
          <div className="flex items-start justify-between">
            <Skeleton className="h-[10px] w-12 rounded" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <div className="mt-2 space-y-1.5">
            <Skeleton className="h-6 w-10 rounded" />
            <Skeleton className="h-3.5 w-14 rounded-full" />
            <Skeleton className="h-[9px] w-12 rounded" />
          </div>
        </div>

        {/* Bottom-left */}
        <div className="flex flex-col justify-between rounded-xl border border-neutral-100 p-2.5">
          <div className="flex items-start justify-between">
            <Skeleton className="h-[10px] w-14 rounded" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <div className="mt-2 space-y-1.5">
            <Skeleton className="h-6 w-8 rounded" />
            <Skeleton className="h-3.5 w-14 rounded-full" />
            <Skeleton className="h-[9px] w-10 rounded" />
          </div>
        </div>

        {/* Bottom-right */}
        <div className="flex flex-col justify-between rounded-xl border border-neutral-100 p-2.5">
          <div className="flex items-start justify-between">
            <Skeleton className="h-[10px] w-8 rounded" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <div className="mt-2 space-y-1.5">
            <Skeleton className="h-6 w-10 rounded" />
            <Skeleton className="h-3.5 w-14 rounded-full" />
            <Skeleton className="h-[9px] w-10 rounded" />
          </div>
        </div>
      </div>
    </DashCard>
  );
}

// ─── Row 2: Pillar Breakdown (col-span-3) ─────────────────────────────────────
function PillarBreakdownSkeleton() {
  return (
    <div className="col-span-3 h-full min-h-0">
      <DashCard className="flex h-full flex-col p-4">
        <CardHeader />

        {/* Inner inset card with donut placeholder */}
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50/80 p-3">
          {/* Concentric ring placeholders */}
          <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
            <Skeleton className="absolute rounded-full opacity-20" style={{ width: 160, height: 160 }} />
            <Skeleton className="absolute rounded-full opacity-30" style={{ width: 126, height: 126 }} />
            <Skeleton className="absolute rounded-full opacity-40" style={{ width: 96, height: 96 }} />
            <Skeleton className="absolute rounded-full opacity-50" style={{ width: 66, height: 66 }} />
            {/* White center hole */}
            <div className="absolute z-10 rounded-full bg-neutral-50/80" style={{ width: 40, height: 40 }} />
          </div>
        </div>
      </DashCard>
    </div>
  );
}

// ─── Row 2: Sentiment Analysis (col-span-5) ───────────────────────────────────
function SentimentAnalysisSkeleton() {
  return (
    <div className="col-span-5 h-full min-h-0">
      <DashCard className="flex h-full flex-col p-4">
        <Skeleton className="h-[14px] w-36 rounded" />
        <Skeleton className="mt-1.5 h-[10px] w-52 rounded" />

        {/* Score + gauge */}
        <div className="mt-5 flex items-center gap-5">
          <div className="shrink-0 space-y-1.5 text-center">
            <Skeleton className="mx-auto h-10 w-12 rounded" />
            <Skeleton className="mx-auto h-[9px] w-12 rounded" />
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-[8px] w-6 rounded" />
              <Skeleton className="h-[8px] w-6 rounded" />
            </div>
          </div>
        </div>

        {/* Stat boxes row */}
        <div className="mt-5 grid grid-cols-4 gap-2">
          {["Positive", "Neutral", "Negative", "AI Mentions"].map((label) => (
            <div key={label} className="space-y-2 rounded-lg border border-neutral-100 bg-neutral-50/60 p-2.5">
              <Skeleton className="h-[9px] w-10 rounded" />
              <Skeleton className="h-5 w-8 rounded" />
            </div>
          ))}
        </div>

        {/* Stacked sentiment bar */}
        <div className="mt-4 overflow-hidden rounded-full">
          <Skeleton className="h-2.5 w-full rounded-full" />
        </div>
      </DashCard>
    </div>
  );
}

// ─── Row 3: Social Brand Reach (col-span-12) ─────────────────────────────────
function SocialReachSkeleton() {
  return (
    <DashCard className="col-span-12 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-neutral-100 px-5 py-4">
        <div className="space-y-1.5">
          <Skeleton className="h-[14px] w-44 rounded" />
          <Skeleton className="h-[10px] w-60 rounded" />
        </div>
        <Skeleton className="h-7 w-20 rounded-md" />
      </div>

      <div className="p-5">
        {/* Platform icons row */}
        <div className="mb-5 flex flex-wrap gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-[9px] w-10 rounded" />
              <Skeleton className="h-[10px] w-8 rounded" />
            </div>
          ))}
        </div>

        {/* World map placeholder with subtle grid lines */}
        <div className="relative overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50/50" style={{ height: 160 }}>
          <Skeleton className="h-full w-full rounded-xl opacity-40" />
          {/* Legend row */}
          <div className="absolute bottom-3 left-4 flex items-center gap-3">
            <Skeleton className="h-2 w-20 rounded-full" />
            <div className="flex gap-2">
              {[1,2,3,4,5,6,7].map((i) => (
                <Skeleton key={i} className="h-[9px] w-9 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashCard>
  );
}

// ─── Row 4: Competitors (col-span-12) ────────────────────────────────────────
function CompetitorsSkeleton() {
  return (
    <DashCard className="col-span-12 overflow-hidden">
      {/* Header — no trophy icon (removed in real card) */}
      <div className="border-b border-neutral-100 bg-gradient-to-br from-primary/[0.03] via-white to-neutral-50/60 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-[14px] w-44 rounded" />
            <Skeleton className="h-[10px] w-36 rounded" />
          </div>
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-12">
        {/* Left: stat cards */}
        <div className="flex flex-col gap-2.5 lg:col-span-4">
          {/* Rank */}
          <div className="overflow-hidden rounded-xl border border-neutral-100 p-3.5">
            <Skeleton className="mb-2 h-[9px] w-16 rounded" />
            <div className="flex items-baseline gap-1.5">
              <Skeleton className="h-9 w-10 rounded" />
              <Skeleton className="h-[10px] w-10 rounded" />
            </div>
            <Skeleton className="mt-1.5 h-[10px] w-24 rounded" />
          </div>
          {/* Score */}
          <div className="overflow-hidden rounded-xl border border-neutral-100 p-3.5">
            <Skeleton className="mb-2 h-[9px] w-16 rounded" />
            <div className="flex items-baseline gap-1">
              <Skeleton className="h-9 w-12 rounded" />
              <Skeleton className="h-[10px] w-10 rounded" />
            </div>
            <Skeleton className="mt-1.5 h-[10px] w-28 rounded" />
          </div>
          {/* Top 3 */}
          <div className="overflow-hidden rounded-xl border border-neutral-100 p-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <Skeleton className="h-[9px] w-8 rounded" />
              <Skeleton className="h-3 w-3 rounded" />
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-[9px] w-3 shrink-0 rounded" />
                  <Skeleton className="h-4 w-4 shrink-0 rounded-md" />
                  <Skeleton className="h-[10px] flex-1 rounded" />
                  <Skeleton className="h-[10px] w-8 shrink-0 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: score comparison line chart */}
        <div className="flex flex-col rounded-xl border border-neutral-100 p-4 lg:col-span-8">
          <div className="mb-3 space-y-1">
            <Skeleton className="h-[13px] w-36 rounded" />
            <Skeleton className="h-[10px] w-40 rounded" />
          </div>
          {/* Chart area */}
          <Skeleton className="flex-1 rounded-lg" style={{ minHeight: 160 }} />
          {/* Legend */}
          <div className="mt-3 flex gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Skeleton className="h-2 w-3.5 rounded-full" />
                <Skeleton className="h-3 w-4 rounded" />
                <Skeleton className="h-[10px] w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashCard>
  );
}

// ─── Page header skeleton ─────────────────────────────────────────────────────
function OverviewHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <Skeleton className="size-8 shrink-0 rounded-md" />
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-7 w-52 rounded sm:h-8 sm:w-64" />
          <Skeleton className="h-3 w-36 rounded" />
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-4 sm:gap-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-[10px] w-12 rounded" />
          <Skeleton className="h-5 w-16 rounded-sm" />
        </div>
        <div className="hidden flex-col gap-1 border-l border-border pl-4 sm:flex">
          <Skeleton className="h-[9px] w-16 rounded" />
          <Skeleton className="h-3.5 w-24 rounded" />
        </div>
        <div className="flex items-center gap-2 pl-2">
          <Skeleton className="h-8 w-24 rounded-sm" />
          <Skeleton className="h-8 w-[68px] rounded-sm" />
        </div>
      </div>
    </div>
  );
}

// ─── Full Overview page skeleton ──────────────────────────────────────────────
export function OverviewSkeleton() {
  return (
    <>
      <OverviewHeaderSkeleton />

      <div className="px-3 pb-4 pt-3 sm:px-4">
        {/* Row 1: GEO Score (w-56) + GEO Performance (flex-1) */}
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <GeoScoreCardSkeleton />
          <GeoPerformanceSkeleton />
        </div>

        {/* Row 2: Visibility(4) + Pillar(3) + Sentiment(5) */}
        <div className="mb-3 grid grid-cols-12 items-stretch gap-3">
          <VisibilityByPlatformSkeleton />
          <PillarBreakdownSkeleton />
          <SentimentAnalysisSkeleton />
        </div>

        {/* Row 3: Social Brand Reach */}
        <div className="mb-3 grid grid-cols-12 items-stretch gap-3">
          <SocialReachSkeleton />
        </div>

        {/* Row 4: Competitors */}
        <div className="mb-3 grid grid-cols-12 items-stretch gap-3">
          <CompetitorsSkeleton />
        </div>
      </div>
    </>
  );
}
