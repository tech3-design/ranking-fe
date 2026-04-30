"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RedditDetails } from "@/lib/api/visibility";
import { BrandDonutChart } from "@/components/ui/vis-charts";
import { MessageSquare, ArrowUp, MessageCircle, ExternalLink } from "lucide-react";

interface RedditDetailsPanelProps {
  details: RedditDetails;
  score: number | null;
  /** Dense layout for bento / above-the-fold grids */
  compact?: boolean;
}

function scoreTone(s: number) {
  if (s >= 70) return { text: "text-emerald-600" };
  if (s >= 40) return { text: "text-amber-600" };
  return { text: "text-primary" };
}

const SENTIMENT_COLORS = {
  positive: "#22c55e",
  negative: "#ef4444",
  neutral: "#94a3b8",
};


export function RedditDetailsPanel({ details, score, compact = false }: RedditDetailsPanelProps) {
  const sentiment = details.sentiment;
  const roundedScore = score != null ? Math.round(score) : 0;
  const tone = scoreTone(roundedScore);

  const sentimentData = sentiment
    ? [
        { name: "positive", value: sentiment.positive, fill: SENTIMENT_COLORS.positive },
        { name: "negative", value: sentiment.negative, fill: SENTIMENT_COLORS.negative },
        { name: "neutral", value: sentiment.neutral, fill: SENTIMENT_COLORS.neutral },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <Card className="glass-card border-border">
      <CardHeader className={cn("pb-3", compact && "pb-2 pt-4")}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-orange-500/10">
              <MessageSquare className="size-3.5 text-orange-600" />
            </div>
            <CardTitle className={cn("tracking-tight", compact ? "text-sm" : "text-base")}>
              Reddit
            </CardTitle>
          </div>
          <span className={cn("shrink-0 font-mono font-bold tabular-nums", compact ? "text-base" : "text-lg", tone.text)}>
            {score != null ? roundedScore : "—"}
            <span className="font-sans text-xs font-normal text-muted-foreground">/100</span>
          </span>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-4", compact && "space-y-3 pb-4 pt-0")}>
        {details.error && (
          <p className="text-sm text-destructive">{details.error}</p>
        )}

        {!details.error && (details.total_mentions ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-7 text-center">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted/30">
              <MessageSquare className="size-4 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No Reddit discussions found</p>
            <p className="text-[11px] text-muted-foreground/60">This brand has no Reddit mentions yet</p>
          </div>
        ) : (
          <>
        {/* Key metrics row */}
        <div className={cn("grid grid-cols-3 gap-2", compact && "gap-1.5")}>
          {[
            {
              label: "Mentions",
              value: details.total_mentions ?? 0,
              icon: <MessageSquare className="size-3.5 text-orange-500" />,
            },
            {
              label: "Upvotes",
              value: details.total_upvotes ?? 0,
              icon: <ArrowUp className="size-3.5 text-emerald-500" />,
            },
            {
              label: "Comments",
              value: details.total_comments ?? 0,
              icon: <MessageCircle className="size-3.5 text-blue-500" />,
            },
          ].map((metric) => (
            <div
              key={metric.label}
              className={cn(
                "rounded-xl border border-border/60 bg-muted/20 text-center transition-colors hover:bg-muted/40",
                compact ? "px-2 py-2.5" : "px-3 py-3",
              )}
            >
              <div className="flex justify-center mb-1">{metric.icon}</div>
              <p className={cn("font-bold tabular-nums tracking-tight", compact ? "text-lg" : "text-xl")}>
                {metric.value}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-0.5">
                {metric.label}
              </p>
            </div>
          ))}
        </div>

        {/* Sentiment donut + legend */}
        {sentiment && (
          <div className={cn("rounded-xl border border-border/60 bg-muted/10", compact ? "p-2.5" : "p-3.5")}>
            <p className={cn("font-semibold tracking-tight mb-2", compact ? "text-xs" : "text-sm")}>Sentiment</p>
            {sentimentData.length > 0 ? (
              <div className="flex items-center gap-3">
                <BrandDonutChart
                  data={sentimentData.map((d) => ({ name: d.name, value: d.value, color: d.fill }))}
                  size={64}
                  innerRadius={18}
                  outerRadius={28}
                />
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">{sentiment.positive} positive</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">{sentiment.negative} negative</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-slate-400" />
                    <span className="text-muted-foreground">{sentiment.neutral} neutral</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span className="text-emerald-600">+{sentiment.positive} pos</span>
                <span className="text-red-500">−{sentiment.negative} neg</span>
                <span>{sentiment.neutral} neutral</span>
              </div>
            )}
          </div>
        )}

        {/* Subreddits */}
        {details.subreddits && details.subreddits.length > 0 && (
          <div>
            <p className={cn("mb-2 font-semibold tracking-tight", compact ? "text-xs" : "text-sm")}>
              Subreddits{compact ? "" : ` (${details.subreddits.length})`}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {details.subreddits.slice(0, compact ? 8 : undefined).map((sub) => (
                <span
                  key={sub}
                  className={cn(
                    "rounded-lg bg-orange-500/8 border border-orange-500/15 text-foreground font-medium",
                    compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
                  )}
                >
                  r/{sub}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent posts */}
        {details.posts && details.posts.length > 0 && (
          <div className="space-y-1.5">
            <p className={cn("font-semibold tracking-tight", compact ? "text-xs" : "text-sm")}>Recent</p>
            <div
              className={cn(
                "space-y-1.5 overflow-y-auto",
                compact ? "max-h-[9rem]" : "max-h-60",
              )}
            >
              {details.posts.slice(0, compact ? 4 : 10).map((post, i) => (
                <a
                  key={i}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2 rounded-xl border border-border/40 bg-muted/10 p-2.5 transition-all hover:bg-muted/30 hover:border-border/80"
                >
                  <ExternalLink className="mt-0.5 size-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{post.title}</p>
                    <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
                      <span className="font-medium text-orange-600/80">r/{post.subreddit}</span>
                      <span className="flex items-center gap-0.5">
                        <ArrowUp className="size-2.5" /> {post.upvotes}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="size-2.5" /> {post.comments}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
