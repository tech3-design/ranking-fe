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
  PanelLeftClose,
  PanelLeftOpen,
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
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
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
    <div className="h-screen w-screen overflow-hidden bg-[#171717]">
      <div className="flex h-full w-full overflow-hidden">
        {/* Dark Sidebar */}
        <Sidebar
          open={pinned || open}
          setOpen={pinned ? () => {} : setOpen}
          animate={true}
          hoverExpand={!pinned}
        >
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
              {/* Logo + Pin */}
              <div className="mb-6 flex items-center justify-between">
                <SidebarLink
                  link={{
                    label: "Signalor",
                    href: "#",
                    icon: (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#3ecf8e]">
                        <Sparkles className="h-4 w-4 text-[#171717]" />
                      </div>
                    ),
                  }}
                  onClick={(e) => e.preventDefault()}
                />
                {(pinned || open) && (
                  <button
                    onClick={() => { setPinned(!pinned); if (!pinned) setOpen(true); }}
                    className="shrink-0 rounded-md p-1 text-neutral-500 transition hover:bg-white/[0.06] hover:text-white"
                    title={pinned ? "Unpin sidebar" : "Pin sidebar"}
                  >
                    {pinned ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                  </button>
                )}
              </div>

              {/* Nav links */}
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
                          icon: (
                            <Icon
                              className={cn(
                                "h-5 w-5 shrink-0",
                                active ? "text-[#3ecf8e]" : "text-neutral-500",
                              )}
                            />
                          ),
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab(tab.key);
                        }}
                      />
                    );
                  })}
              </div>
            </div>

            {/* Bottom links */}
            <div className="flex flex-col gap-1">
              <SidebarLink
                link={{
                  label: "Analytics",
                  href: "#",
                  icon: <ChartNoAxesCombined className="h-5 w-5 shrink-0 text-neutral-500" />,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(routes.dashboardProjectAnalytics(slug));
                }}
              />
            </div>
          </SidebarBody>
        </Sidebar>

        {/* Dark Main Content */}
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl px-4 md:px-6 py-3 md:py-4">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-white">
                Dashboard
              </h1>
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
                <div className="space-y-5">
                  {mainPage && (
                    <SummaryCards
                      geoScore={results.composite_score ?? 0}
                      contentScore={mainPage.content_score}
                      aiVisibilityScore={mainPage.ai_visibility_score}
                      brandVisibilityScore={results.brand_visibility?.overall_score ?? null}
                      scoreHistory={scoreHistory}
                    />
                  )}

                  <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 flex items-center justify-center">
                      <ScoreGauge score={results.composite_score ?? 0} size={200} label="GEO Score" />
                    </div>
                    {mainPage && (
                      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                        <h3 className="mb-4 text-sm font-medium text-neutral-400">Pillar Breakdown</h3>
                        <PillarLegend pageScore={mainPage} />
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                    {scoreHistory.length >= 2 ? (
                      <ScoreHistoryChart
                        data={scoreHistory}
                        onPointClick={(s) => router.push(routes.dashboardProject(s))}
                      />
                    ) : (
                      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 flex items-center justify-center">
                        <p className="text-sm text-neutral-500">Score history appears after your next analysis</p>
                      </div>
                    )}
                    <FixCTACard
                      recommendations={results.recommendations}
                      slug={slug}
                      email={userEmail}
                      orgId={orgId}
                    />
                  </div>

                  {results.brand_visibility && (
                    <div>
                      <h3 className="mb-3 text-sm font-medium text-neutral-400">Brand Visibility</h3>
                      <VisibilitySummary
                        visibility={results.brand_visibility}
                        onViewDetails={() => setActiveTab("visibility")}
                      />
                    </div>
                  )}
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
