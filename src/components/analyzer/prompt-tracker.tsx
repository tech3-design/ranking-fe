"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Eye,
  Search,
  MessageSquare,
  Lock,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addPromptTrack, recheckPrompt } from "@/lib/api/analyzer";
import type {
  PromptTrack,
  PromptResult,
  Engine,
  Sentiment,
} from "@/lib/api/analyzer";
import { useSession } from "@/lib/auth-client";
import { getSubscriptionStatus } from "@/lib/api/payments";
import ActionsDropdown from "./ActionDropdown";

/** Public SVG logos under `/public/logos/` (Next serves at `/logos/...`). */
const ENGINE_LOGO_SRC: Record<Engine, string> = {
  google: "/logos/google.svg",
  bing: "/logos/copilot.svg",
  chatgpt: "/logos/chatgpt.svg",
  claude: "/logos/claude.svg",
  gemini: "/logos/gemini.svg",
  perplexity: "/logos/perplexity.svg",
};

// ── Engine config ─────────────────────────────────────────────────────────────
const ENGINES: Array<{
  key: Engine;
  label: string;
  color: string;
  type: "ai" | "search";
}> = [
    { key: "google", label: "Google", color: "#ea4335", type: "search" },
    { key: "bing", label: "Bing", color: "#00809d", type: "search" },
    { key: "chatgpt", label: "ChatGPT", color: "#10a37f", type: "ai" },
    { key: "claude", label: "Claude", color: "#d97706", type: "ai" },
    { key: "gemini", label: "Gemini", color: "#4285f4", type: "ai" },
    { key: "perplexity", label: "Perplexity", color: "#7c3aed", type: "ai" },
  ];

// ── 5-Factor config (weights for display; styling is neutral in UI) ───────────
const FACTORS = [
  {
    key: "factor_authority" as const,
    label: "Authority",
    fullLabel: "Authority & Credibility",
    weight: "40%",
    weightNum: 40,
    description: "Cross-engine citation rate, domain trust signals and E-E-A-T",
    color: "#171717",
    bg: "bg-muted/40",
    text: "text-foreground",
  },
  {
    key: "factor_content_quality" as const,
    label: "Content",
    fullLabel: "Content Quality & Utility",
    weight: "35%",
    weightNum: 35,
    description:
      "Positive sentiment rate, direct-answer mechanism and original data",
    color: "#171717",
    bg: "bg-muted/40",
    text: "text-foreground",
  },
  {
    key: "factor_structural" as const,
    label: "Structure",
    fullLabel: "Structural Extractability",
    weight: "25%",
    weightNum: 25,
    description:
      "Top-3 position rate, NLP-friendly formatting and schema signals",
    color: "#171717",
    bg: "bg-muted/40",
    text: "text-foreground",
  },
  {
    key: "factor_semantic" as const,
    label: "Semantic",
    fullLabel: "Semantic Alignment",
    weight: "Signal",
    weightNum: 0,
    description: "Prompt-to-brand relevance: mention rate × confidence",
    color: "#171717",
    bg: "bg-muted/50",
    text: "text-foreground/70",
  },
  {
    key: "factor_third_party" as const,
    label: "3rd Party",
    fullLabel: "Third-Party Validation",
    weight: "Signal",
    weightNum: 0,
    description:
      "Google & Bing presence combined with cross-AI-model citation rate",
    color: "#171717",
    bg: "bg-muted/50",
    text: "text-foreground/70",
  },
] as const;

// ── Style helpers ─────────────────────────────────────────────────────────────
const SENTIMENT_STYLES: Record<Sentiment, { pill: string; dot: string }> = {
  positive: {
    pill: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border-emerald-500/20",
    dot: "bg-emerald-600 dark:bg-emerald-400",
  },
  neutral: {
    pill: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground/50",
  },
  negative: {
    pill: "bg-rose-500/8 text-rose-900 dark:text-rose-200 border-rose-500/20",
    dot: "bg-rose-600 dark:bg-rose-400",
  },
};

const LABEL_STYLES: Record<string, { ring: string; text: string; bg: string }> =
{
  Strong: { ring: "ring-border", text: "text-foreground", bg: "bg-muted/70" },
  Moderate: {
    ring: "ring-border/80",
    text: "text-foreground/85",
    bg: "bg-muted/45",
  },
  Weak: {
    ring: "ring-border/60",
    text: "text-muted-foreground",
    bg: "bg-muted/30",
  },
};

type FilterLabel = "All" | "Strong" | "Moderate" | "Weak";
type SortKey = "score" | "visibility" | "created";

// ── Props ─────────────────────────────────────────────────────────────────────
interface PromptTrackerProps {
  slug: string;
  tracks: PromptTrack[];
  onAdded: (track: PromptTrack) => void;
  onRechecked: (trackId: number) => void;
  expandedMode?: "full" | "blank";
  /** When set, shows “Recheck all” to the left of the search field (toolbar). */
  onRecheckAll?: () => void | Promise<void>;
  recheckingAll?: boolean;
}

// ── Main component ────────────────────────────────────────────────────────────
export function PromptTracker({
  slug,
  tracks,
  onAdded,
  onRechecked,
  expandedMode = "full",
  onRecheckAll,
  recheckingAll = false,
}: PromptTrackerProps) {
  const { data: session } = useSession();
  const [planEngines, setPlanEngines] = useState<Engine[] | null>(null);
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [rechecking, setRechecking] = useState<Record<number, boolean>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [viewingResponse, setViewingResponse] = useState<PromptResult | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [filterLabel, setFilterLabel] = useState<FilterLabel>("All");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [portalEl, setPortalEl] = useState<Element | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const addPromptTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setPortalEl(document.body);
  }, []);

  useEffect(() => {
    if (!viewingResponse) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewingResponse(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [viewingResponse]);

  useEffect(() => {
    if (!addDialogOpen) return;
    queueMicrotask(() => addPromptTextareaRef.current?.focus());
  }, [addDialogOpen]);

  useEffect(() => {
    if (!addDialogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAddDialogOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addDialogOpen]);

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) {
      setPlanEngines(null);
      return;
    }
    getSubscriptionStatus(email)
      .then((s) => setPlanEngines((s.limits.engines as Engine[]) ?? null))
      .catch(() => setPlanEngines(null));
  }, [session?.user?.email]);

  const enginesForUi = useMemo(() => {
    if (!planEngines?.length) return ENGINES;
    const allowed = new Set(planEngines);
    return ENGINES.filter((e) => allowed.has(e.key));
  }, [planEngines]);

  const showUpsell = useMemo(() => {
    if (!planEngines?.length) return false;
    const s = new Set(planEngines);
    return !s.has("chatgpt") || !s.has("perplexity") || !s.has("claude");
  }, [planEngines]);

  // ── Aggregate stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = tracks.length;
    if (total === 0)
      return {
        avgScore: 0,
        visibility: 0,
        strong: 0,
        weak: 0,
        totalRuns: 0,
        mentions: 0,
      };
    const avgScore = Math.round(
      (tracks.reduce((s, t) => s + (t.score ?? 0), 0) / total) * 100,
    );
    const totalRuns = tracks.reduce((s, t) => s + (t.total_runs ?? 0), 0);
    const mentions = tracks.reduce((s, t) => s + (t.mentions ?? 0), 0);
    const visibility =
      totalRuns > 0 ? Math.round((mentions / totalRuns) * 100) : 0;
    const strong = tracks.filter((t) => t.ranking_label === "Strong").length;
    const weak = tracks.filter((t) => t.ranking_label === "Weak").length;
    return { avgScore, visibility, strong, weak, totalRuns, mentions };
  }, [tracks]);

  // ── Filtered + sorted tracks ─────────────────────────────────────────────
  const visibleTracks = useMemo(() => {
    let list = [...tracks];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.prompt_text.toLowerCase().includes(q));
    }
    if (filterLabel !== "All") {
      list = list.filter((t) => t.ranking_label === filterLabel);
    }
    if (sortKey === "score")
      list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    else if (sortKey === "visibility")
      list.sort((a, b) => (b.visibility_pct ?? 0) - (a.visibility_pct ?? 0));
    else
      list.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    return list;
  }, [tracks, search, filterLabel, sortKey]);

  const promptFiltersActive = useMemo(
    () =>
      search.trim() !== "" ||
      filterLabel !== "All" ||
      sortKey !== "score",
    [search, filterLabel, sortKey],
  );

  async function handleAdd(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setAdding(true);
    setAddError(null);
    try {
      const track = await addPromptTrack(slug, trimmed);
      onAdded(track);
      setText("");
      setAddDialogOpen(false);
    } catch {
      setAddError("Failed to add prompt.");
    } finally {
      setAdding(false);
    }
  }

  async function handleRecheck(trackId: number) {
    setRechecking((p) => ({ ...p, [trackId]: true }));
    try {
      await recheckPrompt(slug, trackId);
      onRechecked(trackId);
    } catch {
      /* ignore */
    } finally {
      setRechecking((p) => ({ ...p, [trackId]: false }));
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-2.5">
      <div className="flex w-full min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="min-w-0 text-xs text-muted-foreground sm:max-w-[min(100%,24rem)]">
          {tracks.length === 0 ? (
            <>Track prompts to score visibility across AI and search.</>
          ) : promptFiltersActive ? (
            <>
              Showing{" "}
              <span className="font-medium text-foreground">{visibleTracks.length}</span>
              {" of "}
              {tracks.length} prompts
            </>
          ) : (
            <>
              {tracks.length} prompt{tracks.length !== 1 ? "s" : ""} tracked
            </>
          )}
        </p>
        <div className="flex w-full min-w-0 flex-nowrap items-center justify-start gap-2 overflow-x-auto overflow-y-visible py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-auto sm:max-w-[min(100%,52rem)] sm:justify-end lg:max-w-none">
          {tracks.length > 0 && onRecheckAll ? (
            <Button
              type="button"
              variant="outline"
              size="default"
              disabled={recheckingAll}
              className="h-9 min-h-9 shrink-0 gap-1.5 border-border/80 bg-white px-2.5 text-xs font-medium text-foreground shadow-sm hover:bg-neutral-50 disabled:opacity-50 dark:bg-white dark:text-foreground dark:hover:bg-neutral-100"
              onClick={() => void onRecheckAll()}
            >
              {recheckingAll ? (
                <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="size-3.5 shrink-0" aria-hidden />
              )}
              <span className="hidden sm:inline">
                {recheckingAll ? "Rechecking…" : "Recheck all"}
              </span>
              <span className="sm:hidden">{recheckingAll ? "…" : "All"}</span>
            </Button>
          ) : null}
          {tracks.length > 0 ? (
            <>
              <div className="relative min-w-42 max-w-56 shrink-0 px-0.5 sm:min-w-48 sm:max-w-xs md:max-w-64">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search prompts…"
                  className="h-9 min-h-9 border border-border/80 bg-white pl-9 pr-9 text-sm text-foreground focus-visible:ring-offset-0 dark:bg-white dark:text-foreground shadow-sm"
                  aria-label="Search prompts"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-neutral-100 hover:text-foreground dark:hover:bg-neutral-200"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>

              <Select
                value={filterLabel}
                onValueChange={(v) => setFilterLabel(v as FilterLabel)}
              >
                <SelectTrigger
                  size="default"
                  className="h-9 min-h-9 w-34 shrink-0 border border-border/80 bg-white py-0 text-sm text-foreground shadow-sm sm:w-36 dark:bg-white dark:text-foreground dark:hover:bg-neutral-50"
                >
                  <SelectValue placeholder="Strength" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All strengths</SelectItem>
                  <SelectItem value="Strong">Strong</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Weak">Weak</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortKey}
                onValueChange={(v) => setSortKey(v as SortKey)}
              >
                <SelectTrigger
                  size="default"
                  className="h-9 min-h-9 w-30 shrink-0 border border-border/80 bg-white py-0 text-sm text-foreground shadow-sm sm:w-32 dark:bg-white dark:text-foreground dark:hover:bg-neutral-50"
                >
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="visibility">Visibility</SelectItem>
                  <SelectItem value="created">Newest</SelectItem>
                </SelectContent>
              </Select>
            </>
          ) : null}
          <Button
            type="button"
            variant="default"
            size="default"
            className="h-9 min-h-9 shrink-0 gap-1.5 px-3 text-xs font-semibold"
            onClick={() => {
              setAddError(null);
              setAddDialogOpen(true);
            }}
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">New prompt</span>
            <span className="sm:hidden">New</span>
          </Button>
          {tracks.length > 0 && promptFiltersActive ? (
            <Button
              type="button"
              variant="outline"
              size="default"
              className="h-9 min-h-9 shrink-0 border-border/80 bg-white px-2.5 text-xs text-muted-foreground shadow-sm hover:bg-neutral-50 dark:bg-white dark:text-foreground dark:hover:bg-neutral-100"
              onClick={() => {
                setSearch("");
                setFilterLabel("All");
                setSortKey("score");
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>
      {/* ── Single control surface: KPIs · add prompt · filters · upsell ─── */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div
          className={
            tracks.length > 0
              ? "grid grid-cols-1 gap-3 p-3 sm:p-3.5 lg:grid-cols-12 lg:items-stretch lg:gap-4 lg:p-4"
              : "p-3 sm:p-4"
          }
        >
          {tracks.length > 0 ? (
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:col-span-12">
              <StatTile
                accent
                label="Avg score"
                value={`${stats.avgScore}`}
                sub="/100"
              />
              <StatTile
                accent
                label="Visibility"
                value={`${stats.visibility}%`}
                sub={`${stats.mentions} mentions`}
              />
              <StatTile
                label="Strong"
                value={`${stats.strong}`}
                sub={`of ${tracks.length}`}
              />
              <StatTile
                label="Runs"
                value={`${stats.totalRuns}`}
                sub={`${tracks.length} prompts`}
              />
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Use{" "}
              <span className="font-medium text-foreground">New prompt</span> to
              add your first query, or run a full analysis for suggestions.
            </p>
          )}
        </div>

        {showUpsell ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border bg-muted/20 px-3 py-1.5 sm:px-4">
            <Lock className="size-3 shrink-0 text-muted-foreground" />
            <p className="min-w-0 flex-1 text-[11px] leading-snug text-muted-foreground">
              <span className="font-medium text-foreground">
                ChatGPT, Claude, Perplexity
              </span>
              {" — "}Pro / Max.{" "}
              <span className="text-muted-foreground">
                Google and Bing on all plans.
              </span>
            </p>
            <Link
              href="/pricing"
              className="shrink-0 text-[11px] font-medium text-orange-600 underline-offset-4 hover:text-orange-700 hover:underline dark:text-orange-400 dark:hover:text-orange-300"
            >
              Upgrade
            </Link>
          </div>
        ) : null}
      </div>

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {tracks.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/10 py-10 text-center">
          <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-muted/40">
            <MessageSquare className="size-5 text-muted-foreground/45" />
          </div>
          <p className="text-sm font-medium text-foreground">No prompts yet</p>
          <p className="mx-auto mt-1 max-w-sm px-4 text-xs text-muted-foreground">
            Add a prompt with{" "}
            <span className="font-medium text-foreground">New prompt</span> or run
            a full analysis to generate suggestions.
          </p>
        </div>
      )}

      {/* ── Prompt cards ─────────────────────────────────────────────────── */}
      {visibleTracks.length > 0 && (
        <div className="space-y-1.5">
          {visibleTracks.map((track) => {
            const isExpanded = expandedId === track.id;
            const isRechecking = rechecking[track.id];
            const hasResults = track.results.length > 0;
            const label = track.ranking_label ?? "Weak";
            const ls = LABEL_STYLES[label] ?? LABEL_STYLES.Weak;
            const score = Math.round((track.score ?? 0) * 100);

            return (
              <div
                key={track.id}
                className={`overflow-hidden rounded-md border bg-card transition-colors ${isExpanded
                  ? "border-border shadow-sm"
                  : "border-border/80 hover:border-border"
                  }`}
              >
                {/* ── Card header ─────────────────────────────────────── */}
                <div
                  className={`flex cursor-pointer select-none items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-3.5 sm:py-3 ${isExpanded ? "bg-muted/40" : "hover:bg-muted/30"}`}
                  onClick={() => setExpandedId(isExpanded ? null : track.id)}
                >

                  {/* Chevron */}
                  <span
                    className={`shrink-0 ${isExpanded ? "text-muted-foreground" : "text-muted-foreground/35"}`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </span>

                  {/* Score */}
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background ${ls.bg} ring-1 ${ls.ring}`}
                  >
                    <span
                      className={`text-xs font-bold tabular-nums ${ls.text}`}
                    >
                      {hasResults ? score : "—"}
                    </span>
                  </div>

                  {/* Prompt info */}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium leading-snug tracking-tight text-foreground">
                      {track.prompt_text}
                    </p>

                    {/* Status row */}
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      {hasResults && (
                        <>
                          <span
                            className={`inline-flex items-center rounded-sm border border-border/80 px-1.5 py-px text-[10px] font-medium ${ls.bg} ${ls.text}`}
                          >
                            {label}
                          </span>
                          <span className="text-[10px] tabular-nums text-muted-foreground">
                            {track.visibility_pct ?? 0}% ·{" "}
                            {track.total_runs ?? 0} runs
                          </span>
                          {(track.avg_position ?? 0) > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              avg #{track.avg_position}
                            </span>
                          )}
                        </>
                      )}
                      {!hasResults && (
                        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Loader2 className="size-3 animate-spin text-muted-foreground/70" />{" "}
                          Checking…
                        </span>
                      )}
                      {track.is_custom && (
                        <span className="rounded border border-border/40 px-1 py-px text-[9px] text-muted-foreground">
                          Custom
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Engine status — brand logos */}
                  <div className="hidden shrink-0 items-center gap-1 sm:flex">
                    {enginesForUi.map((eng) => {
                      const res = track.results.filter(
                        (r) => r.engine === eng.key,
                      );
                      const hit = res.some((r) => r.brand_mentioned);
                      const has = res.length > 0;
                      return (
                        <EngineStatusIcon
                          key={eng.key}
                          engineKey={eng.key}
                          label={eng.label}
                          has={has}
                          hit={hit}
                        />
                      );
                    })}
                  </div>
                  {/* Actions */}
                  <div
  className="hidden sm:flex items-center gap-1.5 shrink-0 relative"
  onClick={(e) => e.stopPropagation()} // prevent card toggle
>
  <ActionsDropdown prompt={track.prompt_text} />
</div>
                  <button
                    type="button"
                    title="Re-check now"
                    disabled={isRechecking}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRecheck(track.id);
                    }}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground/40 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                  >
                    <RefreshCw
                      className={`size-3.5 ${isRechecking ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>

                {/* ── Expanded panel ───────────────────────────────────── */}
                {isExpanded &&
                  hasResults &&
                  (expandedMode === "blank" ? (
                    <div className="border-t border-border bg-muted/20 px-4 py-6">
                      <div className="rounded-md border border-dashed border-border bg-muted/10 py-8 text-center">
                        <p className="text-sm font-medium text-foreground">
                          Actions panel coming soon
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          This collapsible area is intentionally blank for
                          action implementation.
                        </p>
                      </div>
                    </div>
                  ) : (
                    (() => {
                      const allResults = track.results;
                      const mentioned = allResults.filter(
                        (r) => r.brand_mentioned,
                      );
                      const notMentioned = allResults.filter(
                        (r) => !r.brand_mentioned,
                      );
                      const positions = mentioned
                        .filter((r) => r.rank_position > 0)
                        .map((r) => r.rank_position);
                      const bestPos =
                        positions.length > 0 ? Math.min(...positions) : 0;
                      const avgPos =
                        positions.length > 0
                          ? positions.reduce((a, b) => a + b, 0) /
                          positions.length
                          : 0;
                      const posCount = allResults.filter(
                        (r) => r.sentiment === "positive",
                      ).length;
                      const neuCount = allResults.filter(
                        (r) => r.sentiment === "neutral",
                      ).length;
                      const negCount = allResults.filter(
                        (r) => r.sentiment === "negative",
                      ).length;
                      const sentTotal = posCount + neuCount + negCount;
                      const searchResults = allResults.filter(
                        (r) => r.engine === "google" || r.engine === "bing",
                      );
                      const searchMentioned = searchResults.filter(
                        (r) => r.brand_mentioned,
                      ).length;

                      return (
                        <div className="border-t border-border bg-muted/25">
                          <div className="space-y-3 p-3 sm:p-3.5">
                            {/* ── Summary metrics (dense table-style) ───── */}
                            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-4">
                              <div className="bg-card p-2.5 sm:p-3">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                  Visibility
                                </p>
                                <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground sm:text-xl">
                                  {track.visibility_pct ?? 0}
                                  <span className="text-sm font-medium text-muted-foreground">
                                    %
                                  </span>
                                </p>
                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                  {mentioned.length} of {allResults.length}{" "}
                                  citations
                                </p>
                                <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full rounded-full bg-orange-500 dark:bg-orange-500/90"
                                    style={{
                                      width: `${track.visibility_pct ?? 0}%`,
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="bg-card p-2.5 sm:p-3">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                  Best rank
                                </p>
                                <p
                                  className={`mt-0.5 text-lg font-semibold tabular-nums sm:text-xl ${bestPos > 0 ? "text-foreground" : "text-muted-foreground/50"}`}
                                >
                                  {bestPos > 0 ? `#${bestPos}` : "—"}
                                </p>
                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                  {avgPos > 0
                                    ? `Avg ${avgPos.toFixed(1)}`
                                    : "No rank data"}
                                </p>
                              </div>
                              <div className="bg-card p-2.5 sm:p-3">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                  Engines
                                </p>
                                <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground sm:text-xl">
                                  {new Set(mentioned.map((r) => r.engine)).size}
                                  <span className="text-sm font-normal text-muted-foreground">
                                    /
                                    {
                                      new Set(allResults.map((r) => r.engine))
                                        .size
                                    }
                                  </span>
                                </p>
                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                  With brand mention
                                </p>
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                  {enginesForUi.map((eng) => {
                                    const hit = allResults
                                      .filter((r) => r.engine === eng.key)
                                      .some((r) => r.brand_mentioned);
                                    const has = allResults.some(
                                      (r) => r.engine === eng.key,
                                    );
                                    return (
                                      <EngineStatusIcon
                                        key={eng.key}
                                        engineKey={eng.key}
                                        label={eng.label}
                                        has={has}
                                        hit={hit}
                                        size="md"
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="bg-card p-2.5 sm:p-3">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                  Search
                                </p>
                                <p
                                  className={`mt-0.5 text-lg font-semibold tabular-nums sm:text-xl ${searchMentioned > 0 ? "text-foreground" : "text-muted-foreground/50"}`}
                                >
                                  {searchMentioned}
                                  <span className="text-sm font-normal text-muted-foreground">
                                    /{searchResults.length}
                                  </span>
                                </p>
                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                  {searchMentioned > 0
                                    ? "Google & Bing"
                                    : "No search results"}
                                </p>
                              </div>
                            </div>

                            {/* ── Sentiment + factors ─────────────────── */}
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              {sentTotal > 0 && (
                                <div className="rounded-md border border-border bg-card p-3">
                                  <div className="flex items-baseline justify-between gap-2">
                                    <p className="text-[11px] font-medium text-foreground">
                                      Sentiment
                                    </p>
                                    <span className="text-[10px] tabular-nums text-muted-foreground">
                                      {sentTotal} responses
                                    </span>
                                  </div>
                                  <div className="mt-2 flex h-1 overflow-hidden rounded-full bg-muted">
                                    {posCount > 0 && (
                                      <div
                                        className="bg-emerald-600/80 dark:bg-emerald-500/70"
                                        style={{
                                          width: `${(posCount / sentTotal) * 100}%`,
                                        }}
                                      />
                                    )}
                                    {neuCount > 0 && (
                                      <div
                                        className="bg-muted-foreground/25"
                                        style={{
                                          width: `${(neuCount / sentTotal) * 100}%`,
                                        }}
                                      />
                                    )}
                                    {negCount > 0 && (
                                      <div
                                        className="bg-rose-600/70 dark:bg-rose-500/60"
                                        style={{
                                          width: `${(negCount / sentTotal) * 100}%`,
                                        }}
                                      />
                                    )}
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                                    <span>
                                      <span className="font-medium tabular-nums text-foreground">
                                        {posCount}
                                      </span>{" "}
                                      positive
                                    </span>
                                    <span>
                                      <span className="font-medium tabular-nums text-foreground">
                                        {neuCount}
                                      </span>{" "}
                                      neutral
                                    </span>
                                    <span>
                                      <span className="font-medium tabular-nums text-foreground">
                                        {negCount}
                                      </span>{" "}
                                      negative
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div
                                className={`rounded-md border border-border bg-card p-3 ${sentTotal === 0 ? "md:col-span-2" : ""}`}
                              >
                                <p className="text-[11px] font-medium text-foreground">
                                  Ranking factors
                                </p>
                                <div className="mt-2.5 space-y-2">
                                  {FACTORS.map((f) => {
                                    const val = Math.round(
                                      ((track[f.key] as number) ?? 0) * 100,
                                    );
                                    const isCore = f.weightNum > 0;
                                    return (
                                      <div
                                        key={f.key}
                                        className="flex min-w-0 items-center gap-2 sm:gap-3"
                                      >
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-baseline justify-between gap-2">
                                            <span
                                              className={`truncate text-[11px] ${isCore ? "font-medium text-foreground" : "text-muted-foreground"}`}
                                            >
                                              {f.fullLabel}
                                            </span>
                                            <span className="shrink-0 tabular-nums text-[11px] text-muted-foreground">
                                              <span className="text-[10px]">
                                                {f.weight}
                                              </span>
                                              {" · "}
                                              <span className="font-medium text-foreground">
                                                {val}
                                              </span>
                                            </span>
                                          </div>
                                          <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                                            <div
                                              className={`h-full rounded-full transition-all ${isCore
                                                ? "bg-orange-500/90 dark:bg-orange-400/75"
                                                : "bg-muted-foreground/30"
                                                }`}
                                              style={{ width: `${val}%` }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* ── Brand mention snippets ─────────────────── */}
                            {mentioned.length > 0 && (
                              <div>
                                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                                  <CheckCircle2 className="size-3.5 text-orange-600 dark:text-orange-400" />
                                  Mentions
                                </p>
                                <div className="max-h-40 space-y-1.5 overflow-y-auto pr-0.5">
                                  {mentioned.map((r) => {
                                    const eng = ENGINES.find(
                                      (e) => e.key === r.engine,
                                    );
                                    const openResponse = () =>
                                      setViewingResponse(r);
                                    return (
                                      <div
                                        key={r.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={openResponse}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                          ) {
                                            e.preventDefault();
                                            openResponse();
                                          }
                                        }}
                                        className="group cursor-pointer rounded-md border border-border bg-card transition-colors hover:bg-muted"
                                      >
                                        <div
                                          className="border-l-2 py-2 pl-3 pr-2"
                                          style={{
                                            borderLeftColor:
                                              eng?.color ?? "#737373",
                                          }}
                                        >
                                          <div className="mb-1 flex flex-wrap items-center gap-1.5">
                                            <span className="text-[11px] font-medium text-foreground">
                                              {eng?.label}
                                            </span>
                                            <span
                                              className={`rounded border px-1 py-px text-[9px] capitalize ${SENTIMENT_STYLES[r.sentiment as Sentiment]?.pill}`}
                                            >
                                              {r.sentiment}
                                            </span>
                                            {r.rank_position > 0 && (
                                              <span className="rounded border border-border bg-muted/50 px-1 py-px text-[10px] font-medium tabular-nums text-foreground">
                                                #{r.rank_position}
                                              </span>
                                            )}
                                            <button
                                              type="button"
                                              className="ml-auto inline-flex shrink-0 rounded p-1 text-muted-foreground transition hover:bg-orange-100 hover:text-orange-700 dark:hover:bg-orange-950/50 dark:hover:text-orange-300"
                                              aria-label={`View full response from ${eng?.label ?? r.engine}`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openResponse();
                                              }}
                                            >
                                              <Eye className="size-3.5" />
                                            </button>
                                          </div>
                                          <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                                            {(
                                              r.response_text?.trim() ||
                                              "No response text stored."
                                            ).slice(0, 200)}
                                            {(r.response_text?.length ?? 0) >
                                              200
                                              ? "…"
                                              : ""}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* ── Not mentioned ──────────────────────────── */}
                            {notMentioned.length > 0 && (
                              <div>
                                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                                  <XCircle className="size-3.5 opacity-70" />
                                  No mention
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {[
                                    ...new Set(
                                      notMentioned.map((r) => r.engine),
                                    ),
                                  ].map((engine) => {
                                    const eng = ENGINES.find(
                                      (e) => e.key === engine,
                                    );
                                    const cnt = notMentioned.filter(
                                      (r) => r.engine === engine,
                                    ).length;
                                    return (
                                      <div
                                        key={engine}
                                        className="flex items-center gap-1.5 rounded-md border border-border bg-muted/25 px-2 py-1"
                                      >
                                        <div
                                          className="size-1.5 rounded-full opacity-70"
                                          style={{
                                            backgroundColor:
                                              eng?.color ?? "#737373",
                                          }}
                                        />
                                        <span className="text-[11px] text-foreground">
                                          {eng?.label ?? engine}
                                        </span>
                                        <span className="text-[10px] tabular-nums text-muted-foreground">
                                          ×{cnt}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  ))}

                {/* Pending state (no results yet) */}
                {isExpanded && !hasResults && (
                  <div className="border-t border-border bg-muted/20 px-4 py-6 text-center">
                    <Loader2 className="mx-auto mb-2 size-4 animate-spin text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">
                      Running checks…
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No results after filter */}
      {tracks.length > 0 && visibleTracks.length === 0 && (
        <div className="rounded-lg border border-dashed border-border/60 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing matches this filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilterLabel("All");
            }}
            className="mt-2 text-xs font-medium text-foreground underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ── Response viewer (portal: avoids overflow/transform clipping) ─── */}
      {portalEl &&
        viewingResponse &&
        createPortal(
          <div
            className="fixed inset-0 z-200 flex items-end justify-center bg-black/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-[2px] sm:items-center sm:p-6"
            onClick={() => setViewingResponse(null)}
            role="presentation"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="prompt-response-modal-title"
              className="flex max-h-[min(85vh,800px)] w-full min-h-0 max-w-2xl flex-col overflow-hidden rounded-t-lg border border-border border-t-[3px] border-t-orange-500 bg-card shadow-2xl sm:rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                  <div
                    className="size-2.5 shrink-0 rounded-full ring-2 ring-border"
                    style={{
                      backgroundColor:
                        ENGINES.find((e) => e.key === viewingResponse.engine)
                          ?.color ?? "#737373",
                    }}
                  />
                  <h2
                    id="prompt-response-modal-title"
                    className="text-sm font-semibold text-foreground"
                  >
                    {ENGINES.find((e) => e.key === viewingResponse.engine)
                      ?.label ?? viewingResponse.engine}
                  </h2>
                  {viewingResponse.brand_mentioned ? (
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] capitalize ${SENTIMENT_STYLES[viewingResponse.sentiment as Sentiment]?.pill}`}
                    >
                      {viewingResponse.sentiment}
                    </span>
                  ) : (
                    <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                      Not mentioned
                    </span>
                  )}
                  {viewingResponse.rank_position > 0 && (
                    <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium tabular-nums text-foreground">
                      #{viewingResponse.rank_position}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setViewingResponse(null)}
                  className="shrink-0 rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
                <p className="wrap-break-word whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {viewingResponse.response_text?.trim() ||
                    "No response text was stored for this run."}
                </p>
              </div>
              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-muted/20 px-4 py-3 sm:px-5">
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {new Date(viewingResponse.checked_at).toLocaleString()}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setViewingResponse(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>,
          portalEl,
        )}

      {portalEl &&
        addDialogOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-220 flex items-end justify-center bg-black/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-[2px] sm:items-center sm:p-6"
            onClick={() => {
              if (!adding) setAddDialogOpen(false);
            }}
            role="presentation"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="prompt-track-add-dialog-title"
              className="flex w-full max-w-lg flex-col rounded-t-lg border border-border border-t-[3px] border-t-orange-500 bg-card shadow-2xl sm:rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
                <h2
                  id="prompt-track-add-dialog-title"
                  className="text-sm font-semibold text-foreground"
                >
                  Track a new prompt
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    if (!adding) setAddDialogOpen(false);
                  }}
                  className="shrink-0 rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                  disabled={adding}
                >
                  <X className="size-4" />
                </button>
              </div>
              <form
                onSubmit={(e) => void handleAdd(e)}
                className="flex flex-col gap-3 px-4 py-4 sm:px-5 sm:py-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="prompt-track-add-textarea">Prompt</Label>
                  <textarea
                    id="prompt-track-add-textarea"
                    ref={addPromptTextareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the query you want to track across engines…"
                    disabled={adding}
                    rows={5}
                    className={cn(
                      "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground w-full min-w-0 resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none",
                      "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                      "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  />
                </div>
                {addError ? (
                  <p className="text-xs text-destructive">{addError}</p>
                ) : null}
                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={adding}
                    onClick={() => setAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={adding || !text.trim()}
                    className="bg-orange-600 px-4 font-semibold text-white hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500"
                  >
                    {adding ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    ) : null}
                    {adding ? "Adding…" : "Track prompt"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          portalEl,
        )}
    </div>
  );
}

// ── Small helper components ───────────────────────────────────────────────────

function EngineStatusIcon({
  engineKey,
  label,
  has,
  hit,
  size = "sm",
}: {
  engineKey: Engine;
  label: string;
  has: boolean;
  hit: boolean;
  size?: "sm" | "md";
}) {
  const src = ENGINE_LOGO_SRC[engineKey];
  const title = `${label}: ${!has ? "No data" : hit ? "Mentioned" : "Not mentioned"}`;
  const box = size === "md" ? "size-6" : "size-[18px]";
  const imgClass = size === "md" ? "size-4" : "size-3.5";
  return (
    <span
      title={title}
      className={`inline-flex ${box} shrink-0 items-center justify-center rounded-sm border bg-white p-px dark:bg-muted/40 ${has && hit
        ? "border-orange-400/90 ring-1 ring-orange-200/70 dark:border-orange-600 dark:ring-orange-900/60"
        : has
          ? "border-border opacity-80"
          : "border-border opacity-40 grayscale"
        }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- small static SVGs from /public */}
      <img src={src} alt="" className={`${imgClass} object-contain`} />
    </span>
  );
}

/** KPI cell — optional orange left accent to match product theme. */
function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-md border border-border/80 bg-muted/20 px-2.5 py-2 sm:px-3 sm:py-2 ${accent
        ? "border-l-[3px] border-l-orange-500 pl-2 sm:pl-2.5 dark:border-l-orange-400"
        : ""
        }`}
    >
      <p className="text-[10px] font-medium leading-none tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-1 gap-y-0">
        <span
          className={`text-base font-semibold tabular-nums leading-none sm:text-lg ${accent ? "text-orange-700 dark:text-orange-300" : "text-foreground"
            }`}
        >
          {value}
        </span>
        <span className="text-[10px] text-muted-foreground">{sub}</span>
      </p>
    </div>
  );
}
