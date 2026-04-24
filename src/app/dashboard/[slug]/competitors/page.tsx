"use client";

import { useState } from "react";
import { useRun } from "../_components/run-context";
import {
  CompetitorTable,
  type ConfidenceFilter,
  type ScoreBandFilter,
} from "@/components/analyzer/competitor-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignalorLoader } from "@/components/ui/signalor-loader";
import { Search, X } from "lucide-react";

export default function CompetitorsPage() {
  const { run, loading, error } = useRun();
  const [query, setQuery] = useState("");
  const [confidence, setConfidence] = useState<ConfidenceFilter>("all");
  const [scoreBand, setScoreBand] = useState<ScoreBandFilter>("all");

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
  const filtersActive = Boolean(query.trim() || confidence !== "all" || scoreBand !== "all");

  return (
    <div className="space-y-6 px-2 py-2 sm:px-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Competitors
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Benchmark rival brands across AI surfaces.
          </p>
        </div>
        <div className="flex w-full min-w-0 shrink-0 md:w-auto md:max-w-[min(100%,52rem)] lg:max-w-none">
          <div className="flex w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-end">
            <div className="relative min-w-48 max-w-[16rem] shrink-0">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search competitors..."
                className="h-9 border border-border/80 bg-white pl-9 pr-9 text-sm text-foreground shadow-sm dark:bg-white dark:text-foreground"
                aria-label="Search competitors"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-neutral-100 hover:text-foreground dark:hover:bg-neutral-200"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>

            <Select
              value={confidence}
              onValueChange={(v) => setConfidence(v as ConfidenceFilter)}
            >
              <SelectTrigger
                size="sm"
                className="h-9 w-34 shrink-0 border border-border/80 bg-white text-foreground shadow-sm dark:bg-white dark:text-foreground dark:hover:bg-neutral-50"
              >
                <SelectValue placeholder="Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All confidence</SelectItem>
                <SelectItem value="scored">Scored</SelectItem>
                <SelectItem value="unscored">Low confidence</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={scoreBand}
              onValueChange={(v) => setScoreBand(v as ScoreBandFilter)}
            >
              <SelectTrigger
                size="sm"
                className="h-9 w-30 shrink-0 border border-border/80 bg-white text-foreground shadow-sm dark:bg-white dark:text-foreground dark:hover:bg-neutral-50"
              >
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All scores</SelectItem>
                <SelectItem value="leaders">Leaders (70+)</SelectItem>
                <SelectItem value="mid">Mid (40-69)</SelectItem>
                <SelectItem value="low">Low (&lt;40)</SelectItem>
              </SelectContent>
            </Select>

            {filtersActive ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0 border-border/80 bg-white px-2.5 text-xs text-muted-foreground shadow-sm hover:bg-neutral-50 dark:bg-white dark:text-foreground dark:hover:bg-neutral-100"
                onClick={() => {
                  setQuery("");
                  setConfidence("all");
                  setScoreBand("all");
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {competitors.length || run?.url ? (
        <CompetitorTable
          competitors={competitors}
          yourScore={run?.composite_score ?? null}
          yourName={run?.display_brand_name || run?.brand_name || undefined}
          yourUrl={run?.url}
          query={query}
          confidence={confidence}
          scoreBand={scoreBand}
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
