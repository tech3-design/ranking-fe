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
  FileStack,
  Sparkles,
  Settings2,
  Plus,
  History,
  ChartNoAxesCombined,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalyzerStore } from "@/lib/stores/analyzer-store";
import { useGamificationStore } from "@/lib/stores/gamification-store";
import { getRunDetail, type AnalysisRunDetail } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";

import { AnalysisProgress } from "@/components/analyzer/analysis-progress";
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
import { GamificationPanel } from "@/components/analyzer/gamification-panel";
import { useSession } from "@/lib/auth-client";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type TabKey =
  | "overview"
  | "details"
  | "visibility"
  | "ai-logs"
  | "actions";

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: "easeOut" as const },
  }),
};

export default function AnalyzerResultsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const runId = Number(params.runId);

  const status = useAnalyzerStore((s) => s.status);
  const results = useAnalyzerStore((s) => s.results);
  const { data: session } = useSession();
  const gamStore = useGamificationStore();
  const userEmail = session?.user?.email ?? "";
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (!tab) return;
    const validTabs: TabKey[] = [
      "overview",
      "details",
      "visibility",
      "ai-logs",
      "actions",
    ];
    if (validTabs.includes(tab as TabKey)) {
      setActiveTab(tab as TabKey);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!runId) return;
    const store = useAnalyzerStore.getState();
    if (store.currentRunId !== runId) {
      store.reset();
    }

    getRunDetail(runId)
      .then((detail: AnalysisRunDetail) => {
        if (detail.status === "complete" || detail.status === "failed") {
          useAnalyzerStore.getState().setResults(detail);
        } else {
          useAnalyzerStore.getState().setRunId(runId);
          useAnalyzerStore.getState().startPolling();
        }
      })
      .catch(() => {
        useAnalyzerStore.getState().setRunId(runId);
        useAnalyzerStore.getState().startPolling();
      })
      .finally(() => setLoading(false));
  }, [runId]);

  useEffect(() => {
    if (userEmail) {
      gamStore.fetchActions(userEmail);
    }
  }, [userEmail]);

  const pendingActionsCount = gamStore.actions.filter(
    (a) =>
      Number(a.analysis_run) === Number(runId) &&
      (a.status === "pending" || a.status === "in_progress"),
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (
    !results ||
    (status !== "complete" &&
      status !== "failed" &&
      results?.status !== "complete")
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <AnalysisProgress />
      </div>
    );
  }

  if (results.status === "failed") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Analysis Failed</h2>
          <p className="text-muted-foreground">
            {results.error_message || "Something went wrong."}
          </p>
          <Button onClick={() => router.push(routes.analyzer)}>Try Again</Button>
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
    {
      key: "visibility",
      label: "Visibility",
      icon: Eye,
      hidden: !results.brand_visibility,
    },
    {
      key: "ai-logs",
      label: "AI Logs",
      icon: Bot,
      badge: results.llm_logs?.length ?? 0,
      hidden: !(results.llm_logs && results.llm_logs.length > 0),
    },
    { key: "actions", label: "Actions", icon: ListChecks, badge: pendingActionsCount },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="flex h-full w-full overflow-hidden border border-border/60 bg-background/30">
        <Sidebar open={open} setOpen={setOpen} hoverExpand={false}>
          <SidebarBody className="justify-between gap-6">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="mb-3 border-b border-border/50 pb-3">
                <div className={cn("flex items-center", open ? "justify-start gap-2" : "justify-center")}>
                  <>
                  <div className="rounded-md bg-primary/20 p-1.5 text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                    <span className="text-sm font-semibold text-foreground">Signalor GEO</span>
                  </>
                </div>
                {open ? (
                  <>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">
                      Run #{runId}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{results.url}</p>
                  </>
                ) : null}
              </div>

              <div className="flex-1 space-y-1 overflow-y-auto pr-1">
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
                        }}
                        className={cn(
                          "h-10 rounded-lg border",
                          open ? "px-2.5" : "mx-auto size-10 justify-center px-0",
                          active
                            ? "border-primary/60 bg-primary/25 shadow-sm shadow-primary/10"
                            : "border-transparent hover:border-border/60 hover:bg-muted/40",
                        )}
                      />
                    );
                  })}
              </div>
            </div>

            <div className="space-y-2 border-t border-border/50 pt-3">
              <SidebarLink
                link={{
                  label: "Analytics",
                  href: routes.analyzerAnalytics(runId),
                  icon: <ChartNoAxesCombined className="h-4 w-4 shrink-0 text-muted-foreground" />,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(routes.analyzerAnalytics(runId));
                }}
                className={cn(
                  "h-10 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/40",
                  open ? "px-2.5" : "mx-auto size-10 justify-center px-0",
                )}
              />
              <SidebarLink
                link={{
                  label: "Integrations",
                  href: routes.analyzerIntegrations(runId),
                  icon: <Settings2 className="h-4 w-4 shrink-0 text-muted-foreground" />,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(routes.analyzerIntegrations(runId));
                }}
                className={cn(
                  "h-10 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/40",
                  open ? "px-2.5" : "mx-auto size-10 justify-center px-0",
                )}
              />
              <SidebarLink
                link={{
                  label: "History",
                  href: routes.analyzerRunHistory(runId),
                  icon: <History className="h-4 w-4 shrink-0 text-muted-foreground" />,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(routes.analyzerRunHistory(runId));
                }}
                className={cn(
                  "h-10 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/40",
                  open ? "px-2.5" : "mx-auto size-10 justify-center px-0",
                )}
              />
              <SidebarLink
                link={{
                  label: "New Analysis",
                  href: "#",
                  icon: <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(routes.analyzer);
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
              <PDFDownloadButton runId={runId} />
            </div>
          </div>

          {results.error_message && results.status === "complete" && (
            <div className="relative z-10 border-b border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-xs text-yellow-600 md:px-6">
              Partial results: {results.error_message}
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
                      <ScoreGauge
                        score={results.composite_score ?? 0}
                        size={220}
                        label="Overall GEO Score"
                      />
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
                        {
                          title: "Content Structure",
                          score: mainPage.content_score,
                          details: mainPage.content_details,
                        },
                        {
                          title: "Schema Markup",
                          score: mainPage.schema_score,
                          details: mainPage.schema_details,
                        },
                        {
                          title: "E-E-A-T Signals",
                          score: mainPage.eeat_score,
                          details: mainPage.eeat_details,
                        },
                        {
                          title: "Technical GEO",
                          score: mainPage.technical_score,
                          details: mainPage.technical_details,
                        },
                        {
                          title: "Entity Authority",
                          score: mainPage.entity_score,
                          details: mainPage.entity_details,
                        },
                        {
                          title: "AI Visibility",
                          score: mainPage.ai_visibility_score,
                          details: mainPage.ai_visibility_details,
                        },
                      ].map((props, i) => (
                        <motion.div
                          key={props.title}
                          custom={i}
                          variants={staggerItem}
                          initial="hidden"
                          animate="visible"
                        >
                          <ScoreCard {...props} />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <motion.div
                    custom={6}
                    variants={staggerItem}
                    initial="hidden"
                    animate="visible"
                  >
                    <RecommendationsPanel recommendations={results.recommendations} />
                  </motion.div>

                  <motion.div
                    custom={7}
                    variants={staggerItem}
                    initial="hidden"
                    animate="visible"
                  >
                    <CompetitorTable
                      competitors={results.competitors}
                      yourScore={results.composite_score}
                    />
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
                  <ContentDetailsPanel
                    details={mainPage.content_details}
                    score={mainPage.content_score}
                  />
                  <SchemaDetailsPanel
                    details={mainPage.schema_details}
                    score={mainPage.schema_score}
                  />
                  <EEATDetailsPanel
                    details={mainPage.eeat_details}
                    score={mainPage.eeat_score}
                  />
                  <TechnicalDetailsPanel
                    details={mainPage.technical_details}
                    score={mainPage.technical_score}
                  />
                  <EntityDetailsPanel
                    details={mainPage.entity_details}
                    score={mainPage.entity_score}
                  />
                </motion.div>
              )}

              {activeTab === "ai-logs" && results.llm_logs && (
                <motion.div
                  key="ai-logs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
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
                  <GamificationPanel
                    email={userEmail}
                    recommendations={results.recommendations}
                    runId={Number(runId)}
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
                    <span className="font-mono font-semibold">
                      {Math.round(ps.composite_score)}
                    </span>
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
