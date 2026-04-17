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
  Search,
  ChevronDown,
  Filter,
  BarChart3,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";
import { RotatingGeoFact } from "@/components/ui/rotating-geo-fact";
import { CommandPalette } from "@/components/ui/command-palette";
import {
  SocialBrandReachCard,
  type SocialPresenceDetails,
} from "@/components/analyzer/social-brand-reach-card";

/* ── coral is theme-constant; everything else uses Tailwind classes ── */
const CORAL = "#F95C4B";

/* ── priority colors ── */
const PRIORITY_COLORS: Record<string, string> = {
  critical: CORAL,
  high: "#D97706",
  medium: "#2563EB",
  low: "#7C3AED",
};

const STATUS_STYLES: Record<string, string> = {
  critical: "bg-[#F95C4B]/10 text-[#F95C4B]",
  high: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  low: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

const PILLAR_LABELS: Record<string, string> = {
  content: "Content",
  schema: "Schema",
  eeat: "E-E-A-T",
  technical: "Technical",
  entity: "Entity",
  ai_visibility: "AI Visibility",
};

const FILTER_TABS = ["All", "Critical", "High", "Medium"] as const;

function getScoreStrokeColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#D97706";
  if (score >= 40) return CORAL;
  return CORAL;
}

/* ── page ── */
export default function SignalorDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const { run, scoreHistory, loading, error, refetch } = useRun();
  const [reanalyzing, setReanalyzing] = useState(false);
  const [reanalyzeError, setReanalyzeError] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [historyRange, setHistoryRange] = useState<"7d" | "1m" | "3m" | "all">("all");
  const [historyDropdownOpen, setHistoryDropdownOpen] = useState(false);

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

  // Cmd+K / Ctrl+K to open command palette
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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

  // Derived data — match page score to the analyzed URL, not competitors
  // Normalize URLs for comparison (strip trailing slash + protocol differences)
  const normalizeUrl = (u: string) => u.replace(/^https?:\/\//, "").replace(/\/+$/, "").toLowerCase();
  const pageScore = run?.page_scores?.find((p) => normalizeUrl(p.url) === normalizeUrl(run.url)) ?? run?.page_scores?.[0] ?? null;
  const compositeScore = run?.composite_score ?? 0;
  const brandVis = run?.brand_visibility;
  const recommendations = run?.recommendations ?? [];
  const isRunning = !!run && run.status !== "complete" && run.status !== "failed";

  const criticalCount = recommendations.filter((r) => r.priority === "critical").length;
  const highCount = recommendations.filter((r) => r.priority === "high").length;
  const prevScore = scoreHistory.length >= 2 ? scoreHistory[scoreHistory.length - 2]?.composite_score : null;
  const scoreChange = prevScore !== null ? Math.round(compositeScore - prevScore) : null;

  const topIssues = useMemo(() =>
    [...recommendations]
      .filter((r) => r.priority === "critical" || r.priority === "high")
      .slice(0, 4),
    [recommendations],
  );

  // 7-day prediction: parse impact_estimate numbers from recommendations
  const prediction = useMemo(() => {
    let totalImpact = 0;
    const pillarImpacts: Record<string, number> = {};

    for (const rec of recommendations) {
      // Parse numbers like "~12 points", "+40%", "+37% Visibility"
      const match = rec.impact_estimate?.match(/(\d+)/);
      const pts = match ? parseInt(match[1], 10) : 0;
      const weight = rec.priority === "critical" ? 1 : rec.priority === "high" ? 0.7 : rec.priority === "medium" ? 0.4 : 0.2;
      const impact = Math.min(pts * weight, 15); // cap per-rec
      totalImpact += impact;
      if (rec.pillar) {
        pillarImpacts[rec.pillar] = (pillarImpacts[rec.pillar] || 0) + impact;
      }
    }

    const projected = Math.min(100, compositeScore + totalImpact);
    const projectedGain = Math.round(projected - compositeScore);

    // Build 7-day projected trajectory (gradual improvement)
    const days = Array.from({ length: 7 }, (_, i) => {
      const dayScore = compositeScore + (projectedGain * ((i + 1) / 7));
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      return { day: d.toLocaleDateString("en-US", { weekday: "short" }), score: Math.round(dayScore) };
    });

    return { projected: Math.round(projected), gain: projectedGain, days, pillarImpacts };
  }, [recommendations, compositeScore]);

  // Brand Sentiment from Reddit + web mentions + AI probes
  const sentiment = useMemo(() => {
    const redditDetails = brandVis?.reddit_details as Record<string, unknown> | undefined;
    const redditSentiment = redditDetails?.sentiment as { positive: number; negative: number; neutral: number; modifier: number } | undefined;

    const probes = run?.ai_probes ?? [];
    const mentioned = probes.filter((p) => p.brand_mentioned).length;
    const total = probes.length;

    // Combine Reddit sentiment + AI probe data
    const positive = redditSentiment?.positive ?? 0;
    const negative = redditSentiment?.negative ?? 0;
    const neutral = redditSentiment?.neutral ?? 0;
    const modifier = redditSentiment?.modifier ?? 0; // -20 to +20

    // Convert modifier to -10 to +10 scale
    const score = Math.round(modifier / 2);

    const hasData = (positive + negative + neutral) > 0 || total > 0;
    if (!hasData) return null;

    return {
      positive, negative, neutral,
      score, // -10 to +10
      totalMentions: positive + negative + neutral,
      aiMentioned: mentioned,
      aiTotal: total,
    };
  }, [brandVis?.reddit_details, run?.ai_probes]);

  const filteredRecs = useMemo(() => {
    let filtered = recommendations;
    if (activeFilter !== "All") {
      filtered = filtered.filter((r) => r.priority.toLowerCase() === activeFilter.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.pillar.toLowerCase().includes(q) ||
          (r.category && r.category.toLowerCase().includes(q)) ||
          (r.impact_estimate && r.impact_estimate.toLowerCase().includes(q)),
      );
    }
    // Sort: recs for lowest-scoring pillars first (most impactful)
    if (pageScore) {
      const pillarScores: Record<string, number> = {
        content: pageScore.content_score,
        schema: pageScore.schema_score,
        eeat: pageScore.eeat_score,
        technical: pageScore.technical_score,
        entity: pageScore.entity_score,
        ai_visibility: pageScore.ai_visibility_score,
      };
      filtered = [...filtered].sort((a, b) => {
        const aScore = pillarScores[a.pillar] ?? 50;
        const bScore = pillarScores[b.pillar] ?? 50;
        return aScore - bScore; // lowest pillar score first
      });
    }
    return filtered.slice(0, 10);
  }, [recommendations, activeFilter, searchQuery, pageScore]);

  const visibilityBars = useMemo(() => {
    if (!brandVis) return [];
    return [
      {
        label: "Google", value: Math.round(brandVis.google_score), color: CORAL,
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        ),
      },
      {
        label: "Reddit", value: Math.round(brandVis.reddit_score), color: "hsl(var(--foreground))",
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#FF4500">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 13.38c.15.24.23.53.23.84 0 1.7-1.98 3.08-4.43 3.08s-4.43-1.38-4.43-3.08c0-.31.08-.6.23-.84a1.39 1.39 0 0 1-.33-.9 1.4 1.4 0 0 1 2.39-.98c.97-.63 2.25-1.02 3.65-1.06l.72-3.3a.27.27 0 0 1 .33-.21l2.38.52a.96.96 0 1 1-.1.46l-2.13-.47-.64 2.97c1.36.06 2.6.44 3.55 1.06a1.4 1.4 0 0 1 2.39.98c0 .35-.13.67-.33.9zM9.83 13.2a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm4.34 0a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.3 3.17c.1.1.26.1.36 0 .5-.5 1.24-.75 1.97-.75s1.47.25 1.97.75c.1.1.26.1.36 0 .1-.1.1-.26 0-.36-.6-.6-1.44-.93-2.33-.93s-1.73.33-2.33.93c-.1.1-.1.26 0 .36z"/>
          </svg>
        ),
      },
      {
        label: "Medium", value: Math.round(brandVis.medium_score), color: "#A39888",
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-foreground">
            <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42zm3.04 0c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75c.66 0 1.19 2.58 1.19 5.75z"/>
          </svg>
        ),
      },
      {
        label: "Web", value: Math.round(brandVis.web_mentions_score), color: "#C4BAA8",
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        ),
      },
    ];
  }, [brandVis]);

  const breakdownRows = useMemo(() => {
    if (!pageScore) return [];
    return [
      { label: "Content", score: pageScore.content_score },
      { label: "Schema", score: pageScore.schema_score },
      { label: "E-E-A-T", score: pageScore.eeat_score },
      { label: "Technical", score: pageScore.technical_score },
    ].sort((a, b) => b.score - a.score);
  }, [pageScore]);

  // Filter score history by range
  const filteredHistory = useMemo(() => {
    if (historyRange === "all") return scoreHistory;
    const now = new Date();
    const cutoff = new Date();
    if (historyRange === "7d") cutoff.setDate(now.getDate() - 7);
    else if (historyRange === "1m") cutoff.setMonth(now.getMonth() - 1);
    else if (historyRange === "3m") cutoff.setMonth(now.getMonth() - 3);
    return scoreHistory.filter((pt) => new Date(pt.date) >= cutoff);
  }, [scoreHistory, historyRange]);

  // Loading
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
        <div className="flex items-center gap-3 rounded-xl px-5 py-4 text-sm" style={{ backgroundColor: `${CORAL}10`, border: `1px solid ${CORAL}30`, color: CORAL }}>
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error || reanalyzeError}
        </div>
      </div>
    );
  }

  // Hard failure — show full-page error instead of dashboard with 0 scores
  if (run?.status === "failed") {
    return (
      <div className="flex h-full w-full items-center justify-center px-6">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${CORAL}15` }}>
            <AlertCircle className="w-8 h-8" style={{ color: CORAL }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Analysis Failed</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {run.error_message || "Something went wrong during analysis. Please try again."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
              style={{ backgroundColor: CORAL }}
            >
              {reanalyzing ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Retrying...</>
              ) : (
                <><RefreshCw className="w-4 h-4" /> Try Again</>
              )}
            </button>
          </div>
          {reanalyzeError && (
            <p className="text-xs text-red-500">{reanalyzeError}</p>
          )}
        </div>
      </div>
    );
  }

  /* score colour helper */
  function scoreColor(s: number) {
    if (s >= 70) return "#22c55e";
    if (s >= 40) return "#D97706";
    return CORAL;
  }
  function scoreBg(s: number) {
    if (s >= 70) return "#22c55e15";
    if (s >= 40) return "#D9770615";
    return `${CORAL}15`;
  }

  const aiMentionPct = sentiment ? Math.round((sentiment.aiMentioned / Math.max(sentiment.aiTotal, 1)) * 100) : null;

  return (
    <>
      {/* ══ STICKY HEADER ══ */}
      <header className="sticky top-0 z-20 px-6 py-3 flex items-center justify-between gap-3 bg-white border-b border-[#EBEBEB] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div>
          <h1 className="text-[16px] font-bold text-gray-800 leading-tight">Overview</h1>
          <p className="text-[11px] text-gray-400">
            {greeting}, <span className="font-semibold" style={{ color: CORAL }}>{session?.user?.name?.split(" ")[0] || "there"}</span>
            {run?.url && <> · <span className="font-medium text-gray-500 truncate max-w-[260px] inline-block align-bottom">{run.url}</span></>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPaletteOpen(true)} className="flex items-center gap-2 bg-[#F5F5F5] rounded-xl py-[7px] pl-3 pr-2.5 border border-[#E8E8E8] text-gray-400 hover:bg-[#EEEEEE] transition w-40">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 text-left text-[11px]">Search…</span>
            <kbd className="text-[10px] font-mono bg-white border border-[#E0E0E0] rounded px-1.5 py-0.5 text-gray-400">⌘K</kbd>
          </button>
          <button onClick={handleReanalyze} disabled={reanalyzing || isRunning}
            className="flex items-center gap-1.5 bg-[#F5F5F5] rounded-xl px-3.5 py-[7px] text-[12px] font-medium transition disabled:opacity-50 hover:bg-[#EEEEEE] border border-[#E8E8E8] text-gray-600">
            <RefreshCw className="w-3.5 h-3.5" /> Re-analyze
          </button>
          <button onClick={handleDownloadPDF} disabled={!run || isRunning}
            className="flex items-center gap-1.5 rounded-xl px-4 py-[7px] text-[12px] font-semibold text-white transition disabled:opacity-50 hover:opacity-90 shadow-sm"
            style={{ backgroundColor: CORAL }}>
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </header>

      {run && !isRunning && (
        <div className="px-6 pt-5 pb-8 space-y-4">

          {/* ══ ROW A: HERO CARDS ══ */}
          <div className="grid grid-cols-12 gap-4">

            {/* ── GEO Score Gauge Card ── */}
            <div className="col-span-4 bg-white rounded-3xl p-6 border border-[#EBEBEB] shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
              {/* Top badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold" style={{ backgroundColor: `${CORAL}12`, color: CORAL }}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  GEO Score Overview
                </span>
              </div>

              {/* Gauge SVG */}
              <div className="relative">
                <svg viewBox="0 0 200 115" className="w-full">
                  {(() => {
                    const cx = 100, cy = 105, r = 78, sw = 14;
                    const N = 10;
                    const fillN = Math.round((compositeScore / 100) * N);
                    const toRad = (d: number) => (d * Math.PI) / 180;
                    const segSpan = 16, totalSpan = 18;
                    return Array.from({ length: N }, (_, i) => {
                      const startDeg = 180 - i * totalSpan;
                      const endDeg = startDeg - segSpan;
                      const sx = cx + r * Math.cos(toRad(startDeg));
                      const sy = cy - r * Math.sin(toRad(startDeg));
                      const ex = cx + r * Math.cos(toRad(endDeg));
                      const ey = cy - r * Math.sin(toRad(endDeg));
                      const color = i < fillN ? CORAL : "#F0F0F0";
                      return (
                        <path key={i}
                          d={`M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${r} ${r} 0 0 0 ${ex.toFixed(1)} ${ey.toFixed(1)}`}
                          fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
                      );
                    });
                  })()}
                  {/* Center score */}
                  <text x="100" y="100" textAnchor="middle" fontWeight="800" fontSize="28" fill="#1F2937">{Math.round(compositeScore)}</text>
                  <text x="100" y="112" textAnchor="middle" fontWeight="500" fontSize="10" fill="#9CA3AF">out of 100</text>
                </svg>
                {scoreChange !== null && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                    style={{ backgroundColor: scoreChange >= 0 ? "#22c55e15" : `${CORAL}15`, color: scoreChange >= 0 ? "#22c55e" : CORAL }}>
                    {scoreChange >= 0 ? "↑" : "↓"} {Math.abs(scoreChange)} pts
                  </div>
                )}
              </div>

              {/* Two stat rows */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Link href={`/dashboard/${slug}/recommendations`}
                  className="rounded-2xl p-3.5 hover:brightness-95 transition"
                  style={{ backgroundColor: `${CORAL}0A`, border: `1px solid ${CORAL}20` }}>
                  <p className="text-[10px] font-semibold text-gray-400 mb-1">Recommendations</p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-[22px] font-black leading-none" style={{ color: CORAL }}>{recommendations.length}</span>
                    {criticalCount > 0 && (
                      <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 mb-0.5" style={{ backgroundColor: CORAL, color: "white" }}>
                        {criticalCount}
                      </span>
                    )}
                  </div>
                </Link>
                <Link href={`/dashboard/${slug}/recommendations`}
                  className="rounded-2xl p-3.5 bg-[#F9F9F9] hover:bg-[#F3F3F3] transition border border-[#EBEBEB]">
                  <p className="text-[10px] font-semibold text-gray-400 mb-1">Priority Issues</p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-[22px] font-black leading-none text-gray-800">{criticalCount + highCount}</span>
                    <span className="text-[10px] text-gray-400 mb-0.5">{highCount} high</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* ── Performance Index (Score History) ── */}
            <div className="col-span-5 bg-white rounded-3xl p-6 border border-[#EBEBEB] shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[13px] font-bold text-gray-800">Performance Index</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Your GEO score over time</p>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[28px] font-black text-gray-800 leading-none">{Math.round(compositeScore)}</span>
                  <span className="text-[13px] text-gray-400 font-medium">/ 100</span>
                </div>
              </div>

              {/* Bar chart */}
              <div className="relative h-[120px]">
                {filteredHistory.length > 0 ? (() => {
                  const bars = filteredHistory.slice(-12);
                  const maxScore = Math.max(...bars.map(b => b.composite_score), 1);
                  const latestIdx = bars.length - 1;
                  return (
                    <div className="flex items-end gap-1.5 h-full px-1">
                      {bars.map((b, i) => {
                        const pct = (b.composite_score / maxScore) * 100;
                        const isLatest = i === latestIdx;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            {isLatest && (
                              <div className="rounded-full text-white text-[9px] font-bold px-1.5 py-0.5 whitespace-nowrap mb-1"
                                style={{ backgroundColor: CORAL }}>
                                {new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </div>
                            )}
                            <div className="w-full rounded-t-lg transition-all duration-500"
                              style={{
                                height: `${Math.max(pct, 8)}%`,
                                backgroundColor: isLatest ? CORAL : "#F0F0F0",
                                borderRadius: "6px 6px 3px 3px",
                              }} />
                          </div>
                        );
                      })}
                    </div>
                  );
                })() : (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <BarChart3 className="w-8 h-8 text-gray-200" />
                    <p className="text-[12px] text-gray-400">Run another analysis to see history</p>
                  </div>
                )}
              </div>

              {/* Range picker */}
              <div className="flex items-center justify-between mt-3">
                <div className="relative">
                  <button onClick={() => setHistoryDropdownOpen(!historyDropdownOpen)}
                    className="flex items-center gap-1 text-[11px] rounded-lg px-2.5 py-1.5 bg-[#F5F5F5] hover:bg-[#EEEEEE] transition text-gray-500 border border-[#E8E8E8]">
                    {{ "7d": "7 days", "1m": "1 month", "3m": "3 months", "all": "All time" }[historyRange]}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {historyDropdownOpen && (
                    <div className="absolute left-0 bottom-full mb-1 rounded-xl bg-white shadow-xl py-1 z-50 min-w-[110px] border border-[#EBEBEB]">
                      {([["7d", "7 days"], ["1m", "1 month"], ["3m", "3 months"], ["all", "All time"]] as const).map(([key, label]) => (
                        <button key={key} onClick={() => { setHistoryRange(key); setHistoryDropdownOpen(false); }}
                          className="w-full text-left px-3 py-1.5 text-[12px] transition-colors hover:bg-[#F5F5F5]"
                          style={{ color: historyRange === key ? CORAL : "#6B7280", fontWeight: historyRange === key ? 600 : 400 }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {scoreChange !== null && (
                  <span className="text-[11px] font-bold rounded-full px-2.5 py-1"
                    style={{ backgroundColor: scoreChange >= 0 ? "#22c55e12" : `${CORAL}12`, color: scoreChange >= 0 ? "#22c55e" : CORAL }}>
                    {scoreChange >= 0 ? "↑ +" : "↓ "}{scoreChange} pts vs last
                  </span>
                )}
              </div>
            </div>

            {/* ── Dark AI Mention Rate Card ── */}
            <div className="col-span-3 rounded-3xl p-6 flex flex-col" style={{ backgroundColor: "#141414" }}>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1">AI Mention Rate</p>
              <p className="text-[11px] text-white/30 mb-5">Brand cited by AI engines</p>

              {/* Donut */}
              <div className="flex-1 flex items-center justify-center">
                {sentiment ? (() => {
                  const pct = sentiment.aiMentioned / Math.max(sentiment.aiTotal, 1);
                  const r = 42, c = 2 * Math.PI * r;
                  return (
                    <div className="relative w-36 h-36">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
                        <circle cx="50" cy="50" r={r} fill="none" stroke={CORAL} strokeWidth="14"
                          strokeLinecap="round" strokeDasharray={`${pct * c} ${c}`} />
                        {/* Dots on track */}
                        {Array.from({ length: 12 }, (_, i) => {
                          const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
                          const dx = 50 + r * Math.cos(angle);
                          const dy = 50 + r * Math.sin(angle);
                          return <circle key={i} cx={dx.toFixed(1)} cy={dy.toFixed(1)} r="1.5" fill="rgba(255,255,255,0.15)" />;
                        })}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[26px] font-black text-white leading-none">{Math.round(pct * 100)}%</span>
                        <span className="text-[10px] text-white/40 mt-0.5">Mentioned</span>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-full border-8 border-white/10 flex items-center justify-center">
                      <span className="text-[20px] font-black text-white/30">—</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <p className="text-[20px] font-black text-white leading-none">{sentiment?.aiMentioned ?? "—"}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Mentioned</p>
                </div>
                <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <p className="text-[20px] font-black text-white leading-none">{sentiment ? sentiment.aiTotal - sentiment.aiMentioned : "—"}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Missed</p>
                </div>
              </div>
            </div>
          </div>

          {/* ══ ROW B: PILLAR BREAKDOWN ══ */}
          <div className="grid grid-cols-12 gap-4">
            {/* Pillar Breakdown */}
            <div className="col-span-12 bg-white rounded-3xl p-6 border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[13px] font-bold text-gray-800">Pillar Breakdown</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Score per GEO dimension</p>
                </div>
                <Link href={`/dashboard/${slug}/recommendations`} className="text-[11px] font-semibold transition hover:opacity-70" style={{ color: CORAL }}>
                  See Details →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {breakdownRows.length > 0 ? breakdownRows.map((row) => {
                  const color = scoreColor(row.score);
                  const bg = scoreBg(row.score);
                  return (
                    <div key={row.label}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[12px] font-semibold text-gray-700">{row.label}</span>
                        <span className="text-[11px] font-bold rounded-lg px-2 py-0.5" style={{ color, backgroundColor: bg }}>
                          {Math.round(row.score)}/100
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden bg-[#F0F0F0]">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, row.score)}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                }) : <p className="col-span-4 text-[12px] text-center py-4 text-gray-400">No pillar data yet</p>}
              </div>
            </div>
          </div>

          {/* ══ ROW C: BRAND PRESENCE ══ */}
          <div className="grid grid-cols-12 gap-4">
            <SocialBrandReachCard
              slug={slug}
              brandName={run.display_brand_name?.trim() || run.brand_name || normalizeUrl(run.url).split("/")[0] || "Your brand"}
              brandUrl={run.url ?? ""}
              details={brandVis?.social_presence_details as SocialPresenceDetails | undefined}
              brandVisibility={brandVis}
              coral={CORAL}
            />
          </div>

          {/* ══ ROW D: TOP ISSUES · VISIBILITY · AI PROBES ══ */}
          <div className="grid grid-cols-12 gap-4">
            {/* Top Issues */}
            <div className="col-span-5 bg-white rounded-2xl p-6 border border-[#EBEBEB] shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[13px] font-bold text-gray-800">Top Issues</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Highest impact fixes</p>
                </div>
                <Link href={`/dashboard/${slug}/recommendations`}
                  className="text-[11px] font-semibold rounded-xl px-3 py-1.5 transition hover:opacity-80"
                  style={{ color: CORAL, backgroundColor: `${CORAL}10` }}>
                  View All ({recommendations.length})
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {topIssues.length > 0 ? topIssues.map((rec, i) => (
                  <Link key={i} href={`/dashboard/${slug}/recommendations`}
                    className="group flex items-start gap-3 rounded-xl p-3.5 bg-[#FAFAFA] border border-[#F0F0F0] hover:border-[#E0E0E0] hover:bg-white transition">
                    <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white text-[10px] font-bold mt-0.5"
                      style={{ backgroundColor: rec.priority === "critical" ? CORAL : "#D97706" }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-gray-800 group-hover:text-gray-900 line-clamp-1">{rec.title}</p>
                      <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{rec.impact_estimate || `${rec.priority} priority`}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 capitalize ${STATUS_STYLES[rec.priority] || "bg-gray-100 text-gray-500"}`}>
                      {rec.priority}
                    </span>
                  </Link>
                )) : (
                  <div className="flex items-center justify-center py-8 text-gray-400 text-[12px]">No critical issues — great work!</div>
                )}
              </div>
            </div>

            {/* Visibility by Platform */}
            <div className="col-span-4 bg-white rounded-2xl p-6 border border-[#EBEBEB] shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
              <div className="mb-5">
                <p className="text-[13px] font-bold text-gray-800">Visibility by Platform</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Brand presence scores</p>
              </div>
              {visibilityBars.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {visibilityBars.map((bar) => {
                    const color = scoreColor(bar.value);
                    return (
                      <div key={bar.label} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 w-20 shrink-0">
                          {bar.icon}
                          <span className="text-[11px] font-semibold text-gray-600">{bar.label}</span>
                        </div>
                        <div className="flex-1 h-3 rounded-full bg-[#F0F0F0] overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.max(bar.value, 2)}%`, backgroundColor: color }} />
                        </div>
                        <span className="text-[12px] font-bold w-8 text-right shrink-0" style={{ color }}>{bar.value}</span>
                      </div>
                    );
                  })}
                  <Link href={`/dashboard/${slug}/visibility`}
                    className="mt-2 text-[11px] font-semibold transition hover:opacity-70" style={{ color: CORAL }}>
                    See full visibility report →
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-400 text-[12px]">No visibility data yet</div>
              )}
            </div>

            {/* AI Engine Probes */}
            <div className="col-span-3 bg-white rounded-2xl p-6 border border-[#EBEBEB] shadow-[0_1px_6px_rgba(0,0,0,0.06)] flex flex-col">
              <div className="mb-4">
                <p className="text-[13px] font-bold text-gray-800">AI Engine Probes</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Brand mention rate</p>
              </div>
              {sentiment ? (() => {
                const mentionPct = sentiment.aiMentioned / Math.max(sentiment.aiTotal, 1);
                const missPct = 1 - mentionPct;
                const r = 38; const c = 2 * Math.PI * r;
                return (
                  <div className="flex flex-col items-center flex-1 justify-center gap-4">
                    <div className="relative w-32 h-32">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r={r} fill="none" stroke="#F0F0F0" strokeWidth="12" />
                        <circle cx="50" cy="50" r={r} fill="none" stroke={CORAL} strokeWidth="12" strokeLinecap="round"
                          strokeDasharray={`${mentionPct * c} ${c}`} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[22px] font-bold text-gray-800">{Math.round(mentionPct * 100)}%</span>
                        <span className="text-[10px] text-gray-400">Mentioned</span>
                      </div>
                    </div>
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CORAL }} />
                          <span className="text-[11px] text-gray-500">Mentioned</span>
                        </div>
                        <span className="text-[12px] font-bold text-gray-800">{sentiment.aiMentioned}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                          <span className="text-[11px] text-gray-500">Not mentioned</span>
                        </div>
                        <span className="text-[12px] font-bold text-gray-800">{sentiment.aiTotal - sentiment.aiMentioned}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-[#F0F0F0] mt-1">
                        <div className="h-full rounded-full" style={{ width: `${mentionPct * 100}%`, backgroundColor: CORAL }} />
                      </div>
                    </div>
                    {missPct > 0 && (
                      <p className="text-[10px] text-gray-400 text-center leading-snug">
                        {Math.round(missPct * 100)}% of AI responses didn't mention your brand
                      </p>
                    )}
                  </div>
                );
              })() : (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-gray-300" style={{ animation: "none" }} />
                  </div>
                  <p className="text-[12px]">No probe data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* ══ ROW E: PREDICTION + SENTIMENT ══ */}
          {(prediction.gain > 0 || sentiment) && (
            <div className="grid grid-cols-12 gap-4">
              {/* 7-Day Prediction */}
              <div className="col-span-7 bg-white rounded-2xl p-6 border border-[#EBEBEB] shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[13px] font-bold text-gray-800">7-Day Score Prediction</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">If you act on all recommendations</p>
                  </div>
                  <div className="flex items-center gap-2 bg-[#F8F8F8] rounded-xl px-3 py-2 border border-[#EBEBEB]">
                    <span className="text-[18px] font-bold text-gray-600">{Math.round(compositeScore)}</span>
                    <svg width="18" height="10" viewBox="0 0 20 12" fill="none">
                      <path d="M2 10L10 2L18 2" stroke={CORAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 2H18V7" stroke={CORAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[18px] font-bold" style={{ color: CORAL }}>{prediction.projected}</span>
                    {prediction.gain > 0 && (
                      <span className="text-[11px] font-semibold rounded-lg px-2 py-0.5" style={{ backgroundColor: `${CORAL}12`, color: CORAL }}>
                        +{prediction.gain} pts
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative h-[120px]">
                  <svg viewBox="0 0 350 100" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="predGrad2" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={CORAL} stopOpacity="0.15" />
                        <stop offset="100%" stopColor={CORAL} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[25, 50, 75].map((y) => (
                      <line key={y} x1="0" y1={y} x2="350" y2={y} stroke="#F0F0F0" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    ))}
                    <line x1="0" y1={100 - compositeScore} x2="350" y2={100 - compositeScore} stroke="#DDDDDD" strokeWidth="1" strokeDasharray="5 4" />
                    <path d={`M 0 ${100 - compositeScore} ${prediction.days.map((d, i) => `L ${((i + 1) / 7) * 350} ${100 - d.score}`).join(" ")} L 350 100 L 0 100 Z`} fill="url(#predGrad2)" />
                    <path d={`M 0 ${100 - compositeScore} ${prediction.days.map((d, i) => `L ${((i + 1) / 7) * 350} ${100 - d.score}`).join(" ")}`}
                      fill="none" stroke={CORAL} strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    <circle cx="350" cy={100 - prediction.projected} r="5" fill="white" stroke={CORAL} strokeWidth="2" />
                    <circle cx="0" cy={100 - compositeScore} r="4" fill="white" stroke="#D0D0D0" strokeWidth="2" />
                  </svg>
                </div>
                <div className="flex justify-between mt-2 px-0.5">
                  <span className="text-[10px] text-gray-400 font-medium">Today</span>
                  {prediction.days.map((d, i) => <span key={i} className="text-[10px] text-gray-400">{d.day}</span>)}
                </div>
                {Object.keys(prediction.pillarImpacts).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Object.entries(prediction.pillarImpacts).sort(([, a], [, b]) => b - a).slice(0, 4).map(([pillar, impact]) => (
                      <div key={pillar} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border"
                        style={{ backgroundColor: `${CORAL}06`, borderColor: `${CORAL}18` }}>
                        <span className="text-[10px] font-semibold text-gray-500 capitalize">{pillar.replace("_", " ")}</span>
                        <span className="text-[10px] font-bold" style={{ color: CORAL }}>+{Math.round(impact)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sentiment */}
              <div className="col-span-5 bg-white rounded-2xl p-6 border border-[#EBEBEB] shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
                <p className="text-[13px] font-bold text-gray-800">Sentiment Analysis</p>
                <p className="text-[11px] text-gray-400 mt-0.5 mb-5">What people say about your brand</p>
                {sentiment ? (
                  <div className="space-y-5">
                    <div className="flex items-center gap-5">
                      <div className="text-center shrink-0 w-16">
                        <p className="text-[38px] font-black leading-none"
                          style={{ color: sentiment.score > 0 ? "#22c55e" : sentiment.score < 0 ? CORAL : "#9CA3AF" }}>
                          {sentiment.score > 0 ? "+" : ""}{sentiment.score}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {sentiment.score >= 5 ? "Very Positive" : sentiment.score >= 1 ? "Positive" : sentiment.score === 0 ? "Neutral" : sentiment.score >= -4 ? "Negative" : "Very Negative"}
                        </p>
                      </div>
                      <div className="flex-1">
                        <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "linear-gradient(to right, #F95C4B, #D97706, #22c55e)" }}>
                          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md border-2 border-gray-200"
                            style={{ left: `calc(${((sentiment.score + 10) / 20) * 100}% - 8px)` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                          <span>Very Negative</span><span>Neutral</span><span>Very Positive</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Positive", val: sentiment.positive, color: "#22c55e", bg: "#22c55e0F" },
                        { label: "Neutral", val: sentiment.neutral, color: "#9CA3AF", bg: "#F5F5F5" },
                        { label: "Negative", val: sentiment.negative, color: CORAL, bg: `${CORAL}0F` },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl p-3.5 text-center border" style={{ backgroundColor: s.bg, borderColor: `${s.color}20` }}>
                          <p className="text-[20px] font-bold" style={{ color: s.color }}>{s.val}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    {sentiment.totalMentions > 0 && (
                      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
                        {sentiment.positive > 0 && <div className="h-full rounded-full" style={{ width: `${(sentiment.positive / sentiment.totalMentions) * 100}%`, backgroundColor: "#22c55e" }} />}
                        {sentiment.neutral > 0 && <div className="h-full rounded-full" style={{ width: `${(sentiment.neutral / sentiment.totalMentions) * 100}%`, backgroundColor: "#E5E7EB" }} />}
                        {sentiment.negative > 0 && <div className="h-full rounded-full" style={{ width: `${(sentiment.negative / sentiment.totalMentions) * 100}%`, backgroundColor: CORAL }} />}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-400 text-[12px]">No sentiment data yet</div>
                )}
              </div>
            </div>
          )}

          {/* ══ ROW F: RECOMMENDATIONS TABLE ══ */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_1px_6px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[13px] font-bold text-gray-800">Recommendations</p>
                  <p className="text-[11px] text-gray-400">Ordered by impact · showing top 10</p>
                </div>
                <Link href={`/dashboard/${slug}/recommendations`} className="text-[11px] font-semibold transition hover:opacity-70" style={{ color: CORAL }}>
                  View all {recommendations.length} →
                </Link>
              </div>
              <div className="flex items-center gap-1.5 bg-[#F5F5F5] rounded-xl p-1">
                {FILTER_TABS.map((tab) => (
                  <button key={tab} onClick={() => setActiveFilter(tab)}
                    className="px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                    style={activeFilter === tab
                      ? { backgroundColor: CORAL, color: "white", boxShadow: `0 2px 6px ${CORAL}40` }
                      : { color: "#9CA3AF" }}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Search inside table */}
            <div className="px-6 py-3 border-b border-[#F8F8F8]">
              <div className="flex items-center gap-2 bg-[#FAFAFA] rounded-xl px-3.5 py-2 border border-[#F0F0F0]">
                <Search className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recommendations…"
                  className="flex-1 text-[12px] text-gray-600 bg-transparent outline-none placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#F0F0F0]">
                    {["Recommendation", "Pillar", "Category", "Priority", "Impact"].map((h) => (
                      <th key={h} className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F8F8]">
                  {filteredRecs.length > 0 ? filteredRecs.map((rec) => (
                    <tr key={rec.id} onClick={() => router.push(`/dashboard/${slug}/recommendations`)}
                      className="hover:bg-[#FAFAFA] cursor-pointer transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ backgroundColor: PRIORITY_COLORS[rec.priority] || "#E5E7EB" }}>
                            {rec.title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-gray-800 truncate group-hover:text-gray-900">{rec.title}</p>
                            <p className="text-[11px] text-gray-400 truncate max-w-[240px]">{rec.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-[12px] font-medium text-gray-700">{PILLAR_LABELS[rec.pillar] || rec.pillar}</p>
                        {pageScore && (() => {
                          const scoreKey = `${rec.pillar}_score` as keyof typeof pageScore;
                          const s = typeof pageScore[scoreKey] === "number" ? Math.round(pageScore[scoreKey] as number) : null;
                          if (s == null) return null;
                          return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ color: scoreColor(s), backgroundColor: scoreBg(s) }}>{s}/100</span>;
                        })()}
                      </td>
                      <td className="py-3.5 px-4 text-[12px] text-gray-400">{rec.category || "General"}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg capitalize ${STATUS_STYLES[rec.priority] || "bg-gray-100 text-gray-500"}`}>
                          {rec.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[12px] text-gray-400 max-w-[160px] truncate">{rec.impact_estimate || "—"}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[13px] text-gray-400">No recommendations found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
