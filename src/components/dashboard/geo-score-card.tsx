"use client";

import { useId } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Sparkles } from "@/components/ui/sparkles";
import { cn } from "@/lib/utils";
import { CORAL } from "./constants";

const SEGMENTS = 28;

// Semicircle gauge — center at (110, 110), radius 88, spans 180°
function buildSegments(score: number) {
  const filled = Math.round((Math.min(100, Math.max(0, score)) / 100) * SEGMENTS);
  const cx = 110, cy = 110, r = 88, barW = 8, barH = 22;
  return Array.from({ length: SEGMENTS }, (_, i) => {
    const angleDeg = 180 - (i / (SEGMENTS - 1)) * 180;
    const rad = (angleDeg * Math.PI) / 180;
    return {
      key: i,
      x: cx + r * Math.cos(rad),
      y: cy - r * Math.sin(rad),
      rot: 90 - angleDeg,
      isFilled: i < filled,
      barW,
      barH,
    };
  });
}

function scoreTier(s: number) {
  if (s >= 70) return { label: "Strong",   color: "text-emerald-600" };
  if (s >= 40) return { label: "Moderate", color: "text-amber-600" };
  return              { label: "Low",      color: "text-rose-500" };
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
  const rounded = Math.round(compositeScore);
  const tier = scoreTier(rounded);
  const segments = buildSegments(compositeScore);

  return (
    <div className="relative col-span-3 flex h-full flex-col rounded-xl border border-neutral-100 bg-white px-4 pb-3 pt-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      {sparkle ? <Sparkles /> : null}

      {/* Title */}
      <div className="shrink-0">
        <p className="text-sm font-semibold text-foreground">GEO Score</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">Composite across pillars</p>
      </div>

      {/* Gauge — fills card width, 2:1 aspect ratio for the semicircle */}
      <div className="relative mt-3 w-full shrink-0" style={{ aspectRatio: "220 / 118" }}>
        <svg
          viewBox="0 0 220 118"
          className="absolute inset-0 h-full w-full"
          aria-label={`GEO score ${rounded} out of 100`}
          role="img"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={CORAL} stopOpacity="1" />
              <stop offset="100%" stopColor={CORAL} stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {segments.map(({ key, x, y, rot, isFilled, barW, barH }) => (
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
          ))}
        </svg>

        {/* Score label — centered in the arc mouth */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center pb-0.5">
          <p className="tabular-nums text-[28px] font-bold leading-none tracking-tight text-foreground">
            {rounded}
            <span className="text-[12px] font-semibold text-muted-foreground">/100</span>
          </p>
          <p className={cn("mt-1 text-[10px] font-semibold", tier.color)}>
            {tier.label}
          </p>
        </div>
      </div>

      {/* vs last run badge */}
      <div className="mt-3 shrink-0">
        {scoreChange !== null ? (
          <div
            className={cn(
              "flex w-full items-center justify-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold",
              scoreChange > 0 && "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
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
          <p className="text-center text-[9px] leading-snug text-muted-foreground">
            First analysis — trend after next run
          </p>
        )}
      </div>
    </div>
  );
}
