"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Rows3,
  Eye,
  Bot,
  ListChecks,
  FileSearch,
  FileStack,
  Sparkles,
  Settings2,
  ChartNoAxesCombined,
  Activity,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalyzerStore } from "@/lib/stores/analyzer-store";
import { useGamificationStore } from "@/lib/stores/gamification-store";
import { useOrgStore } from "@/lib/stores/org-store";
import { getRunBySlug, startAnalysis, type AnalysisRunDetail } from "@/lib/api/analyzer";
import { getOrganizations } from "@/lib/api/organizations";
import { routes } from "@/lib/config";

import { AnalysisProgress } from "@/components/analyzer/analysis-progress";
import { OrgSwitcher } from "@/components/analyzer/org-switcher";
import { ScoreGauge } from "@/components/analyzer/score-gauge";
import { PillarBreakdown } from "@/components/analyzer/pillar-breakdown";
import { ScoreCard } from "@/components/analyzer/score-card";
import { RecommendationsPanel } from "@/components/analyzer/recommendations-panel";
import { CompetitorTable } from "@/components/analyzer/competitor-table";
import { ContentDetailsPanel } from "@/components/analyzer/content-details-panel";
import { SchemaDetailsPanel } from "@/components/analyzer/schema-details-panel";
import { EEATDetailsPanel } from "@/components/analyzer/eeat-details-panel";
import { TechnicalDetailsPanel } from "@/components/analyzer/technical-details-panel";
import { EntityDetailsPanel } from "@/components/analyzer/entity-details-panel";
import { PDFDownloadButton } from "@/components/analyzer/pdf-download-button";
import { LLMLogsPanel } from "@/components/analyzer/llm-logs-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandVisibilityTab } from "@/components/analyzer/brand-visibility-tab";
import { CrawlEssentialsPanel } from "@/components/analyzer/crawl-essentials-panel";
import { BlogAutomationPanel } from "@/components/analyzer/blog-automation-panel";
import { AIMonitoringTab } from "@/components/analyzer/ai-monitoring-tab";
import { useSession } from "@/lib/auth-client";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type TabKey = "overview" | "details" | "visibility" | "ai-logs" | "actions" | "ai-monitoring";
type ActionSubmenuKey = "ai-crawl-essentials" | "ai-blog-automation";

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: "easeOut" as const },
  }),
};

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const storeStatus = useAnalyzerStore((s) => s.status);
  const results = useAnalyzerStore((s) => s.results);
  const { data: session } = useSession();
  const gamStore = useGamificationStore();
  const { organizations, activeOrg, setOrganizations } = useOrgStore();
  const userEmail = session?.user?.email ?? "";
  const [loading, setLoading] = useState(true);
  const [runId, setRunId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [activeActionSubmenu, setActiveActionSubmenu] = useState<ActionSubmenuKey>("ai-crawl-essentials");
  const [open, setOpen] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [reanalyzeError, setReanalyzeError] = useState("");
  const crawlIssuePattern =
    /(crawl|crawled|crawler|http 403|forbidden|timed out|timeout|connection error|blocked)/i;

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (!tab) return;
    const validTabs: TabKey[] = ["overview", "details", "visibility", "ai-logs", "actions", "ai-monitoring"];
    if (validTabs.includes(tab as TabKey)) setActiveTab(tab as TabKey);
    const actionSubmenu = searchParams.get("action_submenu");
    if (actionSubmenu) {
      const valid: ActionSubmenuKey[] = ["ai-crawl-essentials", "ai-blog-automation"];
      if (valid.includes(actionSubmenu as ActionSubmenuKey)) {
        setActiveActionSubmenu(actionSubmenu as ActionSubmenuKey);
      }
    }
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
        // run not found — go back to dashboard
        router.replace(routes.dashboard);
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  useEffect(() => {
    if (userEmail) gamStore.fetchActions(userEmail);
  }, [userEmail]);

  // Bootstrap org store on hard refresh (store is empty until dashboard loads)
  useEffect(() => {
    if (!userEmail || organizations.length > 0) return;
    getOrganizations(userEmail).then(setOrganizations).catch(() => {});
  }, [userEmail, organizations.length, setOrganizations]);

  const pendingActionsCount = gamStore.actions.filter(
    (a) =>
      Number(a.analysis_run) === Number(runId) &&
      (a.status === "pending" || a.status === "in_progress"),
  ).length;

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
        org_id: activeOrg?.id,
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
          {isCrawlIssue && (
            <Button
              variant="outline"
              onClick={() => router.push(routes.dashboardProjectIntegrations(slug))}
            >
              Connect WordPress / Shopify
            </Button>
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
    { key: "details", label: "Detailed", icon: Rows3 },
    { key: "visibility", label: "Visibility", icon: Eye, hidden: !results.brand_visibility },
    {
      key: "ai-logs",
      label: "AI Logs",
      icon: Bot,
      badge: results.llm_logs?.length ?? 0,
      hidden: !(results.llm_logs && results.llm_logs.length > 0),
    },
    { key: "actions", label: "Actions", icon: ListChecks, badge: pendingActionsCount },
    { key: "ai-monitoring", label: "AI Monitor", icon: Activity },
  ];

  const actionSubmenus: Array<{
    key: ActionSubmenuKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { key: "ai-crawl-essentials", label: "AI Crawl Essentials", icon: FileSearch },
    { key: "ai-blog-automation", label: "AI Blog Automation", icon: Sparkles },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="flex h-full w-full overflow-hidden border border-border/60 bg-background/30">
        <Sidebar open={open} setOpen={setOpen} hoverExpand={false}>
          <SidebarBody className="justify-between gap-6">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="mb-3 border-b border-border/50 pb-3 space-y-2">
                <div className={cn("flex items-center", open ? "justify-start gap-2" : "justify-center")}>
                  <div className="rounded-md bg-primary/20 p-1.5 text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  {open && <span className="text-sm font-semibold text-foreground">Signalor GEO</span>}
                </div>
                {open && (
                  <OrgSwitcher onOrgChange={() => router.push(routes.dashboard)} />
                )}
              </div>

              <div className="flex-1 space-y-1 overflow-y-auto pr-1">
                {tabs
                  .filter((t) => !t.hidden)
                  .map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                      <div key={tab.key} className="space-y-1">
                        <SidebarLink
                          link={{
                            label: tab.label,
                            href: "#",
                            icon: (
                              <div className="relative">
                                <Icon
                                  className={cn(
                                    "h-4 w-4 shrink-0 transition-colors",
                                    active ? "text-primary" : "text-muted-foreground",
                                  )}
                                />
                                {!!tab.badge && (
                                  <span className="absolute -right-2 -top-1 rounded-full bg-primary/20 px-1 text-[9px] font-semibold text-primary">
                                    {tab.badge}
                                  </span>
                                )}
                              </div>
                            ),
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveTab(tab.key);
                            if (tab.key === "actions") setActiveActionSubmenu("ai-crawl-essentials");
                          }}
                          className={cn(
                            "h-10 rounded-lg border",
                            open ? "px-2.5" : "mx-auto size-10 justify-center px-0",
                            active
                              ? "border-primary/60 bg-primary/25 shadow-sm shadow-primary/10"
                              : "border-transparent hover:border-border/60 hover:bg-muted/40",
                          )}
                        />

                        {tab.key === "actions" && active && open && (
                          <div className="ml-6 space-y-1 pr-2">
                            {actionSubmenus.map((submenu) => {
                              const SubmenuIcon = submenu.icon;
                              const submenuActive = activeActionSubmenu === submenu.key;
                              return (
                                <button
                                  key={submenu.key}
                                  type="button"
                                  onClick={() => {
                                    setActiveTab("actions");
                                    setActiveActionSubmenu(submenu.key);
                                  }}
                                  className={cn(
                                    "flex h-8 w-full items-center gap-2 rounded-md border px-2 text-left text-xs transition-colors",
                                    submenuActive
                                      ? "border-primary/40 bg-primary/15 text-primary"
                                      : "border-transparent text-muted-foreground hover:border-border/50 hover:bg-muted/40 hover:text-foreground",
                                  )}
                                >
                                  <SubmenuIcon className="size-3.5 shrink-0" />
                                  <span className="truncate">{submenu.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="space-y-2 border-t border-border/50 pt-3">
              <SidebarLink
                link={{
                  label: "New Org",
                  href: "#",
                  icon: <Plus className="h-4 w-4 shrink-0 text-primary" />,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(routes.dashboard);
                }}
                className={cn(
                  "h-10 rounded-lg border border-primary/30 bg-primary/10 hover:border-primary/60 hover:bg-primary/20 text-primary",
                  open ? "px-2.5" : "mx-auto size-10 justify-center px-0",
                )}
              />
              <SidebarLink
                link={{
                  label: "Analytics",
                  href: routes.dashboardProjectAnalytics(slug),
                  icon: <ChartNoAxesCombined className="h-4 w-4 shrink-0 text-muted-foreground" />,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(routes.dashboardProjectAnalytics(slug));
                }}
                className={cn(
                  "h-10 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/40",
                  open ? "px-2.5" : "mx-auto size-10 justify-center px-0",
                )}
              />
              <SidebarLink
                link={{
                  label: "Integrations",
                  href: routes.dashboardProjectIntegrations(slug),
                  icon: <Settings2 className="h-4 w-4 shrink-0 text-muted-foreground" />,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(routes.dashboardProjectIntegrations(slug));
                }}
                className={cn(
                  "h-10 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/40",
                  open ? "px-2.5" : "mx-auto size-10 justify-center px-0",
                )}
              />
              {open ? (
                <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/40 p-2">
                  <span className="text-xs text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
              ) : (
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg border border-border/50 bg-background/40">
                  <ThemeToggle />
                </div>
              )}
            </div>
          </SidebarBody>
        </Sidebar>

        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="relative z-10 flex items-center justify-between gap-2 border-b border-border/50 px-4 py-3 md:px-5">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold md:text-xl">
                GEO Analysis Results
              </h1>
              <p className="truncate text-xs text-muted-foreground md:text-sm">
                {results.url}
              </p>
            </div>
            <div className="flex items-center gap-2">
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
            <div className="relative z-10 border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-xs text-destructive md:px-6">
              {reanalyzeError}
            </div>
          )}


          {results.error_message && results.status === "complete" && (
            <div className="relative z-10 border-b border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-xs text-yellow-600 md:px-6">
              Partial results: {results.error_message}
              {crawlIssuePattern.test(results.error_message || "") && (
                <span className="ml-2">
                  Connect WordPress/Shopify in Integrations for a more reliable crawl.
                </span>
              )}
            </div>
          )}
          <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5 md:py-4">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
                    <div className="glass-card rounded-xl p-4">
                      <ScoreGauge score={results.composite_score ?? 0} size={220} label="Overall GEO Score" />
                    </div>
                    {mainPage && (
                      <div className="glass-card flex items-center justify-center rounded-xl p-4">
                        <PillarBreakdown pageScore={mainPage} />
                      </div>
                    )}
                  </div>

                  {mainPage && (
                    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                      {[
                        { title: "Content Structure", score: mainPage.content_score, details: mainPage.content_details },
                        { title: "Schema Markup", score: mainPage.schema_score, details: mainPage.schema_details },
                        { title: "E-E-A-T Signals", score: mainPage.eeat_score, details: mainPage.eeat_details },
                        { title: "Technical GEO", score: mainPage.technical_score, details: mainPage.technical_details },
                        { title: "Entity Authority", score: mainPage.entity_score, details: mainPage.entity_details },
                        { title: "AI Visibility", score: mainPage.ai_visibility_score, details: mainPage.ai_visibility_details },
                      ].map((props, i) => (
                        <motion.div key={props.title} custom={i} variants={staggerItem} initial="hidden" animate="visible">
                          <ScoreCard {...props} />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <motion.div custom={6} variants={staggerItem} initial="hidden" animate="visible">
                    <RecommendationsPanel recommendations={results.recommendations} />
                  </motion.div>

                  <motion.div custom={7} variants={staggerItem} initial="hidden" animate="visible">
                    <CompetitorTable competitors={results.competitors} yourScore={results.composite_score} />
                  </motion.div>

                  {results.brand_visibility && (
                    <motion.button
                      custom={8}
                      variants={staggerItem}
                      initial="hidden"
                      animate="visible"
                      onClick={() => setActiveTab("visibility")}
                      className="glass-card flex w-full items-center justify-between rounded-xl p-5 text-left transition hover:bg-card/85"
                    >
                      <div>
                        <h3 className="text-lg font-semibold">Brand Visibility</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Google {Math.round(results.brand_visibility.google_score)} · Reddit{" "}
                          {Math.round(results.brand_visibility.reddit_score)} · Medium{" "}
                          {Math.round(results.brand_visibility.medium_score)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {Math.round(results.brand_visibility.overall_score)}
                        </p>
                        <p className="text-xs text-muted-foreground">/100</p>
                      </div>
                    </motion.button>
                  )}
                </motion.div>
              )}

              {activeTab === "details" && mainPage && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-4 xl:grid-cols-2"
                >
                  <ContentDetailsPanel details={mainPage.content_details} score={mainPage.content_score} />
                  <SchemaDetailsPanel details={mainPage.schema_details} score={mainPage.schema_score} />
                  <EEATDetailsPanel details={mainPage.eeat_details} score={mainPage.eeat_score} />
                  <TechnicalDetailsPanel details={mainPage.technical_details} score={mainPage.technical_score} />
                  <EntityDetailsPanel details={mainPage.entity_details} score={mainPage.entity_score} />
                </motion.div>
              )}

              {activeTab === "ai-logs" && results.llm_logs && (
                <motion.div
                  key="ai-logs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className=""
                >
                  <LLMLogsPanel logs={results.llm_logs} />
                </motion.div>
              )}

              {activeTab === "visibility" && results.brand_visibility && (
                <motion.div
                  key="visibility"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className=""
                >
                  <BrandVisibilityTab
                    brandName={results.brand_name || new URL(results.url).hostname}
                    visibility={results.brand_visibility}
                  />
                </motion.div>
              )}

              {activeTab === "actions" && userEmail && (
                <motion.div
                  key="actions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeActionSubmenu === "ai-crawl-essentials" ? (
                    <CrawlEssentialsPanel
                      email={userEmail}
                      runId={runId ?? 0}
                      analyzedUrl={results.url}
                    />
                  ) : (
                    <BlogAutomationPanel
                      email={userEmail}
                      runId={runId ?? 0}
                      analyzedUrl={results.url}
                    />
                  )}
                </motion.div>
              )}
              {activeTab === "ai-monitoring" && (
                <motion.div
                  key="ai-monitoring"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className=""
                >
                  <AIMonitoringTab
                    slug={slug}
                    brandName={results.brand_name || new URL(results.url).hostname}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {results.page_scores.length > 1 && (
            <div className="relative z-10 border-t border-border/50 px-4 py-2 md:px-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileStack className="h-3.5 w-3.5" />
                <span>{results.page_scores.length} pages scored in this run</span>
              </div>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {results.page_scores.map((ps) => (
                  <div
                    key={ps.id}
                    className="inline-flex min-w-56 items-center justify-between rounded-md border border-border/60 bg-background/50 px-2 py-1.5 text-xs"
                  >
                    <span className="truncate pr-2">{ps.url}</span>
                    <span className="font-mono font-semibold">{Math.round(ps.composite_score)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
