"use client";

import { useRun } from "../_components/run-context";
import { CompetitorTable } from "@/components/analyzer/competitor-table";
import { SignalorLoader } from "@/components/ui/signalor-loader";

export default function CompetitorsPage() {
  const { run, loading, error } = useRun();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <SignalorLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2 py-6 text-sm text-destructive sm:px-0">{error}</div>
    );
  }

  const competitors = run?.competitors ?? [];

  return (
    <div className="space-y-6 px-2 py-2 sm:px-0">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Competitors
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          Benchmark rival brands across AI surfaces.
        </p>
      </div>

      {competitors.length || run?.url ? (
        <CompetitorTable
          competitors={competitors}
          yourScore={run?.composite_score ?? null}
          yourName={run?.display_brand_name || run?.brand_name || undefined}
          yourUrl={run?.url}
        />
      ) : (
        <div className="rounded-lg border border-border/60 bg-card/65 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No competitors tracked yet for this project.
          </p>
        </div>
      )}
    </div>
  );
}
