"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Bot,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  MessageCircle,
  Play,
  RefreshCw,
  Search as SearchIcon,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import {
  getRankAudit,
  refreshRankQuery,
  startRankAudit,
  type RankAuditResponse,
  type RankAuditSummary,
  type RankQuery,
  type RankResult,
  type RankSentiment,
  type RankSurface,
} from "@/lib/api/analyzer";
import { cn } from "@/lib/utils";

export type RankTrackerMode = "search" | "ai";

const SEARCH_SURFACES: { key: RankSurface; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "google", label: "Google", icon: Globe },
  { key: "reddit", label: "Reddit", icon: Users },
  { key: "quora", label: "Quora", icon: MessageCircle },
];

const AI_ENGINES: { key: string; label: string }[] = [
  { key: "gpt", label: "ChatGPT" },
  { key: "claude", label: "Claude" },
  { key: "gemini", label: "Gemini" },
  { key: "perplexity", label: "Perplexity" },
];

const AI_ENGINE_LABELS: Record<string, string> = {
  gpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

type QuerySeverity = "green" | "amber" | "red";

function querySeverity(q: RankQuery, mode: RankTrackerMode): QuerySeverity {
  const all = q.results || [];
  const scope = mode === "ai"
    ? all.filter((r) => r.surface === "ai")
    : all.filter((r) => r.surface !== "ai");
  if (mode === "ai") {
    const anyBrand = scope.some((r) => r.is_brand_mentioned);
    if (anyBrand) return "green";
    const anyComp = scope.some((r) => r.competitors_mentioned.length > 0);
    return anyComp ? "amber" : "red";
  }
  const top3Brand = scope.some((r) => r.is_brand_mentioned && r.position <= 3);
  if (top3Brand) return "green";
  const anyBrand = scope.some((r) => r.is_brand_mentioned);
  return anyBrand ? "amber" : "red";
}

function surfaceCount(q: RankQuery, surface: RankSurface): number {
  return (q.results || []).filter((r) => r.surface === surface).length;
}

function engineCount(q: RankQuery, engine: string): number {
  return (q.results || []).filter(
    (r) => r.surface === "ai" && r.engine === engine,
  ).length;
}

function faviconFor(url: string): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
  } catch {
    return "";
  }
}

export function RankTrackerPanel({
  slug,
  mode = "search",
}: {
  slug: string;
  mode?: RankTrackerMode;
}) {
  const [data, setData] = useState<RankAuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedQueryId, setFocusedQueryId] = useState<number | null>(null);
  const [activeKey, setActiveKey] = useState<string>(mode === "ai" ? "gpt" : "google");
  const [refreshingQueryId, setRefreshingQueryId] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aliveRef = useRef(true);

  const audit = data?.audit ?? null;
  const queries = data?.queries ?? [];
  const isRunning = audit?.status === "running" || audit?.status === "queued";

  const fetchNow = useCallback(async () => {
    try {
      const res = await getRankAudit(slug);
      if (!aliveRef.current) return;
      setData(res);
      setError(null);
    } catch {
      if (!aliveRef.current) return;
      setError("Couldn't load the rank audit. Retry in a moment.");
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, [slug]);

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

  useEffect(() => {
    if (!isRunning) return;
    if (pollRef.current) clearTimeout(pollRef.current);
    pollRef.current = setTimeout(() => {
      void fetchNow();
    }, 2200);
  }, [isRunning, data, fetchNow]);

  // Auto-focus first query once we have some
  useEffect(() => {
    if (focusedQueryId != null) return;
    if (queries.length > 0) setFocusedQueryId(queries[0].id);
  }, [queries, focusedQueryId]);

  // Reset active key when mode toggles
  useEffect(() => {
    setActiveKey(mode === "ai" ? "gpt" : "google");
  }, [mode]);

  async function handleStart() {
    if (starting) return;
    setStarting(true);
    try {
      await startRankAudit(slug);
      await fetchNow();
    } catch {
      setError("Couldn't start an audit. Try again.");
    } finally {
      setStarting(false);
    }
  }

  async function handleRefreshOne(queryId: number) {
    if (refreshingQueryId != null) return;
    setRefreshingQueryId(queryId);
    try {
      await refreshRankQuery(slug, queryId);
      await fetchNow();
    } catch {
      setError("Couldn't refresh that query.");
    } finally {
      setRefreshingQueryId(null);
    }
  }

  const focused = useMemo(
    () => queries.find((q) => q.id === focusedQueryId) ?? null,
    [queries, focusedQueryId],
  );

  return (
    <div className="space-y-6">
      <Header
        audit={audit}
        onStart={handleStart}
        starting={starting}
        isRunning={isRunning}
        hasAudit={!!audit}
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {audit?.error_message ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {audit.error_message}
        </div>
      ) : null}

      {loading && !audit ? (
        <div className="flex items-center justify-center rounded-xl border border-border/60 bg-card/60 py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !audit ? (
        <EmptyState onStart={handleStart} starting={starting} />
      ) : (
        <>
          <StatTiles audit={audit} queries={queries} />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
            <QueryList
              queries={queries}
              focusedId={focusedQueryId}
              onSelect={setFocusedQueryId}
              isRunning={isRunning}
              mode={mode}
            />
            {focused ? (
              <FocusedQuery
                query={focused}
                mode={mode}
                activeKey={activeKey}
                onKeyChange={setActiveKey}
                onRefresh={() => handleRefreshOne(focused.id)}
                refreshing={refreshingQueryId === focused.id}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center text-sm text-muted-foreground">
                Select a query on the left to see what's ranking.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Header
// ──────────────────────────────────────────────────────────────────────────

function Header({
  audit,
  onStart,
  starting,
  isRunning,
  hasAudit,
}: {
  audit: RankAuditSummary | null;
  onStart: () => void;
  starting: boolean;
  isRunning: boolean;
  hasAudit: boolean;
}) {
  const label = hasAudit ? "Re-run audit" : "Run audit";
  const disabled = starting || isRunning;
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Ranking</p>
        <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          What's ranking for your brand
        </h2>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          10 queries tailored to your brand — we fetch the top Google, Reddit, and Quora
          results and flag where you (and your competitors) show up.
        </p>
      </div>
      <div className="flex items-center gap-3">
        {audit?.finished_at ? (
          <span className="hidden text-xs text-muted-foreground md:inline">
            Last run: {new Date(audit.finished_at).toLocaleString()}
          </span>
        ) : null}
        <button
          type="button"
          disabled={disabled}
          onClick={onStart}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-md border border-border/70 bg-foreground px-3 text-[13px] font-medium text-background shadow-sm transition",
            disabled && "opacity-60",
          )}
        >
          {starting || isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isRunning ? "Running…" : label}
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Empty state
// ──────────────────────────────────────────────────────────────────────────

function EmptyState({
  onStart,
  starting,
}: {
  onStart: () => void;
  starting: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
      <Target className="h-7 w-7 text-muted-foreground" />
      <div className="max-w-md">
        <p className="text-sm font-medium text-foreground">
          No rank audit yet
        </p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Run one to see what's ranking for 10 queries tailored to your brand — across
          Google, Reddit, and Quora.
        </p>
      </div>
      <button
        type="button"
        disabled={starting}
        onClick={onStart}
        className="mt-1 inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-3 text-[13px] font-medium text-background shadow-sm"
      >
        {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        Run audit
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Stat tiles
// ──────────────────────────────────────────────────────────────────────────

function StatTiles({
  audit,
  queries,
}: {
  audit: RankAuditSummary;
  queries: RankQuery[];
}) {
  const done = audit.queries_done || queries.filter((q) => q.status === "done").length;
  const total = audit.total_queries || queries.length || 10;
  const avgMentions = Number(audit.avg_brand_mentions || 0);
  const top3Rate = Number(audit.avg_top3_brand_rate || 0);
  const doneFrac = total > 0 ? Math.min(1, done / total) : 0;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Tile
        eyebrow="Queries Tracked"
        icon={BarChart3}
        value={`${done} / ${total}`}
        sub={
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${Math.round(doneFrac * 100)}%` }}
            />
          </div>
        }
      />
      <Tile
        eyebrow="Avg Brand Mentions"
        icon={Target}
        value={avgMentions.toFixed(1)}
        sub={<span className="text-xs text-muted-foreground">per query, across all surfaces</span>}
      />
      <Tile
        eyebrow="Top-3 Brand Rate"
        icon={CheckCircle2}
        value={`${Math.round(top3Rate * 100)}%`}
        sub={<span className="text-xs text-muted-foreground">queries where brand hits top 3</span>}
      />
    </div>
  );
}

function Tile({
  eyebrow,
  icon: Icon,
  value,
  sub,
}: {
  eyebrow: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">{eyebrow}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      {sub ? <div className="mt-1">{sub}</div> : null}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Query list (left column)
// ──────────────────────────────────────────────────────────────────────────

function QueryList({
  queries,
  focusedId,
  onSelect,
  isRunning,
  mode,
}: {
  queries: RankQuery[];
  focusedId: number | null;
  onSelect: (id: number) => void;
  isRunning: boolean;
  mode: RankTrackerMode;
}) {
  if (queries.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/60 p-6 text-center text-sm text-muted-foreground">
        {isRunning
          ? "Generating queries… results appear here as each one finishes."
          : "No queries yet."}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {queries.map((q) => {
        const sev = querySeverity(q, mode);
        const sevTone =
          sev === "green"
            ? "bg-emerald-500"
            : sev === "amber"
              ? "bg-amber-500"
              : "bg-red-500";
        const sevLabel =
          sev === "green" ? "Top-3" : sev === "amber" ? "Mentioned" : "Absent";
        const isFocused = q.id === focusedId;
        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onSelect(q.id)}
            className={cn(
              "group flex flex-col gap-2 rounded-lg border bg-card/60 p-3 text-left transition",
              isFocused
                ? "border-foreground/70 shadow-sm"
                : "border-border/60 hover:border-border",
            )}
          >
            <div className="flex items-start gap-2">
              <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", sevTone)} />
              <p className="line-clamp-2 text-[13px] leading-snug text-foreground">
                {q.prompt_text}
              </p>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="tabular-nums">
                {q.brand_mention_count} brand mentions
              </span>
              <span className="font-medium text-foreground/70">{sevLabel}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Focused query view (right column)
// ──────────────────────────────────────────────────────────────────────────

function FocusedQuery({
  query,
  mode,
  activeKey,
  onKeyChange,
  onRefresh,
  refreshing,
}: {
  query: RankQuery;
  mode: RankTrackerMode;
  activeKey: string;
  onKeyChange: (k: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const tabs: { key: string; label: string; icon?: React.ComponentType<{ className?: string }>; count: number }[] =
    mode === "ai"
      ? AI_ENGINES.map((e) => ({
          key: e.key,
          label: e.label,
          count: engineCount(query, e.key),
        }))
      : SEARCH_SURFACES.map((s) => ({
          key: s.key,
          label: s.label,
          icon: s.icon,
          count: surfaceCount(query, s.key),
        }));

  const results = (query.results || []).filter((r) => {
    if (mode === "ai") return r.surface === "ai" && r.engine === activeKey;
    return r.surface === activeKey;
  });

  const emptyMessage =
    mode === "ai"
      ? `No ${AI_ENGINE_LABELS[activeKey] || activeKey} response captured for this query.`
      : `No ${activeKey} results captured for this query.`;
  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-card/60">
      <div className="flex flex-col gap-3 border-b border-border/60 p-4">
        <div className="flex items-start gap-3">
          <SearchIcon className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{query.prompt_text}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {query.brand_mention_count} brand mentions across all surfaces
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing || query.status === "queued"}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-border/70 bg-background px-2.5 text-xs text-foreground transition hover:bg-muted disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {tabs.map(({ key, label, icon: Icon, count }) => {
            const active = activeKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onKeyChange(key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12px] font-medium transition",
                  active
                    ? "border-foreground/70 bg-foreground text-background"
                    : "border-border/60 bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                {Icon ? <Icon className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                {label}
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 text-[10px] tabular-nums",
                    active ? "bg-background/20 text-background" : "bg-muted text-foreground/70",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <BrandCitationSummary query={query} mode={mode} />

      <ResultList
        results={results}
        emptyMessage={emptyMessage}
        queryStatus={query.status}
      />
    </div>
  );
}

function ResultList({
  results,
  emptyMessage,
  queryStatus,
}: {
  results: RankResult[];
  emptyMessage: string;
  queryStatus: RankQuery["status"];
}) {
  if (queryStatus === "queued") {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Fetching results…
      </div>
    );
  }
  if (queryStatus === "failed") {
    return (
      <div className="p-10 text-center text-sm text-red-600">
        This query failed. Click Refresh to try again.
      </div>
    );
  }
  if (results.length === 0) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="divide-y divide-border/50">
      {results.map((r) => (
        <ResultRow key={r.id} result={r} />
      ))}
    </div>
  );
}

function ResultRow({ result }: { result: RankResult }) {
  if (result.surface === "ai") {
    return <AiResultRow result={result} />;
  }
  const fav = faviconFor(result.url);
  return (
    <div className="flex items-start gap-3 p-4">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold tabular-nums text-foreground">
        {result.position}
      </span>
      {fav ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fav}
          alt=""
          width={16}
          height={16}
          loading="lazy"
          className="mt-1 h-4 w-4 shrink-0 rounded-sm"
        />
      ) : (
        <Globe className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="line-clamp-1 text-sm font-medium text-foreground hover:underline"
          >
            {result.title || result.url}
          </a>
          <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
        </div>
        <p className="truncate text-[11px] text-muted-foreground">
          {result.domain}
          {result.subreddit ? ` · r/${result.subreddit}` : ""}
          {result.upvotes != null ? ` · ${result.upvotes} upvotes` : ""}
        </p>
        {result.snippet ? (
          <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-muted-foreground">
            {result.snippet}
          </p>
        ) : null}
        {(result.is_brand_mentioned || result.competitors_mentioned.length > 0) ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {result.is_brand_mentioned ? (
              <span className="inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                Your brand
              </span>
            ) : null}
            {result.competitors_mentioned.map((c) => (
              <span
                key={c}
                className="inline-flex items-center rounded-md border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Brand citation + sentiment summary (sits above the results list)
// ──────────────────────────────────────────────────────────────────────────

interface BrandStats {
  name: string;
  isYou: boolean;
  total: number;
  positive: number;
  neutral: number;
  negative: number;
}

function aggregateBrandStats(
  query: RankQuery,
  mode: RankTrackerMode,
): BrandStats[] {
  const acc = new Map<string, BrandStats>();
  const bump = (key: string, isYou: boolean, sentiment: RankSentiment) => {
    const existing = acc.get(key) || {
      name: key,
      isYou,
      total: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
    };
    existing.total += 1;
    existing[sentiment] += 1;
    acc.set(key, existing);
  };
  const inScope = (query.results || []).filter((r) =>
    mode === "ai" ? r.surface === "ai" : r.surface !== "ai",
  );
  for (const r of inScope) {
    if (r.is_brand_mentioned) {
      bump("Your brand", true, r.sentiment || "neutral");
    }
    for (const c of r.competitors_mentioned || []) {
      bump(c, false, r.sentiment || "neutral");
    }
  }
  return Array.from(acc.values()).sort((a, b) => {
    if (a.isYou !== b.isYou) return a.isYou ? -1 : 1;
    return b.total - a.total;
  });
}

function BrandCitationSummary({
  query,
  mode,
}: {
  query: RankQuery;
  mode: RankTrackerMode;
}) {
  const stats = useMemo(() => aggregateBrandStats(query, mode), [query, mode]);
  if (!stats.length) {
    return (
      <div className="border-b border-border/50 bg-muted/30 px-4 py-3 text-[12px] text-muted-foreground">
        No brand or competitor mentions detected across results for this query.
      </div>
    );
  }
  return (
    <div className="border-b border-border/50 bg-muted/20 p-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
        Citations &amp; sentiment
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {stats.map((s) => (
          <BrandStatChip key={s.name} s={s} />
        ))}
      </div>
    </div>
  );
}

function BrandStatChip({ s }: { s: BrandStats }) {
  const tone = s.isYou ? "emerald" : "amber";
  const borderClass =
    tone === "emerald"
      ? "border-emerald-500/40 bg-emerald-500/10"
      : "border-amber-500/40 bg-amber-500/10";
  const textClass = tone === "emerald" ? "text-emerald-800" : "text-amber-900";
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-2 py-1 text-[12px]",
        borderClass,
        textClass,
      )}
    >
      <span className="font-semibold">{s.name}</span>
      <span className="rounded bg-background/60 px-1 font-mono text-[11px] tabular-nums">
        {s.total}
      </span>
      <span className="flex items-center gap-1 text-[10px] font-medium">
        {s.positive > 0 ? (
          <span className="flex items-center gap-0.5 text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {s.positive}
          </span>
        ) : null}
        {s.neutral > 0 ? (
          <span className="flex items-center gap-0.5 text-neutral-600">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
            {s.neutral}
          </span>
        ) : null}
        {s.negative > 0 ? (
          <span className="flex items-center gap-0.5 text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {s.negative}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function AiResultRow({ result }: { result: RankResult }) {
  const [expanded, setExpanded] = useState(false);
  const label = AI_ENGINE_LABELS[result.engine] || result.engine || result.title || "AI";
  const full = result.response_text || result.snippet || "";
  const needsTruncate = full.length > 360;
  const body = expanded || !needsTruncate ? full : full.slice(0, 360) + "…";
  return (
    <div className="flex items-start gap-3 p-4">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted">
        <Bot className="h-3.5 w-3.5 text-foreground" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {result.is_brand_mentioned ? (
            <span className="inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
              Your brand
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md border border-neutral-300/60 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600">
              Brand absent
            </span>
          )}
        </div>
        <p className="mt-1 whitespace-pre-wrap text-[12px] leading-snug text-muted-foreground">
          {body}
        </p>
        {needsTruncate ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-[11px] font-medium text-foreground/70 hover:text-foreground"
          >
            {expanded ? "Show less" : "Show full response"}
          </button>
        ) : null}
        {result.competitors_mentioned.length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {result.competitors_mentioned.map((c) => (
              <span
                key={c}
                className="inline-flex items-center rounded-md border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
