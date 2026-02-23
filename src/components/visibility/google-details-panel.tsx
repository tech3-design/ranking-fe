"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GoogleDetails } from "@/lib/api/visibility";

interface GoogleDetailsPanelProps {
  details: GoogleDetails;
  score: number | null;
}

const METHOD_LABELS: Record<string, { label: string; color: string }> = {
  google_cse_api: { label: "Google API", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  googlesearch_scraper: { label: "Web Scraper", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  llm_analysis: { label: "AI Analysis", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  llm_estimate: { label: "AI Estimate", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
};

export function GoogleDetailsPanel({ details, score }: GoogleDetailsPanelProps) {
  const method = details.method ? METHOD_LABELS[details.method] : null;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Google Search Details</CardTitle>
            {method && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${method.color}`}>
                {method.label}
              </span>
            )}
          </div>
          <span className="font-mono text-sm font-bold">
            {score != null ? Math.round(score) : "—"}/100
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {details.error && (
          <p className="text-sm text-destructive">{details.error}</p>
        )}

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-2xl font-bold">
              {details.brand_rank_position != null ? `#${details.brand_rank_position}` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Brand Rank</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-2xl font-bold">
              {formatNumber(details.site_index_estimate ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">Indexed Pages</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-2xl font-bold">
              {details.brand_results_count ?? 0}
              <span className="text-sm text-muted-foreground font-normal">
                /{details.total_results_checked ?? 10}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">Brand Results</p>
          </div>
        </div>

        {/* Knowledge Panel & AI Overview badges */}
        {(details.has_knowledge_panel !== undefined || details.in_ai_overview !== undefined) && (
          <div className="flex gap-2 flex-wrap">
            {details.has_knowledge_panel !== undefined && (
              <div
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
                  details.has_knowledge_panel
                    ? "text-green-400 bg-green-500/10 border-green-500/20"
                    : "text-muted-foreground bg-muted/30 border-border/50"
                }`}
              >
                <span>{details.has_knowledge_panel ? "✓" : "✗"}</span>
                <span>Knowledge Panel</span>
              </div>
            )}
            {details.in_ai_overview !== undefined && (
              <div
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
                  details.in_ai_overview
                    ? "text-purple-400 bg-purple-500/10 border-purple-500/20"
                    : "text-muted-foreground bg-muted/30 border-border/50"
                }`}
              >
                <span>{details.in_ai_overview ? "✓" : "✗"}</span>
                <span>AI Overview</span>
              </div>
            )}
          </div>
        )}

        {/* Sub-scores breakdown */}
        {details.sub_scores && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Score Breakdown</p>
            <div className="space-y-1.5">
              {Object.entries(details.sub_scores).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-32 capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/80 transition-all"
                      style={{ width: `${Math.min(100, value)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono w-8 text-right">{Math.round(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reasoning (LLM method) */}
        {details.reasoning && (
          <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {details.reasoning}
            </p>
          </div>
        )}

        {/* Top Search Results */}
        {details.brand_search_results && details.brand_search_results.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Top Search Results</p>
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {details.brand_search_results.map((r, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg text-xs ${
                    r.is_brand
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-muted/20 border border-border/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono w-5 text-muted-foreground shrink-0">
                      #{r.position}
                    </span>
                    <div className="flex-1 min-w-0">
                      {r.title ? (
                        <p className="font-medium truncate">{r.title}</p>
                      ) : null}
                      <p className="text-muted-foreground truncate">{r.url}</p>
                      {r.snippet ? (
                        <p className="text-muted-foreground/70 line-clamp-2 mt-0.5">
                          {r.snippet}
                        </p>
                      ) : null}
                    </div>
                    {r.is_brand && (
                      <span className="text-green-400 text-[10px] font-semibold shrink-0 px-1.5 py-0.5 rounded bg-green-500/10">
                        YOUR BRAND
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}
