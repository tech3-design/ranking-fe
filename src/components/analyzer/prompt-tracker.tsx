"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addPromptTrack, recheckPrompt } from "@/lib/api/analyzer";
import type { PromptTrack, Engine, Sentiment } from "@/lib/api/analyzer";

const ENGINE_COLS: Array<{ key: Engine; label: string }> = [
  { key: "chatgpt", label: "ChatGPT" },
  { key: "claude", label: "Claude" },
  { key: "gemini", label: "Gemini" },
  { key: "perplexity", label: "Perplexity" },
];

const SENTIMENT_COLORS: Record<Sentiment, string> = {
  positive: "bg-green-500/15 text-green-400 border-green-500/30",
  neutral: "bg-muted/50 text-muted-foreground border-border",
  negative: "bg-red-500/15 text-red-400 border-red-500/30",
};

const RANKING_STYLES: Record<string, string> = {
  Strong: "bg-green-500/15 text-green-400 border-green-500/30",
  Moderate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Weak: "bg-red-500/15 text-red-400 border-red-500/30",
};

interface PromptTrackerProps {
  slug: string;
  tracks: PromptTrack[];
  onAdded: (track: PromptTrack) => void;
  onRechecked: (trackId: number) => void;
}

export function PromptTracker({ slug, tracks, onAdded, onRechecked }: PromptTrackerProps) {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [rechecking, setRechecking] = useState<Record<number, boolean>>({});

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
      setAddError("Failed to add prompt. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  async function handleRecheck(trackId: number) {
    setRechecking((prev) => ({ ...prev, [trackId]: true }));
    try {
      await recheckPrompt(slug, trackId);
      onRechecked(trackId);
    } catch {
      // silently ignore — polling will refresh state
    } finally {
      setRechecking((prev) => ({ ...prev, [trackId]: false }));
    }
  }

  // Show the most-recent result per engine
  function latestResult(track: PromptTrack, engine: Engine) {
    return track.results
      .filter((r) => r.engine === engine)
      .sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime())[0];
  }

  function checkCount(track: PromptTrack): number {
    const times = new Set(track.results.map((r) => r.checked_at));
    return times.size;
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. What are the best GEO tools for agencies?"
          className="flex-1 text-sm"
          disabled={adding}
        />
        <Button type="submit" size="sm" disabled={adding || !text.trim()}>
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </Button>
      </form>
      {addError && <p className="text-xs text-destructive">{addError}</p>}

      {tracks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No prompts tracked yet. Add one above.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-1/4">
                  Prompt
                </th>
                <th className="px-3 py-2.5 text-center font-medium text-muted-foreground w-24">
                  Score
                </th>
                {ENGINE_COLS.map((col) => (
                  <th key={col.key} className="px-3 py-2.5 text-center font-medium text-muted-foreground">
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-center font-medium text-muted-foreground w-16">
                  Runs
                </th>
                <th className="px-2 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody>
              {tracks.map((track) => {
                const isRechecking = rechecking[track.id];
                const noPending = track.results.length === 0 || isRechecking;
                const checks = checkCount(track);

                return (
                  <tr key={track.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2.5 max-w-0">
                      <span className="block truncate text-foreground">{track.prompt_text}</span>
                      {track.is_custom && (
                        <span className="mt-0.5 inline-flex items-center rounded border border-border px-1 py-0.5 text-[10px] text-muted-foreground">
                          custom
                        </span>
                      )}
                    </td>

                    {/* Score + Ranking Badge */}
                    <td className="px-3 py-2.5 text-center">
                      {track.results.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-bold tabular-nums text-foreground">
                            {Math.round((track.score ?? 0) * 100)}
                          </span>
                          <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${RANKING_STYLES[track.ranking_label ?? "Weak"] ?? RANKING_STYLES.Weak}`}>
                            {track.ranking_label ?? "Weak"}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {track.visibility_pct ?? 0}% vis
                          </span>
                        </div>
                      )}
                    </td>

                    {ENGINE_COLS.map((col) => {
                      const result = latestResult(track, col.key);
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-center">
                          {noPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto text-muted-foreground" />
                          ) : !result ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              {result.brand_mentioned ? (
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground/60" />
                              )}
                              {result.brand_mentioned && (
                                <span
                                  className={`rounded border px-1 py-0.5 text-[10px] capitalize ${SENTIMENT_COLORS[result.sentiment as Sentiment]}`}
                                >
                                  {result.sentiment}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Check count — how many times this prompt has been fired */}
                    <td className="px-3 py-2.5 text-center tabular-nums text-muted-foreground">
                      {checks > 0 ? checks : "—"}
                    </td>

                    {/* Re-check button */}
                    <td className="px-2 py-2.5 text-center">
                      <button
                        type="button"
                        title="Re-check now"
                        disabled={isRechecking}
                        onClick={() => handleRecheck(track.id)}
                        className="rounded p-1 text-muted-foreground/50 transition-colors hover:bg-muted/40 hover:text-primary disabled:opacity-30"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isRechecking ? "animate-spin" : ""}`} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
