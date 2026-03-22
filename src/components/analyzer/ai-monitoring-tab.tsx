"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
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
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Prompt Tracking</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Track how <span className="text-neutral-200 font-medium">{brandName}</span> appears in AI responses
          </p>
        </div>
        {tracks.length > 0 && (
          <button
            onClick={handleRecheckAll}
            disabled={recheckingAll}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 text-xs text-neutral-300 transition hover:bg-white/[0.06] disabled:opacity-50"
          >
            {recheckingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            {recheckingAll ? "Re-checking…" : recheckCount !== null ? `Started ${recheckCount}` : "Re-check All"}
          </button>
        )}
      </div>

      {/* Share of Voice */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <h3 className="mb-4 text-sm font-medium text-neutral-400">Share of Voice</h3>
        {loading ? (
          <p className="text-sm text-neutral-500">Loading…</p>
        ) : (
          <ShareOfVoicePanel data={sov} />
        )}
      </div>

      {/* Prompt Tracker */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <h3 className="mb-4 text-sm font-medium text-neutral-400">Prompt Tracker</h3>
        <PromptTracker
          slug={slug}
          tracks={tracks}
          onAdded={handleAdded}
          onRechecked={handleRechecked}
        />
      </div>

      {/* Sentiment Breakdown */}
      {tracks.some((t) => t.results.length > 0) && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <h3 className="mb-4 text-sm font-medium text-neutral-400">Sentiment per Engine</h3>
          <SentimentBreakdown tracks={tracks} />
        </div>
      )}

      {/* Citation Trend */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <h3 className="mb-4 text-sm font-medium text-neutral-400">Citation Rate Over Time</h3>
        {trend.length > 0 ? (
          <CitationTrendChart data={trend} />
        ) : (
          <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-white/[0.08]">
            <p className="text-xs text-neutral-500">
              No trend data yet — re-check prompts periodically to build history
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
