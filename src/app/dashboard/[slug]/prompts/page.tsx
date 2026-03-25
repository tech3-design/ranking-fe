"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  getPromptTracks,
  recheckAllPrompts,
  type PromptTrack,
} from "@/lib/api/analyzer";
import { PromptTracker } from "@/components/analyzer/prompt-tracker";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";

export default function PromptsPage() {
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
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleRecheckAll() {
    if (!slug) return;
    setRecheckingAll(true);
    try {
      await recheckAllPrompts(slug);
      await fetchData();
    } catch { /* ignore */ }
    finally { setRecheckingAll(false); }
  }

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Prompt Tracking</h2>
          <p className="text-xs mt-1 text-muted-foreground">
            Track how AI engines respond to prompts about your brand
          </p>
        </div>
        <button
          onClick={handleRecheckAll}
          disabled={recheckingAll || tracks.length === 0}
          className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-4 py-2 text-xs font-medium text-foreground transition hover:opacity-80 disabled:opacity-50"
        >
          {recheckingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Recheck All
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <SignalorLoader label="Loading prompts..." />
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/30 px-5 py-4 text-sm text-primary">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {!loading && (
        <PromptTracker
          slug={slug}
          tracks={tracks}
          onAdded={(track) => setTracks((prev) => [...prev, track])}
          onRechecked={() => fetchData()}
        />
      )}
    </div>
  );
}
