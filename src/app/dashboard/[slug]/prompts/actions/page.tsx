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
import { PromptPageSkeleton } from "@/components/dashboard/skeletons";

export default function PromptsActionsPage() {
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Actions</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Add prompts, run rechecks, and keep scores fresh across engines.
          </p>
        </div>
      </div>

      {loading && <PromptPageSkeleton />}

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
          expandedMode="blank"
          onRecheckAll={handleRecheckAll}
          recheckingAll={recheckingAll}
        />
      )}
    </div>
  );
}
