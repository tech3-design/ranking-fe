"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RedditDetails } from "@/lib/api/visibility";

interface RedditDetailsPanelProps {
  details: RedditDetails;
  score: number | null;
  /** Dense layout for bento / above-the-fold grids */
  compact?: boolean;
}

export function RedditDetailsPanel({ details, score, compact = false }: RedditDetailsPanelProps) {
  const sentiment = details.sentiment;

  return (
    <Card className="h-full border-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none">
      <CardHeader className={cn(compact && "space-y-0 pb-2 pt-4")}>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className={cn("tracking-tight", compact ? "text-sm" : "text-base")}>
            Reddit
          </CardTitle>
          <span className={cn("shrink-0 font-mono font-bold tabular-nums", compact ? "text-sm" : "text-sm")}>
            {score != null ? Math.round(score) : "—"}
            <span className="font-sans text-xs font-normal text-muted-foreground">/100</span>
          </span>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-4", compact && "space-y-3 pb-4 pt-0")}>
        {details.error && (
          <p className="text-sm text-destructive">{details.error}</p>
        )}

        <div className={cn("grid grid-cols-3 gap-2 text-center sm:gap-3", compact && "gap-1.5")}>
          <div className={cn("rounded-lg border", compact ? "p-2" : "p-3")}>
            <p className={cn("font-bold", compact ? "text-lg" : "text-2xl")}>{details.total_mentions ?? 0}</p>
            <p className="text-[10px] text-muted-foreground sm:text-xs">Mentions</p>
          </div>
          <div className={cn("rounded-lg border", compact ? "p-2" : "p-3")}>
            <p className={cn("font-bold", compact ? "text-lg" : "text-2xl")}>{details.total_upvotes ?? 0}</p>
            <p className="text-[10px] text-muted-foreground sm:text-xs">Upvotes</p>
          </div>
          <div className={cn("rounded-lg border", compact ? "p-2" : "p-3")}>
            <p className={cn("font-bold", compact ? "text-lg" : "text-2xl")}>{details.total_comments ?? 0}</p>
            <p className="text-[10px] text-muted-foreground sm:text-xs">Comments</p>
          </div>
        </div>

        {sentiment && (
          <div className={cn("rounded-lg border", compact ? "p-2" : "p-3")}>
            <p className={cn("font-medium", compact ? "mb-1 text-xs" : "mb-2 text-sm")}>Sentiment</p>
            <div
              className={cn(
                "flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground",
                compact ? "text-[10px] sm:text-xs" : "text-sm",
              )}
            >
              <span className="text-green-500">+{sentiment.positive} pos</span>
              <span className="text-red-500">−{sentiment.negative} neg</span>
              <span>{sentiment.neutral} neutral</span>
            </div>
          </div>
        )}

        {details.subreddits && details.subreddits.length > 0 && (
          <div>
            <p className={cn("mb-2 font-medium", compact ? "text-xs" : "text-sm")}>
              Subreddits{compact ? "" : ` (${details.subreddits.length})`}
            </p>
            <div className="flex flex-wrap gap-1">
              {details.subreddits.slice(0, compact ? 8 : undefined).map((sub) => (
                <span
                  key={sub}
                  className={cn(
                    "rounded-full bg-muted text-muted-foreground",
                    compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
                  )}
                >
                  r/{sub}
                </span>
              ))}
            </div>
          </div>
        )}

        {details.posts && details.posts.length > 0 && (
          <div className="space-y-1">
            <p className={cn("font-medium", compact ? "text-xs" : "text-sm")}>Recent</p>
            <div
              className={cn(
                "space-y-1 overflow-y-auto",
                compact ? "max-h-[9rem]" : "max-h-60",
              )}
            >
              {details.posts.slice(0, compact ? 4 : 10).map((post, i) => (
                <a
                  key={i}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded bg-muted/30 p-2 transition-colors hover:bg-muted/60"
                >
                  <p className="truncate text-xs">{post.title}</p>
                  <div className="mt-1 flex gap-2 text-[10px] text-muted-foreground">
                    <span>r/{post.subreddit}</span>
                    <span>{post.upvotes}↑</span>
                    <span>{post.comments}c</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
