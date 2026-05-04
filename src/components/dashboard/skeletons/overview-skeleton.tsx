import { Skeleton } from "@/components/ui/skeleton";

// ─── Card shell shared by every dashboard card ────────────────────────────────
function DashCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-neutral-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

// ─── Row 1 left: GEO Score card ───────────────────────────────────────────────
function GeoScoreCardSkeleton() {
  return (
    <div className="w-full shrink-0 sm:w-56">
      <DashCard className="flex h-full flex-col px-4 pb-3 pt-3.5">
        {/* title */}
        <Skeleton className="h-[15px] w-[84px] rounded" />
        <Skeleton className="mt-1 h-[10px] w-[130px] rounded" />

        {/* semicircle gauge area */}
        <div
          className="relative mt-3 w-full overflow-hidden"
          style={{ aspectRatio: "220 / 118" }}
        >
          <Skeleton className="absolute inset-0 rounded-t-[500px]" />
          {/* score centred at arc mouth */}
          <div className="pointer-events-none absolute inset-x-0 bottom-1 flex flex-col items-center gap-1">
            <Skeleton className="h-7 w-14 rounded" />
            <Skeleton className="h-[10px] w-10 rounded" />
          </div>
        </div>

        {/* change badge */}
        <Skeleton className="mt-3 h-7 w-full rounded-full" />
      </DashCard>
    </div>
  );
}

// ─── Row 1 right: Weekly Performance / GEO Performance chart ─────────────────
function WeeklyPerformanceSkeleton() {
  const BAR_HEIGHTS = [65, 42, 80, 55, 90, 35, 72]; // visual variety

  return (
    <div className="min-w-0 flex-1">
      <DashCard className="flex h-full flex-col overflow-hidden">
        {/* tab strip */}
        <div className="flex items-stretch border-b border-neutral-100">
          {/* left scroll btn */}
          <div className="flex w-8 shrink-0 items-center justify-center border-r border-neutral-100" />

          {/* tabs */}
          <div className="flex flex-1 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="relative flex min-w-[70px] flex-col items-center justify-center gap-1 border-r border-neutral-50 px-3 py-2.5"
              >
                <Skeleton className="h-[9px] w-8 rounded-sm" />
                <Skeleton className="h-[11px] w-12 rounded-sm" />
                {i === 5 && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full bg-muted" />
                )}
              </div>
            ))}
          </div>

          {/* right scroll btn */}
          <div className="flex w-8 shrink-0 items-center justify-center border-l border-neutral-100" />
        </div>

        {/* chart content */}
        <div className="px-4 pb-3 pt-3">
          {/* header row */}
          <div className="mb-2.5 flex items-start justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-[14px] w-36 rounded" />
              <Skeleton className="h-[10px] w-28 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="space-y-1.5 text-right">
                <Skeleton className="ml-auto h-[10px] w-14 rounded" />
                <Skeleton className="ml-auto h-5 w-12 rounded" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>

          {/* bars */}
          <div className="flex items-end gap-1 px-7" style={{ height: 152 }}>
            {BAR_HEIGHTS.map((pct, i) => (
              <div key={i} className="flex flex-1 flex-col justify-end">
                <Skeleton
                  className="w-full rounded-t-[4px]"
                  style={{ height: Math.round((pct / 100) * 130) }}
                />
              </div>
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
    <DashCard className="col-span-6 flex h-full min-h-0 flex-col p-3">
      {/* title row */}
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-[14px] w-36 rounded" />
        <Skeleton className="h-3.5 w-3.5 rounded" />
      </div>

      {/* 2 × 2 platform grid */}
      <div className="grid flex-1 grid-cols-2 gap-2" style={{ gridTemplateRows: "1fr 1fr" }}>
        {/* featured card (Google) */}
        <Skeleton className="rounded-xl" />

        {/* other 3 */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-xl border border-neutral-100 bg-white p-2.5"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="h-[10px] w-14 rounded" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="mt-1 space-y-1">
              <Skeleton className="h-7 w-14 rounded" />
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-[10px] w-12 rounded" />
            </div>
          </div>
        ))}
      </div>
    </DashCard>
  );
}

// ─── Row 2: Pillar Breakdown + Top Issues (col-span-5) ────────────────────────
function PillarAndIssuesSkeleton() {
  return (
    <div className="col-span-6 flex h-full min-h-0 flex-col gap-2">
      {/* Pillar Breakdown */}
      <DashCard className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-3.5 pb-2 pt-3">
          <Skeleton className="h-[14px] w-32 rounded" />
          <Skeleton className="h-3.5 w-3.5 rounded" />
        </div>

        <div className="flex-1 overflow-hidden px-2 pb-2">
          <div className="h-full rounded-lg border border-neutral-100 p-3">
            <div className="space-y-3.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-[10px] w-16 shrink-0 rounded" />
                  <Skeleton className="h-1.5 flex-1 rounded-full" />
                  <Skeleton className="h-[10px] w-11 shrink-0 rounded" />
                </div>
              ))}
            </div>

            {/* scale footer */}
            <div className="mt-3 flex justify-between">
              {["0", "25", "50", "75", "100"].map((v) => (
                <Skeleton key={v} className="h-[8px] w-3 rounded" />
              ))}
            </div>
          </div>
        </div>
      </DashCard>

      {/* Top Issues */}
      <DashCard className="shrink-0 p-2">
        <div className="mb-1.5 flex items-center justify-between">
          <Skeleton className="h-[10px] w-24 rounded" />
          <Skeleton className="h-[9px] w-16 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded border border-border/70 bg-white px-1.5 py-1">
              <Skeleton className="mb-1 h-[8px] w-10 rounded" />
              <Skeleton className="h-[10px] w-full rounded" />
              <Skeleton className="mt-0.5 h-[10px] w-3/4 rounded" />
            </div>
          ))}
        </div>
      </DashCard>
    </div>
  );
}

// ─── Row 3: Social Brand Reach (col-span-12) ─────────────────────────────────
function SocialReachSkeleton() {
  return (
    <DashCard className="col-span-12">
      {/* header */}
      <div className="flex items-start justify-between border-b border-neutral-50 px-5 py-4">
        <div className="space-y-1.5">
          <Skeleton className="h-[14px] w-40 rounded" />
          <Skeleton className="h-[10px] w-56 rounded" />
        </div>
        <Skeleton className="h-7 w-24 rounded-md" />
      </div>

      <div className="p-5">
        {/* dimension bars row */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-neutral-100 bg-neutral-50/40 p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-[10px] w-20 rounded" />
              </div>
              <Skeleton className="h-6 w-10 rounded" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>

        {/* social platforms row */}
        <div className="mb-4 flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-neutral-100 bg-white px-3 py-2"
            >
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-[10px] w-16 rounded" />
                <Skeleton className="h-[10px] w-12 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* world map placeholder */}
        <Skeleton className="h-36 w-full rounded-lg" />
      </div>
    </DashCard>
  );
}

// ─── Row 4: Competitors (col-span-12) ────────────────────────────────────────
function CompetitorsSkeleton() {
  const BAR_WIDTHS = [88, 76, 65, 58, 48, 38];

  return (
    <DashCard className="col-span-12 overflow-hidden">
      {/* gradient header */}
      <div className="relative overflow-hidden border-b border-neutral-100 bg-gradient-to-r from-primary/[0.04] via-white to-neutral-50/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-[14px] w-44 rounded" />
              <Skeleton className="h-[10px] w-28 rounded" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>

      {/* stats + bars */}
      <div className="grid gap-4 p-5 lg:grid-cols-12">
        {/* left stat cards */}
        <div className="flex flex-col gap-3 lg:col-span-4">
          {/* rank */}
          <div className="rounded-lg border border-neutral-100 p-3">
            <Skeleton className="mb-2 h-[10px] w-20 rounded" />
            <Skeleton className="h-9 w-12 rounded" />
            <Skeleton className="mt-1.5 h-[10px] w-28 rounded" />
          </div>
          {/* score */}
          <div className="rounded-lg border border-neutral-100 p-3">
            <Skeleton className="mb-2 h-[10px] w-16 rounded" />
            <Skeleton className="h-9 w-14 rounded" />
          </div>
          {/* top 3 */}
          <div className="space-y-2 rounded-lg border border-neutral-100 p-3">
            <Skeleton className="mb-1 h-[10px] w-20 rounded" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-[9px] w-[9px] shrink-0 rounded-full" />
                <Skeleton className="h-[10px] flex-1 rounded" />
                <Skeleton className="h-[10px] w-8 shrink-0 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* right: score comparison bars */}
        <div className="space-y-3 lg:col-span-8">
          <Skeleton className="mb-2 h-[10px] w-32 rounded" />
          {BAR_WIDTHS.map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3.5 w-36 shrink-0 rounded" />
              <div className="h-[13px] flex-1 overflow-hidden rounded-full bg-neutral-100/80">
                <Skeleton
                  className="h-full rounded-full"
                  style={{ width: `${w}%` }}
                />
              </div>
              <Skeleton className="h-3.5 w-9 shrink-0 rounded" />
            </div>
          ))}
        </div>
      </div>
    </DashCard>
  );
}

// ─── Row 5: Prediction + Sentiment (conditional row) ─────────────────────────
function PredictionSentimentSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-3">
      {/* Score Prediction (col-7) */}
      <DashCard className="col-span-12 px-4 pb-4 pt-3.5 md:col-span-7">
        <div className="mb-3 flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-[14px] w-36 rounded" />
            <Skeleton className="h-[10px] w-28 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-12 rounded" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-6 w-12 rounded" />
          </div>
        </div>
        {/* SVG chart area */}
        <Skeleton className="h-[140px] w-full rounded-lg" />
        {/* pillar impact chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-6 w-[72px] rounded-lg" />
          ))}
        </div>
      </DashCard>

      {/* Sentiment (col-5) */}
      <DashCard className="col-span-12 px-4 pb-4 pt-3.5 md:col-span-5">
        <Skeleton className="mb-4 h-[14px] w-36 rounded" />
        {/* large score */}
        <div className="mb-3 flex justify-center">
          <Skeleton className="h-10 w-12 rounded" />
        </div>
        {/* gradient gauge bar */}
        <Skeleton className="mb-4 h-3 w-full rounded-full" />
        {/* 4 stat cells */}
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="space-y-1.5 rounded-lg border border-neutral-100 bg-neutral-50/60 p-2"
            >
              <Skeleton className="h-[10px] w-12 rounded" />
              <Skeleton className="h-5 w-8 rounded" />
            </div>
          ))}
        </div>
        {/* stacked bar */}
        <Skeleton className="mt-3 h-2.5 w-full rounded-full" />
      </DashCard>
    </div>
  );
}

// ─── Page header skeleton ─────────────────────────────────────────────────────
function OverviewHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      {/* left: favicon + name + domain */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <Skeleton className="size-10 shrink-0 rounded-lg sm:size-12" />
        <div className="min-w-0 space-y-1.5">
          <Skeleton className="h-7 w-44 rounded sm:h-8 sm:w-52" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>
      </div>

      {/* right: status + date + buttons */}
      <div className="flex shrink-0 flex-wrap items-center gap-4 sm:gap-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-12 rounded" />
          <Skeleton className="h-5 w-16 rounded-sm" />
        </div>
        <div className="hidden flex-col gap-0.5 border-l border-border pl-4 sm:flex">
          <Skeleton className="h-[10px] w-16 rounded" />
          <Skeleton className="h-3.5 w-24 rounded" />
        </div>
        <div className="flex items-center gap-2 pl-2">
          <Skeleton className="h-8 w-[90px] rounded-sm" />
          <Skeleton className="h-8 w-[72px] rounded-sm" />
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
        {/* Row 1: GEO Score + Weekly Performance */}
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <GeoScoreCardSkeleton />
          <WeeklyPerformanceSkeleton />
        </div>

        {/* Row 2: Visibility col-6 + Pillar/Issues col-6 */}
        <div className="mb-3 grid grid-cols-12 items-stretch gap-3">
          <VisibilityByPlatformSkeleton />
          <PillarAndIssuesSkeleton />
        </div>

        {/* Row 3: Social Brand Reach */}
        <div className="mb-3 grid grid-cols-12 items-stretch gap-3">
          <SocialReachSkeleton />
        </div>

        {/* Row 4: Competitors */}
        <div className="mb-3 grid grid-cols-12 items-stretch gap-3">
          <CompetitorsSkeleton />
        </div>

        {/* Row 5: Prediction + Sentiment */}
        <PredictionSentimentSkeleton />
      </div>
    </>
  );
}
