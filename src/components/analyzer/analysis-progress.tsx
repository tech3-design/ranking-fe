"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyzerStore } from "@/lib/stores/analyzer-store";

const STATUS_LABELS: Record<string, string> = {
  pending: "Queued...",
  crawling: "Crawling website...",
  analyzing: "Analyzing content...",
  scoring: "Computing scores...",
  complete: "Analysis complete!",
  failed: "Analysis failed",
};

export function AnalysisProgress() {
  const { status, progress, error, currentRunId, startPolling, isPolling } =
    useAnalyzerStore();

  useEffect(() => {
    if (currentRunId && !isPolling && status !== "complete" && status !== "failed") {
      startPolling();
    }
  }, [currentRunId, isPolling, status, startPolling]);

  return (
    <Card className="w-full max-w-xl backdrop-blur-xl bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Analyzing...</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {STATUS_LABELS[status] || status}
            </span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent shimmer" />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
