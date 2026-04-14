"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2, CheckCircle2, XCircle, Plus, RefreshCw,
  ChevronDown, ChevronRight, Eye, TrendingUp, TrendingDown, Minus,
  MessageSquare, BarChart3, Target, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addPromptTrack, recheckPrompt } from "@/lib/api/analyzer";
import type { PromptTrack, PromptResult, Engine, Sentiment } from "@/lib/api/analyzer";
import { useSession } from "@/lib/auth-client";
import { getSubscriptionStatus } from "@/lib/api/payments";

const ENGINES: Array<{ key: Engine; label: string; color: string }> = [
  { key: "google", label: "Google", color: "#ea4335" },
  { key: "chatgpt", label: "ChatGPT", color: "#10a37f" },
  { key: "claude", label: "Claude", color: "#d97706" },
  { key: "gemini", label: "Gemini", color: "#4285f4" },
  { key: "perplexity", label: "Perplexity", color: "#7c3aed" },
];

const SENTIMENT_COLORS: Record<Sentiment, string> = {
  positive: "bg-green-500/15 text-green-400 border-green-500/30",
  neutral: "bg-muted/50 text-muted-foreground border-border",
  negative: "bg-red-500/15 text-red-400 border-red-500/30",
};

const RANKING_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Strong: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30" },
  Moderate: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  Weak: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
};

interface PromptTrackerProps {
  slug: string;
  tracks: PromptTrack[];
  onAdded: (track: PromptTrack) => void;
  onRechecked: (trackId: number) => void;
}

export function PromptTracker({ slug, tracks, onAdded, onRechecked }: PromptTrackerProps) {
  const { data: session } = useSession();
  const [planEngines, setPlanEngines] = useState<Engine[] | null>(null);
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [rechecking, setRechecking] = useState<Record<number, boolean>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [viewingResponse, setViewingResponse] = useState<PromptResult | null>(null);

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
    const keys =
      planEngines && planEngines.length > 0
        ? planEngines
        : null;
    if (!keys) {
      return ENGINES;
    }
    const allowed = new Set(keys);
    return ENGINES.filter((e) => allowed.has(e.key));
  }, [planEngines]);

  const showProEngineUpsell = useMemo(() => {
    if (!planEngines?.length) return false;
    const s = new Set(planEngines);
    return !s.has("chatgpt") || !s.has("perplexity");
  }, [planEngines]);

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
    setRechecking((prev) => ({ ...prev, [trackId]: true }));
    try {
      await recheckPrompt(slug, trackId);
      onRechecked(trackId);
    } catch { /* ignore */ }
    finally { setRechecking((prev) => ({ ...prev, [trackId]: false })); }
  }

  // Aggregate stats
  const totalPrompts = tracks.length;
  const avgScore = totalPrompts > 0 ? Math.round(tracks.reduce((s, t) => s + (t.score ?? 0), 0) / totalPrompts * 100) : 0;
  const strongCount = tracks.filter((t) => t.ranking_label === "Strong").length;
  const totalMentions = tracks.reduce((s, t) => s + (t.mentions ?? 0), 0);
  const totalRuns = tracks.reduce((s, t) => s + (t.total_runs ?? 0), 0);
  const overallVisibility = totalRuns > 0 ? Math.round((totalMentions / totalRuns) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {totalPrompts > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard icon={<Target className="w-4 h-4" />} label="Avg Score" value={`${avgScore}`} sub="/100" color="text-primary" />
          <SummaryCard icon={<BarChart3 className="w-4 h-4" />} label="Visibility" value={`${overallVisibility}%`} sub={`${totalMentions}/${totalRuns} mentions`} color="text-green-400" />
          <SummaryCard icon={<TrendingUp className="w-4 h-4" />} label="Strong Prompts" value={`${strongCount}`} sub={`of ${totalPrompts}`} color="text-amber-400" />
          <SummaryCard icon={<MessageSquare className="w-4 h-4" />} label="Total Prompts" value={`${totalPrompts}`} sub={`${totalRuns} total runs`} color="text-blue-400" />
        </div>
      )}

      {/* Add Prompt */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a custom prompt... e.g. What are the best GEO tools?"
          className="flex-1 text-sm"
          disabled={adding}
        />
        <Button type="submit" size="sm" disabled={adding || !text.trim()}>
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </Button>
      </form>
      {addError && <p className="text-xs text-destructive">{addError}</p>}

      {showProEngineUpsell && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-xs text-foreground">
          <Lock className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="text-muted-foreground">
            ChatGPT &amp; Perplexity prompt checks are on <strong className="text-foreground">Pro</strong> and above. Your plan only runs the engines included in your subscription.
          </span>
          <Link href="/pricing" className="ml-auto font-semibold text-primary underline-offset-2 hover:underline">
            Upgrade
          </Link>
        </div>
      )}

      {/* Prompt Cards */}
      {tracks.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No prompts tracked yet. Add one above or run an analysis to auto-generate prompts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => {
            const isExpanded = expandedId === track.id;
            const isRechecking = rechecking[track.id];
            const style = RANKING_STYLES[track.ranking_label ?? "Weak"] ?? RANKING_STYLES.Weak;
            const hasResults = track.results.length > 0;

            return (
              <div key={track.id} className="rounded-xl border border-border/60 bg-card overflow-hidden">
                {/* Prompt Header Row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition"
                  onClick={() => setExpandedId(isExpanded ? null : track.id)}
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}

                  {/* Score circle */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${style.bg} ${style.border} border shrink-0`}>
                    <span className={`text-sm font-bold tabular-nums ${style.text}`}>
                      {hasResults ? Math.round((track.score ?? 0) * 100) : "—"}
                    </span>
                  </div>

                  {/* Prompt text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{track.prompt_text}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {hasResults && (
                        <>
                          <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${style.bg} ${style.text} ${style.border}`}>
                            {track.ranking_label ?? "Weak"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{track.visibility_pct ?? 0}% visibility</span>
                          {(track.avg_position ?? 0) > 0 && (
                            <span className="text-[10px] text-muted-foreground">Avg pos: #{track.avg_position}</span>
                          )}
                          <span className="text-[10px] text-muted-foreground">{track.total_runs ?? 0} runs</span>
                        </>
                      )}
                      {track.is_custom && <span className="text-[10px] text-muted-foreground border border-border rounded px-1">custom</span>}
                    </div>
                  </div>

                  {/* Engine dots */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {enginesForUi.map((eng) => {
                      const results = track.results.filter((r) => r.engine === eng.key);
                      const mentioned = results.some((r) => r.brand_mentioned);
                      const hasData = results.length > 0;
                      return (
                        <div
                          key={eng.key}
                          title={`${eng.label}: ${!hasData ? "No data" : mentioned ? "Mentioned" : "Not mentioned"}`}
                          className={`w-2.5 h-2.5 rounded-full ${
                            !hasData ? "bg-muted/50" : mentioned ? "bg-green-400" : "bg-red-400/60"
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Recheck button */}
                  <button
                    type="button"
                    title="Re-check now"
                    disabled={isRechecking}
                    onClick={(e) => { e.stopPropagation(); handleRecheck(track.id); }}
                    className="rounded-lg p-1.5 text-muted-foreground/50 transition hover:bg-muted/40 hover:text-primary disabled:opacity-30 shrink-0"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRechecking ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {/* Expanded Detail Panel — Peec.ai style */}
                {isExpanded && hasResults && (() => {
                  // Compute per-prompt analytics
                  const allResults = track.results;
                  const mentionedResults = allResults.filter((r) => r.brand_mentioned);
                  const notMentioned = allResults.filter((r) => !r.brand_mentioned);
                  const positions = mentionedResults.filter((r) => r.rank_position > 0).map((r) => r.rank_position);
                  const avgPos = positions.length > 0 ? (positions.reduce((a, b) => a + b, 0) / positions.length) : 0;
                  const bestPos = positions.length > 0 ? Math.min(...positions) : 0;
                  const posCount = allResults.filter((r) => r.sentiment === "positive").length;
                  const neuCount = allResults.filter((r) => r.sentiment === "neutral").length;
                  const negCount = allResults.filter((r) => r.sentiment === "negative").length;
                  const sentimentTotal = posCount + neuCount + negCount;

                  // Google result (if exists)
                  const googleResult = allResults.find((r) => r.engine === "google");

                  return (
                    <div className="border-t border-border/60 px-4 py-4 space-y-5 bg-muted/5">

                      {/* Row 1: Key Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <MetricCard label="Visibility" value={`${track.visibility_pct ?? 0}%`} sub={`${mentionedResults.length}/${allResults.length} mentions`} color={mentionedResults.length > 0 ? "text-green-400" : "text-red-400"} />
                        <MetricCard label="Best Position" value={bestPos > 0 ? `#${bestPos}` : "—"} sub={avgPos > 0 ? `avg #${avgPos.toFixed(1)}` : "not ranked"} color={bestPos === 1 ? "text-green-400" : bestPos > 0 ? "text-amber-400" : "text-muted-foreground"} />
                        <MetricCard label="Sentiment" value={posCount > negCount ? "Positive" : negCount > posCount ? "Negative" : "Neutral"} sub={`+${posCount} / ${neuCount} / -${negCount}`} color={posCount > negCount ? "text-green-400" : negCount > posCount ? "text-red-400" : "text-muted-foreground"} />
                        <MetricCard label="Engines Cited" value={`${new Set(mentionedResults.map((r) => r.engine)).size}`} sub={`of ${new Set(allResults.map((r) => r.engine)).size} checked`} color="text-blue-400" />
                        <MetricCard label="Google Rank" value={googleResult?.rank_position ? `#${googleResult.rank_position}` : "—"} sub={googleResult?.brand_mentioned ? "Found in search" : "Not in results"} color={googleResult?.brand_mentioned ? "text-green-400" : "text-muted-foreground"} />
                      </div>

                      {/* Row 2: Sentiment Breakdown Bar */}
                      {sentimentTotal > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Sentiment Analysis</p>
                          <div className="flex h-3 rounded-full overflow-hidden bg-muted/30">
                            {posCount > 0 && <div className="bg-green-400 transition-all" style={{ width: `${(posCount / sentimentTotal) * 100}%` }} />}
                            {neuCount > 0 && <div className="bg-muted-foreground/30 transition-all" style={{ width: `${(neuCount / sentimentTotal) * 100}%` }} />}
                            {negCount > 0 && <div className="bg-red-400 transition-all" style={{ width: `${(negCount / sentimentTotal) * 100}%` }} />}
                          </div>
                          <div className="flex justify-between mt-1.5 text-[10px]">
                            <span className="text-green-400">Positive {posCount} ({Math.round((posCount / sentimentTotal) * 100)}%)</span>
                            <span className="text-muted-foreground">Neutral {neuCount} ({Math.round((neuCount / sentimentTotal) * 100)}%)</span>
                            <span className="text-red-400">Negative {negCount} ({Math.round((negCount / sentimentTotal) * 100)}%)</span>
                          </div>
                        </div>
                      )}

                      {/* Row 3: Engine Breakdown Cards */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-3">Platform Breakdown</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {enginesForUi.map((eng) => {
                            const results = allResults.filter((r) => r.engine === eng.key);
                            if (results.length === 0) return null;
                            const mentionCount = results.filter((r) => r.brand_mentioned).length;
                            const mentionPct = Math.round((mentionCount / results.length) * 100);
                            const latestResult = [...results].sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime())[0];
                            const engPositions = results.filter((r) => r.rank_position > 0).map((r) => r.rank_position);
                            const engAvgPos = engPositions.length > 0 ? Math.round(engPositions.reduce((a, b) => a + b, 0) / engPositions.length) : 0;
                            const engBestPos = engPositions.length > 0 ? Math.min(...engPositions) : 0;
                            const engPos = results.filter((r) => r.sentiment === "positive").length;
                            const engNeg = results.filter((r) => r.sentiment === "negative").length;

                            return (
                              <div key={eng.key} className="rounded-xl border border-border/60 bg-card p-3 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: eng.color }} />
                                    <span className="text-xs font-semibold text-foreground">{eng.label}</span>
                                  </div>
                                  {mentionCount > 0 ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-muted-foreground/40" />
                                  )}
                                </div>

                                {/* Visibility bar */}
                                <div>
                                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                    <span>Visibility</span>
                                    <span className="font-medium text-foreground">{mentionPct}%</span>
                                  </div>
                                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${mentionPct}%`, backgroundColor: eng.color }} />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Best Pos</span>
                                    <span className="text-foreground font-medium">{engBestPos > 0 ? `#${engBestPos}` : "—"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Avg Pos</span>
                                    <span className="text-foreground font-medium">{engAvgPos > 0 ? `#${engAvgPos}` : "—"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sentiment</span>
                                    {latestResult?.brand_mentioned ? (
                                      <span className={`rounded border px-1 py-0.5 capitalize ${SENTIMENT_COLORS[latestResult.sentiment as Sentiment]}`}>
                                        {latestResult.sentiment}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Runs</span>
                                    <span className="text-foreground">{results.length}</span>
                                  </div>
                                </div>

                                {/* Mini sentiment bar */}
                                {mentionCount > 0 && (
                                  <div className="flex h-1 rounded-full overflow-hidden bg-muted/30">
                                    {engPos > 0 && <div className="bg-green-400" style={{ width: `${(engPos / results.length) * 100}%` }} />}
                                    {engNeg > 0 && <div className="bg-red-400" style={{ width: `${(engNeg / results.length) * 100}%` }} />}
                                  </div>
                                )}

                                {/* View response */}
                                {latestResult?.response_text && (
                                  <button
                                    onClick={() => setViewingResponse(latestResult)}
                                    className="w-full flex items-center justify-center gap-1 rounded-lg bg-muted/50 px-2 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
                                  >
                                    <Eye className="w-3 h-3" /> View AI Response
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Row 4: Brand Mentions Context */}
                      {mentionedResults.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Brand Mention Context</p>
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {mentionedResults.map((result) => {
                              const eng = ENGINES.find((e) => e.key === result.engine);
                              // Extract the sentence containing the brand
                              const snippet = result.response_text?.slice(0, 200) || "";
                              return (
                                <div
                                  key={result.id}
                                  className="rounded-lg px-3 py-2 bg-card border border-border/40 cursor-pointer hover:bg-muted/20 transition"
                                  onClick={() => result.response_text && setViewingResponse(result)}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: eng?.color ?? "#666" }} />
                                    <span className="text-[11px] font-medium text-foreground">{eng?.label}</span>
                                    <span className={`rounded border px-1 py-0.5 text-[9px] capitalize ${SENTIMENT_COLORS[result.sentiment as Sentiment]}`}>{result.sentiment}</span>
                                    {result.rank_position > 0 && <span className="text-[10px] font-bold text-foreground">#{result.rank_position}</span>}
                                    <span className="text-[9px] text-muted-foreground/50 ml-auto">{new Date(result.checked_at).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">&ldquo;{snippet}...&rdquo;</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Row 5: Not Mentioned — which engines missed */}
                      {notMentioned.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Not Mentioned In</p>
                          <div className="flex flex-wrap gap-2">
                            {[...new Set(notMentioned.map((r) => r.engine))].map((engine) => {
                              const eng = ENGINES.find((e) => e.key === engine);
                              const count = notMentioned.filter((r) => r.engine === engine).length;
                              return (
                                <span key={engine} className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/20 px-2.5 py-1 text-[10px] text-muted-foreground">
                                  <div className="w-2 h-2 rounded-full opacity-40" style={{ backgroundColor: eng?.color ?? "#666" }} />
                                  {eng?.label ?? engine} ({count}x)
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Row 6: Full Result History */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">All Results ({allResults.length})</p>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {[...allResults]
                            .sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime())
                            .map((result) => {
                              const eng = ENGINES.find((e) => e.key === result.engine);
                              return (
                                <div
                                  key={result.id}
                                  className="flex items-center gap-3 rounded-lg px-3 py-1.5 bg-card border border-border/30 text-[11px] hover:bg-muted/20 cursor-pointer transition"
                                  onClick={() => result.response_text && setViewingResponse(result)}
                                >
                                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: eng?.color ?? "#666" }} />
                                  <span className="text-muted-foreground w-16 shrink-0">{eng?.label ?? result.engine}</span>
                                  {result.brand_mentioned ? <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" /> : <XCircle className="w-3 h-3 text-muted-foreground/40 shrink-0" />}
                                  {result.brand_mentioned && (
                                    <>
                                      <span className={`rounded border px-1 py-0.5 text-[9px] capitalize ${SENTIMENT_COLORS[result.sentiment as Sentiment]}`}>{result.sentiment}</span>
                                      {result.rank_position > 0 && <span className="text-foreground font-medium">#{result.rank_position}</span>}
                                    </>
                                  )}
                                  <span className="text-muted-foreground/40 ml-auto text-[9px]">{new Date(result.checked_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}

      {/* Response Viewer Modal */}
      {viewingResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setViewingResponse(null)}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ENGINES.find((e) => e.key === viewingResponse.engine)?.color ?? "#666" }} />
                <span className="text-sm font-semibold text-foreground capitalize">{ENGINES.find((e) => e.key === viewingResponse.engine)?.label ?? viewingResponse.engine}</span>
                {viewingResponse.brand_mentioned ? (
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] capitalize ${SENTIMENT_COLORS[viewingResponse.sentiment as Sentiment]}`}>
                    {viewingResponse.sentiment}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Not mentioned</span>
                )}
                {viewingResponse.rank_position > 0 && (
                  <span className="text-xs font-medium text-foreground">Position #{viewingResponse.rank_position}</span>
                )}
              </div>
              <button onClick={() => setViewingResponse(null)} className="rounded-lg p-1.5 hover:bg-accent transition">
                <span className="text-lg leading-none text-muted-foreground">&times;</span>
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{viewingResponse.response_text || "No response captured."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-xl font-bold tabular-nums ${color}`}>{value}</span>
        <span className="text-[10px] text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-3 text-center">
      <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-[9px] text-muted-foreground/60 mt-0.5">{sub}</p>
    </div>
  );
}
