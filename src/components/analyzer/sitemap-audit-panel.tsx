"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Gauge,
  Layers,
  Loader2,
  Play,
  Search,
  Sparkles,
  Timer,
  X,
  XCircle,
} from "lucide-react";

import {
  getSitemapAudit,
  startSitemapAudit,
  type SitemapAuditPage,
  type SitemapAuditResponse,
  type SitemapAuditSummary,
  type SitemapPageSeverity,
  type SitemapPageState,
} from "@/lib/api/analyzer";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type StateTab = "crawled" | "redirect" | "queued" | "failed";
type SeverityFilter = SitemapPageSeverity | "all";

const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: "AI score ↓", value: "-ai_score" },
  { label: "AI score ↑", value: "ai_score" },
  { label: "Status ↓", value: "-status" },
  { label: "Words ↓", value: "-words" },
  { label: "LCP ↑", value: "lcp" },
  { label: "FCP ↑", value: "fcp" },
  { label: "TTFB ↑", value: "ttfb" },
  { label: "URL A→Z", value: "url" },
];

export function SitemapAuditPanel({ slug }: { slug: string }) {
  const [data, setData] = useState<SitemapAuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<StateTab>("crawled");
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("-ai_score");
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aliveRef = useRef(true);

  const audit = data?.audit ?? null;
  const isRunning = audit?.status === "running" || audit?.status === "queued";

  const fetchNow = useCallback(async () => {
    try {
      const res = await getSitemapAudit(slug, {
        state,
        severity: severity === "all" ? undefined : severity,
        q: q || undefined,
        sort,
        page: 1,
        page_size: 100,
      });
      if (!aliveRef.current) return;
      setData(res);
      setError(null);
    } catch {
      if (!aliveRef.current) return;
      setError("Couldn't load the audit. Retry in a moment.");
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, [slug, state, severity, q, sort]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    void fetchNow();
  }, [fetchNow]);

  // Poll while running
  useEffect(() => {
    if (!isRunning) return;
    if (pollRef.current) clearTimeout(pollRef.current);
    pollRef.current = setTimeout(() => {
      void fetchNow();
    }, 2200);
  }, [isRunning, data, fetchNow]);

  async function handleStart() {
    if (starting) return;
    setStarting(true);
    try {
      await startSitemapAudit(slug);
      await fetchNow();
    } catch {
      setError("Couldn't start an audit. Try again.");
    } finally {
      setStarting(false);
    }
  }

  if (loading && !data) {
    return <SitemapAuditSkeleton />;
  }

  // No audit yet — empty state
  if (!audit) {
    return (
      <EmptyAudit onStart={handleStart} starting={starting} error={error} />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
          {error}
        </div>
      ) : null}

      <HeaderBar
        audit={audit}
        isRunning={isRunning}
        starting={starting}
        onStart={handleStart}
      />

      <StatTiles audit={audit} />

      <StateTabs audit={audit} active={state} onChange={setState} />

      <Toolbar
        q={q}
        onQ={setQ}
        sort={sort}
        onSort={setSort}
        severity={severity}
        onSeverity={setSeverity}
      />

      <PagesTable
        pages={data?.pages ?? []}
        total={data?.total ?? 0}
        state={state}
        running={isRunning}
      />

      {audit.truncated ? (
        <div className="rounded-lg border border-amber-300/50 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
          <strong className="font-semibold">Showing first {audit.crawl_limit} of {audit.discovered_url_count}</strong> URLs —
          lifting this cap is on the roadmap. Contact sales for full-site scans.
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function SitemapAuditSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {/* Header bar skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="space-y-1.5">
            <Skeleton className="h-[10px] w-14 rounded" />
            <Skeleton className="h-[13px] w-48 rounded" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* 4 stat tiles */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {/* Indexed Pages tile */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-[10px] w-24 rounded" />
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-9 w-28 rounded" />
          <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
          <Skeleton className="mt-1.5 h-[10px] w-24 rounded" />
          <Skeleton className="mt-3 h-1 w-full rounded-full" />
          <Skeleton className="mt-1 h-[10px] w-32 rounded" />
        </div>

        {/* 3 vital tiles (Avg LCP, FCP, TTFB) */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-[10px] w-16 rounded" />
              <Skeleton className="h-3.5 w-3.5 rounded" />
            </div>
            <Skeleton className="mt-2 h-9 w-24 rounded" />
            {/* tri-colour band */}
            <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-200">
              <Skeleton className="absolute inset-0 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Section heading + state-tab buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-36 rounded" />
          <Skeleton className="h-[11px] w-80 rounded" />
        </div>
        <div className="flex items-center gap-2">
          {[88, 72, 64, 60].map((w, i) => (
            <Skeleton key={i} className="h-8 rounded-md" style={{ width: w }} />
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Skeleton className="h-9 flex-1 rounded-md md:w-80 md:flex-initial" />
        <Skeleton className="h-9 w-36 shrink-0 rounded-md" />
        <Skeleton className="h-9 w-36 shrink-0 rounded-md" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* thead */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
          {[
            "30%", "6%", "10%", "6%", "6%", "6%", "6%", "8%", "8%", "10%", "8%",
          ].map((w, i) => (
            <Skeleton
              key={i}
              className="h-[9px] shrink-0 rounded"
              style={{ width: `calc(${w} - 8px)` }}
            />
          ))}
        </div>

        {/* rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="flex items-center gap-2 border-b border-border/60 px-4 py-3 last:border-0"
          >
            {/* URL col — path + title */}
            <div className="shrink-0 space-y-1" style={{ width: "calc(30% - 8px)" }}>
              <Skeleton className="h-[12px] w-4/5 rounded" />
              <Skeleton className="h-[10px] w-3/5 rounded" />
            </div>
            {/* Status pill */}
            <Skeleton className="h-5 w-8 shrink-0 rounded-full" style={{ minWidth: "calc(6% - 8px)" }} />
            {/* Content words + ratio */}
            <div className="shrink-0 space-y-1" style={{ width: "calc(10% - 8px)" }}>
              <Skeleton className="h-[11px] w-full rounded" />
              <Skeleton className="h-[10px] w-3/4 rounded" />
            </div>
            {/* LCP / FCP / TTFB / Server — single line each */}
            {[1, 2, 3, 4].map((j) => (
              <Skeleton
                key={j}
                className="h-[11px] shrink-0 rounded"
                style={{ width: "calc(6% - 8px)" }}
              />
            ))}
            {/* Resources */}
            <div className="shrink-0 space-y-1" style={{ width: "calc(8% - 8px)" }}>
              <Skeleton className="h-[11px] w-full rounded" />
              <Skeleton className="h-[10px] w-3/4 rounded" />
            </div>
            {/* Links */}
            <div className="shrink-0 space-y-1" style={{ width: "calc(8% - 8px)" }}>
              <Skeleton className="h-[11px] w-full rounded" />
              <Skeleton className="h-[10px] w-3/4 rounded" />
            </div>
            {/* AI score bar + chip */}
            <div className="shrink-0 flex items-center gap-1.5" style={{ width: "calc(10% - 8px)" }}>
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-[11px] w-8 rounded" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
              <Skeleton className="h-4 w-7 shrink-0 rounded-full" />
            </div>
            {/* Crawled date */}
            <Skeleton
              className="h-[10px] shrink-0 rounded"
              style={{ width: "calc(8% - 8px)" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyAudit({
  onStart,
  starting,
  error,
}: {
  onStart: () => void;
  starting: boolean;
  error: string | null;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Gauge className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">No sitemap audit yet</h3>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
        Fetch your sitemap, score every page for Core Web Vitals, structure, and AI readiness.
        Up to 200 URLs per run.
      </p>
      <button
        type="button"
        onClick={onStart}
        disabled={starting}
        className={cn(
          "mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90",
          starting ? "opacity-80" : "",
        )}
      >
        {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        Run audit
      </button>
      {error ? (
        <p className="mt-3 text-[12px] text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header bar
// ---------------------------------------------------------------------------

function HeaderBar({
  audit,
  isRunning,
  starting,
  onStart,
}: {
  audit: SitemapAuditSummary;
  isRunning: boolean;
  starting: boolean;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Layers className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Sitemap
          </p>
          <p className="truncate text-[13px] font-semibold text-foreground">
            {audit.sitemap_url || "—"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isRunning ? (
          <div className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Crawling… {audit.progress}%
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${audit.progress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onStart}
            disabled={starting}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-[12px] font-semibold text-foreground shadow-sm transition hover:bg-muted/40 disabled:opacity-60"
          >
            {starting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            Re-run audit
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat tiles
// ---------------------------------------------------------------------------

function StatTiles({ audit }: { audit: SitemapAuditSummary }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <IndexedTile audit={audit} />
      <VitalTile
        label="Avg LCP"
        value={audit.avg_lcp_ms}
        unit="ms"
        thresholds={[2500, 4000]}
        icon={<Timer className="h-3.5 w-3.5" />}
      />
      <VitalTile
        label="Avg FCP"
        value={audit.avg_fcp_ms}
        unit="ms"
        thresholds={[1800, 3000]}
        icon={<Sparkles className="h-3.5 w-3.5" />}
      />
      <VitalTile
        label="Avg TTFB"
        value={audit.avg_ttfb_ms}
        unit="ms"
        thresholds={[800, 1800]}
        icon={<Gauge className="h-3.5 w-3.5" />}
      />
    </div>
  );
}

function IndexedTile({ audit }: { audit: SitemapAuditSummary }) {
  const pct = audit.crawl_limit > 0 ? Math.min(100, (audit.total_urls / audit.crawl_limit) * 100) : 0;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Indexed Pages
        </p>
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
        {audit.indexed_count}
        <span className="ml-1 text-base font-semibold text-muted-foreground">/ {audit.total_urls}</span>
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${(audit.indexed_count / Math.max(1, audit.total_urls)) * 100}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        Successful: {audit.indexed_count}
      </p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full rounded-full bg-neutral-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Crawl limit: {audit.total_urls} / {audit.crawl_limit}
      </p>
    </div>
  );
}

function VitalTile({
  label,
  value,
  unit,
  thresholds,
  icon,
}: {
  label: string;
  value: number | null;
  unit: string;
  thresholds: [number, number];
  icon: React.ReactNode;
}) {
  const [good, warn] = thresholds;
  const bandMax = warn * 1.5;
  const hasValue = typeof value === "number";
  const color = !hasValue
    ? "text-muted-foreground"
    : value! <= good
    ? "text-emerald-600"
    : value! <= warn
    ? "text-amber-600"
    : "text-red-600";
  const markerPct = !hasValue ? 0 : Math.min(100, (value! / bandMax) * 100);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className={cn("mt-2 text-3xl font-bold tabular-nums", color)}>
        {hasValue ? value : "—"}
        {hasValue ? <span className="ml-1 text-sm font-semibold">{unit}</span> : null}
      </p>
      <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-200">
        <div className="absolute inset-y-0 left-0 bg-emerald-500" style={{ width: `${(good / bandMax) * 100}%` }} />
        <div
          className="absolute inset-y-0 bg-amber-500"
          style={{ left: `${(good / bandMax) * 100}%`, width: `${((warn - good) / bandMax) * 100}%` }}
        />
        <div
          className="absolute inset-y-0 right-0 bg-red-500"
          style={{ width: `${((bandMax - warn) / bandMax) * 100}%` }}
        />
        {hasValue ? (
          <div
            className="absolute -top-0.5 h-2.5 w-0.5 bg-black"
            style={{ left: `${markerPct}%` }}
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// State tabs + toolbar
// ---------------------------------------------------------------------------

function StateTabs({
  audit,
  active,
  onChange,
}: {
  audit: SitemapAuditSummary;
  active: StateTab;
  onChange: (next: StateTab) => void;
}) {
  const items: { key: StateTab; label: string; count: number }[] = [
    { key: "crawled", label: "Crawled Pages", count: audit.indexed_count },
    { key: "redirect", label: "Redirects", count: audit.redirect_count },
    { key: "queued", label: "Queued", count: audit.queued_count },
    { key: "failed", label: "Failed", count: audit.failed_count },
  ];
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        {/* <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Sitemap</p> */}
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Sitemap Audit</h2>
        <p className="mt-1 text-xs text-muted-foreground">Fetch your sitemap, score every page for Core Web Vitals, structure, and AI readiness. Up to 200 URLs per run.</p>
      </div>
      <div>
      {items.map((it) => {
        const isActive = it.key === active;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onChange(it.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-semibold transition",
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {it.label}
            <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-foreground">
              {it.count}
            </span>
          </button>
        );
      })}
      </div>
      
    </div>
  );
}

function Toolbar({
  q,
  onQ,
  sort,
  onSort,
  severity,
  onSeverity,
}: {
  q: string;
  onQ: (v: string) => void;
  sort: string;
  onSort: (v: string) => void;
  severity: SeverityFilter;
  onSeverity: (v: SeverityFilter) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <div className="relative min-w-[220px] flex-1 md:flex-initial md:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search URLs…"
          value={q}
          onChange={(e) => onQ(e.target.value)}
          className="w-full rounded-md border border-border bg-white py-2 pl-9 pr-8 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        {q ? (
          <button
            type="button"
            onClick={() => onQ("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={severity}
          onValueChange={(v) => onSeverity(v as SeverityFilter)}
        >
          <SelectTrigger
            size="sm"
            className="h-9 w-34 shrink-0 border border-border/80 bg-white text-foreground shadow-sm sm:w-36 dark:bg-white dark:text-foreground dark:hover:bg-neutral-50"
          >
            <SelectValue placeholder="All severities" />
          </SelectTrigger>
          <SelectContent> 
            <SelectItem value="all">All severities</SelectItem>
            <SelectItem value="ok">OK</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="fail">Fail</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sort}
          onValueChange={(v) => onSort(v as string)}
        >
          <SelectTrigger
            size="sm"
            className="h-9 w-34 shrink-0 border border-border/80 bg-white text-foreground shadow-sm sm:w-36 dark:bg-white dark:text-foreground dark:hover:bg-neutral-50"
          >
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> 
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

function PagesTable({
  pages,
  total,
  state,
  running,
}: {
  pages: SitemapAuditPage[];
  total: number;
  state: StateTab;
  running: boolean;
}) {
  if (pages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 px-5 py-10 text-center text-[13px] text-muted-foreground">
        {running ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Crawling pages — results appear here as each URL finishes.
          </span>
        ) : (
          <>No {state} pages yet.</>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full table-fixed text-left text-[12px]">
        <thead className="border-b border-border bg-muted/30 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="w-[30%] px-4 py-3">URL</th>
            <th className="w-[6%] px-2 py-3">Status</th>
            <th className="w-[10%] px-2 py-3">Content</th>
            <th className="w-[6%] px-2 py-3">LCP</th>
            <th className="w-[6%] px-2 py-3">FCP</th>
            <th className="w-[6%] px-2 py-3">TTFB</th>
            <th className="w-[6%] px-2 py-3">Server</th>
            <th className="w-[8%] px-2 py-3">Resources</th>
            <th className="w-[8%] px-2 py-3">Links</th>
            <th className="w-[10%] px-2 py-3">AI</th>
            <th className="w-[8%] px-2 py-3 whitespace-nowrap">Crawled</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((p) => (
            <PageRow key={p.id} page={p} />
          ))}
        </tbody>
      </table>
      {total > pages.length ? (
        <div className="border-t border-border px-4 py-2 text-right text-[11px] text-muted-foreground">
          Showing {pages.length} of {total}
        </div>
      ) : null}
    </div>
  );
}

function PageRow({ page }: { page: SitemapAuditPage }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr
        className={cn(
          "cursor-pointer border-b border-border/60 transition hover:bg-muted/30",
          open ? "bg-muted/30" : "",
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <td className="px-4 py-3 align-top">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-muted-foreground">
              {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </span>
            <div className="min-w-0 max-w-full">
              <p className="truncate font-medium text-foreground" title={page.url}>
                {page.path || page.url}
              </p>
              {page.title ? (
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground" title={page.title}>
                  {page.title}
                </p>
              ) : null}
            </div>
          </div>
        </td>
        <td className="px-2 py-3 align-top whitespace-nowrap">
          <StatusPill code={page.status_code} />
        </td>
        <td className="px-2 py-3 align-top tabular-nums">
          <p className="whitespace-nowrap font-medium text-foreground">{page.word_count.toLocaleString()} words</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {(page.text_ratio * 100).toFixed(0)}% text ratio
          </p>
        </td>
        <td className={cn("px-2 py-3 align-top tabular-nums whitespace-nowrap", vitalColor(page.lcp_ms, [2500, 4000]))}>
          {fmtMs(page.lcp_ms)}
        </td>
        <td className={cn("px-2 py-3 align-top tabular-nums whitespace-nowrap", vitalColor(page.fcp_ms, [1800, 3000]))}>
          {fmtMs(page.fcp_ms)}
        </td>
        <td className={cn("px-2 py-3 align-top tabular-nums whitespace-nowrap", vitalColor(page.ttfb_ms, [800, 1800]))}>
          {fmtMs(page.ttfb_ms)}
        </td>
        <td className="px-2 py-3 align-top tabular-nums whitespace-nowrap text-muted-foreground">
          {fmtMs(page.server_ms)}
        </td>
        <td className="px-2 py-3 align-top tabular-nums">
          <p>{page.resource_count} files</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{fmtBytes(page.resource_bytes)}</p>
        </td>
        <td className="px-2 py-3 align-top tabular-nums">
          <p>{page.link_count_total} Links</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {page.link_count_internal} int / {page.link_count_external} ext
          </p>
        </td>
        <td className="px-2 py-3 align-top">
          <AiScoreCell score={page.ai_score} severity={page.severity} />
        </td>
        <td className="whitespace-nowrap px-2 py-3 align-top text-[11px] text-muted-foreground">
          {new Date(page.checked_at).toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
          })}
        </td>
      </tr>
      {open ? (
        <tr className="border-b border-border bg-muted/20">
          <td colSpan={11} className="px-4 py-4">
            <PageDetails page={page} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function PageDetails({ page }: { page: SitemapAuditPage }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          AI-readiness findings
        </p>
        {page.findings.length === 0 ? (
          <p className="mt-2 text-[12px] text-emerald-700">
            <CheckCircle2 className="inline h-3.5 w-3.5" /> No issues detected.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-[12px]">
            {page.findings.map((f) => (
              <li key={f.code} className="flex items-start gap-2">
                <SeverityIcon severity={f.severity} />
                <span className="text-foreground">{f.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Structure
        </p>
        <dl className="mt-2 grid grid-cols-2 gap-y-1 text-[12px]">
          <dt className="text-muted-foreground">JSON-LD</dt>
          <dd className="font-medium">{page.jsonld_count}</dd>
          <dt className="text-muted-foreground">H1 count</dt>
          <dd className="font-medium">{page.h1_count}</dd>
          <dt className="text-muted-foreground">Canonical</dt>
          <dd className="font-medium">{page.has_canonical ? "✓" : "—"}</dd>
          <dt className="text-muted-foreground">Open Graph</dt>
          <dd className="font-medium">{page.has_og ? "✓" : "—"}</dd>
          <dt className="text-muted-foreground">noindex</dt>
          <dd className="font-medium">{page.is_noindex ? "yes" : "no"}</dd>
          <dt className="text-muted-foreground">GPTBot</dt>
          <dd className="font-medium">{page.robots_allows_gptbot ? "allowed" : "blocked"}</dd>
          <dt className="text-muted-foreground">ClaudeBot</dt>
          <dd className="font-medium">{page.robots_allows_claudebot ? "allowed" : "blocked"}</dd>
          <dt className="text-muted-foreground">PerplexityBot</dt>
          <dd className="font-medium">{page.robots_allows_perplexitybot ? "allowed" : "blocked"}</dd>
        </dl>
        <a
          href={page.final_url || page.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
        >
          Open page <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bits
// ---------------------------------------------------------------------------

function StatusPill({ code }: { code: number }) {
  const ok = code >= 200 && code < 300;
  const redirect = code >= 300 && code < 400;
  const cls = ok
    ? "bg-emerald-100 text-emerald-700"
    : redirect
    ? "bg-amber-100 text-amber-700"
    : code
    ? "bg-red-100 text-red-700"
    : "bg-neutral-100 text-neutral-600";
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums", cls)}>
      {code || "—"}
    </span>
  );
}

function SeverityIcon({ severity }: { severity: SitemapPageSeverity }) {
  if (severity === "fail") return <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />;
  if (severity === "warn") return <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />;
  return <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />;
}

function AiScoreCell({
  score,
  severity,
}: {
  score: number;
  severity: SitemapPageSeverity;
}) {
  const bar = severity === "fail" ? "bg-red-500" : severity === "warn" ? "bg-amber-500" : "bg-emerald-500";
  const chip = severity === "fail"
    ? "bg-red-100 text-red-700"
    : severity === "warn"
    ? "bg-amber-100 text-amber-700"
    : "bg-emerald-100 text-emerald-700";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 min-w-0">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold tabular-nums text-foreground">{score}</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-200">
          <div className={cn("h-full rounded-full", bar)} style={{ width: `${score}%` }} />
        </div>
      </div>
      <span className={cn("rounded-full px-1 py-0.5 text-[9px] font-bold uppercase", chip)}>
        {severity}
      </span>
    </div>
  );
}

function vitalColor(value: number | null, [good, warn]: [number, number]): string {
  if (value == null) return "text-muted-foreground";
  if (value <= good) return "text-emerald-600";
  if (value <= warn) return "text-amber-600";
  return "text-red-600";
}

function fmtMs(value: number | null): string {
  if (value == null) return "—";
  if (value >= 1000) return `${(value / 1000).toFixed(2)}s`;
  return `${Math.round(value)}ms`;
}

function fmtBytes(value: number): string {
  if (!value) return "0KB";
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)}MB`;
  return `${Math.round(value / 1024)}KB`;
}
