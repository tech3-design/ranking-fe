"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GoogleDetails } from "@/lib/api/visibility";
import { CheckCircle2, XCircle, Search, TrendingUp } from "lucide-react";

interface GoogleDetailsPanelProps {
  details: GoogleDetails;
  score: number | null;
  /** Dense layout for bento / above-the-fold grids */
  compact?: boolean;
}

const METHOD_LABELS: Record<string, { label: string; color: string }> = {
  google_cse_api: { label: "Google API", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
  googlesearch_scraper: { label: "Web Scraper", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
  llm_analysis: { label: "AI Analysis", color: "text-teal-600 bg-teal-500/10 border-teal-500/20" },
  llm_estimate: { label: "AI Estimate", color: "text-teal-600 bg-teal-500/10 border-teal-500/20" },
};

function scoreTone(s: number) {
  if (s >= 70) return { fill: "hsl(152, 57%, 42%)", text: "text-emerald-600" };
  if (s >= 40) return { fill: "hsl(38, 92%, 50%)", text: "text-amber-600" };
  return { fill: "var(--primary)", text: "text-primary" };
}

export function GoogleDetailsPanel({ details, score, compact = false }: GoogleDetailsPanelProps) {
  const method = details.method ? METHOD_LABELS[details.method] : null;
  const roundedScore = score != null ? Math.round(score) : 0;
  const tone = scoreTone(roundedScore);

  return (
    <Card className="glass-card h-full border-border">
      <CardHeader className={cn("pb-3", compact && "pb-2 pt-4")}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-red-500/10">
              <Search className="size-3.5 text-red-600" />
            </div>
            <CardTitle className={cn("tracking-tight", compact ? "text-sm" : "text-base")}>
              Google
            </CardTitle>
            {method && (
              <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md border ${method.color}`}>
                {method.label}
              </span>
            )}
          </div>
          <span className={cn("shrink-0 font-mono font-bold tabular-nums", compact ? "text-base" : "text-lg", tone.text)}>
            {score != null ? roundedScore : "—"}
            <span className="text-muted-foreground font-sans text-xs font-normal">/100</span>
          </span>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-4", compact && "space-y-3 pb-4 pt-0")}>
        {details.error && (
          <p className="text-sm text-destructive">{details.error}</p>
        )}

        {/* Key metrics row */}
        <div className={cn("grid grid-cols-3 gap-2", compact && "gap-1.5")}>
          {[
            {
              label: "Brand rank",
              value: details.brand_rank_position != null ? `#${details.brand_rank_position}` : "—",
              icon: <TrendingUp className="size-3.5 text-emerald-600" />,
            },
            {
              label: "Indexed",
              value: formatNumber(details.site_index_estimate ?? 0),
              icon: <Search className="size-3.5 text-blue-500" />,
            },
            {
              label: "In SERP",
              value: `${details.brand_results_count ?? 0}/${details.total_results_checked ?? 10}`,
              icon: <CheckCircle2 className="size-3.5 text-amber-500" />,
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

        {/* Knowledge Panel & AI Overview badges */}
        {(details.has_knowledge_panel !== undefined || details.in_ai_overview !== undefined) && (
          <div className={cn("flex flex-wrap gap-1.5", compact && "gap-1")}>
            {details.has_knowledge_panel !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border transition-colors",
                  compact ? "px-2.5 py-1 text-[11px]" : "gap-1.5 px-3 py-1.5 text-xs",
                  details.has_knowledge_panel
                    ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-700"
                    : "border-border/60 bg-muted/20 text-muted-foreground",
                )}
              >
                {details.has_knowledge_panel ? (
                  <CheckCircle2 className="size-3.5 shrink-0" />
                ) : (
                  <XCircle className="size-3.5 shrink-0 opacity-50" />
                )}
                <span className="font-medium">{compact ? "Knowledge" : "Knowledge Panel"}</span>
              </div>
            )}
            {details.in_ai_overview !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border transition-colors",
                  compact ? "px-2.5 py-1 text-[11px]" : "gap-1.5 px-3 py-1.5 text-xs",
                  details.in_ai_overview
                    ? "border-teal-500/25 bg-teal-500/8 text-teal-700"
                    : "border-border/60 bg-muted/20 text-muted-foreground",
                )}
              >
                {details.in_ai_overview ? (
                  <CheckCircle2 className="size-3.5 shrink-0" />
                ) : (
                  <XCircle className="size-3.5 shrink-0 opacity-50" />
                )}
                <span className="font-medium">AI Overview</span>
              </div>
            )}
          </div>
        )}

        {/* Sub-scores breakdown with styled bars */}
        {details.sub_scores && (
          <div className={cn("space-y-2.5", compact && "max-h-[160px] overflow-y-auto pr-1")}>
            <p className={cn("font-semibold tracking-tight", compact ? "text-xs" : "text-sm")}>Breakdown</p>
            <div className="space-y-2">
              {Object.entries(details.sub_scores)
                .slice(0, compact ? 6 : undefined)
                .map(([key, value]) => {
                  const barTone = scoreTone(value);
                  return (
                    <div key={key} className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "w-28 shrink-0 capitalize text-muted-foreground truncate",
                          compact ? "text-[11px]" : "text-xs",
                        )}
                      >
                        {key.replace(/_/g, " ")}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/40">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${Math.min(100, value)}%`,
                            backgroundColor: barTone.fill,
                          }}
                        />
                      </div>
                      <span className={cn(
                        "w-8 shrink-0 text-right font-mono font-semibold tabular-nums",
                        compact ? "text-[11px]" : "text-xs",
                      )}>
                        {Math.round(value)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Reasoning (LLM method) */}
        {!compact && details.reasoning && (
          <div className="rounded-xl bg-muted/20 border border-border/50 p-3.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {details.reasoning}
            </p>
          </div>
        )}

        {/* Top Search Results */}
        {!compact && details.brand_search_results && details.brand_search_results.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-tight">Top Search Results</p>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {details.brand_search_results.map((r, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-2.5 rounded-xl text-xs border transition-colors",
                    r.is_brand
                      ? "bg-emerald-500/6 border-emerald-500/20 hover:bg-emerald-500/10"
                      : "bg-muted/15 border-border/40 hover:bg-muted/30",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono w-5 text-muted-foreground shrink-0 text-[10px]">
                      #{r.position}
                    </span>
                    <div className="flex-1 min-w-0">
                      {r.title ? (
                        <p className="font-medium truncate">{r.title}</p>
                      ) : null}
                      <p className="text-muted-foreground truncate text-[10px]">{r.url}</p>
                      {r.snippet ? (
                        <p className="text-muted-foreground/70 line-clamp-2 mt-0.5">
                          {r.snippet}
                        </p>
                      ) : null}
                    </div>
                    {r.is_brand && (
                      <span className="text-emerald-700 text-[9px] font-bold shrink-0 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-wider">
                        Brand
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
