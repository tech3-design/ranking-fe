"use client";

import { useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WebMentionsDetails } from "@/lib/api/visibility";
import {
  Globe,
  Newspaper,
  MessageSquare,
  Users,
  Star,
  FileText,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Link2,
  Layers,
  Hash,
} from "lucide-react";
import { ChartConfig } from "../ui/chart";

interface WebMentionsPanelProps {
  details: WebMentionsDetails;
  score: number | null;
  /** Dense layout for bento / above-the-fold grids */
  compact?: boolean;
}

const PLATFORM_CONFIG: Record<
  string,
  { label: string; icon: ReactNode; color: string; fill: string }
> = {
  blog: {
    label: "Blogs",
    icon: <FileText className="w-4 h-4" />,
    color: "text-teal-600 bg-teal-500/10 border-teal-500/20",
    fill: "#14b8a6",
  },
  news: {
    label: "News",
    icon: <Newspaper className="w-4 h-4" />,
    color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    fill: "#f59e0b",
  },
  forum: {
    label: "Forums",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    fill: "#22c55e",
  },
  social: {
    label: "Social Media",
    icon: <Users className="w-4 h-4" />,
    color: "text-cyan-600 bg-cyan-500/10 border-cyan-500/20",
    fill: "#06b6d4",
  },
  review: {
    label: "Review Sites",
    icon: <Star className="w-4 h-4" />,
    color: "text-yellow-600 bg-yellow-500/10 border-yellow-500/20",
    fill: "#eab308",
  },
  other: {
    label: "Other",
    icon: <Globe className="w-4 h-4" />,
    color: "text-muted-foreground bg-muted border-border",
    fill: "#94a3b8",
  },
};

const METHOD_LABELS: Record<string, { label: string; color: string }> = {
  google_cse_api: {
    label: "Google API",
    color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  },
  llm_analysis: {
    label: "AI Analysis",
    color: "text-teal-600 bg-teal-500/10 border-teal-500/20",
  },
};

function scoreTone(s: number) {
  if (s >= 70) return { fill: "hsl(152, 57%, 42%)", text: "text-emerald-600" };
  if (s >= 40) return { fill: "hsl(38, 92%, 50%)", text: "text-amber-600" };
  return { fill: "var(--primary)", text: "text-primary" };
}

export function WebMentionsPanel({ details, score, compact = false }: WebMentionsPanelProps) {
  const mentions = details.mentions ?? [];
  const method = details.method ? METHOD_LABELS[details.method] : null;
  const roundedScore = score != null ? Math.round(score) : 0;
  const tone = scoreTone(roundedScore);

  // Group mentions by platform_type
  const grouped: Record<string, typeof mentions> = {};
  for (const m of mentions) {
    const type = m.platform_type || "other";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(m);
  }

  // Sort groups by count descending
  const sortedTypes = Object.keys(grouped).sort(
    (a, b) => grouped[b].length - grouped[a].length,
  );

  // Chart data for platform breakdown
  const chartData = sortedTypes.map((type) => ({
    type: (PLATFORM_CONFIG[type] ?? PLATFORM_CONFIG.other).label,
    count: grouped[type].length,
    fill: (PLATFORM_CONFIG[type] ?? PLATFORM_CONFIG.other).fill,
  }));

  const chartConfig: ChartConfig = Object.fromEntries(
    sortedTypes.map((type) => [
      type,
      {
        label: (PLATFORM_CONFIG[type] ?? PLATFORM_CONFIG.other).label,
        color: (PLATFORM_CONFIG[type] ?? PLATFORM_CONFIG.other).fill,
      },
    ]),
  );

  return (
    <Card className="glass-card h-full">
      <CardHeader className={cn("pb-3", compact && "pb-2 pt-4")}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10">
              <Globe className="size-3.5 text-blue-600" />
            </div>
            <CardTitle className={cn("tracking-tight", compact ? "text-sm" : "text-base")}>
              Web
            </CardTitle>
            {method && (
              <span
                className={cn(
                  "shrink-0 rounded-md border font-medium",
                  compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
                  method.color,
                )}
              >
                {method.label}
              </span>
            )}
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

        {/* Key metrics */}
        <div className={cn("grid grid-cols-3 gap-2", compact && "gap-1.5")}>
          {[
            {
              label: "Mentions",
              value: details.total_mentions ?? 0,
              icon: <Hash className="size-3.5 text-blue-500" />,
            },
            {
              label: "Types",
              value: Object.keys(details.platform_counts ?? {}).length,
              icon: <Layers className="size-3.5 text-purple-500" />,
            },
            {
              label: "Domains",
              value: new Set(mentions.map((m) => m.domain)).size,
              icon: <Link2 className="size-3.5 text-emerald-500" />,
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

        {/* Sub-scores breakdown */}
        {details.sub_scores && (
          <div className={cn("space-y-2.5", compact && "max-h-[130px] overflow-y-auto pr-1")}>
            <p className={cn("font-semibold tracking-tight", compact ? "text-xs" : "text-sm")}>Breakdown</p>
            <div className="space-y-2">
              {Object.entries(details.sub_scores)
                .slice(0, compact ? 5 : undefined)
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

        {/* Reasoning */}
        {!compact && details.reasoning && (
          <div className="rounded-xl bg-muted/20 border border-border/50 p-3.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {details.reasoning}
            </p>
          </div>
        )}

        {/* Grouped mentions — full accordion */}
        {!compact && sortedTypes.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-tight">Mentions by Platform</p>
            <div className="space-y-1.5">
              {sortedTypes.map((type) => (
                <MentionGroup
                  key={type}
                  type={type}
                  mentions={grouped[type]}
                />
              ))}
            </div>
          </div>
        )}

        {/* Compact: type chips + top links */}
        {compact && sortedTypes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-tight">By type</p>
            <div className="flex flex-wrap gap-1.5">
              {sortedTypes.map((type) => {
                const config = PLATFORM_CONFIG[type] ?? PLATFORM_CONFIG.other;
                return (
                  <span
                    key={type}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-medium",
                      config.color,
                    )}
                  >
                    {config.label}
                    <span className="tabular-nums opacity-80 font-bold">{grouped[type].length}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {compact && mentions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold tracking-tight">Top links</p>
            <div className="max-h-[7.5rem] space-y-1.5 overflow-y-auto pr-0.5">
              {mentions.slice(0, 5).map((m, i) => (
                <a
                  key={i}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2 rounded-xl border border-border/40 bg-muted/10 px-2.5 py-2 text-[11px] transition-all hover:bg-muted/30 hover:border-border/80"
                >
                  <ExternalLink className="mt-0.5 size-3 shrink-0 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 font-medium text-foreground">{m.title || m.url}</span>
                    <span className="mt-0.5 block font-mono text-[9px] text-muted-foreground">{m.domain}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MentionGroup({
  type,
  mentions,
}: {
  type: string;
  mentions: Array<{
    url: string;
    title: string;
    snippet: string;
    platform_type: string;
    domain: string;
  }>;
}) {
  const [open, setOpen] = useState(false);
  const config = PLATFORM_CONFIG[type] ?? PLATFORM_CONFIG.other;

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm hover:bg-muted/20 transition-colors"
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
        <span className={config.color.split(" ")[0]}>{config.icon}</span>
        <span className="font-semibold">{config.label}</span>
        <span
          className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-lg border ${config.color}`}
        >
          {mentions.length}
        </span>
      </button>
      {open && (
        <div className="border-t border-border/30 divide-y divide-border/20">
          {mentions.map((m, i) => (
            <a
              key={i}
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 px-3.5 py-2.5 hover:bg-muted/15 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium truncate">
                    {m.title || m.url}
                  </p>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {m.domain}
                  </span>
                </div>
                {m.snippet && (
                  <p className="text-[11px] text-muted-foreground/70 line-clamp-2 mt-0.5">
                    {m.snippet}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
