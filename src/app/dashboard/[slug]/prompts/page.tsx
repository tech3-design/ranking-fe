"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  getPromptTracks,
  recheckAllPrompts,
  type PromptTrack,
} from "@/lib/api/analyzer";
import { PromptTracker } from "@/components/analyzer/prompt-tracker";
import { AlertCircle } from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";

export default function PromptsOverviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tracks, setTracks] = useState<PromptTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recheckingAll, setRecheckingAll] = useState(false);

  const fetchData = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const data = await getPromptTracks(slug);
      setTracks(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load prompts");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleRecheckAll() {
    if (!slug) return;
    setRecheckingAll(true);
    try {
      await recheckAllPrompts(slug);
      await fetchData();
    } catch {
      /* ignore */
    } finally {
      setRecheckingAll(false);
    }
  }

  return (
    <div className="space-y-6 w-full">
      {/* <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Prompt Tracking</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              See how AI models and search engines respond to queries about your brand.
              Scored with the 2026 AI Visibility Framework — Authority, Content Quality &amp; Structural signals.
            </p>
          </div>

          {tracks.length > 0 && (
            <button
              onClick={handleRecheckAll}
              disabled={recheckingAll}
              className="flex items-center gap-1.5 shrink-0 bg-background border border-border rounded-xl px-4 py-2 text-xs font-medium text-foreground transition hover:bg-muted/50 disabled:opacity-50"
            >
              {recheckingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              {recheckingAll ? "Rechecking…" : "Recheck All"}
            </button>
          )}
        </div>
        {tracks.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground">
              {tracks.length} prompts
            </span>
            <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground">
              {totalRuns} runs
            </span>
            <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground">
              {visibility}% visibility
            </span>
          </div>
        )}
      </div> */}
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Prompt Tracking</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          See how AI models and search engines respond to queries about your brand.
          Scored with the 2026 AI Visibility Framework — Authority, Content Quality &amp; Structural signals.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <SignalorLoader label="Loading prompts…" />
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && (
        <PromptTracker
          slug={slug}
          tracks={tracks}
          onAdded={(track) => setTracks((prev) => [track, ...prev])}
          onRechecked={() => fetchData()}
          onDeleted={(trackId) => setTracks((prev) => prev.filter((t) => t.id !== trackId))}
          onRecheckAll={handleRecheckAll}
          recheckingAll={recheckingAll}
        />
      )}
    </div>
  );
}
