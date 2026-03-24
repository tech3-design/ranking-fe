"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Eye,
  ListChecks,
  Sparkles,
  ChartNoAxesCombined,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalyzerStore } from "@/lib/stores/analyzer-store";
import { getRunBySlug, startAnalysis, getScoreHistory, type AnalysisRunDetail, type ScoreHistoryPoint } from "@/lib/api/analyzer";
import { getOrganizations } from "@/lib/api/organizations";
import { routes } from "@/lib/config";

import { AnalysisProgress } from "@/components/analyzer/analysis-progress";
import { ScoreGauge } from "@/components/analyzer/score-gauge";
import { PillarLegend } from "@/components/analyzer/pillar-legend";
import { SummaryCards } from "@/components/analyzer/summary-cards";
import { FixCTACard } from "@/components/analyzer/fix-cta-card";
import { VisibilitySummary } from "@/components/analyzer/visibility-summary";
import { RecommendationsPanel } from "@/components/analyzer/recommendations-panel";
import { ScoreHistoryChart } from "@/components/analyzer/score-history-chart";
import { ScheduleToggle } from "@/components/analyzer/schedule-toggle";
import { PDFDownloadButton } from "@/components/analyzer/pdf-download-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandVisibilityTab } from "@/components/analyzer/brand-visibility-tab";
import { AIMonitoringTab } from "@/components/analyzer/ai-monitoring-tab";
import { useSession } from "@/lib/auth-client";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type TabKey = "overview" | "recommendations" | "visibility" | "prompts";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const storeStatus = useAnalyzerStore((s) => s.status);
  const results = useAnalyzerStore((s) => s.results);
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";
  const [loading, setLoading] = useState(true);
  const [runId, setRunId] = useState<number | null>(null);
  const [orgId, setOrgId] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [reanalyzing, setReanalyzing] = useState(false);
  const [reanalyzeError, setReanalyzeError] = useState("");
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryPoint[]>([]);
  const crawlIssuePattern =
    /(crawl|crawled|crawler|http 403|forbidden|timed out|timeout|connection error|blocked)/i;

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (!tab) return;
    const validTabs: TabKey[] = ["overview", "recommendations", "visibility", "prompts"];
    if (validTabs.includes(tab as TabKey)) setActiveTab(tab as TabKey);
  }, [searchParams]);

  useEffect(() => {
    if (!slug) return;

    getRunBySlug(slug)
      .then((detail: AnalysisRunDetail) => {
        const id = detail.id;
        setRunId(id);

        const store = useAnalyzerStore.getState();
        if (store.currentRunId !== id) store.reset();

        if (detail.status === "complete" || detail.status === "failed") {
          store.setResults(detail);
        } else {
          store.setRunId(id);
          store.startPolling();
        }
      })
      .catch(() => {
        router.replace(routes.dashboard);
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  // Resolve org by email (single org per user)
  useEffect(() => {
    if (!userEmail) return;
    getOrganizations(userEmail)
      .then((orgs) => {
        if (orgs.length > 0) setOrgId(orgs[0].id);
      })
      .catch(() => {});
  }, [userEmail]);

  // Fetch score history
  useEffect(() => {
    if (!userEmail) return;
    getScoreHistory(userEmail, orgId).then(setScoreHistory).catch(() => {});
  }, [userEmail, orgId]);

  // Never show a score lower than the best achieved + boost for applied fixes
  const [appliedFixCount, setAppliedFixCount] = useState(0);

  useEffect(() => {
    if (!slug) return;
    import("@/lib/api/analyzer").then(({ getAutoFixStatus }) => {
      getAutoFixStatus(slug)
        .then((fixes) => setAppliedFixCount(fixes.filter((f) => f.status === "success").length))
        .catch(() => {});
    });
  }, [slug]);

  const currentScore = results?.composite_score ?? 0;
  const bestHistoricScore = scoreHistory.length > 0
    ? Math.max(...scoreHistory.map((s) => s.composite_score))
    : 0;
  // Add fix bonus: 0.5 pts per fix, min 2 pts if any fix, max 5 pts
  const fixBonus = appliedFixCount > 0 ? Math.min(Math.max(appliedFixCount * 0.5, 2), 5) : 0;
  const displayScore = Math.min(Math.max(currentScore, bestHistoricScore) + fixBonus, 100);

  async function handleReanalyze() {
    if (!results?.url || reanalyzing) return;
    setReanalyzeError("");
    setReanalyzing(true);
    try {
      const nextRun = await startAnalysis({
        url: results.url,
        run_type: "single_page",
        email: userEmail || undefined,
        brand_name: results.brand_name || undefined,
        country: results.country || undefined,
        org_id: orgId,
      });
      const store = useAnalyzerStore.getState();
      store.reset();
      store.setRunId(nextRun.id);
      store.startPolling();
      router.push(routes.dashboardProject(nextRun.slug));
    } catch {
      setReanalyzeError("Failed to start a new analysis. Please try again.");
    } finally {
      setReanalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (
    !results ||
    (storeStatus !== "complete" &&
      storeStatus !== "failed" &&
      results?.status !== "complete")
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <AnalysisProgress />
      </div>
    );
  }

  if (results.status === "failed") {
    const isCrawlIssue = crawlIssuePattern.test(results.error_message || "");
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-bold">Analysis Failed</h2>
          <p className="text-muted-foreground">
            {results.error_message || "Something went wrong."}
          </p>
          {isCrawlIssue && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
              Crawl access issue detected. Connect your WordPress or Shopify integration and try again.
            </div>
          )}
          <Button onClick={() => router.push(routes.dashboard)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const mainPage =
    results.page_scores.find((p) => p.url === results.url) ||
    results.page_scores[0];

  const tabs: Array<{
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    hidden?: boolean;
  }> = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "recommendations", label: "Recommendations", icon: ListChecks, badge: results.recommendations?.length ?? 0 },
    { key: "visibility", label: "Visibility", icon: Eye, hidden: !results.brand_visibility },
    { key: "prompts", label: "Prompts", icon: Activity },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <div className="flex h-full w-full overflow-hidden">
        {/* Sidebar — always open */}
        <Sidebar open={true} setOpen={() => {}} animate={false}>
          <SidebarBody className="justify-between gap-8">
            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
              <SidebarLink
                link={{
                  label: "Signalor",
                  href: "#",
                  icon: (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
                      <Sparkles className="h-4 w-4 text-sidebar-primary-foreground" />
                    </div>
                  ),
                }}
                onClick={(e) => e.preventDefault()}
                className="mb-6"
              />

              <div className="flex flex-col gap-1">
                {tabs
                  .filter((t) => !t.hidden)
                  .map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                      <SidebarLink
                        key={tab.key}
                        link={{
                          label: tab.label,
                          href: "#",
                          icon: <Icon className={cn("h-5 w-5 shrink-0", active ? "text-sidebar-primary" : "text-sidebar-foreground/60")} />,
                        }}
                        onClick={(e) => { e.preventDefault(); setActiveTab(tab.key); }}
                      />
                    );
                  })}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <SidebarLink
                link={{
                  label: "Analytics",
                  href: "#",
                  icon: <ChartNoAxesCombined className="h-5 w-5 shrink-0 text-sidebar-foreground/60" />,
                }}
                onClick={(e) => { e.preventDefault(); router.push(routes.dashboardProjectAnalytics(slug)); }}
              />
            </div>
          </SidebarBody>
        </Sidebar>

        {/* Main Content */}
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 md:px-6 py-3 md:py-4">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-foreground">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              {orgId && results && (
                <ScheduleToggle
                  email={userEmail}
                  orgId={orgId}
                  url={results.url}
                  brandName={results.brand_name}
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReanalyze}
                disabled={reanalyzing}
              >
                {reanalyzing ? "Re-analyzing..." : "Re-analyze"}
              </Button>
              {runId && <PDFDownloadButton runId={runId} />}
            </div>
          </div>

          {reanalyzeError && (
            <div className="border-b border-red-500/20 bg-red-500/10 px-6 py-2 text-xs text-red-400">
              {reanalyzeError}
            </div>
          )}

          {results.error_message && results.status === "complete" && (
            <div className="border-b border-yellow-500/20 bg-yellow-500/10 px-6 py-2 text-xs text-yellow-400">
              Partial results: {results.error_message}
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5">
              {activeTab === "overview" && (
                <div className="space-y-4">

                  {/* Row 1: GEO donut + 2 colored stats | Chart | Pillar list (like TeamHub) */}
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-[260px_1fr_240px]">

                    {/* Left: GEO Score donut + AI Vis & Brand Vis stacked */}
                    <div className="flex flex-col gap-3">
                      {/* GEO Score — clean donut */}
                      <div className="rounded-lg bg-primary/8 border border-primary/15 p-5 shadow-sm flex items-center gap-5">
                        <div className="relative h-16 w-16 shrink-0">
                          <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                            <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
                            <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary"
                              strokeDasharray={`${2 * Math.PI * 15}`}
                              strokeDashoffset={`${2 * Math.PI * 15 * (1 - Math.round(displayScore) / 100)}`}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">{Math.round(displayScore)}</span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">GEO Score</p>
                          <p className="text-3xl font-bold text-foreground">{Math.round(displayScore)}</p>
                          {appliedFixCount > 0 && (
                            <p className="text-[10px] text-primary font-medium">↑ {Math.round(fixBonus)} pts</p>
                          )}
                        </div>
                      </div>

                      {/* Two colored stat cards — like "42 Entry created" / "12 Head" */}
                      {mainPage && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-chart-3/10 border border-chart-3/20 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="h-2 w-2 rounded-full bg-chart-3" />
                              <p className="text-[10px] text-muted-foreground">AI Visibility</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{Math.round(mainPage.ai_visibility_score)}</p>
                          </div>
                          <div className="rounded-lg bg-chart-2/10 border border-chart-2/20 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="h-2 w-2 rounded-full bg-chart-2" />
                              <p className="text-[10px] text-muted-foreground">Brand Vis.</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{results.brand_visibility ? Math.round(results.brand_visibility.overall_score) : "--"}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Center: Score History chart — like "Application" */}
                    <div className="rounded-lg bg-card border border-border p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground">Score History</h3>
                        <span className="text-[10px] text-muted-foreground border border-border rounded-full px-2.5 py-0.5">All time</span>
                      </div>
                      {scoreHistory.length >= 2 ? (
                        <ScoreHistoryChart
                          data={scoreHistory.map((point, i) => {
                            if (i === scoreHistory.length - 1 && fixBonus > 0) {
                              return { ...point, composite_score: Math.min(point.composite_score + fixBonus, 100) };
                            }
                            return point;
                          })}
                          onPointClick={(s) => router.push(routes.dashboardProject(s))}
                        />
                      ) : (
                        <div className="flex h-36 items-center justify-center">
                          <p className="text-xs text-muted-foreground">Chart appears after next analysis</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Fix Status + Site Info */}
                    <div className="rounded-lg bg-card border border-border p-5 shadow-sm">
                      <h3 className="text-sm font-semibold text-foreground mb-4">Quick Summary</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Site</p>
                          <p className="text-xs font-medium text-foreground mt-1 truncate">{results.url}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Recommendations</p>
                          <p className="text-2xl font-bold text-foreground mt-1">{results.recommendations.length}</p>
                          <p className="text-[10px] text-muted-foreground">{appliedFixCount} fixed · {results.recommendations.length - appliedFixCount} pending</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Top Priority</p>
                          <div className="mt-2 space-y-1.5">
                            {results.recommendations.filter(r => r.priority === "critical").length > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] rounded-full bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 px-2 py-0.5">critical</span>
                                <span className="text-xs font-semibold text-foreground">{results.recommendations.filter(r => r.priority === "critical").length}</span>
                              </div>
                            )}
                            {results.recommendations.filter(r => r.priority === "high").length > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5">high</span>
                                <span className="text-xs font-semibold text-foreground">{results.recommendations.filter(r => r.priority === "high").length}</span>
                              </div>
                            )}
                            {results.recommendations.filter(r => r.priority === "medium").length > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] rounded-full bg-muted text-muted-foreground px-2 py-0.5">medium</span>
                                <span className="text-xs font-semibold text-foreground">{results.recommendations.filter(r => r.priority === "medium").length}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button onClick={() => setActiveTab("recommendations")} className="w-full text-xs text-primary hover:underline text-left font-medium">
                          View all recommendations →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Brand Visibility + Recommendations */}
                  <div className="grid gap-4 grid-cols-1 lg:grid-cols-[280px_1fr]">
                    {/* Brand Visibility — 2x2 mini cards */}
                    {results.brand_visibility && (
                      <div className="rounded-lg bg-card border border-border p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold text-foreground">Visibility</h3>
                          <button onClick={() => setActiveTab("visibility")} className="text-[10px] text-primary hover:underline">Details</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: "Google", score: Math.round(results.brand_visibility.google_score), color: "#3ecf8e" },
                            { label: "Reddit", score: Math.round(results.brand_visibility.reddit_score), color: "#f97316" },
                            { label: "Medium", score: Math.round(results.brand_visibility.medium_score), color: "#3b82f6" },
                            { label: "Web", score: Math.round(results.brand_visibility.web_mentions_score), color: "#a855f7" },
                          ].map((v) => (
                            <div key={v.label} className="rounded-md border border-border p-3 text-center">
                              <div className="relative h-12 w-12 mx-auto mb-2">
                                <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
                                  <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
                                  <circle cx="18" cy="18" r="14" fill="none" stroke={v.color} strokeWidth="3" strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 14}`}
                                    strokeDashoffset={`${2 * Math.PI * 14 * (1 - v.score / 100)}`}
                                  />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-foreground">{v.score}</span>
                              </div>
                              <p className="text-[11px] font-medium text-muted-foreground">{v.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations preview — clean list */}
                    <div className="rounded-lg bg-card border border-border shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">Recommendations</h3>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{results.recommendations.length}</span>
                        </div>
                        <button onClick={() => setActiveTab("recommendations")} className="text-xs text-primary hover:underline font-medium">View all &rarr;</button>
                      </div>
                      <div className="divide-y divide-border">
                        {results.recommendations
                          .sort((a, b) => {
                            const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
                            return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
                          })
                          .slice(0, 8)
                          .map((rec, i) => (
                            <div key={rec.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/30 transition-colors">
                              <span className="text-[10px] text-muted-foreground font-mono w-5">{String(i + 1).padStart(2, "0")}</span>
                              <span className="flex-1 text-sm text-foreground truncate">{rec.title}</span>
                              <span className={`text-[9px] font-semibold rounded-full px-2 py-0.5 ${
                                rec.priority === "critical" ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                : rec.priority === "high" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                : "bg-muted text-muted-foreground"
                              }`}>{rec.priority}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "recommendations" && (
                <RecommendationsPanel recommendations={results.recommendations} slug={slug} email={userEmail} orgId={orgId} />
              )}

              {activeTab === "visibility" && results.brand_visibility && (
                <BrandVisibilityTab
                  brandName={results.brand_name || new URL(results.url).hostname}
                  visibility={results.brand_visibility}
                />
              )}

              {activeTab === "prompts" && (
                <AIMonitoringTab
                  slug={slug}
                  brandName={results.brand_name || new URL(results.url).hostname}
                />
              )}
          </div>

        </main>
      </div>
    </div>
  );
}
