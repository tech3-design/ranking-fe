"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GoogleDetails } from "@/lib/api/visibility";

interface GoogleDetailsPanelProps {
  details: GoogleDetails;
  score: number | null;
  /** Dense layout for bento / above-the-fold grids */
  compact?: boolean;
}

const METHOD_LABELS: Record<string, { label: string; color: string }> = {
  google_cse_api: { label: "Google API", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  googlesearch_scraper: { label: "Web Scraper", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  llm_analysis: { label: "AI Analysis", color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
  llm_estimate: { label: "AI Estimate", color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
};

export function GoogleDetailsPanel({ details, score, compact = false }: GoogleDetailsPanelProps) {
  const method = details.method ? METHOD_LABELS[details.method] : null;

  return (
    <Card className="glass-card h-full border-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none">
      <CardHeader className={cn(compact && "space-y-0 pb-2 pt-4")}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <CardTitle className={cn("tracking-tight", compact ? "text-sm" : "text-base")}>
              Google
            </CardTitle>
            {method && (
              <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md border ${method.color}`}>
                {method.label}
              </span>
            )}
          </div>
          <span className={cn("shrink-0 font-mono font-bold tabular-nums", compact ? "text-sm" : "text-sm")}>
            {score != null ? Math.round(score) : "—"}
            <span className="text-muted-foreground font-sans text-xs font-normal">/100</span>
          </span>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-4", compact && "space-y-3 pb-4 pt-0")}>
        {details.error && (
          <p className="text-sm text-destructive">{details.error}</p>
        )}

        {/* Key metrics */}
        <div className={cn("grid grid-cols-3 gap-2 text-center sm:gap-3", compact && "gap-1.5")}>
          <div
            className={cn(
              "rounded-lg border border-border/50 bg-muted/30",
              compact ? "p-2" : "p-3",
            )}
          >
            <p className={cn("font-bold", compact ? "text-lg" : "text-2xl")}>
              {details.brand_rank_position != null ? `#${details.brand_rank_position}` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground sm:text-xs">Brand rank</p>
          </div>
          <div
            className={cn(
              "rounded-lg border border-border/50 bg-muted/30",
              compact ? "p-2" : "p-3",
            )}
          >
            <p className={cn("font-bold", compact ? "text-lg" : "text-2xl")}>
              {formatNumber(details.site_index_estimate ?? 0)}
            </p>
            <p className="text-[10px] text-muted-foreground sm:text-xs">Indexed</p>
          </div>
          <div
            className={cn(
              "rounded-lg border border-border/50 bg-muted/30",
              compact ? "p-2" : "p-3",
            )}
          >
            <p className={cn("font-bold", compact ? "text-lg" : "text-2xl")}>
              {details.brand_results_count ?? 0}
              <span className="text-muted-foreground font-normal text-xs sm:text-sm">
                /{details.total_results_checked ?? 10}
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground sm:text-xs">In SERP</p>
          </div>
        </div>

        {/* Knowledge Panel & AI Overview badges */}
        {(details.has_knowledge_panel !== undefined || details.in_ai_overview !== undefined) && (
          <div className={cn("flex flex-wrap gap-1.5", compact && "gap-1")}>
            {details.has_knowledge_panel !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full border",
                  compact ? "px-2 py-0.5 text-[10px]" : "gap-1.5 px-3 py-1.5 text-xs",
                  details.has_knowledge_panel
                    ? "border-green-500/20 bg-green-500/10 text-green-400"
                    : "border-border/50 bg-muted/30 text-muted-foreground",
                )}
              >
                <span>{details.has_knowledge_panel ? "✓" : "✗"}</span>
                <span>{compact ? "Knowledge" : "Knowledge Panel"}</span>
              </div>
            )}
            {details.in_ai_overview !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full border",
                  compact ? "px-2 py-0.5 text-[10px]" : "gap-1.5 px-3 py-1.5 text-xs",
                  details.in_ai_overview
                    ? "border-teal-500/20 bg-teal-500/10 text-teal-400"
                    : "border-border/50 bg-muted/30 text-muted-foreground",
                )}
              >
                <span>{details.in_ai_overview ? "✓" : "✗"}</span>
                <span>{compact ? "AI Overview" : "AI Overview"}</span>
              </div>
            )}
          </div>
        )}

        {/* Sub-scores breakdown */}
        {details.sub_scores && (
          <div className={cn("space-y-2", compact && "max-h-[140px] overflow-y-auto pr-1")}>
            <p className={cn("font-medium", compact ? "text-xs" : "text-sm")}>Breakdown</p>
            <div className="space-y-1.5">
              {Object.entries(details.sub_scores)
                .slice(0, compact ? 6 : undefined)
                .map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-24 shrink-0 capitalize text-muted-foreground sm:w-32",
                      compact ? "text-[10px]" : "text-xs",
                    )}
                  >
                    {key.replace(/_/g, " ")}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/50 sm:h-2">
                    <div
                      className="h-full rounded-full bg-primary/80 transition-all"
                      style={{ width: `${Math.min(100, value)}%` }}
                    />
                  </div>
                  <span className="w-7 shrink-0 text-right font-mono text-[10px] sm:text-xs">
                    {Math.round(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reasoning (LLM method) */}
        {!compact && details.reasoning && (
          <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {details.reasoning}
            </p>
          </div>
        )}

        {/* Top Search Results */}
        {!compact && details.brand_search_results && details.brand_search_results.length > 0 && (
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
