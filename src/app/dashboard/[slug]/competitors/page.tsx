"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
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
import { CompetitorsSkeleton } from "@/components/dashboard/skeletons";
import { addCompetitor } from "@/lib/api/analyzer";
import { Globe, Loader2, Plus, Search, X } from "@/components/icons";

// ─── Add Competitor Modal ─────────────────────────────────────────────────────

function AddCompetitorModal({
  slug,
  onSuccess,
  onClose,
}: {
  slug: string;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const urlRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimUrl = url.trim();
    const trimName = name.trim();
    if (!trimUrl || !trimName) return;
    setSaving(true);
    setErr("");
    try {
      await addCompetitor(slug, trimName, trimUrl);
      onSuccess();
    } catch {
      setErr("Failed to add competitor. Check the URL and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Add competitor</h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Track a rival brand across AI surfaces.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Website URL */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-foreground" htmlFor="comp-url">
              Website URL
            </label>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={urlRef}
                id="comp-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. competitor.com"
                autoFocus
                required
                disabled={saving}
                className="h-9 w-full rounded-md border border-border/80 bg-white pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Brand Name */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-foreground" htmlFor="comp-name">
              Brand name
            </label>
            <input
              id="comp-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              required
              disabled={saving}
              className="h-9 w-full rounded-md border border-border/80 bg-white px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
            />
          </div>

          {err && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {err}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex h-9 items-center rounded-md border border-border bg-white px-4 text-[13px] font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !url.trim() || !name.trim()}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {saving ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" />Adding…</>
              ) : (
                <><Plus className="h-3.5 w-3.5" />Add competitor</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompetitorsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { run, loading, error, refetch } = useRun();
  const [query, setQuery] = useState("");
  const [confidence, setConfidence] = useState<ConfidenceFilter>("all");
  const [scoreBand, setScoreBand] = useState<ScoreBandFilter>("all");
  const [addOpen, setAddOpen] = useState(false);

  if (loading) return <CompetitorsSkeleton />;

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
            {/* Search */}
            <div className="relative min-w-48 max-w-[16rem] shrink-0">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search competitors..."
                className="h-9 border border-border/80 bg-white pl-9 pr-9 text-sm text-foreground shadow-sm focus-visible:border-border focus-visible:ring-0 dark:bg-white dark:text-foreground"
                aria-label="Search competitors"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-neutral-100 hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>

            {/* Confidence filter */}
            <Select value={confidence} onValueChange={(v) => setConfidence(v as ConfidenceFilter)}>
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

            {/* Score filter */}
            <Select value={scoreBand} onValueChange={(v) => setScoreBand(v as ScoreBandFilter)}>
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

            {/* Clear filters */}
            {filtersActive ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0 border-border/80 bg-white px-2.5 text-xs text-muted-foreground shadow-sm hover:bg-neutral-50 dark:bg-white dark:text-foreground dark:hover:bg-neutral-100"
                onClick={() => { setQuery(""); setConfidence("all"); setScoreBand("all"); }}
              >
                Clear
              </Button>
            ) : null}

            {/* Add competitor button — icon only */}
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/80 bg-primary text-white shadow-sm transition hover:brightness-110"
              aria-label="Add competitor"
            >
              <Plus className="h-4 w-4" />
            </button>
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
          slug={slug}
          onDelete={() => void refetch()}
        />
      ) : (
        <div className="rounded-lg border border-border/60 bg-card/65 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No competitors tracked yet for this project.
          </p>
        </div>
      )}

      {addOpen && slug && (
        <AddCompetitorModal
          slug={slug}
          onSuccess={() => { setAddOpen(false); void refetch(); }}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}
