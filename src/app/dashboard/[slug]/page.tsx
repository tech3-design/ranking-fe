"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  getExportPDFUrl,
  startAnalysis,
} from "@/lib/api/analyzer";
import { useRun } from "./_components/run-context";
import { config, routes } from "@/lib/config";
import {
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";
import { RotatingGeoFact } from "@/components/ui/rotating-geo-fact";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SocialBrandReachCard,
  type SocialPresenceDetails,
} from "@/components/analyzer/social-brand-reach-card";
import { CORAL } from "@/components/dashboard/constants";
import type { DashboardSentiment } from "@/components/dashboard/types";
import { GeoScoreCard } from "@/components/dashboard/geo-score-card";
import { GeoScoreHistoryCard } from "@/components/dashboard/geo-score-history-card";
import { PillarBreakdownCard } from "@/components/dashboard/pillar-breakdown-card";
import { TopIssuesCard } from "@/components/dashboard/top-issues-card";
import { VisibilityByPlatformCard } from "@/components/dashboard/visibility-by-platform-card";
import { CompetitorsCard } from "@/components/dashboard/competitors-card";
import { PredictionSentimentRow } from "@/components/dashboard/prediction-sentiment-row";
import { WeeklyPerformanceSection } from "@/components/dashboard/weekly-performance-section";

export default function SignalorDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const { run, scoreHistory, loading, error, scoreBump } = useRun();
  const [reanalyzing, setReanalyzing] = useState(false);
  const [reanalyzeError, setReanalyzeError] = useState("");

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

  const normalizeUrl = (u: string) => u.replace(/^https?:\/\//, "").replace(/\/+$/, "").toLowerCase();
  const pageScore = run?.page_scores?.find((p) => normalizeUrl(p.url) === normalizeUrl(run.url)) ?? run?.page_scores?.[0] ?? null;
  const compositeScore = run?.composite_score ?? 0;
  const brandVis = run?.brand_visibility;
  const recommendations = run?.recommendations ?? [];
  const isRunning = !!run && run.status !== "complete" && run.status !== "failed";

  const prevScore = scoreHistory.length >= 2 ? scoreHistory[scoreHistory.length - 2]?.composite_score : null;
  const scoreChange = prevScore !== null ? Math.round(compositeScore - prevScore) : null;

  const prediction = useMemo(() => {
    let totalImpact = 0;
    const pillarImpacts: Record<string, number> = {};

    for (const rec of recommendations) {
      const match = rec.impact_estimate?.match(/(\d+)/);
      const pts = match ? parseInt(match[1], 10) : 0;
      const weight = rec.priority === "critical" ? 1 : rec.priority === "high" ? 0.7 : rec.priority === "medium" ? 0.4 : 0.2;
      const impact = Math.min(pts * weight, 15);
      totalImpact += impact;
      if (rec.pillar) {
        pillarImpacts[rec.pillar] = (pillarImpacts[rec.pillar] || 0) + impact;
      }
    }

    const projected = Math.min(100, compositeScore + totalImpact);
    const projectedGain = Math.round(projected - compositeScore);

    const days = Array.from({ length: 7 }, (_, i) => {
      const dayScore = compositeScore + (projectedGain * ((i + 1) / 7));
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      return { day: d.toLocaleDateString("en-US", { weekday: "short" }), score: Math.round(dayScore) };
    });

    return { projected: Math.round(projected), gain: projectedGain, days, pillarImpacts };
  }, [recommendations, compositeScore]);

  const sentiment = useMemo((): DashboardSentiment | null => {
    const redditDetails = brandVis?.reddit_details as Record<string, unknown> | undefined;
    const redditSentiment = redditDetails?.sentiment as { positive: number; negative: number; neutral: number; modifier: number } | undefined;

    const probes = run?.ai_probes ?? [];
    const mentioned = probes.filter((p) => p.brand_mentioned).length;
    const total = probes.length;

    const positive = redditSentiment?.positive ?? 0;
    const negative = redditSentiment?.negative ?? 0;
    const neutral = redditSentiment?.neutral ?? 0;
    const modifier = redditSentiment?.modifier ?? 0; 
    const score = Math.round(modifier / 2);

    const hasData = (positive + negative + neutral) > 0 || total > 0;
    if (!hasData) return null;

    return {
      positive, negative, neutral,
      score,
      totalMentions: positive + negative + neutral,
      aiMentioned: mentioned,
      aiTotal: total,
    };
  }, [brandVis?.reddit_details, run?.ai_probes]);

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
        <div className="flex items-center gap-3 rounded-sm border px-5 py-4 text-sm shadow-sm" style={{ backgroundColor: `${CORAL}08`, borderColor: `${CORAL}30`, color: CORAL }}>
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error || reanalyzeError}
        </div>
      </div>
    );
  }

  if (run?.status === "failed") {
    return (
      <div className="flex h-full w-full items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-sm border border-border shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-sm flex items-center justify-center" style={{ backgroundColor: `${CORAL}10` }}>
            <AlertCircle className="w-6 h-6" style={{ color: CORAL }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Analysis Failed</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {run.error_message || "Something went wrong during analysis. Please try again."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="default"
              size="default"
              className="rounded-sm shadow-sm gap-2 text-xs font-semibold"
              onClick={handleReanalyze}
              disabled={reanalyzing}
            >
              {reanalyzing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Retrying…
                </>
              ) : (
                <>
                  <RefreshCw className="size-4" />
                  Try Again
                </>
              )}
            </Button>
          </div>
          {reanalyzeError && <p className="text-xs text-destructive">{reanalyzeError}</p>}
        </div>
      </div>
    );
  }

  const projectName = run?.display_brand_name?.trim() || run?.brand_name || (run?.url ? normalizeUrl(run.url).split("/")[0] : "Overview");
  const brandDomain = run?.url ? normalizeUrl(run.url).split("/")[0] : "";
  const brandFavicon = brandDomain
    ? `https://www.google.com/s2/favicons?domain=${brandDomain}&sz=128`
    : "";
  const statusLabel = run?.status === "complete" ? "Active" : run?.status === "failed" ? "Failed" : "Analyzing";
  const statusClasses = run?.status === "complete"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : run?.status === "failed"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <>
      {/* <header className="sticky top-0 z-20 border-b border-border bg-white px-6 py-4"> */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            {brandFavicon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brandFavicon}
                alt={`${projectName} logo`}
                width={48}
                height={48}
                className="size-10 shrink-0 rounded-lg border border-border bg-white object-contain p-1 shadow-sm sm:size-12"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : null}
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight text-foreground capitalize sm:text-3xl">
                {projectName}
              </h1>
              {brandDomain ? (
                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  {brandDomain}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-4 sm:gap-5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Status</span>
              <span className={cn("rounded-sm border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase", statusClasses)}>
                {statusLabel}
              </span>
            </div>
            
            {run?.created_at ? (
              <div className="hidden flex-col items-end gap-0.5 text-right sm:flex border-l border-border pl-4">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Created on
                </span>
                <span className="text-xs font-medium text-foreground">
                  {new Date(run.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            ) : null}

            <div className="flex items-center gap-2 pl-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReanalyze}
                disabled={reanalyzing || isRunning}
                className="h-8 gap-1.5 rounded-sm border-border bg-white px-3 text-xs font-medium text-foreground shadow-sm"
              >
                {reanalyzing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                Re-analyze
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={!run || isRunning}
                className="h-8 gap-1.5 rounded-sm px-3 text-xs font-medium shadow-sm"
              >
                <Download className="size-3.5" />
                Export
              </Button>
            </div>
          </div>
        </div>
      {/* </header> */}

      {run && !isRunning && (
        <div className="px-3 pb-4 pt-3 sm:px-4">
          <WeeklyPerformanceSection
            scoreHistory={scoreHistory}
            joinDate={run.created_at}
          />
          <div className="grid grid-cols-12 items-stretch gap-3 mb-3">
            <GeoScoreCard
              compositeScore={compositeScore}
              scoreChange={scoreChange}
              sparkle={!!scoreBump && scoreBump > 0}
            />
            <VisibilityByPlatformCard brandVis={brandVis} />
            {/* <GeoScoreHistoryCard scoreHistory={scoreHistory} /> */}
            <div className="col-span-5 flex min-h-0 h-full flex-col gap-2">
              <div className="min-h-0 flex-1">
                <PillarBreakdownCard pageScore={pageScore} />
              </div>
              <div className="shrink-0">
                <TopIssuesCard slug={slug} recommendations={recommendations} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 items-stretch gap-3 mb-3">
            <SocialBrandReachCard
              slug={slug}
              brandName={projectName}
              brandUrl={run.url ?? ""}
              details={brandVis?.social_presence_details as SocialPresenceDetails | undefined}
              brandVisibility={brandVis}
              coral={CORAL}
            />
          </div>

          <div className="grid grid-cols-12 items-stretch gap-3 mb-3">
            <CompetitorsCard
              slug={slug}
              competitors={run.competitors ?? []}
              yourScore={compositeScore}
              yourName={projectName}
              yourUrl={run.url}
            />
          </div>

          {(prediction.gain > 0 || sentiment) && (
            <PredictionSentimentRow compositeScore={compositeScore} prediction={prediction} sentiment={sentiment} />
          )}
        </div>
      )}
    </>
  );
}
