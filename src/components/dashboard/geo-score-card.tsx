"use client";

import { useId } from "react";
import { Minus, MoreHorizontal, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "@/components/ui/sparkles";
import { cn } from "@/lib/utils";
import { CORAL } from "./constants";

const GEO_SCORE_GAUGE_SEGMENTS = 25;

function getGeoScoreGaugeRects(score: number) {
  const total = GEO_SCORE_GAUGE_SEGMENTS;
  const filled = Math.round((Math.min(100, Math.max(0, score)) / 100) * total);
  const cx = 90;
  const cy = 94;
  const r = 68;
  const barW = 7;
  const barH = 20;
  return Array.from({ length: total }, (_, i) => {
    const angleDeg = 180 - (i / (total - 1)) * 180;
    const rad = (angleDeg * Math.PI) / 180;
    const x = cx + r * Math.cos(rad);
    const y = cy - r * Math.sin(rad);
    const rot = 90 - angleDeg;
    return {
      key: i,
      x,
      y,
      rot,
      isFilled: i < filled,
      barW,
      barH,
    };
  });
}

export function GeoScoreCard({
  compositeScore,
  scoreChange,
  sparkle = false,
}: {
  compositeScore: number;
  scoreChange: number | null;
  sparkle?: boolean;
}) {
  const gradId = useId().replace(/:/g, "");

  return (
    <div className="relative col-span-3 flex h-full min-h-0 flex-col rounded-xl border border-neutral-100 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      {sparkle ? <Sparkles /> : null}
      <div className="flex shrink-0 items-center justify-between mb-0.5">
        <p className="text-sm font-semibold text-foreground">GEO Score</p>
        {/* <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground"
          aria-label="GEO score options"
        >
          <MoreHorizontal className="size-4" />
        </Button> */}
      </div>
      <p className="mb-2 shrink-0 text-[10px] text-muted-foreground">Composite across pillars</p>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5">
        <div
          className="relative mx-auto w-[148px] shrink-0"
          style={{ height: 92 }}
          role="img"
          aria-label={`GEO score ${Math.round(compositeScore)} out of 100`}
        >
          <svg viewBox="0 0 180 108" className="absolute inset-0 size-full" aria-hidden>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={CORAL} stopOpacity="1" />
                <stop offset="100%" stopColor={CORAL} stopOpacity="0.85" />
              </linearGradient>
            </defs>
            {getGeoScoreGaugeRects(compositeScore).map(
              ({ key, x, y, rot, isFilled, barW, barH }) => (
                <rect
                  key={key}
                  x={-barW / 2}
                  y={-barH / 2}
                  width={barW}
                  height={barH}
                  rx={2.5}
                  fill={isFilled ? `url(#${gradId})` : "var(--border)"}
                  fillOpacity={isFilled ? 1 : 0.35}
                  transform={`translate(${x} ${y}) rotate(${rot})`}
                />
              ),
            )}
          </svg>
          <div className="pointer-events-none absolute left-1/2 top-[70%] flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5">
            <p className="tabular-nums text-[22px] font-bold leading-none tracking-tight text-foreground">
              {Math.round(compositeScore)}
              <span className="text-[10px] font-semibold text-muted-foreground">/100</span>
            </p>
          </div>
        </div>

      </div>

      <div className="shrink-0 border-t border-neutral-100 pt-2">
        {scoreChange !== null ? (
          <div
            className={cn(
              "flex w-full items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold",
              scoreChange > 0 && "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
              scoreChange < 0 && "border-primary/20 bg-primary/10 text-primary",
              scoreChange === 0 && "border-border bg-muted/40 text-muted-foreground",
            )}
          >
            {scoreChange > 0 ? (
              <TrendingUp className="size-3 shrink-0" aria-hidden />
            ) : scoreChange < 0 ? (
              <TrendingDown className="size-3 shrink-0" aria-hidden />
            ) : (
              <Minus className="size-3 shrink-0" aria-hidden />
            )}
            <span>
              {scoreChange > 0 ? "+" : ""}
              {scoreChange} vs last run
            </span>
          </div>
        ) : (
          <p className="text-center text-[9px] leading-snug text-muted-foreground">First analysis — trend after next run</p>
        )}
      </div>
    </div>
  );
}
