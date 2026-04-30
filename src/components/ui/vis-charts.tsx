"use client";

import { memo, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Sector,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export const BRAND_COLOR = "#e04a3d";

export const BRAND_PALETTE = [
  "#e04a3d",
  "#e04a3dcc",
  "#e04a3d99",
  "#e04a3d66",
  "#e04a3d4d",
  "#e04a3d33",
];

// ─── ScoreGauge ─────────────────────────────────────────────────────────────

interface ScoreGaugeProps {
  value: number;
  size?: number;
  color?: string;
  className?: string;
}

export const ScoreGauge = memo(function ScoreGauge({
  value,
  size = 100,
  color = BRAND_COLOR,
  className,
}: ScoreGaugeProps) {
  const config: ChartConfig = useMemo(
    () => ({ score: { label: "Score", color } }),
    [color],
  );
  const data = useMemo(() => [{ name: "score", value, fill: color }], [value, color]);

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <ChartContainer config={config} className="!aspect-square" style={{ width: size, height: size }}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="72%"
          outerRadius="100%"
          barSize={10}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar dataKey="value" cornerRadius={12} background={{ fill: "var(--muted)" }} />
        </RadialBarChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{value}</span>
        <span className="-mt-0.5 text-[10px] font-medium text-muted-foreground">/100</span>
      </div>
    </div>
  );
});

// ─── HorizontalScoreBar ─────────────────────────────────────────────────────

interface HorizontalScoreBarProps {
  label: string;
  value: number;
  color?: string;
  compact?: boolean;
  className?: string;
}

export const HorizontalScoreBar = memo(function HorizontalScoreBar({
  label,
  value,
  color = BRAND_COLOR,
  compact = false,
  className,
}: HorizontalScoreBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "shrink-0 truncate capitalize text-muted-foreground",
          compact ? "w-24 text-[11px]" : "w-28 text-xs",
        )}
      >
        {label.replace(/_/g, " ")}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/50">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span
        className={cn(
          "w-8 shrink-0 text-right font-mono font-semibold tabular-nums text-foreground",
          compact ? "text-[11px]" : "text-xs",
        )}
      >
        {Math.round(value)}
      </span>
    </div>
  );
});

// ─── BrandBarChart ───────────────────────────────────────────────────────────

export interface BarChartDatum {
  label: string;
  value: number;
  color?: string;
  meta?: Record<string, unknown>;
}

interface BrandBarChartProps {
  data: BarChartDatum[];
  height?: number;
  yDomain?: [number, number];
  yTickFormatter?: (v: number) => string;
  tooltipFormatter?: (value: number, datum: BarChartDatum) => [string, string];
  barSize?: number;
  className?: string;
}

export const BrandBarChart = memo(function BrandBarChart({
  data,
  height = 260,
  yDomain = [0, 100],
  yTickFormatter = String,
  tooltipFormatter,
  barSize = 32,
  className,
}: BrandBarChartProps) {
  const chartConfig: ChartConfig = useMemo(
    () => ({
      value: { label: "Share of Voice", color: BRAND_COLOR },
      ...Object.fromEntries(
        data.map((d, i) => [
          d.label,
          { label: d.label, color: d.color ?? BRAND_PALETTE[i % BRAND_PALETTE.length] },
        ]),
      ),
    }),
    [data],
  );

  const chartData = useMemo(
    () =>
      data.map((d, i) => ({
        label: d.label,
        value: d.value,
        fill: d.color ?? BRAND_PALETTE[i % BRAND_PALETTE.length],
        _meta: d.meta,
      })),
    [data],
  );

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("!aspect-auto w-full", className)}
      style={{ height }}
    >
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.35} />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          domain={yDomain}
          tickFormatter={yTickFormatter}
          width={34}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", fillOpacity: 0.25 }}
          content={
            <ChartTooltipContent
              hideLabel={false}
              formatter={(value, _name, _item, _index, payload) => {
                const v = typeof value === "number" ? value : Number(value ?? 0);
                const d = data.find((d) => d.label === (payload as Record<string, unknown>)?.label);
                const formatted =
                  tooltipFormatter && d
                    ? tooltipFormatter(v, d)[0]
                    : yTickFormatter(v);
                const fill =
                  ((payload as Record<string, unknown>)?.fill as string) ?? BRAND_COLOR;
                return (
                  <>
                    <div
                      className="mr-1 h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: fill }}
                    />
                    <span className="font-mono font-semibold tabular-nums text-foreground">
                      {formatted}
                    </span>
                  </>
                );
              }}
            />
          }
        />
        <Bar dataKey="value" radius={[5, 5, 0, 0]} barSize={barSize} isAnimationActive>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
});

// ─── BrandDonutChart — outer-arc label on hover ──────────────────────────────

export interface DonutDatum {
  name: string;
  value: number;
  color?: string;
}

interface BrandDonutChartProps {
  data: DonutDatum[];
  size?: number;
  innerRadius?: number | string;
  outerRadius?: number | string;
  centerLabel?: string;
  centerSub?: string;
  className?: string;
  /** @deprecated — label now renders outside the arc; this prop is no longer used */
  tooltipFormatter?: (value: number, name: string) => [string, string];
}

const RADIAN = Math.PI / 180;

// Renders only the visual expansion + connector dot — label is an HTML overlay
function DonutActiveShape(props: Record<string, unknown>) {
  const {
    cx, cy, innerRadius, outerRadius,
    startAngle, endAngle, fill,
  } = props as {
    cx: number; cy: number;
    innerRadius: number; outerRadius: number;
    startAngle: number; endAngle: number;
    fill: string;
  };

  const midAngle  = (startAngle + endAngle) / 2;
  const cos       = Math.cos(-midAngle * RADIAN);
  const sin       = Math.sin(-midAngle * RADIAN);
  const expandedOuter = outerRadius + 5;
  const dotR          = expandedOuter + 10;

  return (
    <g>
      {/* Expanded active sector */}
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={expandedOuter}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      {/* Short connector line */}
      <line
        x1={cx + (expandedOuter + 2) * cos}
        y1={cy + (expandedOuter + 2) * sin}
        x2={cx + dotR * cos}
        y2={cy + dotR * sin}
        stroke={fill}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.55}
      />
      {/* Anchor dot */}
      <circle cx={cx + dotR * cos} cy={cy + dotR * sin} r={2} fill={fill} opacity={0.75} />
    </g>
  );
}

export const BrandDonutChart = memo(function BrandDonutChart({
  data,
  size = 200,
  innerRadius = 50,
  outerRadius = 82,
  centerLabel,
  centerSub,
  className,
}: BrandDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeData, setActiveData] = useState<{
    startAngle: number; endAngle: number; fill: string; name: string; value: number;
  } | null>(null);

  const nonEmpty = useMemo(() => data.filter((d) => d.value > 0), [data]);

  const chartConfig: ChartConfig = useMemo(
    () =>
      Object.fromEntries(
        nonEmpty.map((d, i) => [
          d.name,
          { label: d.name, color: d.color ?? BRAND_PALETTE[i % BRAND_PALETTE.length] },
        ]),
      ),
    [nonEmpty],
  );

  const chartData = useMemo(
    () =>
      nonEmpty.map((d, i) => ({
        ...d,
        fill: d.color ?? BRAND_PALETTE[i % BRAND_PALETTE.length],
      })),
    [nonEmpty],
  );

  const labelInfo = useMemo(() => {
    if (!activeData) return null;
    const midAngle = (activeData.startAngle + activeData.endAngle) / 2;
    const r = (typeof outerRadius === "number" ? outerRadius : 56) + 22;
    const cos = Math.cos(-midAngle * RADIAN);
    const sin = Math.sin(-midAngle * RADIAN);
    return {
      x: size / 2 + r * cos,
      y: size / 2 + r * sin,
      name: activeData.name,
      value: activeData.value,
      color: activeData.fill,
      cos,
    };
  }, [activeData, outerRadius, size]);

  if (nonEmpty.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-xs text-muted-foreground",
          className,
        )}
        style={{ width: size, height: size }}
      >
        No data
      </div>
    );
  }

  const isHovering = activeIndex !== null;
  const cx = size / 2;
  const cy = size / 2;
  const hasBothLabels = centerLabel !== undefined && centerSub !== undefined;
  const labelFontSize = Math.min(24, Math.round(size * 0.17));

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <ChartContainer
        config={chartConfig}
        className="!aspect-square"
        style={{ width: size, height: size, overflow: "visible" }}
      >
        <PieChart style={{ overflow: "visible" }}>
          {/*
           * Center label lives inside the SVG — rendered BEFORE <Pie> so it
           * paints first. DonutActiveShape (rendered last by recharts as the
           * active sector) then paints on top, keeping outer labels visible.
           * This avoids the CSS stacking-context conflict caused by the old
           * position:absolute HTML overlay.
           */}
          {(centerLabel !== undefined || centerSub !== undefined) && (
            <g
              style={{
                opacity: isHovering ? 0.15 : 1,
                transition: "opacity 0.15s ease",
                pointerEvents: "none",
              }}
            >
              {centerLabel !== undefined && (
                <text
                  x={cx}
                  y={hasBothLabels ? cy - 7 : cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--foreground)"
                  fontSize={labelFontSize}
                  fontWeight={600}
                  fontFamily="inherit"
                >
                  {centerLabel}
                </text>
              )}
              {centerSub !== undefined && (
                <text
                  x={cx}
                  y={hasBothLabels ? cy + 11 : cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--muted-foreground)"
                  fontSize={10}
                  fontFamily="inherit"
                >
                  {centerSub}
                </text>
              )}
            </g>
          )}

          {/* Pie renders after center text — active shape paints last, on top */}
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            stroke="none"
            activeIndex={activeIndex ?? undefined}
            activeShape={DonutActiveShape as never}
            onMouseEnter={(data, index) => {
              setActiveIndex(index);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const d = data as any;
              setActiveData({ startAngle: d.startAngle, endAngle: d.endAngle, fill: d.fill, name: d.name, value: d.value });
            }}
            onMouseLeave={() => { setActiveIndex(null); setActiveData(null); }}
            isAnimationActive={false}
          >
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.fill}
                opacity={!isHovering || activeIndex === i ? 1 : 0.3}
                style={{ transition: "opacity 0.15s ease" }}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* HTML overlay label — paints above adjacent grid columns via z-index */}
      {labelInfo && (
        <div
          className="pointer-events-none"
          style={{
            position: "absolute",
            left: `${labelInfo.x}px`,
            top: `${labelInfo.y}px`,
            transform: `translate(${labelInfo.cos >= 0 ? "6px" : "calc(-100% - 6px)"}, -50%)`,
            zIndex: 50,
            whiteSpace: "nowrap",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "3px 8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.3, margin: 0 }}>
            {labelInfo.name}
          </p>
          <p style={{ fontSize: 10, fontWeight: 500, color: labelInfo.color, lineHeight: 1.3, margin: 0 }}>
            {labelInfo.value}
          </p>
        </div>
      )}
    </div>
  );
});
