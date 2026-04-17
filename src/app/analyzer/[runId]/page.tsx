"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ScoreGauge } from "@/components/analyzer/score-gauge";
import { CompetitorTable } from "@/components/analyzer/competitor-table";
import { ScoreCard } from "@/components/analyzer/score-card";
import { getRunDetail, type AnalysisRunDetail } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";

export default function AnalyzerResultsPage() {
  const params = useParams();
  const router = useRouter();
  const runId = Number(params.runId);

  const [result, setResult] = useState<AnalysisRunDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!runId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      try {
        const detail = await getRunDetail(runId);
        if (cancelled) return;
        setResult(detail);
        if (detail.status !== "complete" && detail.status !== "failed") {
          timer = setTimeout(poll, 2200);
        }
      } catch {
        if (cancelled) return;
        timer = setTimeout(poll, 2500);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [runId]);

  const mainPage = useMemo(() => {
    if (!result?.page_scores?.length) return null;
    return result.page_scores.find((p) => p.url === result.url) || result.page_scores[0];
  }, [result]);

  if (loading || !result || (result.status !== "complete" && result.status !== "failed")) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 p-4"
        style={{ backgroundColor: "#F6F4F1" }}
      >
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">Preparing your report…</p>
      </div>
    );
  }

  if (result.status === "failed") {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center p-6">
        <div className="w-full rounded-xl border border-border/70 bg-card p-6 text-center">
          <h1 className="text-xl font-semibold">Analysis failed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {result.error_message || "Something went wrong while running analysis."}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button onClick={() => router.push("/")}>Try another URL</Button>
            <Button asChild variant="outline">
              <Link href={routes.signUp}>Sign up for full analysis</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <header className="rounded-xl border border-border/70 bg-card p-4 md:p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Quick Report</p>
        <h1 className="mt-1 text-xl font-semibold md:text-2xl">AI Visibility Snapshot</h1>
        <p className="mt-1 truncate text-sm text-muted-foreground">{result.url}</p>
      </header>

      <section className="mt-4 rounded-xl border border-amber-300/40 bg-amber-50 p-4">
        <p className="text-sm text-amber-900">
          This is a quick report. Sign up to unlock full analysis, detailed recommendations, logs, and action tracking.
        </p>
        <div className="mt-3 flex gap-2">
          <Button asChild size="sm">
            <Link href={routes.signUp}>Sign up for full analysis</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.signIn}>Sign in</Link>
          </Button>
        </div>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-xl border border-border/70 bg-card p-4">
          <ScoreGauge score={result.composite_score ?? 0} size={220} label="Overall GEO Score" />
        </div>
        <div className="rounded-xl border border-border/70 bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            AI Visibility Card
          </h2>
          {mainPage ? (
            <ScoreCard
              title="AI Visibility"
              score={mainPage.ai_visibility_score}
              details={mainPage.ai_visibility_details}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No AI visibility data available.</p>
          )}
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-border/70 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Competitors
        </h2>
d be bigger         <CompetitorTable
          competitors={result.competitors}
          yourScore={result.composite_score}
          locked
        />
      </section>
    </main>
  );
}
