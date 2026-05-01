"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Crown, Sparkles, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Competitor } from "@/lib/api/analyzer";

const PRIMARY_HEX = "#FF5A3C";

type Row = {
  key: string;
  name: string;
  url?: string;
  score: number;
  isYou: boolean;
  delta: number | null;
};

type ChartDatum = {
  name: string;
  short: string;
  score: number;
  isYou: boolean;
  url?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function barOpacity(score: number): number {
  if (score >= 70) return 1.0;
  if (score >= 40) return 0.65;
  return 0.35;
}

function scoreTextColor(score: number) {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-rose-500";
}

// ─── Brand logo ───────────────────────────────────────────────────────────────

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
        className={`flex shrink-0 items-center justify-center bg-gradient-to-br font-bold text-white ${rounded} ${avatarTint(name)}`}
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

// ─── Score comparison bars ────────────────────────────────────────────────────

function ScoreComparisonBars({ chartData }: { chartData: ChartDatum[] }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(t);
  }, []);

  const maxScore = Math.max(...chartData.map((d) => d.score), 1);

  return (
    <div className="space-y-3">
      {chartData.map((d, i) => {
        const pct = animated ? (d.score / maxScore) * 100 : 0;
        const opacity = barOpacity(d.score);
        const delay = `${i * 0.055}s`;

        return (
          <div key={i} className="flex items-center gap-3">
            {/* Brand label + logo */}
            <div className="flex w-36 shrink-0 items-center justify-end gap-1.5 overflow-hidden">
              <span
                className={cn(
                  "truncate text-[11px]",
                  d.isYou ? "font-semibold text-primary" : "font-medium text-foreground",
                )}
                title={d.name}
              >
                {d.short}
              </span>
              <BrandLogo name={d.name} url={d.url} size={20} />
            </div>

            {/* Background track + filled bar */}
            <div className="relative h-[13px] flex-1 overflow-hidden rounded-full bg-neutral-100/80">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: PRIMARY_HEX,
                  opacity,
                  transition: `width 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}`,
                }}
              />
              {d.isYou && (
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, transparent 60%, rgba(255,255,255,0.18) 100%)",
                    transition: `width 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}`,
                  }}
                />
              )}
            </div>

            {/* Score value */}
            <span className="w-9 shrink-0 text-right text-[11px] font-bold tabular-nums text-foreground">
              {fmt(d.score)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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
  const roundedGap = Math.round(leaderGap * 10) / 10;
  const scoreDelta = yourScore !== null ? Math.round((yourScore - avgScore) * 10) / 10 : null;

  return (
    <div className="col-span-12 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      {/* Header */}
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
          {/* ── Left: stat cards ─────────────────────────────────────────── */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
              {/* Your Rank */}
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
                  <span className={cn("text-3xl font-bold tabular-nums", isLeading ? "text-emerald-600" : "text-primary")}>
                    #{yourRank ?? "—"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">of {ranked.length}</span>
                </div>
                {isLeading ? (
                  <p className="mt-1 text-[11px] font-medium text-emerald-700">You're leading 🎉</p>
                ) : leader ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    <span className={cn("font-semibold", roundedGap > 0 ? "text-rose-600" : "text-emerald-600")}>
                      {roundedGap > 0 ? `−${roundedGap}` : `+${Math.abs(roundedGap)}`} pts
                    </span>{" "}
                    vs leader
                  </p>
                ) : null}
              </div>

              {/* Your Score */}
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
                    {yourScore !== null ? Math.round(yourScore) : "—"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">/100</span>
                </div>
                {yourScore !== null && totalScored > 0 && scoreDelta !== null ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Avg{" "}
                    <span className="font-semibold tabular-nums text-foreground">{avgScore}</span>
                    {scoreDelta !== 0 && (
                      <span className={cn("ml-1 font-semibold tabular-nums", scoreDelta > 0 ? "text-emerald-600" : "text-rose-600")}>
                        ({scoreDelta > 0 ? "+" : ""}{scoreDelta})
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
                  {top3.map((row, i) => (
                    <div key={row.key} className="flex items-center gap-2">
                      <span className="w-3.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                        {i + 1}
                      </span>
                      <BrandLogo name={row.name} url={row.url} size={18} />
                      <p className={cn("min-w-0 flex-1 truncate text-[11px]", row.isYou ? "font-semibold text-primary" : "font-medium text-foreground")}>
                        {row.name}
                      </p>
                      <span className={cn("text-[11px] font-bold tabular-nums", scoreTextColor(row.score))}>
                        {Math.round(row.score)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: bar chart ─────────────────────────────────────────── */}
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
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PRIMARY_HEX, opacity: 1.0 }} />
                    70+
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PRIMARY_HEX, opacity: 0.65 }} />
                    40–69
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PRIMARY_HEX, opacity: 0.35 }} />
                    &lt;40
                  </span>
                </div>
              </div>

              <ScoreComparisonBars chartData={chartData} />
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
