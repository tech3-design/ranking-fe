"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPromptTracks,
  getShareOfVoice,
  getCitationTrend,
  recheckAllPrompts,
} from "@/lib/api/analyzer";
import type { PromptTrack, ShareOfVoiceItem, CitationTrendPoint } from "@/lib/api/analyzer";
import { ShareOfVoicePanel } from "./share-of-voice-panel";
import { CitationTrendChart } from "./citation-trend-chart";
import { SentimentBreakdown } from "./sentiment-breakdown";
import { PromptTracker } from "./prompt-tracker";

interface AIMonitoringTabProps {
  slug: string;
  brandName: string;
}

export function AIMonitoringTab({ slug, brandName }: AIMonitoringTabProps) {
  const [tracks, setTracks] = useState<PromptTrack[]>([]);
  const [sov, setSov] = useState<ShareOfVoiceItem[]>([]);
  const [trend, setTrend] = useState<CitationTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [recheckingAll, setRecheckingAll] = useState(false);
  const [recheckCount, setRecheckCount] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasPending = useCallback(
    (t: PromptTrack[]) => t.some((track) => track.results.length === 0),
    [],
  );

  const fetchAll = useCallback(async () => {
    try {
      const [t, s, c] = await Promise.all([
        getPromptTracks(slug),
        getShareOfVoice(slug),
        getCitationTrend(slug),
      ]);
      setTracks(t);
      setSov(s);
      setTrend(c);
      return t;
    } catch {
      return tracks;
    }
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Schedule a poll cycle
  const schedulePoll = useCallback(
    (delay = 3000) => {
      if (pollRef.current) clearTimeout(pollRef.current);
      pollRef.current = setTimeout(async () => {
        const updated = await fetchAll();
        if (hasPending(updated)) schedulePoll(3000);
      }, delay);
    },
    [fetchAll, hasPending],
  );

  useEffect(() => {
    let alive = true;
    async function init() {
      setLoading(true);
      const t = await fetchAll();
      if (!alive) return;
      setLoading(false);
      if (hasPending(t)) schedulePoll();
    }
    init();
    return () => {
      alive = false;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleAdded(track: PromptTrack) {
    setTracks((prev) => [track, ...prev]);
    schedulePoll(3000);
  }

  // Called when a single row's re-check button is clicked — start polling
  function handleRechecked(_trackId: number) {
    schedulePoll(3000);
  }

  async function handleRecheckAll() {
    setRecheckingAll(true);
    setRecheckCount(null);
    try {
      const { count } = await recheckAllPrompts(slug);
      setRecheckCount(count);
      schedulePoll(3000);
      // Clear the count badge after 4s
      setTimeout(() => setRecheckCount(null), 4000);
    } catch {
      // ignore
    } finally {
      setRecheckingAll(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">AI Monitor</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track how{" "}
            <span className="font-medium text-foreground">{brandName}</span>{" "}
            appears across ChatGPT, Claude, Gemini, and Perplexity.
          </p>
        </div>

        {tracks.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecheckAll}
            disabled={recheckingAll}
            className="shrink-0 gap-1.5 text-xs"
          >
            {recheckingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {recheckingAll
              ? "Re-checking…"
              : recheckCount !== null
              ? `Started ${recheckCount} re-checks`
              : "Re-check All"}
          </Button>
        )}
      </div>

      {/* Share of Voice */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Share of Voice
        </h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <ShareOfVoicePanel data={sov} />
        )}
      </section>

      {/* Prompt Tracker */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Prompt Tracker
        </h3>
        <PromptTracker
          slug={slug}
          tracks={tracks}
          onAdded={handleAdded}
          onRechecked={handleRechecked}
        />
      </section>

      {/* Sentiment Breakdown */}
      {tracks.some((t) => t.results.length > 0) && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Sentiment per Engine
          </h3>
          <SentimentBreakdown tracks={tracks} />
        </section>
      )}

      {/* Citation Trend */}
      <section className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Citation Rate Over Time
          </h3>
          {trend.length === 0 && !loading && (
            <span className="text-xs text-muted-foreground">
              Builds up as you re-check prompts over time
            </span>
          )}
        </div>
        {trend.length > 0 ? (
          <CitationTrendChart data={trend} />
        ) : (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border/50">
            <p className="text-xs text-muted-foreground">
              No trend data yet — hit <strong>Re-check All</strong> periodically or set up the daily cron job
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
