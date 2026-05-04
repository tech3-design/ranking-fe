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
import { HorizontalScoreBar, BRAND_PALETTE } from "@/components/ui/vis-charts";

interface WebMentionsPanelProps {
  details: WebMentionsDetails;
  score: number | null;
  compact?: boolean;
}

const PLATFORM_CONFIG: Record<
  string,
  { label: string; icon: ReactNode; hexColor: string }
> = {
  blog: { label: "Blogs", icon: <FileText className="w-4 h-4" />, hexColor: BRAND_PALETTE[0] },
  news: { label: "News", icon: <Newspaper className="w-4 h-4" />, hexColor: BRAND_PALETTE[1] },
  forum: { label: "Forums", icon: <MessageSquare className="w-4 h-4" />, hexColor: BRAND_PALETTE[2] },
  social: { label: "Social Media", icon: <Users className="w-4 h-4" />, hexColor: BRAND_PALETTE[3] },
  review: { label: "Review Sites", icon: <Star className="w-4 h-4" />, hexColor: BRAND_PALETTE[4] },
  other: { label: "Other", icon: <Globe className="w-4 h-4" />, hexColor: BRAND_PALETTE[5] },
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
  if (s >= 70) return { text: "text-emerald-600" };
  if (s >= 40) return { text: "text-amber-600" };
  return { text: "text-primary" };
}

export function WebMentionsPanel({ details, score, compact = false }: WebMentionsPanelProps) {
  const mentions = details.mentions ?? [];
  const method = details.method ? METHOD_LABELS[details.method] : null;
  const roundedScore = score != null ? Math.round(score) : 0;
  const tone = scoreTone(roundedScore);

  const grouped: Record<string, typeof mentions> = {};
  for (const m of mentions) {
    const type = m.platform_type || "other";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(m);
  }

  const sortedTypes = Object.keys(grouped).sort(
    (a, b) => grouped[b].length - grouped[a].length,
  );

  return (
    <Card className="glass-card">
      <CardHeader className={cn("pb-3", compact && "pb-2 pt-4")}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="flex size-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${BRAND_PALETTE[0]}18` }}
            >
              <Globe className="size-3.5" style={{ color: BRAND_PALETTE[0] }} />
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
          <span
            className={cn(
              "shrink-0 font-mono font-bold tabular-nums",
              compact ? "text-base" : "text-lg",
              tone.text,
            )}
          >
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
              icon: <Hash className="size-3.5" style={{ color: BRAND_PALETTE[0] }} />,
            },
            {
              label: "Types",
              value: Object.keys(details.platform_counts ?? {}).length,
              icon: <Layers className="size-3.5" style={{ color: BRAND_PALETTE[2] }} />,
            },
            {
              label: "Domains",
              value: new Set(mentions.map((m) => m.domain)).size,
              icon: <Link2 className="size-3.5" style={{ color: BRAND_PALETTE[4] }} />,
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
              <p
                className={cn(
                  "font-bold tabular-nums tracking-tight",
                  compact ? "text-lg" : "text-xl",
                )}
              >
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
          <div className="space-y-2.5">
            <p className={cn("font-semibold tracking-tight", compact ? "text-xs" : "text-sm")}>
              Breakdown
            </p>
            <div className="space-y-2">
              {Object.entries(details.sub_scores)
                .slice(0, compact ? 5 : undefined)
                .map(([key, value]) => (
                  <HorizontalScoreBar
                    key={key}
                    label={key}
                    value={value}
                    compact={compact}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Reasoning */}
        {!compact && details.reasoning && (
          <div className="rounded-xl bg-muted/20 border border-border/50 p-3.5">
            <p className="text-xs text-muted-foreground leading-relaxed">{details.reasoning}</p>
          </div>
        )}

        {/* Grouped mentions — full accordion */}
        {!compact && sortedTypes.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-tight">Mentions by Platform</p>
            <div className="space-y-1.5">
              {sortedTypes.map((type) => (
                <MentionGroup key={type} type={type} mentions={grouped[type]} />
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
                    className="inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-medium text-foreground"
                    style={{
                      backgroundColor: `${config.hexColor}18`,
                      borderColor: `${config.hexColor}30`,
                    }}
                  >
                    {config.label}
                    <span className="tabular-nums font-bold opacity-80">{grouped[type].length}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {compact && mentions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold tracking-tight">Top links</p>
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-muted/5">
              <div className="max-h-80 overflow-y-auto divide-y divide-border/30">
                {mentions.slice(0, 12).map((m, i) => (
                  <a
                    key={i}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 px-3 py-2.5 text-[11px] transition-colors hover:bg-muted/20"
                  >
                    <ExternalLink className="size-3 shrink-0 text-muted-foreground/50 transition-opacity group-hover:text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 font-medium text-foreground">{m.title || m.url}</span>
                      <span className="mt-0.5 block font-mono text-[9px] text-muted-foreground/70">
                        {m.domain}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
              {mentions.length > 12 && (
                <div className="border-t border-border/40 px-3 py-1.5 text-center text-[10px] text-muted-foreground/60">
                  +{mentions.length - 12} more
                </div>
              )}
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
    <div className="overflow-hidden rounded-xl border border-border/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors hover:bg-muted/20"
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
        <span style={{ color: config.hexColor }}>{config.icon}</span>
        <span className="font-semibold">{config.label}</span>
        <span
          className="ml-auto rounded-lg border px-2 py-0.5 text-[10px] font-bold text-foreground"
          style={{
            backgroundColor: `${config.hexColor}18`,
            borderColor: `${config.hexColor}30`,
          }}
        >
          {mentions.length}
        </span>
      </button>
      {open && (
        <div className="divide-y divide-border/20 border-t border-border/30">
          {mentions.map((m, i) => (
            <a
              key={i}
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 px-3.5 py-2.5 transition-colors hover:bg-muted/15"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-medium">{m.title || m.url}</p>
                  <ExternalLink className="w-3 h-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">{m.domain}</span>
                </div>
                {m.snippet && (
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground/70">
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
