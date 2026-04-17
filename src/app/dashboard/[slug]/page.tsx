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
  MoreHorizontal,
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

  const historyPath = useMemo(() => {
    if (filteredHistory.length === 0) return null;
    const recent = filteredHistory.slice(-12);
    const w = 300;
    const h = 100;

    if (recent.length === 1) {
      // Single point — show as a dot with a flat line
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
  }, [filteredHistory]);

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

  return (
    <>
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-20 px-6 py-3 flex items-center justify-between gap-3 bg-white border-b border-[#EBEBEB] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {/* Left: title + subtitle */}
        <div>
          <h1 className="text-[17px] font-bold text-gray-800 leading-tight">Dashboard</h1>
          <p className="text-[11px] text-gray-400 leading-tight">
            {greeting}, <span className="font-medium" style={{ color: CORAL }}>{session?.user?.name?.split(" ")[0] || "there"}</span> — track your GEO score and AI visibility
          </p>
        </div>

        {/* Right: search + actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 bg-[#F5F5F5] rounded-xl py-2 pl-3 pr-3 text-sm border border-[#E8E8E8] text-gray-400 hover:bg-[#EEEEEE] transition w-44"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 text-left text-[12px]">Search…</span>
            <kbd className="text-[10px] font-mono bg-white border border-[#E0E0E0] rounded px-1.5 py-0.5 text-gray-400">⌘K</kbd>
          </button>
          <button
            onClick={handleReanalyze}
            disabled={reanalyzing || isRunning}
            className="flex items-center gap-1.5 bg-[#F5F5F5] rounded-xl px-3.5 py-2 text-[12px] font-medium transition disabled:opacity-50 hover:bg-[#EEEEEE] border border-[#E8E8E8] text-gray-600"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-analyze
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={!run || isRunning}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition disabled:opacity-50 hover:opacity-90 shadow-sm"
            style={{ backgroundColor: CORAL }}
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </header>

      {/* ── URL bar ── */}
      {run?.url && (
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl px-4 py-2.5 bg-white border border-[#EBEBEB] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${CORAL}15` }}>
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke={CORAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <span className="text-[12px] font-medium truncate text-gray-500">{run.url}</span>
          {run.brand_name && (
            <span className="ml-auto text-[11px] font-semibold rounded-lg px-2.5 py-0.5 shrink-0" style={{ backgroundColor: `${CORAL}10`, color: CORAL }}>
              {run.brand_name}
            </span>
          )}
        </div>
      )}

      {/* Dashboard content */}
      {run && !isRunning && (
        <div className="px-6 pb-6 pt-4">
          {/* ── ROW 1 ── */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            {/* GEO Score Card */}
            {(() => {
              const toRad = (d: number) => (d * Math.PI) / 180;
              const cx = 110, cy = 100, r = 86, sw = 15;
              const N = 11;
              const totalSpan = 240; // degrees the gauge spans
              const slotDeg = totalSpan / N;   // ~21.8° per slot
              const activeDeg = slotDeg - 4;   // active arc per segment
              const startAngle = 210;          // bottom-left start
              const fillN = Math.round((compositeScore / 100) * N);
              const percentileLabel =
                compositeScore >= 80 ? "10%" :
                compositeScore >= 60 ? "25%" :
                compositeScore >= 40 ? "40%" : "60%";

              const segments = Array.from({ length: N }, (_, i) => {
                const sDeg = startAngle - i * slotDeg;
                const eDeg = sDeg - activeDeg;
                const sx = (cx + r * Math.cos(toRad(sDeg))).toFixed(2);
                const sy = (cy - r * Math.sin(toRad(sDeg))).toFixed(2);
                const ex = (cx + r * Math.cos(toRad(eDeg))).toFixed(2);
                const ey = (cy - r * Math.sin(toRad(eDeg))).toFixed(2);
                return (
                  <path key={i}
                    d={`M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}`}
                    fill="none"
                    stroke={i < fillN ? CORAL : "#EBEBEB"}
                    strokeWidth={sw}
                    strokeLinecap="round"
                  />
                );
              });

              return (
                <div className="col-span-4 bg-white rounded-2xl p-5 border border-[#EBEBEB] shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-bold text-gray-800">GEO Score</p>
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-[#F5F5F5] transition">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Top badge */}
                  <div className="flex items-center gap-2 mt-3 rounded-xl px-3 py-2" style={{ backgroundColor: `${CORAL}0D` }}>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill={CORAL}>
                      <path d="M2 6l3 3L10 2l5 7 3-3-2 8H4L2 6z"/>
                    </svg>
                    <p className="text-[12px] font-medium text-gray-600">
                      You&apos;re in the <span className="font-bold" style={{ color: CORAL }}>top {percentileLabel}</span> of sites analyzed
                    </p>
                  </div>

                  {/* Gauge */}
                  <div className="relative -mx-1 mt-1">
                    <svg viewBox="0 0 220 158" className="w-full">
                      {segments}
                      <text x="110" y="128" textAnchor="middle" fontFamily="inherit" fontWeight="800" fontSize="33" fill="#1F2937">
                        {Math.round(compositeScore)}%
                      </text>
                      <text x="110" y="147" textAnchor="middle" fontFamily="inherit" fontWeight="500" fontSize="11" fill="#9CA3AF" letterSpacing="0.5">
                        GEO Score
                      </text>
                    </svg>
                    {scoreChange !== null && (
                      <div className="absolute top-2 right-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ backgroundColor: scoreChange >= 0 ? "#22c55e15" : `${CORAL}15`, color: scoreChange >= 0 ? "#22c55e" : CORAL }}>
                        {scoreChange >= 0 ? "↑" : "↓"} {Math.abs(scoreChange)} pts
                      </div>
                    )}
                  </div>

                  {/* Bottom stats */}
                  <div className="grid grid-cols-2 gap-2 -mt-1">
                    <Link href={`/dashboard/${slug}/recommendations`}
                      className="rounded-xl p-3 hover:bg-[#FAFAFA] transition border border-[#F0F0F0]">
                      <p className="text-[10px] font-semibold text-gray-400 mb-1">Recommendations</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[22px] font-black text-gray-800 leading-none">{recommendations.length}</span>
                        {criticalCount > 0 && (
                          <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: CORAL }}>
                            {criticalCount} critical
                          </span>
                        )}
                      </div>
                    </Link>
                    <Link href={`/dashboard/${slug}/recommendations`}
                      className="rounded-xl p-3 hover:bg-[#FAFAFA] transition border border-[#F0F0F0]">
                      <p className="text-[10px] font-semibold text-gray-400 mb-1">Priority Issues</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[22px] font-black text-gray-800 leading-none">{criticalCount + highCount}</span>
                        <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white bg-gray-800">
                          {highCount} high
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })()}

            {/* GEO Score History */}
            <div className="col-span-4 bg-white rounded-2xl p-5 border border-[#EBEBEB] shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-foreground">GEO Score History</p>
                {/* Range dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setHistoryDropdownOpen(!historyDropdownOpen)}
                    className="flex items-center gap-1 text-[11px] rounded-lg px-2.5 py-1 transition hover:opacity-80 text-muted-foreground border border-border"
                  >
                    {{ "7d": "7 days", "1m": "1 month", "3m": "3 months", "all": "All time" }[historyRange]}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {historyDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 rounded-xl bg-card shadow-lg py-1 z-50 min-w-[110px] border border-border">
                      {([["7d", "7 days"], ["1m", "1 month"], ["3m", "3 months"], ["all", "All time"]] as const).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => { setHistoryRange(key); setHistoryDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${historyRange === key ? "font-semibold" : "font-normal text-muted-foreground"}`}
                          style={{
                            color: historyRange === key ? CORAL : undefined,
                            backgroundColor: historyRange === key ? `${CORAL}08` : "transparent",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="h-[120px] relative">
                {historyPath ? (
                  <svg viewBox="0 0 300 100" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={CORAL} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={CORAL} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="50" x2="300" y2="50" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    <line x1="0" y1="25" x2="300" y2="25" stroke="currentColor" strokeOpacity="0.04" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    <line x1="0" y1="75" x2="300" y2="75" stroke="currentColor" strokeOpacity="0.04" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    {/* Area fill */}
                    <path d={historyPath.area} fill="url(#areaGrad)" />
                    {/* Line */}
                    <path d={historyPath.line} fill="none" stroke={CORAL} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Data points */}
                    {historyPath.points?.map((pt, i) => (
                      <g key={i}>
                        <circle cx={pt.x} cy={pt.y} r="6" fill={CORAL} fillOpacity="0.15" vectorEffect="non-scaling-stroke" />
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
                    <span>100</span><span>50</span><span>0</span>
                  </div>
                )}
              </div>
              {historyPath && (
                <div className="flex justify-between text-[10px] mt-2 px-1 text-muted-foreground">
                  {historyPath.labels.map((l, i) => <span key={i}>{l}</span>)}
                </div>
              )}
            </div>

            {/* Pillar Breakdown — horizontal bars */}
            <div className="col-span-4 bg-white rounded-2xl p-5 border border-[#EBEBEB] shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-foreground">Pillar Breakdown</p>
                <button className="text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-col gap-3">
                {breakdownRows.length > 0 ? breakdownRows.map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-semibold text-foreground">{Math.round(row.score)}/100</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-muted">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, row.score)}%`, backgroundColor: CORAL }} />
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-center py-6 text-muted-foreground">No pillar data yet</p>
                )}
              </div>
              {breakdownRows.length > 0 && (
                <div className="flex justify-between text-[9px] mt-3 text-muted-foreground">
                  <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            <SocialBrandReachCard
              slug={slug}
              brandName={
                run.display_brand_name?.trim() ||
                run.brand_name ||
                normalizeUrl(run.url).split("/")[0] ||
                "Your brand"
              }
              brandUrl={run.url ?? ""}
              details={brandVis?.social_presence_details as SocialPresenceDetails | undefined}
              brandVisibility={brandVis}
              coral={CORAL}
            />
          </div>

          {/* ── ROW 2 ── */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            {/* Top Issues */}
            <div className="col-span-5 bg-white rounded-2xl p-5 border border-[#EBEBEB] shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-foreground">Top Issues</p>
                <Link
                  href={`/dashboard/${slug}/recommendations`}
                  className="flex items-center gap-1.5 text-xs rounded-lg px-3 py-1.5 transition hover:opacity-80"
                  style={{ color: CORAL, border: `1px solid ${CORAL}30` }}
                >
                  View All ({recommendations.length})
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {topIssues.length > 0 ? topIssues.map((rec, i) => (
                  <Link
                    key={i}
                    href={`/dashboard/${slug}/recommendations`}
                    className="rounded-xl p-4 transition hover:shadow-sm group bg-[#FAFAFA] border border-[#EBEBEB]"
                  >
                    <div className="flex items-start gap-2 mb-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: rec.priority === "critical" ? CORAL : "#D97706" }}
                      />
                      <p className="text-sm font-semibold line-clamp-2 group-hover:underline text-foreground">{rec.title}</p>
                    </div>
                    <p className="text-xs line-clamp-2 pl-3.5 text-muted-foreground">{rec.impact_estimate || `${rec.priority} priority`}</p>
                  </Link>
                )) : (
                  <p className="col-span-2 text-xs text-center py-6 text-muted-foreground">No critical issues found</p>
                )}
              </div>
            </div>

            {/* Visibility by Platform */}
            <div className="col-span-4 bg-white rounded-2xl p-6 border border-[#EBEBEB] shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
              <p className="text-sm font-semibold mb-5 text-foreground">Visibility by Platform</p>
              {visibilityBars.length > 0 ? (
                <div className="flex items-end gap-5 px-2" style={{ height: 180 }}>
                  {/* Y-axis labels */}
                  <div className="flex flex-col justify-between h-full pb-7 shrink-0">
                    {[100, 75, 50, 25, 0].map((v) => (
                      <span key={v} className="text-[10px] font-medium w-6 text-right text-muted-foreground">{v}</span>
                    ))}
                  </div>

                  {/* Chart area */}
                  <div className="flex-1 flex flex-col h-full">
                    {/* Grid + bars */}
                    <div className="relative flex-1">
                      {/* Horizontal grid */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-full border-b border-border" />
                        ))}
                      </div>

                      {/* Bars row */}
                      <div className="relative z-10 flex items-end h-full gap-3 px-2">
                        {visibilityBars.map((bar) => {
                          const pct = Math.max(bar.value, 3);
                          return (
                            <div key={bar.label} className="flex-1 flex flex-col items-center h-full justify-end">
                              <span className="text-[11px] font-bold mb-1 text-foreground">{bar.value}</span>
                              <div
                                className="w-full rounded-t-xl relative overflow-hidden"
                                style={{
                                  height: `${pct}%`,
                                  backgroundColor: bar.color,
                                  maxWidth: 56,
                                }}
                              >
                                {/* Subtle shine overlay */}
                                <div
                                  className="absolute inset-0 rounded-t-xl"
                                  style={{
                                    background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 60%)",
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* X-axis labels with icons */}
                    <div className="flex gap-3 px-2 pt-2.5 border-t border-border">
                      {visibilityBars.map((bar) => (
                        <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[11px] font-semibold text-foreground/70">{bar.label}</span>
                          {bar.icon}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center" style={{ height: 180 }}>
                  <p className="text-xs text-muted-foreground">No visibility data yet</p>
                </div>
              )}
            </div>

            {/* AI Engine Probes — pie chart */}
            <div className="col-span-3 bg-white rounded-2xl p-5 border border-[#EBEBEB] shadow-[0_1px_4px_rgba(0,0,0,0.05)] flex flex-col">
              <p className="text-sm font-semibold text-foreground mb-3">AI Engine Probes</p>
              {sentiment ? (() => {
                const mentionPct = sentiment.aiMentioned / sentiment.aiTotal;
                const missPct = 1 - mentionPct;
                // SVG pie: two arcs
                const r = 40;
                const c = 251.3; // 2 * PI * 40
                return (
                  <div className="flex flex-col items-center flex-1 justify-center">
                    {/* Pie */}
                    <div className="relative w-28 h-28">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {/* Mentioned slice */}
                        <circle cx="50" cy="50" r={r} fill="none"
                          stroke={CORAL} strokeWidth="20"
                          strokeDasharray={`${mentionPct * c} ${c}`}
                        />
                        {/* Not mentioned slice */}
                        <circle cx="50" cy="50" r={r} fill="none"
                          stroke="var(--border)" strokeWidth="20"
                          strokeDasharray={`${missPct * c} ${c}`}
                          strokeDashoffset={`${-mentionPct * c}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center">
                          <span className="text-lg font-bold text-foreground">{Math.round(mentionPct * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CORAL }} />
                        <span className="text-[10px] text-muted-foreground">Mentioned <span className="font-bold text-foreground">{Math.round(mentionPct * 100)}%</span></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-border" />
                        <span className="text-[10px] text-muted-foreground">Missed <span className="font-bold text-foreground">{Math.round(missPct * 100)}%</span></span>
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">No probe data</p>
                </div>
              )}
            </div>
          </div>

          {/* ── ROW 2.5: Prediction & Sentiment ── */}
          {(prediction.gain > 0 || sentiment) && (
            <div className="grid grid-cols-12 gap-4 mb-4">
              {/* 7-Day Prediction */}
              <div className="col-span-7 bg-white rounded-2xl p-6 border border-[#EBEBEB] shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">7-Day Score Prediction</p>
                    <p className="text-xs mt-0.5 text-muted-foreground">Projected improvement if you act on recommendations</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">{Math.round(compositeScore)}</span>
                    <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                      <path d="M2 10L10 2L18 2" stroke={CORAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 2H18V7" stroke={CORAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-2xl font-bold" style={{ color: CORAL }}>{prediction.projected}</span>
                  </div>
                </div>

                {/* Chart */}
                <div className="relative" style={{ height: 140 }}>
                  <svg viewBox="0 0 350 100" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="predGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={CORAL} stopOpacity="0.15" />
                        <stop offset="100%" stopColor={CORAL} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Current score line (dashed) */}
                    <line x1="0" y1={100 - compositeScore} x2="350" y2={100 - compositeScore} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
                    {/* Prediction area */}
                    <path
                      d={`M 0 ${100 - compositeScore} ${prediction.days.map((d, i) => `L ${((i + 1) / 7) * 350} ${100 - d.score}`).join(" ")} L 350 100 L 0 100 Z`}
                      fill="url(#predGrad)"
                    />
                    {/* Prediction line */}
                    <path
                      d={`M 0 ${100 - compositeScore} ${prediction.days.map((d, i) => `L ${((i + 1) / 7) * 350} ${100 - d.score}`).join(" ")}`}
                      fill="none" stroke={CORAL} strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                    />
                    {/* Endpoint dot */}
                    <circle cx="350" cy={100 - prediction.projected} r="4" fill={CORAL} />
                    {/* Start dot */}
                    <circle cx="0" cy={100 - compositeScore} r="3" fill="var(--border)" />
                  </svg>
                  {/* Y labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] font-medium text-muted-foreground">
                    <span>100</span><span>50</span><span>0</span>
                  </div>
                </div>
                {/* Day labels */}
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-[10px] font-medium text-muted-foreground">Today</span>
                  {prediction.days.map((d, i) => (
                    <span key={i} className="text-[10px] font-medium text-muted-foreground">{d.day}</span>
                  ))}
                </div>

                {/* Pillar impact breakdown */}
                {Object.keys(prediction.pillarImpacts).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Object.entries(prediction.pillarImpacts)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 4)
                      .map(([pillar, impact]) => (
                        <div
                          key={pillar}
                          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                          style={{ backgroundColor: `${CORAL}08`, border: `1px solid ${CORAL}15` }}
                        >
                          <span className="text-[10px] font-semibold capitalize text-muted-foreground">
                            {pillar.replace("_", " ")}
                          </span>
                          <span className="text-[10px] font-bold" style={{ color: CORAL }}>
                            +{Math.round(impact)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Sentiment Analysis — -10 to +10 scale */}
              <div className="col-span-5 bg-white rounded-2xl p-6 border border-[#EBEBEB] shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
                <p className="text-sm font-semibold mb-1 text-foreground">Sentiment Analysis</p>
                <p className="text-xs mb-5 text-muted-foreground">What people say about your brand online</p>

                {sentiment ? (
                  <div className="space-y-5">
                    {/* Score gauge -10 to +10 */}
                    <div className="flex items-center gap-5">
                      <div className="text-center shrink-0">
                        <p
                          className="text-4xl font-bold"
                          style={{ color: sentiment.score > 0 ? "#22c55e" : sentiment.score < 0 ? CORAL : "var(--muted-foreground)" }}
                        >
                          {sentiment.score > 0 ? "+" : ""}{sentiment.score}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {sentiment.score >= 5 ? "Very Positive" : sentiment.score >= 1 ? "Positive" : sentiment.score === 0 ? "Neutral" : sentiment.score >= -4 ? "Negative" : "Very Negative"}
                        </p>
                      </div>

                      {/* Scale bar */}
                      <div className="flex-1">
                        <div className="relative h-3 rounded-full bg-muted">
                          {/* Gradient: red → yellow → green */}
                          <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(to right, #F95C4B, #D97706, #22c55e)" }} />
                          {/* Line indicator */}
                          <div
                            className="absolute -top-2 flex flex-col items-center"
                            style={{ left: `${((sentiment.score + 10) / 20) * 100}%`, transform: "translateX(-50%)" }}
                          >
                            {/* Score label */}
                            <span className="text-[9px] font-bold text-foreground bg-card border border-border rounded px-1 mb-0.5 shadow-sm">
                              {sentiment.score > 0 ? "+" : ""}{sentiment.score}
                            </span>
                            {/* Vertical line */}
                            <div className="w-0.5 h-7 bg-foreground rounded-full shadow-sm" />
                          </div>
                        </div>
                        <div className="flex justify-between text-[9px] text-muted-foreground mt-4">
                          <span>-10</span><span>0</span><span>+10</span>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown stats */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="rounded-xl p-3 bg-[#22c55e]/10 border border-[#22c55e]/20 text-center">
                        <p className="text-lg font-bold text-[#22c55e]">{sentiment.positive}</p>
                        <p className="text-[9px] text-muted-foreground">Positive</p>
                      </div>
                      <div className="rounded-xl p-3 bg-background border border-border text-center">
                        <p className="text-lg font-bold text-muted-foreground">{sentiment.neutral}</p>
                        <p className="text-[9px] text-muted-foreground">Neutral</p>
                      </div>
                      <div className="rounded-xl p-3 bg-primary/10 border border-primary/20 text-center">
                        <p className="text-lg font-bold text-primary">{sentiment.negative}</p>
                        <p className="text-[9px] text-muted-foreground">Negative</p>
                      </div>
                      <div className="rounded-xl p-3 bg-background border border-border text-center">
                        <p className="text-lg font-bold text-foreground">{sentiment.aiMentioned}/{sentiment.aiTotal}</p>
                        <p className="text-[9px] text-muted-foreground">AI Mentions</p>
                      </div>
                    </div>

                    {/* Stacked bar */}
                    {sentiment.totalMentions > 0 && (
                      <div>
                        <div className="flex h-2.5 rounded-full overflow-hidden">
                          {sentiment.positive > 0 && <div className="h-full" style={{ width: `${(sentiment.positive / sentiment.totalMentions) * 100}%`, backgroundColor: "#22c55e" }} />}
                          {sentiment.neutral > 0 && <div className="h-full" style={{ width: `${(sentiment.neutral / sentiment.totalMentions) * 100}%`, backgroundColor: "var(--border)" }} />}
                          {sentiment.negative > 0 && <div className="h-full" style={{ width: `${(sentiment.negative / sentiment.totalMentions) * 100}%`, backgroundColor: CORAL }} />}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-xs text-muted-foreground">No sentiment data available yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ROW 3: Recommendations ── */}
          <div className="bg-white rounded-2xl p-5 border border-[#EBEBEB] shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <p className="text-lg font-semibold text-foreground">Recommendations</p>
                <Link
                  href={`/dashboard/${slug}/recommendations`}
                  className="text-[11px] font-medium transition hover:opacity-80"
                  style={{ color: CORAL }}
                >
                  View all &rarr;
                </Link>
              </div>
              <div className="flex items-center gap-2">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeFilter === tab
                        ? "text-white"
                        : "bg-background text-muted-foreground"
                    }`}
                    style={activeFilter === tab ? { backgroundColor: CORAL } : undefined}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="pb-3 px-2">Recommendation <ChevronDown className="w-3 h-3 inline ml-0.5" /></th>
                    <th className="pb-3 px-2">Pillar <ChevronDown className="w-3 h-3 inline ml-0.5" /></th>
                    <th className="pb-3 px-2">Category</th>
                    <th className="pb-3 px-2">Priority <ChevronDown className="w-3 h-3 inline ml-0.5" /></th>
                    <th className="pb-3 px-2">Impact <ChevronDown className="w-3 h-3 inline ml-0.5" /></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecs.length > 0 ? filteredRecs.map((rec) => (
                    <tr key={rec.id} onClick={() => router.push(`/dashboard/${slug}/recommendations`)} className="transition-colors hover:opacity-80 cursor-pointer border-b border-border">
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ backgroundColor: PRIORITY_COLORS[rec.priority] || "var(--border)" }}
                          >
                            {rec.title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate text-foreground">{rec.title}</p>
                            <p className="text-[11px] truncate max-w-[260px] text-muted-foreground">{rec.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-2">
                        <p className="text-sm font-medium text-foreground">{PILLAR_LABELS[rec.pillar] || rec.pillar}</p>
                        {pageScore && (() => {
                          const scoreKey = `${rec.pillar}_score` as keyof typeof pageScore;
                          const score = typeof pageScore[scoreKey] === "number" ? Math.round(pageScore[scoreKey] as number) : null;
                          if (score == null) return null;
                          const color = score >= 70 ? "text-[#22c55e] bg-[#22c55e]/10" : score >= 40 ? "text-[#D97706] bg-[#D97706]/10" : "text-primary bg-primary/10";
                          return <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${color}`}>{score}/100</span>;
                        })()}
                      </td>
                      <td className="py-3.5 px-2 text-xs text-muted-foreground">{rec.category || "General"}</td>
                      <td className="py-3.5 px-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${STATUS_STYLES[rec.priority] || "bg-gray-100 text-gray-600"}`}>
                          {rec.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-xs text-muted-foreground">{rec.impact_estimate || "—"}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        No recommendations found
                      </td>
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
