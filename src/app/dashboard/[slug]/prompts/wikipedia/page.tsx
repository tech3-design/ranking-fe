"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  getPromptTracks,
  type PromptTrack,
} from "@/lib/api/analyzer";
import { PromptTracker } from "@/components/analyzer/prompt-tracker";
import { AlertCircle, Info } from "@/components/icons";
import { PromptPageSkeleton } from "@/components/dashboard/skeletons";

export default function WikipediaPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tracks, setTracks] = useState<PromptTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Wikipedia per prompt
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Pick a prompt to see which Wikipedia articles AI engines reach for and
            how to earn a citation in them.
          </p>
        </div>
        <a
          href="https://docs.signalor.ai/wikipedia"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View documentation"
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
        >
          <Info className="size-4" />
        </a>
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
          onDeleted={(trackId) =>
            setTracks((prev) => prev.filter((t) => t.id !== trackId))
          }
          expandedMode="wikipedia"
        />
      )}
    </div>
  );
}
