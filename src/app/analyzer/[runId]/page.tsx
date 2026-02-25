"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
import { GATrafficTab } from "@/components/integrations/ga-traffic-tab";
import { GamificationPanel } from "@/components/analyzer/gamification-panel";
import { getIntegrationStatus } from "@/lib/api/integrations";
import { useSession } from "@/lib/auth-client";

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function AnalyzerResultsPage() {
  const params = useParams();
  const router = useRouter();
  const runId = Number(params.runId);

  const status = useAnalyzerStore((s) => s.status);
  const results = useAnalyzerStore((s) => s.results);
  const { data: session } = useSession();
  const gamStore = useGamificationStore();
  const userEmail = session?.user?.email ?? "";
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "visibility" | "ai-logs" | "traffic" | "actions">("overview");
  const [hasGA, setHasGA] = useState(false);

  useEffect(() => {
    if (!runId) return;

    const store = useAnalyzerStore.getState();

    // Reset store if navigating to a different run
    if (store.currentRunId !== runId) {
      store.reset();
    }

    // Try to load results directly
    getRunDetail(runId)
      .then((detail: AnalysisRunDetail) => {
        if (detail.status === "complete" || detail.status === "failed") {
          useAnalyzerStore.getState().setResults(detail);
        } else {
          // Still in progress — start polling
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

  // Check if GA4 is connected
  useEffect(() => {
    if (!userEmail) return;
    getIntegrationStatus(userEmail)
      .then((integrations) => {
        const ga = integrations.find(
          (i) => i.provider === "google_analytics" && i.is_active && i.metadata?.property_id,
        );
        setHasGA(!!ga);
      })
      .catch(() => {});
  }, [userEmail]);

  // Calculate pending actions count
  const pendingActionsCount = gamStore.actions.filter(a => a.status === "pending" || a.status === "in_progress").length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Show progress if not complete
  if (!results || (status !== "complete" && status !== "failed" && results?.status !== "complete")) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <AnalysisProgress />
      </div>
    );
  }

  // Failed state
  if (results.status === "failed") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Analysis Failed</h2>
          <p className="text-muted-foreground">{results.error_message || "Something went wrong."}</p>
          <Button onClick={() => router.push(routes.analyzer)}>Try Again</Button>
        </div>
      </div>
    );
  }

  const mainPage = results.page_scores.find((p) => p.url === results.url) || results.page_scores[0];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold">GEO Analysis Results</h1>
            <p className="text-muted-foreground text-sm truncate max-w-lg">{results.url}</p>
          </div>
          <div className="flex gap-2">
            <Link href={routes.settingsIntegrations}>
              <Button variant="outline" size="sm">Integrations</Button>
            </Link>
            <ThemeToggle />
            <PDFDownloadButton runId={runId} />
            <Button variant="outline" size="sm" onClick={() => router.push(routes.analyzer)}>
              New Analysis
            </Button>
          </div>
        </motion.div>

        {/* Partial results banner */}
        {results.error_message && results.status === "complete" && (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <p className="text-sm font-medium text-yellow-500">Partial Results</p>
            <p className="text-xs text-yellow-500/80 mt-1">{results.error_message}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b pb-2">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === "details" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("details")}
          >
            Detailed Breakdown
          </Button>
          {results.brand_visibility && (
            <Button
              variant={activeTab === "visibility" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("visibility")}
            >
              Brand Visibility
            </Button>
          )}
          {results.llm_logs && results.llm_logs.length > 0 && (
            <Button
              variant={activeTab === "ai-logs" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("ai-logs")}
            >
              AI Logs ({results.llm_logs.length})
            </Button>
          )}
          {hasGA && (
            <Button
              variant={activeTab === "traffic" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("traffic")}
            >
              Traffic
            </Button>
          )}
          <Button
            variant={activeTab === "actions" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("actions")}
            className="relative"
          >
            Actions
            {pendingActionsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                </span>
            )}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Score + Radar */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center">
                  <ScoreGauge
                    score={results.composite_score ?? 0}
                    size={240}
                    label="Overall GEO Score"
                  />
                </div>
                {mainPage && (
                  <div className="flex items-center justify-center">
                    <PillarBreakdown pageScore={mainPage} />
                  </div>
                )}
              </div>

              {/* Pillar Score Cards */}
              {mainPage && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: "Content Structure", score: mainPage.content_score, details: mainPage.content_details },
                    { title: "Schema Markup", score: mainPage.schema_score, details: mainPage.schema_details },
                    { title: "E-E-A-T Signals", score: mainPage.eeat_score, details: mainPage.eeat_details },
                    { title: "Technical GEO", score: mainPage.technical_score, details: mainPage.technical_details },
                    { title: "Entity Authority", score: mainPage.entity_score, details: mainPage.entity_details },
                    { title: "AI Visibility", score: mainPage.ai_visibility_score, details: mainPage.ai_visibility_details },
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

              {/* Recommendations */}
              <motion.div custom={6} variants={staggerItem} initial="hidden" animate="visible">
                <RecommendationsPanel 
                  recommendations={results.recommendations} 
                />
              </motion.div>

              {/* Competitors */}
              <motion.div custom={7} variants={staggerItem} initial="hidden" animate="visible">
                <CompetitorTable
                  competitors={results.competitors}
                  yourScore={results.composite_score}
                />
              </motion.div>

              {/* Brand Visibility Summary */}
              {results.brand_visibility && (
                <motion.div custom={8} variants={staggerItem} initial="hidden" animate="visible">
                  <button
                    onClick={() => setActiveTab("visibility")}
                    className="w-full text-left rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl p-6 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Brand Visibility</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Google {Math.round(results.brand_visibility.google_score)} · Reddit{" "}
                          {Math.round(results.brand_visibility.reddit_score)} · Medium{" "}
                          {Math.round(results.brand_visibility.medium_score)}
                        </p>
                      </div>
                      <div className="text-3xl font-bold">
                        {Math.round(results.brand_visibility.overall_score)}
                        <span className="text-sm font-normal text-muted-foreground">/100</span>
                      </div>
                    </div>
                  </button>
                </motion.div>
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
              className="grid md:grid-cols-2 gap-4"
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

          {activeTab === "traffic" && hasGA && userEmail && (
            <motion.div
              key="traffic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <GATrafficTab email={userEmail} />
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

        {/* Multi-page scores */}
        {results.page_scores.length > 1 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">All Pages</h3>
            <div className="space-y-1">
              {results.page_scores.map((ps) => (
                <div key={ps.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                  <span className="text-sm truncate max-w-md">{ps.url}</span>
                  <span className="font-mono text-sm font-bold">{Math.round(ps.composite_score)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
