"use client";

import { useState, useMemo, useRef, useEffect, memo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Minus,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip,
} from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { ScoreHistoryPoint } from "@/lib/api/analyzer";
import { CORAL } from "./constants";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Sunday-indexed, matching Date.getDay()
const DAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatWeekTab(start: Date, end: Date): { line1: string; line2: string } {
  const sm = start.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const em = end.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const sd = String(start.getDate()).padStart(2, "0");
  const ed = String(end.getDate()).padStart(2, "0");
  if (sm === em) return { line1: sm, line2: `${sd}–${ed}` };
  return { line1: sm, line2: `${sd}–${em} ${ed}` };
}

interface WeekRange {
  start: Date;
  end: Date;
  points: ScoreHistoryPoint[];
}

interface DayBar {
  name: string;
  score: number | null;
  dateLabel: string;
  isFuture: boolean;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

// recharts v3 TooltipProps omits active/payload (read from context); use a local type
interface TooltipContentProps {
  active?: boolean;
  payload?: Array<{ payload: DayBar; value?: number }>;
}

function BarTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d || d.score == null) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-foreground mb-1">{d.dateLabel}</p>
      <div className="flex items-center gap-1.5">
        <span
          className="size-2 shrink-0 rounded-[2px]"
          style={{ backgroundColor: CORAL }}
        />
        <span className="text-muted-foreground">GEO Score</span>
        <span
          className="ml-2 font-mono font-bold tabular-nums"
          style={{ color: CORAL }}
        >
          {d.score}
          <span className="font-normal text-muted-foreground">/100</span>
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const CHART_CONFIG: ChartConfig = { score: { label: "GEO Score", color: CORAL } };

export const WeeklyPerformanceSection = memo(function WeeklyPerformanceSection({
  scoreHistory,
  joinDate,
}: {
  scoreHistory: ScoreHistoryPoint[];
  joinDate: string;
}) {
  // Build week ranges anchored to the user's actual start date.
  // Week 1 begins on joinDate (or the earliest scoreHistory point if older).
  // All subsequent weeks are strict 7-day intervals from that anchor — no
  // Monday-snapping — so April 30 stays April 30 for existing users and a
  // new user's first analysis date becomes their personal Week 1 start.
  const weeks = useMemo<WeekRange[]>(() => {
    const origin = new Date(joinDate);
    origin.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Pick the earliest of joinDate and the first scoreHistory point
    const earliestStr =
      scoreHistory.length > 0
        ? scoreHistory.reduce(
            (min, p) => (p.date < min ? p.date : min),
            scoreHistory[0].date,
          )
        : joinDate;
    const earliest = new Date(earliestStr);
    earliest.setHours(0, 0, 0, 0);

    // Anchor = the real start day (no Monday-snapping)
    const anchor = earliest < origin ? earliest : origin;

    const cursor = new Date(anchor);
    const result: WeekRange[] = [];

    while (cursor <= today) {
      const end = new Date(cursor);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      const points = scoreHistory.filter((p) => {
        const d = new Date(p.date);
        return d >= cursor && d <= end;
      });

      result.push({ start: new Date(cursor), end: new Date(end), points });
      cursor.setDate(cursor.getDate() + 7);
    }
    return result;
  }, [scoreHistory, joinDate]);

  // Initially show the most-recent week
  const [selectedIdx, setSelectedIdx] = useState(() => Math.max(0, weeks.length - 1));

  // Once history loads, jump to last week that actually has data
  const didInit = useRef(false);
  useEffect(() => {
    if (scoreHistory.length > 0 && !didInit.current) {
      didInit.current = true;
      for (let i = weeks.length - 1; i >= 0; i--) {
        if (weeks[i].points.length > 0) {
          setSelectedIdx(i);
          break;
        }
      }
    }
  }, [scoreHistory.length, weeks]);

  // Scroll selected tab into view whenever it changes
  const tabRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const btn = tabRefs.current.get(selectedIdx);
    btn?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [selectedIdx]);

  const selectedWeek = weeks[selectedIdx];

  // 7-bar chart data for the selected week.
  // Day labels are derived from the actual calendar date so they are always
  // correct regardless of which weekday the week starts on.
  const chartData = useMemo<DayBar[]>(() => {
    if (!selectedWeek) return [];
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(selectedWeek.start);
      date.setDate(date.getDate() + i);
      const pts = selectedWeek.points.filter((p) =>
        isSameDay(new Date(p.date), date),
      );
      const score =
        pts.length > 0
          ? Math.round(
              pts.reduce((s, p) => s + p.composite_score, 0) / pts.length,
            )
          : null;
      return {
        name: DAY_ABBREVS[date.getDay()],
        score,
        dateLabel: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        isFuture: date > now,
      };
    });
  }, [selectedWeek]);

  // Aggregate stats
  const weekAvg =
    selectedWeek?.points.length
      ? Math.round(
          selectedWeek.points.reduce((s, p) => s + p.composite_score, 0) /
            selectedWeek.points.length,
        )
      : null;

  const prevWeek = selectedIdx > 0 ? weeks[selectedIdx - 1] : null;
  const prevAvg =
    prevWeek?.points.length
      ? Math.round(
          prevWeek.points.reduce((s, p) => s + p.composite_score, 0) /
            prevWeek.points.length,
        )
      : null;

  const weekDelta =
    weekAvg != null && prevAvg != null ? weekAvg - prevAvg : null;

  const hasData = (selectedWeek?.points.length ?? 0) > 0;

  if (weeks.length === 0) return null;

  return (
    <div className="mb-3 overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      {/* ── Week tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-stretch border-b border-neutral-100">
        {/* Scroll left */}
        <button
          type="button"
          onClick={() =>
            scrollContainerRef.current?.scrollBy({ left: -220, behavior: "smooth" })
          }
          className="flex w-8 shrink-0 items-center justify-center border-r border-neutral-100 text-muted-foreground transition-colors hover:bg-neutral-50 hover:text-foreground"
          aria-label="Scroll weeks left"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        {/* Scrollable tab strip */}
        <div
          ref={scrollContainerRef}
          className="flex flex-1 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
        >
          {weeks.map((week, i) => {
            const { line1, line2 } = formatWeekTab(week.start, week.end);
            const isSelected = i === selectedIdx;
            const hasWeekData = week.points.length > 0;

            return (
              <button
                key={i}
                type="button"
                ref={(el) => {
                  if (el) tabRefs.current.set(i, el);
                  else tabRefs.current.delete(i);
                }}
                onClick={() => setSelectedIdx(i)}
                className={cn(
                  "relative flex min-w-[70px] shrink-0 flex-col items-center justify-center border-r border-neutral-50 px-3 py-2.5 transition-colors",
                  isSelected
                    ? "bg-white"
                    : "bg-neutral-50/40 hover:bg-neutral-50/80",
                )}
              >
                <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                  {line1}
                </span>
                <span
                  className={cn(
                    "mt-0.5 text-[11px] font-bold tabular-nums",
                    isSelected ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {line2}
                </span>
                {/* Bottom bar */}
                <span
                  className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: isSelected
                      ? CORAL
                      : hasWeekData
                        ? `${CORAL}45`
                        : "transparent",
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Scroll right */}
        <button
          type="button"
          onClick={() =>
            scrollContainerRef.current?.scrollBy({ left: 220, behavior: "smooth" })
          }
          className="flex w-8 shrink-0 items-center justify-center border-l border-neutral-100 text-muted-foreground transition-colors hover:bg-neutral-50 hover:text-foreground"
          aria-label="Scroll weeks right"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* ── Chart area ────────────────────────────────────────────────── */}
      <div className="px-4 pb-3 pt-3">
        {/* Row: title + stat */}
        <div className="mb-2.5 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">
              GEO Performance
            </p>
            {selectedWeek && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {selectedWeek.start.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                –{" "}
                {selectedWeek.end.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {weekAvg != null ? (
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Avg score
                </p>
                <p
                  className="text-xl font-bold tabular-nums tracking-tight leading-none mt-0.5"
                  style={{ color: CORAL }}
                >
                  {weekAvg}
                  <span className="text-xs font-normal text-muted-foreground">
                    /100
                  </span>
                </p>
              </div>
              {weekDelta !== null && (
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold",
                    weekDelta > 0
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700"
                      : weekDelta < 0
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-border bg-muted/40 text-muted-foreground",
                  )}
                >
                  {weekDelta > 0 ? (
                    <TrendingUp className="size-3 shrink-0" />
                  ) : weekDelta < 0 ? (
                    <TrendingDown className="size-3 shrink-0" />
                  ) : (
                    <Minus className="size-3 shrink-0" />
                  )}
                  <span>
                    {weekDelta > 0 ? "+" : ""}
                    {weekDelta} vs prev
                  </span>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Bar chart or empty state */}
        {hasData ? (
          <ChartContainer
            config={CHART_CONFIG}
            className="!aspect-auto w-full"
            style={{ height: 152 }}
          >
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -12, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeOpacity={0.28}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                width={28}
                tickCount={5}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", fillOpacity: 0.18 }}
                content={<BarTooltip />}
              />
              <Bar
                dataKey="score"
                radius={[4, 4, 0, 0]}
                barSize={34}
                isAnimationActive
              >
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.score != null ? CORAL : "transparent"}
                    fillOpacity={
                      entry.score != null
                        ? entry.isFuture
                          ? 0.3
                          : 0.88
                        : 0
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-36 flex-col items-center justify-center gap-2 rounded-xl bg-neutral-50/60">
            <div className="flex size-9 items-center justify-center rounded-xl bg-muted/25">
              <BarChart2 className="size-4 text-muted-foreground/40" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              No analysis runs this week
            </p>
            <p className="text-[11px] text-muted-foreground/60">
              Re-analyze to track GEO performance
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
