"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  getExportPDFUrl,
  startAnalysis,
} from "@/lib/api/analyzer";
import { useRun } from "./_components/run-context";
import { config, routes } from "@/lib/config";
import {
  ChevronLeft,
  ArrowUpRight,
  ArrowRight,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Zap,
  Calendar,
  Globe2,
  Sparkles,
} from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";
import { RotatingGeoFact } from "@/components/ui/rotating-geo-fact";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { cn } from "@/lib/utils";

/* ── Neon orange accent (matches brand primary) ── */
const LIME = "#FF5A2B"; // kept var name for minimal diff; now neon orange
const INK = "#111111";

type Range = "Today" | "Week" | "Month" | "Year";
const RANGES: Range[] = ["Today", "Week", "Month", "Year"];

const PILLAR_COLORS: Record<string, string> = {
  Content: "#FF5A2B",
  Schema: "#E04A3D",
  "E-E-A-T": "#B8392E",
  Technical: "#7F2720",
};

/* ── page ── */
export default function SignalorDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const { run, scoreHistory, loading, error } = useRun();
  const [reanalyzing, setReanalyzing] = useState(false);
  const [reanalyzeError, setReanalyzeError] = useState("");
  const [range, setRange] = useState<Range>("Month");

  // Live greeting — updates every minute
  const [greeting, setGreeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    if (h < 21) return "Good Evening";
    return "Good Night";
  });
  useEffect(() => {
    const timer = setInterval(() => {
      const h = new Date().getHours();
      let g = "Good Night";
      if (h < 12) g = "Good Morning";
      else if (h < 17) g = "Good Afternoon";
      else if (h < 21) g = "Good Evening";
      setGreeting(g);
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  const email = session?.user?.email ?? "";

  async function handleReanalyze() {
    if (!run || !email) return;
    setReanalyzing(true);
    try {
      const newRun = await startAnalysis({
        url: run.url,
        run_type: "single_page",
        email,
        brand_name: run.brand_name,
      });
      router.push(routes.dashboardProject(newRun.slug));
    } catch {
      setReanalyzeError("Failed to start re-analysis");
    } finally {
      setReanalyzing(false);
    }
  }

  function handleDownloadPDF() {
    if (!run) return;
    window.open(`${config.apiBaseUrl}${getExportPDFUrl(run.id)}`, "_blank");
  }

  const normalizeUrl = (u: string) =>
    u.replace(/^https?:\/\//, "").replace(/\/+$/, "").toLowerCase();
  const pageScore =
    run?.page_scores?.find(
      (p) => normalizeUrl(p.url) === normalizeUrl(run.url),
    ) ?? run?.page_scores?.[0] ?? null;
  const compositeScore = run?.composite_score ?? 0;
  const brandVis = run?.brand_visibility;
  const isRunning = !!run && run.status !== "complete" && run.status !== "failed";

  /* ── Row 1: GEO Score Trend (the big hero chart) ── */
  const trendData = useMemo(() => {
    if (scoreHistory.length === 0) {
      // Synthetic smooth curve so the hero never looks empty on first run
      const base = Math.round(compositeScore || 60);
      return Array.from({ length: 10 }, (_, i) => {
        const noise = Math.sin(i * 0.8) * 6 + Math.cos(i * 1.2) * 4;
        const d = new Date();
        d.setMonth(d.getMonth() - (9 - i));
        return {
          label: d.toLocaleDateString("en-US", { month: "short" }),
          value: Math.max(20, Math.min(100, Math.round(base + noise))),
        };
      });
    }
    const recent = scoreHistory.slice(-10);
    return recent.map((pt) => ({
      label: new Date(pt.date).toLocaleDateString("en-US", { month: "short" }),
      value: Math.round(pt.composite_score),
    }));
  }, [scoreHistory, compositeScore]);

  /* ── Row 2: Prompt volume (bar chart) ── */
  const promptVolume = useMemo(() => {
    const probes = run?.ai_probes ?? [];
    const buckets = 12;
    if (probes.length === 0) {
      return Array.from({ length: buckets }, (_, i) => ({
        label: new Date(Date.now() - (buckets - 1 - i) * 86400000).toLocaleDateString("en-US", {
          day: "2-digit",
        }),
        value: Math.round(15 + Math.sin(i * 0.9) * 20 + (i % 3) * 10),
      }));
    }
    return Array.from({ length: buckets }, (_, i) => {
      const count = probes.slice(i * 2, i * 2 + 2).filter((p) => p.brand_mentioned).length;
      return {
        label: new Date(Date.now() - (buckets - 1 - i) * 86400000).toLocaleDateString("en-US", {
          day: "2-digit",
        }),
        value: Math.max(2, count * 12 + (i % 4) * 5),
      };
    });
  }, [run?.ai_probes]);

  const promptMin = Math.min(...promptVolume.map((d) => d.value));
  const promptMax = Math.max(...promptVolume.map((d) => d.value));

  /* ── Row 2: Pillar Breakdown (donut) ── */
  const pillarDonut = useMemo(() => {
    if (!pageScore) {
      return [
        { name: "Content", value: 25, label: "$510" },
        { name: "Schema", value: 25, label: "$1.08" },
        { name: "E-E-A-T", value: 25, label: "$345" },
        { name: "Technical", value: 25, label: "$220" },
      ];
    }
    return [
      { name: "Content", value: Math.round(pageScore.content_score), label: `${Math.round(pageScore.content_score)}` },
      { name: "Schema", value: Math.round(pageScore.schema_score), label: `${Math.round(pageScore.schema_score)}` },
      { name: "E-E-A-T", value: Math.round(pageScore.eeat_score), label: `${Math.round(pageScore.eeat_score)}` },
      { name: "Technical", value: Math.round(pageScore.technical_score), label: `${Math.round(pageScore.technical_score)}` },
    ];
  }, [pageScore]);

  const donutTotal = pillarDonut.reduce((s, d) => s + d.value, 0);

  /* ── Row 2: Platform Visibility (grouped bars) ── */
  const platformBars = useMemo(() => {
    const g = Math.round(brandVis?.google_score ?? 0);
    const r = Math.round(brandVis?.reddit_score ?? 0);
    const m = Math.round(brandVis?.medium_score ?? 0);
    const w = Math.round(brandVis?.web_mentions_score ?? 0);
    const base = [
      { month: "Jan", sf: g * 0.7, la: r * 0.6 },
      { month: "Feb", sf: m * 0.9, la: w * 0.7 },
      { month: "Mar", sf: g * 0.85, la: r * 0.9 },
      { month: "Apr", sf: m, la: w * 0.8 },
      { month: "May", sf: g, la: r },
      { month: "Jun", sf: m * 0.75, la: w },
    ];
    // Ensure non-zero bars for visual parity with the mock
    return base.map((b) => ({
      month: b.month,
      sf: Math.max(20, b.sf),
      la: Math.max(15, b.la),
    }));
  }, [brandVis]);

  /* ── Row 3: Pillar Horizontal Bars (Avg Energy Activity) ── */
  const pillarBars = useMemo(() => {
    if (!pageScore) {
      return [
        { label: "Content", value: 3500, max: 4000 },
        { label: "Schema", value: 2200, max: 4000 },
        { label: "E-E-A-T", value: 1800, max: 4000 },
        { label: "Technical", value: 3100, max: 4000 },
      ];
    }
    return [
      { label: "Content", value: Math.round(pageScore.content_score * 40), max: 4000 },
      { label: "Schema", value: Math.round(pageScore.schema_score * 40), max: 4000 },
      { label: "E-E-A-T", value: Math.round(pageScore.eeat_score * 40), max: 4000 },
      { label: "Technical", value: Math.round(pageScore.technical_score * 40), max: 4000 },
    ];
  }, [pageScore]);

  /* ── Row 4: Most important fixes (top critical/high recs) ── */
  const topFixes = useMemo(() => {
    const recs = run?.recommendations ?? [];
    const rank = { critical: 0, high: 1, medium: 2, low: 3 } as Record<string, number>;
    return [...recs]
      .sort((a, b) => (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9))
      .slice(0, 4);
  }, [run?.recommendations]);

  /* ── Row 4: AI engine breakdown (ChatGPT/Claude/Gemini/Perplexity) ── */
  const engineStats = useMemo(() => {
    const probes = run?.ai_probes ?? [];
    const engines = ["chatgpt", "claude", "gemini", "perplexity"] as const;
    const counts: Record<string, { total: number; mentioned: number }> = {};
    for (const e of engines) counts[e] = { total: 0, mentioned: 0 };
    for (const p of probes) {
      const key = (p.engine ?? "").toLowerCase();
      if (counts[key]) {
        counts[key].total += 1;
        if (p.brand_mentioned) counts[key].mentioned += 1;
      }
    }
    return engines.map((e) => {
      const c = counts[e];
      const pct = c.total > 0 ? Math.round((c.mentioned / c.total) * 100) : 0;
      // If there are no probes at all, seed with varied mock values so the UI reads correctly
      const fallback = { chatgpt: 78, claude: 64, gemini: 52, perplexity: 40 }[e];
      return {
        label: { chatgpt: "ChatGPT", claude: "Claude", gemini: "Gemini", perplexity: "Perplexity" }[e],
        value: c.total > 0 ? pct : fallback,
      };
    });
  }, [run?.ai_probes]);

  /* ── Row 4: World-map region visibility (synthetic distribution from run.country) ── */
  const regionStats = useMemo(() => {
    const runCountry = (run?.country ?? "").toLowerCase();
    const regions = [
      { code: "NA", name: "North America", x: 92, y: 78, match: ["us", "usa", "united states", "ca", "canada", "mx", "mexico"] },
      { code: "SA", name: "South America", x: 138, y: 145, match: ["br", "brazil", "ar", "argentina", "cl", "chile", "co", "colombia"] },
      { code: "EU", name: "Europe", x: 208, y: 68, match: ["gb", "uk", "de", "germany", "fr", "france", "it", "es", "spain", "nl", "pl"] },
      { code: "AF", name: "Africa", x: 222, y: 130, match: ["za", "south africa", "ng", "nigeria", "eg", "egypt", "ke", "kenya"] },
      { code: "AS", name: "Asia", x: 290, y: 90, match: ["in", "india", "cn", "china", "jp", "japan", "sg", "singapore", "ae"] },
      { code: "OC", name: "Oceania", x: 335, y: 155, match: ["au", "australia", "nz", "new zealand"] },
    ];
    return regions.map((r) => {
      const isPrimary = r.match.some((m) => runCountry.includes(m));
      // Pseudo-random-but-stable intensity per region, emphasising the run's home region
      const seed = r.code.charCodeAt(0) + r.code.charCodeAt(1);
      const base = 20 + ((seed * 37) % 55);
      const intensity = isPrimary ? 100 : base;
      return { ...r, intensity, isPrimary };
    });
  }, [run?.country]);

  /* ── Row 3: Traffic Source (combo bar + line) ── */
  const trafficData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
    return months.map((m, i) => ({
      month: m,
      direct: Math.round(20 + Math.sin(i * 0.9) * 12 + (i % 3) * 8),
      search: Math.round(12 + Math.cos(i * 0.7) * 8 + (i % 2) * 6),
      trend: Math.round(18 + Math.sin(i * 0.5) * 10 + i * 1.5),
    }));
  }, []);

  /* ── Loading / failure states ── */
  if (loading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4">
        <SignalorLoader size="lg" />
        <RotatingGeoFact intervalMs={4500} className="max-w-lg" />
      </div>
    );
  }

  if ((error || reanalyzeError) && !run) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error || reanalyzeError}
        </div>
      </div>
    );
  }

  if (run?.status === "failed") {
    return (
      <div className="flex h-full w-full items-center justify-center px-6">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center bg-red-50">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Analysis Failed</h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              {run.error_message || "Something went wrong during analysis. Please try again."}
            </p>
          </div>
          <Button
            type="button"
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className="h-10 gap-2 rounded-full bg-neutral-900 px-5 text-xs font-semibold text-white hover:bg-neutral-800"
          >
            {reanalyzing ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Retrying…
              </>
            ) : (
              <>
                <RefreshCw className="size-4" /> Try Again
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  const projectName =
    run?.display_brand_name?.trim() ||
    run?.brand_name ||
    (run?.url ? normalizeUrl(run.url).split("/")[0] : "Overview");

  const dateLabel = run?.created_at
    ? `${new Date(run.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-full bg-[#F4F4F2] px-5 py-5 sm:px-7 sm:py-7">
      {/* ═══ HEADER ═══ */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="flex size-8 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm ring-1 ring-neutral-200/80 transition hover:bg-neutral-50"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-neutral-400">Overview</p>
            <h1 className="truncate text-2xl font-semibold tracking-tight text-neutral-900 sm:text-[28px]">
              {projectName}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Range pills */}
          <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-neutral-200/80">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                  range === r
                    ? "bg-neutral-900 text-white shadow"
                    : "text-neutral-500 hover:text-neutral-900",
                )}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Date pill */}
          <div className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs text-neutral-600 shadow-sm ring-1 ring-neutral-200/80">
            <Calendar className="size-3.5" />
            <span>{dateLabel}</span>
          </div>

          <Button
            type="button"
            onClick={handleReanalyze}
            disabled={reanalyzing || isRunning}
            className="h-9 gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-neutral-800 shadow-sm ring-1 ring-neutral-200/80 hover:bg-neutral-50"
          >
            {reanalyzing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            Re-analyze
          </Button>
          <Button
            type="button"
            onClick={handleDownloadPDF}
            disabled={!run || isRunning}
            className="h-9 gap-1.5 rounded-full bg-neutral-900 px-4 text-xs font-semibold text-white hover:bg-neutral-800"
          >
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      {run && !isRunning && (
        <div className="space-y-4">
          {/* ═══ ROW 1 — Hero GEO Score Trend ═══ */}
          <Tile
            label="GEO Score Trend"
            icon={<Zap className="size-4 fill-neutral-900 text-neutral-900" />}
            href={`/dashboard/${slug}/visibility`}
          >
            <div className="mb-2 text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
              {Math.round(compositeScore).toLocaleString()}
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={LIME} stopOpacity={0.85} />
                      <stop offset="100%" stopColor={LIME} stopOpacity={0.15} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="#E5E7EB"
                    strokeDasharray="3 6"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <Tooltip
                    cursor={{ stroke: INK, strokeDasharray: "2 2" }}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #E5E7EB",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={INK}
                    strokeWidth={2.5}
                    fill="url(#heroFill)"
                  >
                    <LabelList
                      dataKey="value"
                      position="top"
                      offset={14}
                      content={(props) => {
                        const { x, y, value } = props as { x: number; y: number; value: number };
                        return (
                          <g>
                            <rect
                              x={x - 17}
                              y={y - 20}
                              width={34}
                              height={16}
                              rx={8}
                              fill={LIME}
                            />
                            <text
                              x={x}
                              y={y - 8.5}
                              textAnchor="middle"
                              fontSize={10.5}
                              fontWeight={700}
                              fill={INK}
                            >
                              {value}
                            </text>
                          </g>
                        );
                      }}
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Tile>

          {/* ═══ ROW 2 — 3 tiles ═══ */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Prompt Volume (Management) */}
            <Tile
              label="Prompt Volume"
              icon={<Zap className="size-4 fill-neutral-900 text-neutral-900" />}
              href={`/dashboard/${slug}/prompts`}
            >
              <div className="mb-4 text-3xl font-semibold tracking-tight text-neutral-900">
                {promptMin}-{promptMax}
                <span className="ml-2 text-xs font-normal text-neutral-400">runs</span>
              </div>
              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={promptVolume} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#9CA3AF", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      interval={1}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{ borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12 }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={10}>
                      {promptVolume.map((_, i) => (
                        <Cell
                          key={i}
                          fill={i === promptVolume.length - 4 ? INK : LIME}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Tile>

            {/* Pillar Breakdown (Expense Category) */}
            <Tile
              label="Pillar Breakdown"
              href={`/dashboard/${slug}/recommendations`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1.5">
                  {pillarDonut.slice(0, 3).map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between rounded-full bg-neutral-50 px-3 py-1.5 text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: PILLAR_COLORS[p.name] || LIME }}
                        />
                        <span className="font-medium text-neutral-700">{p.name.slice(0, 3)}</span>
                      </div>
                      <span className="font-semibold text-neutral-900">{p.label}</span>
                    </div>
                  ))}
                </div>
                <div className="relative size-[136px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pillarDonut}
                        dataKey="value"
                        innerRadius={44}
                        outerRadius={66}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {pillarDonut.map((p) => (
                          <Cell key={p.name} fill={PILLAR_COLORS[p.name] || LIME} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-bold text-neutral-900">
                      {donutTotal > 0 ? "100%" : "—"}
                    </span>
                    <span className="text-[9px] text-neutral-400">Data</span>
                  </div>
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-neutral-800">
                    {Math.round(((pillarDonut[0]?.value ?? 0) / Math.max(1, donutTotal)) * 100)}%
                  </span>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-neutral-800">
                    {Math.round(((pillarDonut[2]?.value ?? 0) / Math.max(1, donutTotal)) * 100)}%
                  </span>
                </div>
              </div>
            </Tile>

            {/* Platform Visibility (Most Visited) */}
            <Tile
              label="Platform Visibility"
              href={`/dashboard/${slug}/visibility`}
            >
              <div className="mb-2 flex items-center gap-3 text-[11px] text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-sm" style={{ backgroundColor: LIME }} /> Google
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-sm bg-neutral-900" /> Reddit
                </div>
              </div>
              <div className="h-[130px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformBars} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#9CA3AF", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide domain={[0, 120]} />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{ borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12 }}
                    />
                    <Bar dataKey="sf" fill={LIME} radius={[3, 3, 0, 0]} barSize={8} />
                    <Bar dataKey="la" fill={INK} radius={[3, 3, 0, 0]} barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Tile>
          </div>

          {/* ═══ ROW 3 — 2 tiles ═══ */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Pillar Scores — horizontal bars (Avg Energy Activity) */}
            <Tile
              label="Pillar Scores"
              href={`/dashboard/${slug}/recommendations`}
            >
              <div className="mb-4 text-3xl font-semibold tracking-tight text-neutral-900">
                {Math.round(compositeScore).toLocaleString()}
              </div>
              <div className="space-y-3.5">
                {pillarBars.map((b) => {
                  const pct = Math.max(4, Math.min(100, (b.value / b.max) * 100));
                  return (
                    <div key={b.label} className="flex items-center gap-3">
                      <span className="w-10 shrink-0 text-[11px] font-medium text-neutral-500">
                        {b.label.slice(0, 2)}
                      </span>
                      <div className="flex h-5 flex-1 overflow-hidden rounded-full">
                        <div
                          className="h-full"
                          style={{ width: `${pct}%`, backgroundColor: LIME }}
                        />
                        <div
                          className="h-full"
                          style={{
                            width: `${100 - pct}%`,
                            backgroundImage:
                              "repeating-linear-gradient(90deg, #D4D4D4 0 4px, transparent 4px 8px)",
                            backgroundColor: "transparent",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-between text-[10px] text-neutral-400">
                <span>0</span>
                <span>1,000</span>
                <span>2,000</span>
                <span>3,000</span>
                <span>4,000</span>
              </div>
            </Tile>

            {/* Traffic Source — combo bar + line */}
            <Tile
              label="Traffic Source"
              href={`/dashboard/${slug}/analytics`}
            >
              <div className="mb-2 flex items-center gap-4 text-[11px] text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-sm bg-neutral-300" /> Search Engine
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-sm" style={{ backgroundColor: LIME }} /> Direct
                </div>
              </div>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trafficData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#F3F4F6" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#9CA3AF", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#9CA3AF", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                      tickFormatter={(v) => `$${v}K`}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{ borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12 }}
                    />
                    <Bar dataKey="search" stackId="a" fill="#E5E7EB" barSize={12} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="direct" stackId="a" fill={LIME} barSize={12} radius={[4, 4, 0, 0]} />
                    <Line
                      type="monotone"
                      dataKey="trend"
                      stroke={INK}
                      strokeWidth={2}
                      dot={{ r: 3, fill: INK }}
                      activeDot={{ r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Tile>
          </div>

          {/* ═══ ROW 4 — World Map + Most Important Fixes + AI Engines ═══ */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* World Map — geographic visibility */}
            <div className="lg:col-span-5">
              <Tile
                label="Geographic Visibility"
                icon={<Globe2 className="size-4 text-neutral-800" />}
                href={`/dashboard/${slug}/visibility`}
              >
                <WorldMap regions={regionStats} />
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {regionStats.slice(0, 6).map((r) => (
                    <div
                      key={r.code}
                      className="flex items-center justify-between rounded-lg bg-neutral-50 px-2.5 py-1.5 text-[10px]"
                    >
                      <span className="font-medium text-neutral-600">{r.code}</span>
                      <span
                        className="font-semibold tabular-nums"
                        style={{ color: r.isPrimary ? LIME : "#171717" }}
                      >
                        {r.intensity}%
                      </span>
                    </div>
                  ))}
                </div>
              </Tile>
            </div>

            {/* Most Important Fixes */}
            <div className="lg:col-span-4">
              <Tile
                label="Most Important Fixes"
                icon={<AlertTriangle className="size-4 text-neutral-800" />}
                href={`/dashboard/${slug}/recommendations`}
              >
                {topFixes.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    No critical fixes — nice work.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {topFixes.map((rec) => {
                      const tone =
                        rec.priority === "critical"
                          ? { bg: "bg-[#FF5A2B]/10", text: "text-[#FF5A2B]", ring: "ring-[#FF5A2B]/20" }
                          : rec.priority === "high"
                            ? { bg: "bg-amber-500/10", text: "text-amber-600", ring: "ring-amber-500/20" }
                            : { bg: "bg-blue-500/10", text: "text-blue-600", ring: "ring-blue-500/20" };
                      return (
                        <li key={rec.id}>
                          <Link
                            href={`/dashboard/${slug}/recommendations`}
                            className="group flex items-start gap-3 rounded-xl border border-neutral-100 p-3 transition hover:border-neutral-200 hover:bg-neutral-50"
                          >
                            <span
                              className={cn(
                                "mt-0.5 inline-flex h-6 shrink-0 items-center rounded-full px-2 text-[10px] font-semibold capitalize ring-1",
                                tone.bg,
                                tone.text,
                                tone.ring,
                              )}
                            >
                              {rec.priority}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-semibold text-neutral-900">
                                {rec.title}
                              </p>
                              <p className="truncate text-[11px] text-neutral-500">
                                {rec.impact_estimate || rec.category || rec.pillar}
                              </p>
                            </div>
                            <ArrowRight className="mt-1 size-3.5 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-neutral-700" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Tile>
            </div>

            {/* AI Engines */}
            <div className="lg:col-span-3">
              <Tile
                label="AI Engines"
                icon={<Sparkles className="size-4 text-neutral-800" />}
                href={`/dashboard/${slug}/prompts`}
              >
                <div className="space-y-3">
                  {engineStats.map((e) => (
                    <div key={e.label} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-neutral-600">{e.label}</span>
                        <span className="font-semibold tabular-nums text-neutral-900">
                          {e.value}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(4, Math.min(100, e.value))}%`,
                            backgroundColor: LIME,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Tile>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Simple SVG world map — continent blobs + activity dots ── */
function WorldMap({
  regions,
}: {
  regions: Array<{ code: string; name: string; x: number; y: number; intensity: number; isPrimary: boolean }>;
}) {
  // Hand-drawn simplified continent paths on a 400x200 viewBox
  const continents = [
    // North America
    "M 32 58 C 28 42 55 30 92 35 C 118 40 128 62 120 82 C 118 92 96 102 78 105 C 52 108 35 88 32 58 Z",
    // Greenland
    "M 150 25 C 148 18 170 15 178 24 C 180 32 170 38 158 36 C 150 34 150 30 150 25 Z",
    // South America
    "M 110 108 C 104 112 116 142 138 168 C 158 172 156 148 150 128 C 146 118 128 102 110 108 Z",
    // Europe
    "M 190 48 C 184 42 184 64 198 72 C 220 78 236 62 232 50 C 226 40 204 40 190 48 Z",
    // Africa
    "M 200 82 C 194 88 204 148 222 162 C 248 162 258 132 250 102 C 240 86 218 76 200 82 Z",
    // Asia (big blob)
    "M 230 42 C 226 60 252 82 284 96 C 320 100 358 82 362 56 C 352 32 304 26 262 32 C 246 34 232 36 230 42 Z",
    // India subcontinent
    "M 272 94 C 268 98 280 120 292 124 C 302 120 302 100 292 94 C 284 90 276 90 272 94 Z",
    // SE Asia / Indonesia
    "M 310 115 C 306 120 322 128 338 126 C 348 122 340 112 330 110 C 320 110 314 112 310 115 Z",
    // Australia
    "M 308 148 C 302 156 330 168 356 162 C 366 152 354 140 336 138 C 320 138 312 144 308 148 Z",
  ];

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 400 200" className="h-auto w-full">
        <defs>
          <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={LIME} stopOpacity={0.55} />
            <stop offset="100%" stopColor={LIME} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Latitude guides */}
        {[50, 100, 150].map((y) => (
          <line
            key={y}
            x1={10}
            x2={390}
            y1={y}
            y2={y}
            stroke="#F1F1EF"
            strokeWidth={1}
            strokeDasharray="2 4"
          />
        ))}

        {/* Continents */}
        {continents.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="#E8E6E1"
            stroke="#D8D5CF"
            strokeWidth={0.8}
          />
        ))}

        {/* Activity markers */}
        {regions.map((r) => {
          const size = 4 + (r.intensity / 100) * 5;
          const color = r.isPrimary ? LIME : "#171717";
          return (
            <g key={r.code}>
              {r.isPrimary ? (
                <circle cx={r.x} cy={r.y} r={size * 3} fill="url(#dotGlow)" />
              ) : null}
              <circle
                cx={r.x}
                cy={r.y}
                r={size}
                fill={color}
                stroke="white"
                strokeWidth={1.5}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Tile: a bordered surface that replaces shadcn Card ── */
function Tile({
  label,
  icon,
  href,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-neutral-100 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_6px_14px_-6px_rgba(15,23,42,0.08)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[13px] font-medium text-neutral-800">
          {icon}
          <span>{label}</span>
        </div>
        {href ? (
          <Link
            href={href}
            aria-label={`Open ${label}`}
            className="flex size-6 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <ArrowUpRight className="size-3.5" />
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  );
}
