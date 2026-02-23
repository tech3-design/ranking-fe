"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RedditDetails } from "@/lib/api/visibility";

interface RedditDetailsPanelProps {
  details: RedditDetails;
  score: number | null;
}

export function RedditDetailsPanel({ details, score }: RedditDetailsPanelProps) {
  const sentiment = details.sentiment;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Reddit Mentions</CardTitle>
          <span className="font-mono text-sm font-bold">
            {score != null ? Math.round(score) : "—"}/100
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {details.error && (
          <p className="text-sm text-destructive">{details.error}</p>
        )}

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-bold">{details.total_mentions ?? 0}</p>
            <p className="text-xs text-muted-foreground">Mentions</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-bold">{details.total_upvotes ?? 0}</p>
            <p className="text-xs text-muted-foreground">Upvotes</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-bold">{details.total_comments ?? 0}</p>
            <p className="text-xs text-muted-foreground">Comments</p>
          </div>
        </div>

        {/* Sentiment */}
        {sentiment && (
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium mb-2">Sentiment</p>
            <div className="flex gap-4 text-sm">
              <span className="text-green-500">
                +{sentiment.positive} positive
              </span>
              <span className="text-red-500">
                -{sentiment.negative} negative
              </span>
              <span className="text-muted-foreground">
                {sentiment.neutral} neutral
              </span>
            </div>
          </div>
        )}

        {/* Subreddits */}
        {details.subreddits && details.subreddits.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">
              Active Subreddits ({details.subreddits.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {details.subreddits.map((sub) => (
                <span
                  key={sub}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  r/{sub}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        {details.posts && details.posts.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Recent Posts</p>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {details.posts.slice(0, 10).map((post, i) => (
                <a
                  key={i}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded bg-muted/30 hover:bg-muted/60 transition-colors"
                >
                  <p className="text-xs truncate">{post.title}</p>
                  <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span>r/{post.subreddit}</span>
                    <span>{post.upvotes} upvotes</span>
                    <span>{post.comments} comments</span>
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
