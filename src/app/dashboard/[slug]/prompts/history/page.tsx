"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  getPromptTracks,
  getShareOfVoice,
  getCitationTrend,
  type PromptTrack,
  type PromptResult,
  type ShareOfVoiceItem,
  type CitationTrendPoint,
} from "@/lib/api/analyzer";
import { ShareOfVoicePanel } from "@/components/analyzer/share-of-voice-panel";
import { CitationTrendChart } from "@/components/analyzer/citation-trend-chart";
import { SentimentBreakdown } from "@/components/analyzer/sentiment-breakdown";
import { History, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";
import { EngineBadge } from "@/components/ui/engine-badge";

export default function PromptsHistoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tracks, setTracks] = useState<PromptTrack[]>([]);
  const [sov, setSov] = useState<ShareOfVoiceItem[]>([]);
  const [trend, setTrend] = useState<CitationTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const [t, s, c] = await Promise.all([
        getPromptTracks(slug),
        getShareOfVoice(slug),
        getCitationTrend(slug),
      ]);
      setTracks(t);
      setSov(s);
      setTrend(c);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load history data");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activity = useMemo(() => {
    const items: Array<PromptResult & { prompt_text: string }> = [];
    for (const track of tracks) {
      for (const result of track.results) {
        items.push({ ...result, prompt_text: track.prompt_text });
      }
    }
    return items.sort(
      (a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime(),
    );
  }, [tracks]);

  const mentionedCount = activity.filter((a) => a.brand_mentioned).length;
  const mentionRate = activity.length > 0 ? Math.round((mentionedCount / activity.length) * 100) : 0;
  const trackedEngines = new Set(activity.map((a) => a.engine)).size;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <History className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">History</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track everything in one place: per-engine visibility, sentiment, citation trend, and
              every prompt check in time order.
            </p>
          </div>
        </div>
        {activity.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground">
              {activity.length} checks
            </span>
            <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground">
              {mentionRate}% mention rate
            </span>
            <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground">
              {trackedEngines} engines
            </span>
          </div>
        )}
      </div>
      
      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground mb-1">Share of voice</h2>
              <p className="text-xs text-muted-foreground mb-4">
                Where your brand gets mentioned across all tracked engines.
              </p>
              <ShareOfVoicePanel data={sov} />
            </div>

            {tracks.some((t) => t.results.length > 0) && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold text-foreground mb-1">Sentiment by engine</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Aggregated from all prompt runs currently in this project.
                </p>
                <SentimentBreakdown tracks={tracks} />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground mb-1">Citation trend</h2>
              <p className="text-xs text-muted-foreground mb-4">
                Weekly mention rate progression for each engine.
              </p>
              {trend.length > 0 ? (
                <CitationTrendChart data={trend} />
              ) : (
                <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-border">
                  <p className="text-xs text-muted-foreground text-center px-4">
                    No trend data yet — recheck prompts to build history.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">Full result history</h2>
                <span className="text-[11px] text-muted-foreground">{activity.length} checks</span>
              </div>

              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No result history yet.</p>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {activity.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-muted/20 border border-border/30 text-[11px] transition hover:border-primary/30 hover:bg-card"
                    >
                      <EngineBadge
                        engine={r.engine}
                        size={14}
                        className="text-foreground/80 w-24 shrink-0 font-semibold"
                      />
                      {r.brand_mentioned ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-muted-foreground/35 shrink-0" />
                      )}
                      {r.brand_mentioned && (
                        <span className="text-muted-foreground capitalize">{r.sentiment}</span>
                      )}
                      {r.brand_mentioned && r.rank_position > 0 && (
                        <span className="font-bold text-foreground">#{r.rank_position}</span>
                      )}
                      <span className="text-muted-foreground/90 truncate">
                        {r.prompt_text}
                      </span>
                      <span className="text-muted-foreground/50 ml-auto text-[10px] tabular-nums shrink-0">
                        {new Date(r.checked_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <SignalorLoader label="Loading history..." />
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

    </div>
  );
}
