"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  getRunBySlug,
  getScoreHistory,
  getExportPDFUrl,
  startAnalysis,
  type AnalysisRunDetail,
  type ScoreHistoryPoint,
} from "@/lib/api/analyzer";
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
  high: "bg-amber-100 text-amber-700",
  medium: "bg-blue-100 text-blue-700",
  low: "bg-purple-100 text-purple-700",
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

  const [run, setRun] = useState<AnalysisRunDetail | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reanalyzing, setReanalyzing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
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

  const email = session?.user?.email ?? "";

  const fetchData = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      setError("");
      const detail = await getRunBySlug(slug);
      setRun(detail);
      if (detail.email) {
        const history = await getScoreHistory(detail.email).catch(() => []);
        setScoreHistory(history);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load analysis");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!run || run.status === "complete" || run.status === "failed") return;
    const interval = setInterval(async () => {
      try {
        const updated = await getRunBySlug(slug);
        setRun(updated);
        if (updated.status === "complete" || updated.status === "failed") {
          clearInterval(interval);
          if (updated.email) {
            const history = await getScoreHistory(updated.email).catch(() => []);
            setScoreHistory(history);
          }
        }
      } catch { /* ignore */ }
    }, 2500);
    return () => clearInterval(interval);
  }, [run?.status, slug]);

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
      setError("Failed to start re-analysis");
    } finally {
      setReanalyzing(false);
    }
  }

  function handleDownloadPDF() {
    if (!run) return;
    window.open(`${config.apiBaseUrl}${getExportPDFUrl(run.id)}`, "_blank");
  }

  // Derived data
  const pageScore = run?.page_scores?.[0] ?? null;
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

  // AI Sentiment from probes
  const sentiment = useMemo(() => {
    const probes = run?.ai_probes ?? [];
    if (probes.length === 0) return null;
    const mentioned = probes.filter((p) => p.brand_mentioned).length;
    const notMentioned = probes.length - mentioned;
    const avgConfidence = probes.reduce((sum, p) => sum + p.confidence, 0) / probes.length;

    // Categorize confidence levels
    const high = probes.filter((p) => p.confidence >= 0.7).length;
    const medium = probes.filter((p) => p.confidence >= 0.4 && p.confidence < 0.7).length;
    const low = probes.filter((p) => p.confidence < 0.4).length;

    return { total: probes.length, mentioned, notMentioned, avgConfidence, high, medium, low };
  }, [run?.ai_probes]);

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
    return filtered.slice(0, 10);
  }, [recommendations, activeFilter, searchQuery]);

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
    if (filteredHistory.length < 2) return null;
    const recent = filteredHistory.slice(-12);
    const w = 300;
    const h = 100;
    const points = recent.map((pt, i) => {
      const x = (i / (recent.length - 1)) * w;
      const y = h - (pt.composite_score / 100) * h;
      return { x, y };
    });
    const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const area = `${line} L ${w} ${h} L 0 ${h} Z`;
    const labels = recent.map((pt) => {
      const d = new Date(pt.date);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });
    return { line, area, labels };
  }, [filteredHistory]);

  // Loading
  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <SignalorLoader size="lg" label="Loading analysis..." />
      </div>
    );
  }

  if (error && !run) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl px-5 py-4 text-sm" style={{ backgroundColor: `${CORAL}10`, border: `1px solid ${CORAL}30`, color: CORAL }}>
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Sticky Top Bar (compact) ── */}
      <header className="sticky top-0 z-20 px-6 py-2.5 flex items-center justify-end gap-3 bg-background border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search recommendations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card rounded-xl py-2 pl-9 pr-4 text-sm w-52 focus:outline-none focus:ring-2 border border-border text-foreground"
          />
        </div>
        <button
          onClick={handleReanalyze}
          disabled={reanalyzing || isRunning}
          className="flex items-center gap-1.5 bg-card rounded-xl px-4 py-2 text-xs font-medium transition disabled:opacity-50 hover:opacity-80 border border-border text-foreground"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-analyze
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={!run || isRunning}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium text-white transition disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: CORAL }}
        >
          <Download className="w-3.5 h-3.5" /> Download PDF
        </button>
      </header>

      {/* ── Greeting + URL (scrollable) ── */}
      <div className="px-6 pt-5 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-none text-foreground">
          {greeting}, <span style={{ color: CORAL }}>{session?.user?.name?.split(" ")[0] || "there"}</span>
          <span style={{ color: CORAL }}>.</span>
        </h1>
        <p className="text-sm mt-1.5 text-muted-foreground">
          Stay on top of your GEO score, monitor visibility, and track progress.
        </p>

        {/* URL bar */}
        {run?.url && (
          <div className="flex items-center gap-2 rounded-xl px-3.5 py-2 bg-card mt-4 border border-border">
            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${CORAL}15` }}>
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke={CORAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <span className="text-xs font-medium truncate text-muted-foreground">{run.url}</span>
            {run.brand_name && (
              <span className="ml-auto text-[10px] font-semibold rounded-md px-2 py-0.5 shrink-0" style={{ backgroundColor: `${CORAL}10`, color: CORAL }}>
                {run.brand_name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Running state */}
      {isRunning && (
        <div className="flex items-center justify-center py-16">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 md:p-8 border border-border">
            {/* Orbital loader */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-20 h-20 mb-3">
                <svg width={80} height={80} viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="3" />
                  <circle
                    cx="40" cy="40" r="32" fill="none"
                    stroke={CORAL} strokeWidth="3" strokeLinecap="round"
                    strokeDasharray="50 150"
                    className="animate-[signalor-spin_1.2s_linear_infinite]"
                    style={{ transformOrigin: "40px 40px" }}
                  />
                  <text x="40" y="42" textAnchor="middle" dominantBaseline="middle" fill="var(--foreground)" fontSize="16" fontWeight="700">
                    {run?.progress != null ? Math.round(run.progress) : 0}%
                  </text>
                </svg>
              </div>
              <p className="text-base font-semibold text-foreground">Analysis in progress</p>
              <p className="text-xs mt-0.5 text-muted-foreground">
                {run?.status === "pending" && "Queued — starting soon..."}
                {run?.status === "crawling" && "Crawling your website..."}
                {run?.status === "analyzing" && "AI is analyzing content..."}
                {run?.status === "scoring" && "Computing GEO scores..."}
                {run?.status === "running" && "Running analysis..."}
                {!["pending", "crawling", "analyzing", "scoring", "running"].includes(run?.status ?? "") && "Processing..."}
              </p>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full rounded-full overflow-hidden bg-muted">
              <div
                className="h-full rounded-full transition-all duration-700 relative"
                style={{ width: `${run?.progress ?? 0}%`, backgroundColor: CORAL }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard content */}
      {run && !isRunning && (
        <div className="px-6 pb-6">
          {/* ── ROW 1 ── */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            {/* GEO Score Card — special coral gradient, kept as-is */}
            <div className="col-span-4 rounded-2xl p-6 relative overflow-hidden" style={{ background: `linear-gradient(145deg, ${CORAL} 0%, #FF7A6B 50%, #FF9080 100%)`, border: "none" }}>
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
              <div className="flex items-start gap-6 relative z-10">
                <div className="flex flex-col items-center shrink-0">
                  <p className="text-xs font-semibold mb-3 text-white/70">GEO Score</p>
                  <div className="relative w-28 h-28">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="7" />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round"
                        strokeDasharray={`${compositeScore * 2.51} ${100 * 2.51}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">{Math.round(compositeScore)}</span>
                      {scoreChange !== null && (
                        <span className="text-[11px] font-semibold text-white/80">
                          {scoreChange >= 0 ? "+" : ""}{scoreChange} pts
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 flex-1 pt-1">
                  <Link href={`/dashboard/${slug}/recommendations`} className="rounded-xl px-4 py-3.5 transition hover:brightness-110" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <p className="text-xs mb-1 text-white/60">Recommendations</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">{recommendations.length}</span>
                      {criticalCount > 0 && (
                        <span className="text-xs text-white/70">{criticalCount} critical</span>
                      )}
                    </div>
                  </Link>
                  <Link href={`/dashboard/${slug}/recommendations`} className="rounded-xl px-4 py-3.5 transition hover:brightness-110" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <p className="text-xs mb-1 text-white/60">Priority Issues</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">{criticalCount + highCount}</span>
                      <span className="text-xs text-white/60">{criticalCount} critical / {highCount} high</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* GEO Score History */}
            <div className="col-span-4 bg-card rounded-2xl p-5 border border-border">
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
                    <path d={historyPath.area} fill="url(#areaGrad)" />
                    <path d={historyPath.line} fill="none" stroke={CORAL} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                  </svg>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs text-muted-foreground">Run more analyses to see trends</p>
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
            <div className="col-span-4 bg-card rounded-2xl p-5 border border-border">
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

          {/* ── ROW 2 ── */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            {/* Top Issues */}
            <div className="col-span-5 bg-card rounded-2xl p-5 border border-border">
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
                    className="rounded-xl p-4 transition hover:shadow-sm group bg-background border border-border"
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
            <div className="col-span-4 bg-card rounded-2xl p-6 border border-border">
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
            <div className="col-span-3 bg-card rounded-2xl p-5 border border-border flex flex-col">
              <p className="text-sm font-semibold text-foreground mb-3">AI Engine Probes</p>
              {sentiment ? (() => {
                const mentionPct = sentiment.mentioned / sentiment.total;
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
              <div className="col-span-7 bg-card rounded-2xl p-6 border border-border">
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

              {/* AI Sentiment Analysis — stacked bar + stat grid */}
              <div className="col-span-5 bg-card rounded-2xl p-6 border border-border">
                <p className="text-sm font-semibold mb-1 text-foreground">AI Sentiment Analysis</p>
                <p className="text-xs mb-5 text-muted-foreground">How AI engines perceive your brand</p>

                {sentiment ? (
                  <div className="space-y-5">
                    {/* Big stat row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl p-3.5 bg-background border border-border text-center">
                        <p className="text-2xl font-bold text-foreground">{sentiment.mentioned}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Mentioned</p>
                      </div>
                      <div className="rounded-xl p-3.5 bg-background border border-border text-center">
                        <p className="text-2xl font-bold text-foreground">{sentiment.notMentioned}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Not Found</p>
                      </div>
                      <div className="rounded-xl p-3.5 text-center" style={{ background: `linear-gradient(135deg, ${CORAL}, #FF7A6B)` }}>
                        <p className="text-2xl font-bold text-white">{(sentiment.avgConfidence * 100).toFixed(0)}%</p>
                        <p className="text-[10px] text-white/70 mt-0.5">Avg Conf.</p>
                      </div>
                    </div>

                    {/* Stacked sentiment bar */}
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Confidence Distribution</p>
                      <div className="flex h-3 rounded-full overflow-hidden">
                        {sentiment.high > 0 && (
                          <div className="h-full" style={{ width: `${(sentiment.high / sentiment.total) * 100}%`, backgroundColor: "#22c55e" }} />
                        )}
                        {sentiment.medium > 0 && (
                          <div className="h-full" style={{ width: `${(sentiment.medium / sentiment.total) * 100}%`, backgroundColor: "#D97706" }} />
                        )}
                        {sentiment.low > 0 && (
                          <div className="h-full" style={{ width: `${(sentiment.low / sentiment.total) * 100}%`, backgroundColor: CORAL }} />
                        )}
                      </div>
                      {/* Legend */}
                      <div className="flex items-center gap-4 mt-2">
                        {[
                          { label: "High", count: sentiment.high, color: "#22c55e" },
                          { label: "Medium", count: sentiment.medium, color: "#D97706" },
                          { label: "Low", count: sentiment.low, color: CORAL },
                        ].map((l) => (
                          <div key={l.label} className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                            <span className="text-[10px] text-muted-foreground">{l.label} <span className="font-bold text-foreground">{l.count}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-xs text-muted-foreground">No AI probe data available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ROW 3: Recommendations ── */}
          <div className="bg-card rounded-2xl p-5 border border-border">
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

      {/* Failed run */}
      {run?.status === "failed" && (
        <div className="px-6 py-8">
          <div className="flex items-center gap-3 rounded-xl px-5 py-4 text-sm" style={{ backgroundColor: `${CORAL}10`, border: `1px solid ${CORAL}30`, color: CORAL }}>
            <AlertCircle className="h-4 w-4 shrink-0" />
            Analysis failed: {run.error_message || "Unknown error. Try re-analyzing."}
          </div>
        </div>
      )}
    </>
  );
}
