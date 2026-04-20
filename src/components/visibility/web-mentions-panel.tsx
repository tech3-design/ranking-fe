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
} from "lucide-react";

interface WebMentionsPanelProps {
  details: WebMentionsDetails;
  score: number | null;
  /** Dense layout for bento / above-the-fold grids */
  compact?: boolean;
}

const PLATFORM_CONFIG: Record<
  string,
  { label: string; icon: ReactNode; color: string }
> = {
  blog: {
    label: "Blogs",
    icon: <FileText className="w-4 h-4" />,
    color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  },
  news: {
    label: "News",
    icon: <Newspaper className="w-4 h-4" />,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  forum: {
    label: "Forums",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  social: {
    label: "Social Media",
    icon: <Users className="w-4 h-4" />,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  review: {
    label: "Review Sites",
    icon: <Star className="w-4 h-4" />,
    color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  },
  other: {
    label: "Other",
    icon: <Globe className="w-4 h-4" />,
    color: "text-muted-foreground bg-muted border-border",
  },
};

const METHOD_LABELS: Record<string, { label: string; color: string }> = {
  google_cse_api: {
    label: "Google API",
    color: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  llm_analysis: {
    label: "AI Analysis",
    color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  },
};

export function WebMentionsPanel({ details, score, compact = false }: WebMentionsPanelProps) {
  const mentions = details.mentions ?? [];
  const method = details.method ? METHOD_LABELS[details.method] : null;

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

  return (
    <Card className="glass-card h-full">
      <CardHeader className={cn(compact && "space-y-0 pb-2 pt-4")}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <CardTitle className={cn("tracking-tight", compact ? "text-sm" : "text-base")}>
              Web
            </CardTitle>
            {method && (
              <span
                className={cn(
                  "shrink-0 rounded-full border font-medium",
                  compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
                  method.color,
                )}
              >
                {method.label}
              </span>
            )}
          </div>
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

        {/* Key metrics */}
        <div className={cn("grid grid-cols-3 gap-2 text-center sm:gap-3", compact && "gap-1.5")}>
          <div
            className={cn(
              "rounded-lg border border-border/50 bg-muted/30",
              compact ? "p-2" : "p-3",
            )}
          >
            <p className={cn("font-bold", compact ? "text-lg" : "text-2xl")}>{details.total_mentions ?? 0}</p>
            <p className="text-[10px] text-muted-foreground sm:text-xs">Mentions</p>
          </div>
          <div
            className={cn(
              "rounded-lg border border-border/50 bg-muted/30",
              compact ? "p-2" : "p-3",
            )}
          >
            <p className={cn("font-bold", compact ? "text-lg" : "text-2xl")}>
              {Object.keys(details.platform_counts ?? {}).length}
            </p>
            <p className="text-[10px] text-muted-foreground sm:text-xs">Types</p>
          </div>
          <div
            className={cn(
              "rounded-lg border border-border/50 bg-muted/30",
              compact ? "p-2" : "p-3",
            )}
          >
            <p className={cn("font-bold", compact ? "text-lg" : "text-2xl")}>
              {new Set(mentions.map((m) => m.domain)).size}
            </p>
            <p className="text-[10px] text-muted-foreground sm:text-xs">Domains</p>
          </div>
        </div>

        {/* Sub-scores breakdown */}
        {details.sub_scores && (
          <div className={cn("space-y-2", compact && "max-h-[120px] overflow-y-auto pr-1")}>
            <p className={cn("font-medium", compact ? "text-xs" : "text-sm")}>Breakdown</p>
            <div className="space-y-1.5">
              {Object.entries(details.sub_scores)
                .slice(0, compact ? 5 : undefined)
                .map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-28 shrink-0 capitalize text-muted-foreground sm:w-36",
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

        {/* Reasoning */}
        {!compact && details.reasoning && (
          <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {details.reasoning}
            </p>
          </div>
        )}

        {/* Grouped mentions — full accordion */}
        {!compact && sortedTypes.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Mentions by Platform</p>
            <div className="space-y-2">
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
            <p className="text-xs font-medium">By type</p>
            <div className="flex flex-wrap gap-1">
              {sortedTypes.map((type) => {
                const config = PLATFORM_CONFIG[type] ?? PLATFORM_CONFIG.other;
                return (
                  <span
                    key={type}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
                      config.color,
                    )}
                  >
                    {config.label}
                    <span className="tabular-nums opacity-80">{grouped[type].length}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {compact && mentions.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium">Top links</p>
            <div className="max-h-[7.5rem] space-y-1 overflow-y-auto pr-0.5">
              {mentions.slice(0, 5).map((m, i) => (
                <a
                  key={i}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-1.5 rounded-md border border-border/40 px-2 py-1.5 text-[10px] transition-colors hover:bg-muted/30"
                >
                  <ExternalLink className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
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
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/30 transition-colors"
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
        <span className={config.color.split(" ")[0]}>{config.icon}</span>
        <span className="font-medium">{config.label}</span>
        <span
          className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full border ${config.color}`}
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
              className="flex items-start gap-2 px-3 py-2 hover:bg-muted/20 transition-colors group"
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
