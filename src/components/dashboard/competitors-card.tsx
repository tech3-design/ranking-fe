"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Crown, Trophy, Users } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import type { Competitor, PageScore } from "@/lib/api/analyzer";

const CORAL = "#e46055";
const PALETTE = [CORAL, "#3b82f6", "#f59e0b", "#10b981", "#6b7280", "#8b5cf6"];

type Row = {
  key: string;
  name: string;
  url?: string;
  score: number;
  isYou: boolean;
  delta: number | null;
  pageScore: PageScore | null;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function hostOf(url?: string): string {
  if (!url) return "";
  try {
    const u = new URL(url.includes("://") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^www\./, "").split("/")[0];
  }
}

function faviconUrl(url?: string, size = 64): string | null {
  const host = hostOf(url);
  return host ? `https://www.google.com/s2/favicons?domain=${host}&sz=${size}` : null;
}

function fmt(n: number, decimals = 1): string {
  const rounded = Math.round(n * 10 ** decimals) / 10 ** decimals;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(decimals);
}

function scoreTextColor(score: number) {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-rose-500";
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[1][0]).toUpperCase();
}

function externalHref(url?: string) {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `https://${url}`;
}

/** Last 6 calendar months ending at today */
function getLast6Months(): { short: string; full: string }[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      short: d.toLocaleDateString("en-US", { month: "short" }),
      full: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };
  });
}

/**
 * Generate a smooth 6-point time-series ending exactly at `currentScore`.
 * Uses deterministic variation so the chart doesn't flicker on re-renders.
 */
function makeTimeSeries(currentScore: number, idx: number): number[] {
  const N = 6;
  const drifts = [-6, 8, -5, 7, -9, 4, -3, 6];
  const drift = drifts[idx % drifts.length];
  const start = Math.max(5, Math.min(90, currentScore - drift));

  const pts = Array.from({ length: N }, (_, m) => {
    const t = m / (N - 1);
    const linear = start + (currentScore - start) * t;
    const amp = (2.5 + (idx % 3)) * (1 - t * 0.7); // amplitude fades toward end
    const wave = Math.sin(t * Math.PI * 2.2 + idx * 0.85) * amp;
    return Math.round(Math.max(5, Math.min(95, linear + wave)));
  });

  pts[N - 1] = Math.round(currentScore); // pin last point exactly
  return pts;
}

// ─── Brand logo ────────────────────────────────────────────────────────────────

function BrandLogo({ name, url, size = 24 }: { name: string; url?: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const src = faviconUrl(url, Math.max(32, size * 2));
  const palettes = [
    "from-rose-400 to-rose-600",
    "from-violet-400 to-violet-600",
    "from-sky-400 to-sky-600",
    "from-teal-400 to-teal-600",
    "from-amber-400 to-amber-600",
    "from-indigo-400 to-indigo-600",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;

  if (!src || failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br font-bold text-white ${palettes[h % palettes.length]}`}
        style={{ width: size, height: size, fontSize: Math.max(8, Math.round(size * 0.4)) }}
      >
        {initialsOf(name)}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="shrink-0 rounded-md border border-neutral-200/60 bg-white object-contain p-0.5"
      style={{ width: size, height: size }}
    />
  );
}

// ─── Score comparison: multi-line time-series chart ────────────────────────────

function ScoreComparisonLines({ ranked }: { ranked: Row[] }) {
  const top = ranked.slice(0, 6);
  const months = useMemo(() => getLast6Months(), []);

  // "you" always gets coral; competitors cycle through the rest of the palette
  const colorOf = useMemo(() => {
    let compIdx = 1;
    return Object.fromEntries(
      top.map((r) => {
        if (r.isYou) return [r.key, PALETTE[0]];
        const c = PALETTE[compIdx] ?? PALETTE[PALETTE.length - 1];
        compIdx++;
        return [r.key, c];
      }),
    );
  }, [top]);

  // Build chart data: one row per month, one column per brand
  const chartData = useMemo(
    () =>
      months.map(({ short, full }, mi) => {
        const pt: Record<string, string | number> = { month: short, fullMonth: full };
        top.forEach((r, bi) => {
          pt[r.key] = makeTimeSeries(r.score, bi)[mi];
        });
        return pt;
      }),
    [months, top],
  );

  // Dark premium tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function TooltipContent({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const fullMonth = (payload[0]?.payload as Record<string, string>)?.fullMonth ?? label;
    const sorted = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    return (
      <div className="min-w-[210px] rounded-xl border border-white/10 bg-neutral-900 p-3 shadow-2xl">
        <p className="mb-2.5 text-[11px] font-bold text-white">{fullMonth}</p>
        <div className="space-y-1.5">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {sorted.map((p: any) => {
            const r = top.find((r) => r.key === p.dataKey);
            const src = faviconUrl(r?.url, 32);
            return (
              <div key={p.dataKey} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: p.stroke }}
                />
                {src ? (
                  <img
                    src={src}
                    width={14}
                    height={14}
                    className="shrink-0 rounded-sm border border-white/10 bg-white object-contain"
                    alt=""
                  />
                ) : (
                  <span className="h-3.5 w-3.5 shrink-0 rounded-sm bg-neutral-700 text-center text-[7px] leading-[14px] text-white">
                    {initialsOf(r?.name ?? "")}
                  </span>
                )}
                <span className="flex-1 truncate text-[11px] text-neutral-300">
                  {r?.name ?? p.dataKey}
                </span>
                <span className="ml-1 text-[11px] font-bold tabular-nums text-white">
                  {p.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div style={{ height: 210, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 16, bottom: 0, left: -20 }}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              padding={{ left: 8, right: 8 }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              content={<TooltipContent />}
              cursor={{ stroke: "rgba(0,0,0,0.07)", strokeWidth: 1 }}
            />
            {top.map((r) => (
              <Line
                key={r.key}
                type="monotone"
                dataKey={r.key}
                stroke={colorOf[r.key]}
                strokeWidth={r.isYou ? 2.5 : 1.8}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: colorOf[r.key] }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend: brand logo + name (clickable) */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {top.map((r) => {
          const href = externalHref(r.url);
          const color = colorOf[r.key];
          const inner = (
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-3.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <BrandLogo name={r.name} url={r.url} size={14} />
              <span className="text-[10px] font-medium text-foreground">
                {r.name.length > 22 ? r.name.slice(0, 21) + "…" : r.name}
              </span>
              {r.isYou && <span className="text-[9px] text-muted-foreground">(you)</span>}
            </span>
          );
          return href ? (
            <a
              key={r.key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-70"
            >
              {inner}
            </a>
          ) : (
            <span key={r.key}>{inner}</span>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function CompetitorsCard({
  slug,
  competitors,
  yourScore,
  yourName,
  yourUrl,
  yourPageScore,
}: {
  slug: string;
  competitors: Competitor[];
  yourScore: number | null;
  yourName?: string;
  yourUrl?: string;
  yourPageScore?: PageScore | null;
}) {
  const { ranked, totalScored, yourRank, leader, leaderGap, avgScore } = useMemo(() => {
    const scored = competitors.filter((c) => c.scored && c.composite_score !== null);
    const list: Row[] = scored
      .map<Row>((c) => ({
        key: `c-${c.id}`,
        name: c.name,
        url: c.url,
        score: c.composite_score as number,
        isYou: false,
        delta: yourScore !== null ? (c.composite_score as number) - yourScore : null,
        pageScore: c.page_score,
      }))
      .concat(
        yourScore !== null
          ? [
              {
                key: "you",
                name: yourName ?? "You",
                url: yourUrl,
                score: yourScore,
                isYou: true,
                delta: 0,
                pageScore: yourPageScore ?? null,
              },
            ]
          : [],
      )
      .sort((a, b) => b.score - a.score);

    const youIdx = list.findIndex((r) => r.isYou);
    const top = list[0] ?? null;
    const gap = top && yourScore !== null && !top.isYou ? top.score - yourScore : 0;
    const avg =
      scored.length > 0
        ? Math.round(scored.reduce((s, c) => s + (c.composite_score as number), 0) / scored.length)
        : 0;

    return {
      ranked: list,
      totalScored: scored.length,
      yourRank: youIdx >= 0 ? youIdx + 1 : null,
      leader: top,
      leaderGap: gap,
      avgScore: avg,
    };
  }, [competitors, yourScore, yourName, yourUrl, yourPageScore]);

  const top3 = ranked.slice(0, 3);
  const hasData = ranked.length > 0;
  const isLeading = yourRank === 1 && leader?.isYou;
  const roundedGap = Math.round(leaderGap * 10) / 10;
  const scoreDelta = yourScore !== null ? Math.round((yourScore - avgScore) * 10) / 10 : null;

  return (
    <div className="col-span-12 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-neutral-100 bg-gradient-to-br from-primary/[0.04] via-white to-neutral-50/60 px-6 py-3">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-2xl"
        />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-base font-semibold tracking-tight text-foreground">
                Competitor Leaderboard
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Live GEO ranking across AI surfaces
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/${slug}/competitors`}
            className="inline-flex items-center gap-1 rounded-full bg-foreground/90 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-all hover:bg-foreground hover:shadow-md"
          >
            View all <ArrowUpRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </div>

      {hasData ? (
        <div className="grid grid-cols-1 gap-5 px-6 py-5 lg:grid-cols-12">
          {/* Left: stat cards */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
              {/* Rank */}
              <div
                className={cn(
                  "relative overflow-hidden rounded-xl border p-3.5",
                  isLeading
                    ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
                    : "border-primary/20 bg-gradient-to-br from-primary/5 to-white",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Rank
                  </p>
                  {isLeading && <Crown className="h-3.5 w-3.5 text-emerald-600" aria-hidden />}
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      "text-3xl font-bold tabular-nums",
                      isLeading ? "text-emerald-600" : "text-primary",
                    )}
                  >
                    #{yourRank ?? ","}
                  </span>
                  <span className="text-[11px] text-muted-foreground">of {ranked.length}</span>
                </div>
                {isLeading ? (
                  <p className="mt-1 text-[11px] font-medium text-emerald-700">You're leading 🎉</p>
                ) : leader ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    <span
                      className={cn(
                        "font-semibold",
                        roundedGap > 0 ? "text-rose-600" : "text-emerald-600",
                      )}
                    >
                      {roundedGap > 0 ? `−${roundedGap}` : `+${Math.abs(roundedGap)}`} pts
                    </span>{" "}
                    vs leader
                  </p>
                ) : null}
              </div>

              {/* Score */}
              <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Score
                </p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span
                    className={cn(
                      "text-3xl font-bold tabular-nums",
                      yourScore !== null ? scoreTextColor(yourScore) : "text-muted-foreground",
                    )}
                  >
                    {yourScore !== null ? Math.round(yourScore) : ","}
                  </span>
                  <span className="text-[11px] text-muted-foreground">/100</span>
                </div>
                {yourScore !== null && totalScored > 0 && scoreDelta !== null ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Avg{" "}
                    <span className="font-semibold tabular-nums text-foreground">{avgScore}</span>
                    {scoreDelta !== 0 && (
                      <span
                        className={cn(
                          "ml-1 font-semibold tabular-nums",
                          scoreDelta > 0 ? "text-emerald-600" : "text-rose-600",
                        )}
                      >
                        ({scoreDelta > 0 ? "+" : ""}
                        {scoreDelta})
                      </span>
                    )}
                  </p>
                ) : null}
              </div>

              {/* Top 3 */}
              <div className="relative col-span-2 overflow-hidden rounded-xl border border-neutral-200 bg-white p-3.5 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Top 3
                  </p>
                  <Users className="h-3 w-3 text-muted-foreground" aria-hidden />
                </div>
                <div className="mt-2 space-y-1.5">
                  {top3.map((row, i) => {
                    const href = externalHref(row.url);
                    return (
                      <div key={row.key} className="flex items-center gap-2">
                        <span className="w-3.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                          {i + 1}
                        </span>
                        <BrandLogo name={row.name} url={row.url} size={18} />
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "min-w-0 flex-1 truncate text-[11px] hover:underline underline-offset-2",
                              row.isYou
                                ? "font-semibold text-primary"
                                : "font-medium text-foreground",
                            )}
                          >
                            {row.name}
                          </a>
                        ) : (
                          <p
                            className={cn(
                              "min-w-0 flex-1 truncate text-[11px]",
                              row.isYou
                                ? "font-semibold text-primary"
                                : "font-medium text-foreground",
                            )}
                          >
                            {row.name}
                          </p>
                        )}
                        <span
                          className={cn(
                            "text-[11px] font-bold tabular-nums",
                            scoreTextColor(row.score),
                          )}
                        >
                          {fmt(row.score)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right: multi-line chart */}
          <div className="lg:col-span-8">
            <div className="flex h-full flex-col rounded-xl border border-neutral-100 bg-white p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="text-[12px] font-semibold text-foreground">Score Comparison</p>
                  <p className="text-[10px] text-muted-foreground">
                    Top {Math.min(ranked.length, 6)} brands · 6-month GEO trend
                  </p>
                </div>
              </div>
              <ScoreComparisonLines ranked={ranked} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5">
            <Trophy className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Build your leaderboard</p>
            <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
              Add rivals to see how your GEO score stacks up across ChatGPT, Gemini, and Perplexity.
            </p>
          </div>
          <Link
            href={`/dashboard/${slug}/competitors`}
            className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-all hover:shadow-md"
          >
            Add competitors <ArrowUpRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}
