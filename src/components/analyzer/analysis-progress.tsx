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
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Analyzing...</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {STATUS_LABELS[status] || status}
            </span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
