"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAnalyzerStore } from "@/lib/stores/analyzer-store";
import { getRunDetail, type AnalysisRunDetail } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";

import { AnalysisProgress } from "@/components/analyzer/analysis-progress";
import { ScoreGauge } from "@/components/analyzer/score-gauge";
import { PillarBreakdown } from "@/components/analyzer/pillar-breakdown";
import { ScoreCard } from "@/components/analyzer/score-card";
import { RecommendationsPanel } from "@/components/analyzer/recommendations-panel";
import { AIVisibilityPanel } from "@/components/analyzer/ai-visibility-panel";
import { CompetitorTable } from "@/components/analyzer/competitor-table";
import { ContentDetailsPanel } from "@/components/analyzer/content-details-panel";
import { SchemaDetailsPanel } from "@/components/analyzer/schema-details-panel";
import { EEATDetailsPanel } from "@/components/analyzer/eeat-details-panel";
import { TechnicalDetailsPanel } from "@/components/analyzer/technical-details-panel";
import { EntityDetailsPanel } from "@/components/analyzer/entity-details-panel";
import { PDFDownloadButton } from "@/components/analyzer/pdf-download-button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AnalyzerResultsPage() {
  const params = useParams();
  const router = useRouter();
  const runId = Number(params.runId);

  const status = useAnalyzerStore((s) => s.status);
  const results = useAnalyzerStore((s) => s.results);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "details">("overview");

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">GEO Analysis Results</h1>
            <p className="text-muted-foreground text-sm truncate max-w-lg">{results.url}</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <PDFDownloadButton runId={runId} />
            <Button variant="outline" size="sm" onClick={() => router.push(routes.analyzer)}>
              New Analysis
            </Button>
          </div>
        </div>

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
        </div>

        {activeTab === "overview" && (
          <>
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
                <ScoreCard title="Content Structure" score={mainPage.content_score} details={mainPage.content_details} />
                <ScoreCard title="Schema Markup" score={mainPage.schema_score} details={mainPage.schema_details} />
                <ScoreCard title="E-E-A-T Signals" score={mainPage.eeat_score} details={mainPage.eeat_details} />
                <ScoreCard title="Technical GEO" score={mainPage.technical_score} details={mainPage.technical_details} />
                <ScoreCard title="Entity Authority" score={mainPage.entity_score} details={mainPage.entity_details} />
                <ScoreCard title="AI Visibility" score={mainPage.ai_visibility_score} details={mainPage.ai_visibility_details} />
              </div>
            )}

            {/* Recommendations */}
            <RecommendationsPanel recommendations={results.recommendations} />

            {/* Competitors */}
            <CompetitorTable
              competitors={results.competitors}
              yourScore={results.composite_score}
            />

            {/* AI Probes */}
            <AIVisibilityPanel probes={results.ai_probes} />
          </>
        )}

        {activeTab === "details" && mainPage && (
          <div className="grid md:grid-cols-2 gap-4">
            <ContentDetailsPanel details={mainPage.content_details} score={mainPage.content_score} />
            <SchemaDetailsPanel details={mainPage.schema_details} score={mainPage.schema_score} />
            <EEATDetailsPanel details={mainPage.eeat_details} score={mainPage.eeat_score} />
            <TechnicalDetailsPanel details={mainPage.technical_details} score={mainPage.technical_score} />
            <EntityDetailsPanel details={mainPage.entity_details} score={mainPage.entity_score} />
          </div>
        )}

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
