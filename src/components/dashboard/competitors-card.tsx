"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Crown, Sparkles, Trophy, Users } from "lucide-react";
import type { Competitor } from "@/lib/api/analyzer";

type Row = {
  key: string;
  name: string;
  url?: string;
  score: number;
  isYou: boolean;
  delta: number | null;
};

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

function BrandLogo({
  name,
  url,
  size = 24,
  rounded = "rounded-md",
}: {
  name: string;
  url?: string;
  size?: number;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = faviconUrl(url, Math.max(32, size * 2));

  if (!src || failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-gradient-to-br text-white font-bold ${rounded} ${avatarTint(name)}`}
        style={{ width: size, height: size, fontSize: Math.max(8, Math.round(size * 0.4)) }}
        aria-hidden
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
      className={`shrink-0 border border-neutral-200/60 bg-white object-contain p-0.5 ${rounded}`}
      style={{ width: size, height: size }}
    />
  );
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function avatarTint(name: string) {
  const palette = [
    "from-rose-400 to-rose-600",
    "from-violet-400 to-violet-600",
    "from-sky-400 to-sky-600",
    "from-teal-400 to-teal-600",
    "from-amber-400 to-amber-600",
    "from-fuchsia-400 to-fuchsia-600",
    "from-indigo-400 to-indigo-600",
    "from-emerald-400 to-emerald-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

function scoreColor(score: number) {
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#f59e0b";
  return "#f43f5e";
}

function scoreText(score: number) {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-rose-600";
}

const PRIMARY_HEX = "#FF5A3C";

type ChartDatum = {
  name: string;
  short: string;
  score: number;
  isYou: boolean;
  url?: string;
};

function YAxisLogoTick({
  x,
  y,
  payload,
  data,
}: {
  x?: number | string;
  y?: number | string;
  payload?: { value: string; index: number };
  data: ChartDatum[];
}) {
  if (x === undefined || y === undefined || !payload) return null;
  const xNum = typeof x === "number" ? x : Number(x);
  const yNum = typeof y === "number" ? y : Number(y);
  if (Number.isNaN(xNum) || Number.isNaN(yNum)) return null;
  const d = data[payload.index];
  if (!d) return null;
  const width = 132;
  const height = 28;
  return (
    <foreignObject x={xNum - width} y={yNum - height / 2} width={width} height={height}>
      <div
        // @ts-expect-error xmlns on div is required for SVG foreignObject content
        xmlns="http://www.w3.org/1999/xhtml"
        className="flex h-full items-center justify-end gap-1.5 pr-2"
      >
        <span
          className={`truncate text-[11px] ${
            d.isYou ? "font-semibold text-primary" : "font-medium text-foreground"
          }`}
          title={d.name}
        >
          {d.short}
        </span>
        <BrandLogo name={d.name} url={d.url} size={20} />
      </div>
    </foreignObject>
  );
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDatum }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-lg">
      <BrandLogo name={d.name} url={d.url} size={22} />
      <div>
        <p className="text-[11px] font-semibold text-foreground">{d.name}</p>
        <p className={`text-base font-bold tabular-nums leading-tight ${scoreText(d.score)}`}>
          {d.score}
          <span className="ml-1 text-[10px] font-normal text-muted-foreground">/100</span>
        </p>
      </div>
    </div>
  );
}

export function CompetitorsCard({
  slug,
  competitors,
  yourScore,
  yourName,
  yourUrl,
}: {
  slug: string;
  competitors: Competitor[];
  yourScore: number | null;
  yourName?: string;
  yourUrl?: string;
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
      }))
      .concat(
        yourScore !== null
          ? [{ key: "you", name: yourName ?? "You", url: yourUrl, score: yourScore, isYou: true, delta: 0 }]
          : [],
      )
      .sort((a, b) => b.score - a.score);

    const youIdx = list.findIndex((r) => r.isYou);
    const top = list[0] ?? null;
    const gap = top && yourScore !== null && !top.isYou ? top.score - yourScore : 0;
    const avg = scored.length > 0
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
  }, [competitors, yourScore, yourName, yourUrl]);

  const chartData: ChartDatum[] = ranked.slice(0, 8).map((r) => ({
    name: r.name,
    short: r.name.length > 16 ? r.name.slice(0, 15) + "…" : r.name,
    score: r.score,
    isYou: r.isYou,
    url: r.url,
  }));

  const top3 = ranked.slice(0, 3);
  const hasData = ranked.length > 0;
  const isLeading = yourRank === 1 && leader?.isYou;

  return (
    <div className="col-span-12 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="relative overflow-hidden border-b border-neutral-100 bg-gradient-to-br from-primary/[0.04] via-white to-neutral-50/60 px-6 py-4">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-2xl"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white shadow-md shadow-primary/20">
              <Trophy className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold tracking-tight text-foreground">
                  Competitor Leaderboard
                </p>
                <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Live GEO ranking across AI surfaces
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/${slug}/competitors`}
            className="inline-flex items-center gap-1 rounded-full bg-foreground/90 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-all hover:bg-foreground hover:shadow-md"
          >
            View all
            <ArrowUpRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </div>

      {hasData ? (
        <div className="grid grid-cols-1 gap-5 px-6 py-5 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
              <div
                className={`relative overflow-hidden rounded-xl border p-3.5 ${
                  isLeading
                    ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
                    : "border-primary/20 bg-gradient-to-br from-primary/5 to-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Rank
                  </p>
                  {isLeading ? (
                    <Crown className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                  ) : null}
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className={`text-3xl font-bold tabular-nums ${isLeading ? "text-emerald-600" : "text-primary"}`}>
                    #{yourRank ?? "—"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">of {ranked.length}</span>
                </div>
                {isLeading ? (
                  <p className="mt-1 text-[11px] font-medium text-emerald-700">You're leading 🎉</p>
                ) : leader ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    <span className={`font-semibold ${leaderGap > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                      {leaderGap > 0 ? `−${leaderGap}` : `+${Math.abs(leaderGap)}`} pts
                    </span>{" "}
                    vs leader
                  </p>
                ) : null}
              </div>

              <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Score
                </p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span
                    className="text-3xl font-bold tabular-nums"
                    style={{ color: yourScore !== null ? scoreColor(yourScore) : "#94a3b8" }}
                  >
                    {yourScore ?? "—"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">/100</span>
                </div>
                {yourScore !== null && totalScored > 0 ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Avg{" "}
                    <span className="font-semibold tabular-nums text-foreground">{avgScore}</span>
                    {yourScore - avgScore !== 0 ? (
                      <span
                        className={`ml-1 font-semibold tabular-nums ${
                          yourScore - avgScore > 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        ({yourScore - avgScore > 0 ? "+" : ""}
                        {yourScore - avgScore})
                      </span>
                    ) : null}
                  </p>
                ) : null}
              </div>

              <div className="relative col-span-2 overflow-hidden rounded-xl border border-neutral-200 bg-white p-3.5 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Top 3
                  </p>
                  <Users className="h-3 w-3 text-muted-foreground" aria-hidden />
                </div>
                <div className="mt-2 space-y-1.5">
                  {top3.map((row, i) => (
                    <div key={row.key} className="flex items-center gap-2">
                      <span className="w-3.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                        {i + 1}
                      </span>
                      <BrandLogo name={row.name} url={row.url} size={18} />
                      <p
                        className={`min-w-0 flex-1 truncate text-[11px] ${
                          row.isYou ? "font-semibold text-primary" : "font-medium text-foreground"
                        }`}
                      >
                        {row.name}
                      </p>
                      <span
                        className="text-[11px] font-bold tabular-nums"
                        style={{ color: scoreColor(row.score) }}
                      >
                        {row.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="flex h-full flex-col rounded-xl border border-neutral-100 bg-gradient-to-br from-neutral-50/40 to-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold text-foreground">Score Comparison</p>
                  <p className="text-[10px] text-muted-foreground">
                    Top {chartData.length} brands · ranked by GEO score
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    70+
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    40-69
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    &lt;40
                  </span>
                </div>
              </div>
              <div style={{ width: "100%", height: Math.max(180, chartData.length * 32) }}>
                <ResponsiveContainer>
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 4, right: 36, left: 0, bottom: 0 }}
                    barCategoryGap={6}
                  >
                    <defs>
                      <linearGradient id="primaryBar" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={PRIMARY_HEX} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={PRIMARY_HEX} stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      hide
                    />
                    <YAxis
                      type="category"
                      dataKey="short"
                      width={138}
                      tick={(props) => <YAxisLogoTick {...props} data={chartData} />}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                    />
                    <Tooltip cursor={{ fill: "rgba(15,23,42,0.04)" }} content={<ChartTooltip />} />
                    <Bar
                      dataKey="score"
                      radius={[6, 6, 6, 6]}
                      label={{
                        position: "right",
                        fontSize: 11,
                        fontWeight: 600,
                        fill: "#334155",
                        formatter: (v: unknown) => (v == null ? "" : `${v}`),
                      }}
                    >
                      {chartData.map((d, i) => (
                        <Cell
                          key={i}
                          fill={d.isYou ? "url(#primaryBar)" : scoreColor(d.score)}
                          fillOpacity={d.isYou ? 1 : 0.85}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
              Add rivals to see how your GEO score stacks up across ChatGPT, Gemini, and Perplexity — and where the next win lives.
            </p>
          </div>
          <Link
            href={`/dashboard/${slug}/competitors`}
            className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-all hover:shadow-md"
          >
            Add competitors
            <ArrowUpRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}
