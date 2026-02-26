"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MediumDetails } from "@/lib/api/visibility";

interface MediumDetailsPanelProps {
  details: MediumDetails;
  score: number | null;
}

export function MediumDetailsPanel({ details, score }: MediumDetailsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Medium Presence</CardTitle>
          <span className="font-mono text-sm font-bold">
            {score != null ? Math.round(score) : "—"}/100
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {details.method === "llm_estimate" && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              Estimated via AI: {details.reasoning}
            </p>
          </div>
        )}

        {details.error && (
          <p className="text-sm text-destructive">{details.error}</p>
        )}

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-bold">{details.total_articles ?? 0}</p>
            <p className="text-xs text-muted-foreground">Articles Found</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-bold">{details.relevant_titles ?? 0}</p>
            <p className="text-xs text-muted-foreground">Relevant Titles</p>
          </div>
        </div>

        {details.articles && details.articles.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Articles</p>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {details.articles.map((article, i) => (
                <a
                  key={i}
                  href={article.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block p-2 rounded transition-colors ${
                    article.is_relevant
                      ? "bg-green-500/10 border border-green-500/20 hover:bg-green-500/20"
                      : "bg-muted/30 hover:bg-muted/60"
                  }`}
                >
                  <p className="text-xs truncate">{article.title}</p>
                  {article.is_relevant && (
                    <span className="text-green-500 text-[10px] font-medium mt-0.5 inline-block">
                      BRAND RELEVANT
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
