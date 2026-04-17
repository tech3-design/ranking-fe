"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2, CheckCircle2, XCircle, Plus, RefreshCw,
  ChevronDown, ChevronRight, Eye, TrendingUp, Search,
  MessageSquare, BarChart3, Target, Lock, Zap, Activity,
  Globe, Bot, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addPromptTrack, recheckPrompt } from "@/lib/api/analyzer";
import type { PromptTrack, PromptResult, Engine, Sentiment } from "@/lib/api/analyzer";
import { useSession } from "@/lib/auth-client";
import { getSubscriptionStatus } from "@/lib/api/payments";

// ── Engine config ─────────────────────────────────────────────────────────────
const ENGINES: Array<{ key: Engine; label: string; color: string; type: "ai" | "search" }> = [
  { key: "google",     label: "Google",     color: "#ea4335", type: "search" },
  { key: "bing",       label: "Bing",       color: "#00809d", type: "search" },
  { key: "chatgpt",    label: "ChatGPT",    color: "#10a37f", type: "ai" },
  { key: "claude",     label: "Claude",     color: "#d97706", type: "ai" },
  { key: "gemini",     label: "Gemini",     color: "#4285f4", type: "ai" },
  { key: "perplexity", label: "Perplexity", color: "#7c3aed", type: "ai" },
];

// ── 5-Factor config — all in brand primary ───────────────────────────────────
const FACTORS = [
  {
    key: "factor_authority"       as const,
    label: "Authority",
    fullLabel: "Authority & Credibility",
    weight: "40%",
    weightNum: 40,
    description: "Cross-engine citation rate, domain trust signals and E-E-A-T",
    color: "#F95C4B",   // primary
    bg: "bg-primary/10",
    text: "text-primary",
  },
  {
    key: "factor_content_quality" as const,
    label: "Content",
    fullLabel: "Content Quality & Utility",
    weight: "35%",
    weightNum: 35,
    description: "Positive sentiment rate, direct-answer mechanism and original data",
    color: "#F95C4B",
    bg: "bg-primary/10",
    text: "text-primary",
  },
  {
    key: "factor_structural"      as const,
    label: "Structure",
    fullLabel: "Structural Extractability",
    weight: "25%",
    weightNum: 25,
    description: "Top-3 position rate, NLP-friendly formatting and schema signals",
    color: "#F95C4B",
    bg: "bg-primary/10",
    text: "text-primary",
  },
  {
    key: "factor_semantic"        as const,
    label: "Semantic",
    fullLabel: "Semantic Alignment",
    weight: "Signal",
    weightNum: 0,
    description: "Prompt-to-brand relevance: mention rate × confidence",
    color: "#171717",   // foreground (supplementary = subdued)
    bg: "bg-muted/50",
    text: "text-foreground/70",
  },
  {
    key: "factor_third_party"     as const,
    label: "3rd Party",
    fullLabel: "Third-Party Validation",
    weight: "Signal",
    weightNum: 0,
    description: "Google & Bing presence combined with cross-AI-model citation rate",
    color: "#171717",
    bg: "bg-muted/50",
    text: "text-foreground/70",
  },
] as const;

// ── Style helpers ─────────────────────────────────────────────────────────────
const SENTIMENT_STYLES: Record<Sentiment, { pill: string; dot: string }> = {
  positive: { pill: "bg-primary/10 text-primary border-primary/20",           dot: "bg-primary" },
  neutral:  { pill: "bg-muted/50 text-muted-foreground border-border",        dot: "bg-muted-foreground/40" },
  negative: { pill: "bg-foreground/8 text-foreground/60 border-foreground/15", dot: "bg-foreground/30" },
};

const LABEL_STYLES: Record<string, { ring: string; text: string; bg: string; glow: string }> = {
  Strong:   { ring: "ring-primary/50",           text: "text-primary",            bg: "bg-primary/10",         glow: "shadow-primary/20" },
  Moderate: { ring: "ring-foreground/20",         text: "text-foreground/70",      bg: "bg-foreground/5",       glow: "shadow-foreground/10" },
  Weak:     { ring: "ring-foreground/10",         text: "text-muted-foreground",   bg: "bg-muted/50",           glow: "" },
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
}

// ── Main component ────────────────────────────────────────────────────────────
export function PromptTracker({
  slug,
  tracks,
  onAdded,
  onRechecked,
  expandedMode = "full",
}: PromptTrackerProps) {
  const { data: session } = useSession();
  const [planEngines, setPlanEngines] = useState<Engine[] | null>(null);
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [rechecking, setRechecking] = useState<Record<number, boolean>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [viewingResponse, setViewingResponse] = useState<PromptResult | null>(null);
  const [search, setSearch] = useState("");
  const [filterLabel, setFilterLabel] = useState<FilterLabel>("All");
  const [sortKey, setSortKey] = useState<SortKey>("score");

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) { setPlanEngines(null); return; }
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
    if (total === 0) return { avgScore: 0, visibility: 0, strong: 0, weak: 0, totalRuns: 0, mentions: 0 };
    const avgScore = Math.round(tracks.reduce((s, t) => s + (t.score ?? 0), 0) / total * 100);
    const totalRuns = tracks.reduce((s, t) => s + (t.total_runs ?? 0), 0);
    const mentions  = tracks.reduce((s, t) => s + (t.mentions ?? 0), 0);
    const visibility = totalRuns > 0 ? Math.round((mentions / totalRuns) * 100) : 0;
    const strong = tracks.filter((t) => t.ranking_label === "Strong").length;
    const weak   = tracks.filter((t) => t.ranking_label === "Weak").length;
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
    if (sortKey === "score") list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    else if (sortKey === "visibility") list.sort((a, b) => (b.visibility_pct ?? 0) - (a.visibility_pct ?? 0));
    else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [tracks, search, filterLabel, sortKey]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setAdding(true);
    setAddError(null);
    try {
      const track = await addPromptTrack(slug, trimmed);
      onAdded(track);
      setText("");
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
    } catch { /* ignore */ }
    finally { setRechecking((p) => ({ ...p, [trackId]: false })); }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Top summary strip ───────────────────────────────────────────── */}
      {tracks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<Target className="w-4 h-4" />}
            label="Avg AI Score"
            value={`${stats.avgScore}`}
            sub="/100"
            color="text-primary"
            accent="from-primary/15 to-primary/5"
          />
          <StatCard
            icon={<BarChart3 className="w-4 h-4" />}
            label="Brand Visibility"
            value={`${stats.visibility}%`}
            sub={`${stats.mentions} mentions`}
            color="text-primary"
            accent="from-primary/10 to-primary/3"
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Strong Prompts"
            value={`${stats.strong}`}
            sub={`of ${tracks.length}`}
            color="text-foreground"
            accent="from-muted/80 to-muted/20"
          />
          <StatCard
            icon={<Activity className="w-4 h-4" />}
            label="Total Runs"
            value={`${stats.totalRuns}`}
            sub={`${tracks.length} prompts`}
            color="text-foreground"
            accent="from-muted/80 to-muted/20"
          />
        </div>
      )}


      {/* ── Add prompt form ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
          <Plus className="w-3.5 h-3.5 text-primary" /> Add Custom Prompt
        </p>
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. What are the best GEO tools for e-commerce in 2026?"
            className="flex-1 text-sm bg-background"
            disabled={adding}
          />
          <Button type="submit" disabled={adding || !text.trim()} className="shrink-0">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {adding ? "Checking..." : "Track"}
          </Button>
        </form>
        {addError && <p className="text-xs text-destructive mt-2">{addError}</p>}
      </div>

      {/* ── Upsell banner ────────────────────────────────────────────────── */}
      {showUpsell && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs">
          <Lock className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="text-muted-foreground">
            <strong className="text-foreground">ChatGPT, Claude &amp; Perplexity</strong> are on Pro / Max plans.
            Google &amp; Bing are included on all plans.
          </span>
          <Link href="/pricing" className="ml-auto font-semibold text-primary hover:underline underline-offset-2">
            Upgrade →
          </Link>
        </div>
      )}

      {/* ── Filter / Sort bar ────────────────────────────────────────────── */}
      {tracks.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prompts…"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
          {/* Label filter */}
          <div className="flex items-center gap-1">
            {(["All", "Strong", "Moderate", "Weak"] as FilterLabel[]).map((l) => (
              <button
                key={l}
                onClick={() => setFilterLabel(l)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition ${
                  filterLabel === l
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          {/* Sort */}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="px-2.5 py-1 text-[11px] rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            <option value="score">Sort: Score</option>
            <option value="visibility">Sort: Visibility</option>
            <option value="created">Sort: Newest</option>
          </select>
          <span className="text-[11px] text-muted-foreground ml-auto">{visibleTracks.length} of {tracks.length}</span>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {tracks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/50 py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No prompts tracked yet</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Add a custom prompt above, or run a full analysis to auto-generate prompts for your brand.
          </p>
        </div>
      )}

      {/* ── Prompt cards ─────────────────────────────────────────────────── */}
      {visibleTracks.length > 0 && (
        <div className="space-y-2.5">
          {visibleTracks.map((track) => {
            const isExpanded  = expandedId === track.id;
            const isRechecking = rechecking[track.id];
            const hasResults  = track.results.length > 0;
            const label       = track.ranking_label ?? "Weak";
            const ls          = LABEL_STYLES[label] ?? LABEL_STYLES.Weak;
            const score       = Math.round((track.score ?? 0) * 100);

            return (
              <div
                key={track.id}
                className={`rounded-2xl border bg-card overflow-hidden transition-all ${
                  isExpanded
                    ? "border-primary/20 shadow-lg"
                    : "border-border/50 hover:border-border hover:shadow-sm"
                }`}
                style={{ boxShadow: isExpanded ? "0 4px 20px rgba(249,92,75,0.08)" : undefined }}
              >
                {/* ── Card header ─────────────────────────────────────── */}
                <div
                  className={`flex items-center gap-3 px-4 py-4 cursor-pointer select-none transition-colors ${isExpanded ? "bg-primary/3" : "hover:bg-muted/20"}`}
                  onClick={() => setExpandedId(isExpanded ? null : track.id)}
                >
                  {/* Chevron */}
                  <span className={`shrink-0 transition-colors ${isExpanded ? "text-primary/60" : "text-muted-foreground/30"}`}>
                    {isExpanded
                      ? <ChevronDown className="w-4 h-4" />
                      : <ChevronRight className="w-4 h-4" />}
                  </span>

                  {/* Score ring — larger, cleaner */}
                  <div className={`relative w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl ring-2 ${ls.ring} ${ls.bg}`}
                    style={{ boxShadow: label === "Strong" ? "0 0 12px rgba(249,92,75,0.15)" : undefined }}>
                    <span className={`text-sm font-black tabular-nums ${ls.text}`}>
                      {hasResults ? score : "—"}
                    </span>
                  </div>

                  {/* Prompt info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-snug line-clamp-1 tracking-tight">
                      {track.prompt_text}
                    </p>

                    {/* Status row */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {hasResults && (
                        <>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${ls.bg} ${ls.text} border-current/20`}>
                            {label}
                          </span>
                          <span className="text-[11px] text-muted-foreground/80 tabular-nums">
                            {track.visibility_pct ?? 0}% visible
                          </span>
                          {(track.avg_position ?? 0) > 0 && (
                            <span className="text-[11px] text-muted-foreground/80">
                              #{track.avg_position} avg pos
                            </span>
                          )}
                          <span className="text-[11px] text-muted-foreground/50">
                            {track.total_runs ?? 0} runs
                          </span>
                        </>
                      )}
                      {!hasResults && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin text-primary/60" /> Checking engines…
                        </span>
                      )}
                      {track.is_custom && (
                        <span className="text-[10px] text-muted-foreground/50 border border-border/50 rounded-full px-1.5 py-0.5">
                          custom
                        </span>
                      )}
                    </div>

                    {/* Mini factor bars */}
                    {hasResults && (
                      <div className="flex gap-2.5 mt-2.5 items-center">
                        {FACTORS.slice(0, 3).map((f) => {
                          const val = Math.round(((track[f.key] as number) ?? 0) * 100);
                          return (
                            <div key={f.key} title={`${f.fullLabel}: ${val}/100`} className="flex flex-col gap-0.5">
                              <div className="w-14 h-1 bg-muted/50 rounded-full overflow-hidden">
                                <div className="h-full bg-primary/70 rounded-full transition-all" style={{ width: `${val}%` }} />
                              </div>
                              <span className="text-[8px] text-muted-foreground/50 tabular-nums">{f.label} {val}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Engine status dots — use engine brand colors as identifiers */}
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                    {enginesForUi.map((eng) => {
                      const res = track.results.filter((r) => r.engine === eng.key);
                      const hit = res.some((r) => r.brand_mentioned);
                      const has = res.length > 0;
                      return (
                        <div
                          key={eng.key}
                          title={`${eng.label}: ${!has ? "No data" : hit ? "Mentioned" : "Not mentioned"}`}
                          className="w-2.5 h-2.5 rounded-full transition-all"
                          style={{
                            backgroundColor: has && hit ? eng.color : has ? `${eng.color}25` : "#d4d4d425",
                            boxShadow: has && hit ? `0 0 6px ${eng.color}50` : undefined,
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Recheck */}
                  <button
                    type="button"
                    title="Re-check now"
                    disabled={isRechecking}
                    onClick={(e) => { e.stopPropagation(); handleRecheck(track.id); }}
                    className="rounded-xl p-2 text-muted-foreground/30 hover:bg-primary/8 hover:text-primary transition-all disabled:opacity-30 shrink-0"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRechecking ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {/* ── Expanded panel ───────────────────────────────────── */}
                {isExpanded && hasResults && (
                  expandedMode === "blank" ? (
                    <div className="border-t border-border/60 bg-muted/5 px-4 py-8">
                      <div className="rounded-2xl border border-dashed border-border/60 bg-card/50 py-10 text-center">
                        <p className="text-sm font-medium text-foreground">Actions panel coming soon</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          This collapsible area is intentionally blank for action implementation.
                        </p>
                      </div>
                    </div>
                  ) : (() => {
                    const allResults      = track.results;
                    const mentioned       = allResults.filter((r) => r.brand_mentioned);
                    const notMentioned    = allResults.filter((r) => !r.brand_mentioned);
                    const positions       = mentioned.filter((r) => r.rank_position > 0).map((r) => r.rank_position);
                    const bestPos         = positions.length > 0 ? Math.min(...positions) : 0;
                    const avgPos          = positions.length > 0 ? positions.reduce((a, b) => a + b, 0) / positions.length : 0;
                    const posCount        = allResults.filter((r) => r.sentiment === "positive").length;
                    const neuCount        = allResults.filter((r) => r.sentiment === "neutral").length;
                    const negCount        = allResults.filter((r) => r.sentiment === "negative").length;
                    const sentTotal       = posCount + neuCount + negCount;
                    const searchResults   = allResults.filter((r) => r.engine === "google" || r.engine === "bing");
                    const searchMentioned = searchResults.filter((r) => r.brand_mentioned).length;

                    return (
                      <div className="border-t border-border/60 bg-muted/5">
                        <div className="p-4 space-y-4">

                          {/* ── Metric cards ──────────────────────────── */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* Visibility */}
                            <div className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary/8 to-primary/3 p-4 flex flex-col gap-1.5 relative overflow-hidden"
                              style={{ boxShadow: "0 2px 12px rgba(249,92,75,0.08)" }}>
                              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-primary/5" />
                              <div className="flex items-center justify-between relative">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-primary/50">Visibility</span>
                                <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center">
                                  <BarChart3 className="w-3 h-3 text-primary" />
                                </div>
                              </div>
                              <p className="text-4xl font-black tabular-nums text-primary leading-none relative">
                                {track.visibility_pct ?? 0}<span className="text-lg">%</span>
                              </p>
                              <p className="text-[10px] text-primary/50 relative">
                                {mentioned.length} of {allResults.length} cited
                              </p>
                              <div className="h-1 bg-primary/15 rounded-full overflow-hidden relative mt-1">
                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${track.visibility_pct ?? 0}%` }} />
                              </div>
                            </div>

                            {/* Best Position */}
                            <div className={`rounded-2xl border p-4 flex flex-col gap-1.5 relative overflow-hidden ${
                              bestPos > 0 ? "border-primary/20 bg-linear-to-br from-primary/8 to-primary/3" : "border-border/40 bg-muted/15"
                            }`} style={bestPos > 0 ? { boxShadow: "0 2px 12px rgba(249,92,75,0.08)" } : undefined}>
                              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-primary/5" />
                              <div className="flex items-center justify-between relative">
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${bestPos > 0 ? "text-primary/50" : "text-muted-foreground/50"}`}>Best Rank</span>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${bestPos > 0 ? "bg-primary/15" : "bg-muted/40"}`}>
                                  <Target className={`w-3 h-3 ${bestPos > 0 ? "text-primary" : "text-muted-foreground/40"}`} />
                                </div>
                              </div>
                              <p className={`text-4xl font-black tabular-nums leading-none relative ${bestPos > 0 ? "text-primary" : "text-muted-foreground/25"}`}>
                                {bestPos > 0 ? `#${bestPos}` : "—"}
                              </p>
                              <p className={`text-[10px] relative ${bestPos > 0 ? "text-primary/50" : "text-muted-foreground/40"}`}>
                                {avgPos > 0 ? `avg #${avgPos.toFixed(1)}` : "not ranked yet"}
                              </p>
                            </div>

                            {/* Engines Citing */}
                            <div className="rounded-2xl border border-border/40 bg-muted/15 p-4 flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Engines</span>
                                <div className="w-6 h-6 rounded-lg bg-muted/60 flex items-center justify-center">
                                  <Bot className="w-3 h-3 text-foreground/40" />
                                </div>
                              </div>
                              <p className="text-4xl font-black tabular-nums text-foreground leading-none">
                                {new Set(mentioned.map((r) => r.engine)).size}
                                <span className="text-lg font-bold text-muted-foreground/30">/{new Set(allResults.map((r) => r.engine)).size}</span>
                              </p>
                              <p className="text-[10px] text-muted-foreground/50">mention your brand</p>
                              <div className="flex gap-1.5 flex-wrap mt-1">
                                {enginesForUi.map((eng) => {
                                  const hit = allResults.filter((r) => r.engine === eng.key).some((r) => r.brand_mentioned);
                                  const has = allResults.some((r) => r.engine === eng.key);
                                  return (
                                    <div key={eng.key} title={eng.label} className="w-2.5 h-2.5 rounded-full transition-all"
                                      style={{
                                        backgroundColor: has && hit ? eng.color : has ? `${eng.color}25` : "#d4d4d420",
                                        boxShadow: has && hit ? `0 0 5px ${eng.color}50` : undefined,
                                      }} />
                                  );
                                })}
                              </div>
                            </div>

                            {/* Search Presence */}
                            <div className={`rounded-2xl border p-4 flex flex-col gap-1.5 relative overflow-hidden ${
                              searchMentioned > 0 ? "border-primary/20 bg-linear-to-br from-primary/8 to-primary/3" : "border-border/40 bg-muted/15"
                            }`} style={searchMentioned > 0 ? { boxShadow: "0 2px 12px rgba(249,92,75,0.08)" } : undefined}>
                              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-primary/5" />
                              <div className="flex items-center justify-between relative">
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${searchMentioned > 0 ? "text-primary/50" : "text-muted-foreground/50"}`}>Search</span>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${searchMentioned > 0 ? "bg-primary/15" : "bg-muted/40"}`}>
                                  <Globe className={`w-3 h-3 ${searchMentioned > 0 ? "text-primary" : "text-muted-foreground/40"}`} />
                                </div>
                              </div>
                              <p className={`text-4xl font-black tabular-nums leading-none relative ${searchMentioned > 0 ? "text-primary" : "text-muted-foreground/25"}`}>
                                {searchMentioned}<span className={`text-lg font-bold ${searchMentioned > 0 ? "text-primary/40" : "text-muted-foreground/20"}`}>/{searchResults.length}</span>
                              </p>
                              <p className={`text-[10px] relative ${searchMentioned > 0 ? "text-primary/50" : "text-muted-foreground/40"}`}>
                                {searchMentioned > 0 ? "Google & Bing found you" : "not in search yet"}
                              </p>
                            </div>
                          </div>

                          {/* ── Sentiment + Factors side-by-side ──────── */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                            {/* Sentiment card */}
                            {sentTotal > 0 && (
                              <div className="rounded-2xl border border-border/50 bg-card p-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-xs font-bold text-foreground tracking-tight">Sentiment</p>
                                  <span className="text-[9px] text-muted-foreground/50 bg-muted/50 px-2 py-0.5 rounded-full border border-border/30">
                                    {sentTotal} responses
                                  </span>
                                </div>
                                {/* Stacked bar */}
                                <div className="flex h-2.5 rounded-full overflow-hidden mb-3 bg-muted/30">
                                  {posCount > 0 && (
                                    <div className="bg-primary transition-all" style={{ width: `${(posCount / sentTotal) * 100}%` }} />
                                  )}
                                  {neuCount > 0 && (
                                    <div className="bg-muted-foreground/20 transition-all" style={{ width: `${(neuCount / sentTotal) * 100}%` }} />
                                  )}
                                  {negCount > 0 && (
                                    <div className="bg-foreground/20 transition-all" style={{ width: `${(negCount / sentTotal) * 100}%` }} />
                                  )}
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  {[
                                    { label: "Positive", count: posCount, dotClass: "bg-primary", numClass: "text-primary" },
                                    { label: "Neutral",  count: neuCount, dotClass: "bg-muted-foreground/30", numClass: "text-muted-foreground" },
                                    { label: "Negative", count: negCount, dotClass: "bg-foreground/25", numClass: "text-foreground/50" },
                                  ].map((s) => (
                                    <div key={s.label} className="rounded-xl bg-muted/30 border border-border/30 py-2.5 px-1 text-center">
                                      <p className={`text-xl font-black tabular-nums ${s.numClass}`}>{s.count}</p>
                                      <div className="flex items-center justify-center gap-1 mt-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${s.dotClass}`} />
                                        <span className="text-[9px] text-muted-foreground/60">{s.label}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 5-Factor scores card */}
                            <div className="rounded-2xl border border-border/50 bg-card p-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-bold text-foreground tracking-tight">Ranking Factors</p>
                                <span className="text-[9px] font-medium text-muted-foreground/50 bg-muted/50 px-2 py-0.5 rounded-full border border-border/30">2026</span>
                              </div>
                              <div className="space-y-3">
                                {FACTORS.map((f) => {
                                  const val = Math.round(((track[f.key] as number) ?? 0) * 100);
                                  const isCore = f.weightNum > 0;
                                  return (
                                    <div key={f.key} className="flex items-center gap-3">
                                      <div className={`w-1 h-7 rounded-full shrink-0 ${isCore ? "bg-primary" : "bg-border"}`} />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1.5">
                                          <span className={`text-[11px] font-semibold ${isCore ? "text-foreground/90" : "text-muted-foreground/60"}`}>{f.fullLabel}</span>
                                          <div className="flex items-center gap-2 shrink-0 ml-2">
                                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${isCore ? "bg-primary/10 text-primary/70" : "bg-muted text-muted-foreground/50"}`}>
                                              {f.weight}
                                            </span>
                                            <span className={`text-xs font-black tabular-nums ${isCore ? "text-primary" : "text-muted-foreground/40"}`}>{val}</span>
                                          </div>
                                        </div>
                                        <div className="h-1.5 rounded-full overflow-hidden bg-muted/50">
                                          <div className={`h-full rounded-full transition-all duration-700 ${isCore ? "bg-primary" : "bg-muted-foreground/25"}`} style={{ width: `${val}%` }} />
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
                              <p className="text-xs font-semibold text-foreground mb-2.5 flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                                Brand Mention Snippets
                              </p>
                              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                {mentioned.map((r) => {
                                  const eng = ENGINES.find((e) => e.key === r.engine);
                                  return (
                                    <div
                                      key={r.id}
                                      onClick={() => r.response_text && setViewingResponse(r)}
                                      className="group relative rounded-xl bg-card border border-border/40 hover:border-border cursor-pointer transition-all overflow-hidden"
                                    >
                                      {/* Coloured left accent */}
                                      <div
                                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                                        style={{ backgroundColor: eng?.color ?? "#666" }}
                                      />
                                      <div className="pl-4 pr-3 py-2.5">
                                        <div className="flex items-center gap-2 mb-1.5">
                                          <span className="text-[11px] font-semibold text-foreground">{eng?.label}</span>
                                          <span className={`rounded-full border px-1.5 py-0.5 text-[9px] capitalize ${SENTIMENT_STYLES[r.sentiment as Sentiment]?.pill}`}>
                                            {r.sentiment}
                                          </span>
                                          {r.rank_position > 0 && (
                                            <span className="text-[10px] font-bold text-foreground bg-muted/60 px-1.5 py-0.5 rounded-full">
                                              #{r.rank_position}
                                            </span>
                                          )}
                                          <Eye className="w-3 h-3 text-muted-foreground/20 group-hover:text-primary ml-auto transition" />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                                          {r.response_text?.slice(0, 200)}…
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
                              <p className="text-xs font-semibold text-foreground mb-2.5 flex items-center gap-2">
                                <XCircle className="w-3.5 h-3.5 text-muted-foreground/50" />
                                Not Mentioned In
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {[...new Set(notMentioned.map((r) => r.engine))].map((engine) => {
                                  const eng = ENGINES.find((e) => e.key === engine);
                                  const cnt = notMentioned.filter((r) => r.engine === engine).length;
                                  return (
                                    <div
                                      key={engine}
                                      className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2"
                                    >
                                      <div
                                        className="w-2 h-2 rounded-full opacity-40"
                                        style={{ backgroundColor: eng?.color ?? "#666" }}
                                      />
                                      <span className="text-[11px] font-medium text-muted-foreground">{eng?.label ?? engine}</span>
                                      <span className="text-[10px] text-muted-foreground/40 bg-muted/50 px-1.5 py-0.5 rounded-full">{cnt}×</span>
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
                )}

                {/* Pending state (no results yet) */}
                {isExpanded && !hasResults && (
                  <div className="border-t border-border/60 px-4 py-8 text-center bg-muted/5">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Checking across AI engines and search…</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No results after filter */}
      {tracks.length > 0 && visibleTracks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/50 py-12 text-center">
          <p className="text-sm text-muted-foreground">No prompts match your filter.</p>
          <button onClick={() => { setSearch(""); setFilterLabel("All"); }} className="text-xs text-primary hover:underline mt-1">
            Clear filters
          </button>
        </div>
      )}

      {/* ── Response Viewer Modal ────────────────────────────────────────── */}
      {viewingResponse && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setViewingResponse(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ENGINES.find((e) => e.key === viewingResponse.engine)?.color ?? "#666" }}
                />
                <span className="text-sm font-semibold text-foreground">
                  {ENGINES.find((e) => e.key === viewingResponse.engine)?.label ?? viewingResponse.engine}
                </span>
                {viewingResponse.brand_mentioned ? (
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] capitalize ${SENTIMENT_STYLES[viewingResponse.sentiment as Sentiment]?.pill}`}>
                    {viewingResponse.sentiment}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted/50 border border-border">
                    Not mentioned
                  </span>
                )}
                {viewingResponse.rank_position > 0 && (
                  <span className="text-xs font-bold text-foreground bg-muted/50 border border-border px-2 py-0.5 rounded-full">
                    #{viewingResponse.rank_position}
                  </span>
                )}
              </div>
              <button
                onClick={() => setViewingResponse(null)}
                className="rounded-xl p-1.5 hover:bg-muted/60 transition text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Modal body */}
            <div className="p-5 overflow-y-auto flex-1">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {viewingResponse.response_text || "No response captured."}
              </p>
            </div>
            <div className="px-5 py-3 border-t border-border shrink-0 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                {new Date(viewingResponse.checked_at).toLocaleString()}
              </span>
              <button
                onClick={() => setViewingResponse(null)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small helper components ───────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub, color, accent,
}: {
  icon: React.ReactNode; label: string; value: string;
  sub: string; color: string; accent: string;
}) {
  return (
    <div className={`rounded-2xl border border-border/60 bg-linear-to-br ${accent} p-5 relative overflow-hidden`}
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">{label}</span>
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center bg-background/60 border border-border/40 ${color}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-3xl font-black tabular-nums leading-none ${color}`}>{value}</span>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}

function QuickMetric({
  label, value, sub, color,
}: {
  label: string; value: string; sub: string; color: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-3 text-center">
      <p className={`text-lg font-black tabular-nums ${color}`}>{value}</p>
      <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{label}</p>
      <p className="text-[9px] text-muted-foreground/60 mt-0.5">{sub}</p>
    </div>
  );
}
