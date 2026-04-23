"use client";

import { useId, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ScoreHistoryPoint } from "@/lib/api/analyzer";
import { CORAL } from "./constants";
import type { HistoryPathData } from "./types";

function buildHistoryPath(filteredHistory: ScoreHistoryPoint[]): HistoryPathData | null {
  if (filteredHistory.length === 0) return null;
  const recent = filteredHistory.slice(-12);
  const w = 300;
  const h = 100;

  if (recent.length === 1) {
    const y = h - (recent[0].composite_score / 100) * h;
    const d = new Date(recent[0].date);
    return {
      line: `M 0 ${y.toFixed(1)} L ${w} ${y.toFixed(1)}`,
      area: `M 0 ${y.toFixed(1)} L ${w} ${y.toFixed(1)} L ${w} ${h} L 0 ${h} Z`,
      labels: [d.toLocaleDateString("en-US", { month: "short", day: "numeric" })],
      points: [{ x: w / 2, y, score: recent[0].composite_score }],
    };
  }

  const points = recent.map((pt, i) => {
    const x = (i / (recent.length - 1)) * w;
    const y = h - (pt.composite_score / 100) * h;
    return { x, y, score: pt.composite_score };
  });
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;
  const labels = recent.map((pt) => {
    const d = new Date(pt.date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
  return { line, area, labels, points };
}

export function GeoScoreHistoryCard({ scoreHistory }: { scoreHistory: ScoreHistoryPoint[] }) {
  const [historyRange, setHistoryRange] = useState<"7d" | "1m" | "3m" | "all">("all");
  const [historyDropdownOpen, setHistoryDropdownOpen] = useState(false);
  const gradId = useId().replace(/:/g, "");

  const filteredHistory = useMemo(() => {
    if (historyRange === "all") return scoreHistory;
    const now = new Date();
    const cutoff = new Date();
    if (historyRange === "7d") cutoff.setDate(now.getDate() - 7);
    else if (historyRange === "1m") cutoff.setMonth(now.getMonth() - 1);
    else if (historyRange === "3m") cutoff.setMonth(now.getMonth() - 3);
    return scoreHistory.filter((pt) => new Date(pt.date) >= cutoff);
  }, [scoreHistory, historyRange]);

  const historyPath = useMemo(() => buildHistoryPath(filteredHistory), [filteredHistory]);

  return (
    <div className="col-span-5 bg-white rounded-xl p-5 border border-neutral-100 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-foreground">GEO Score History</p>
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setHistoryDropdownOpen(!historyDropdownOpen)}
            className="h-7 gap-1 border-neutral-200/90 bg-card px-2.5 text-[11px] font-medium text-muted-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            {{ "7d": "7 days", "1m": "1 month", "3m": "3 months", "all": "All time" }[historyRange]}
            <ChevronDown className="size-3 opacity-70" aria-hidden />
          </Button>
          {historyDropdownOpen ? (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[118px] rounded-md border border-border bg-card py-0.5 shadow-md ring-1 ring-black/5 dark:ring-white/10">
              {(
                [
                  ["7d", "7 days"],
                  ["1m", "1 month"],
                  ["3m", "3 months"],
                  ["all", "All time"],
                ] as const
              ).map(([key, label]) => (
                <Button
                  key={key}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setHistoryRange(key);
                    setHistoryDropdownOpen(false);
                  }}
                  className={cn(
                    "h-8 w-full justify-start rounded-none px-3 text-xs font-normal",
                    historyRange === key
                      ? "bg-primary/10 font-semibold text-primary hover:bg-primary/15"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="h-[120px] relative">
        {historyPath ? (
          <svg viewBox="0 0 300 100" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={CORAL} stopOpacity="0.2" />
                <stop offset="100%" stopColor={CORAL} stopOpacity="0" />
              </linearGradient>
            </defs>
            <line
              x1="0"
              y1="50"
              x2="300"
              y2="50"
              stroke="currentColor"
              strokeOpacity="0.06"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1="0"
              y1="25"
              x2="300"
              y2="25"
              stroke="currentColor"
              strokeOpacity="0.04"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1="0"
              y1="75"
              x2="300"
              y2="75"
              stroke="currentColor"
              strokeOpacity="0.04"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <path d={historyPath.area} fill={`url(#${gradId})`} />
            <path
              d={historyPath.line}
              fill="none"
              stroke={CORAL}
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {historyPath.points?.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="6"
                  fill={CORAL}
                  fillOpacity="0.15"
                  vectorEffect="non-scaling-stroke"
                />
                <circle cx={pt.x} cy={pt.y} r="3" fill={CORAL} vectorEffect="non-scaling-stroke" />
              </g>
            ))}
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted-foreground">No analysis history yet</p>
          </div>
        )}
        {historyPath && (
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] font-medium text-muted-foreground">
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>
        )}
      </div>
      {historyPath && (
        <div className="flex justify-between text-[10px] mt-2 px-1 text-muted-foreground">
          {historyPath.labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}
