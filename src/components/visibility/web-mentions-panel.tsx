"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

const PLATFORM_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  blog: {
    label: "Blogs",
    icon: <FileText className="w-4 h-4" />,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
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
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  review: {
    label: "Review Sites",
    icon: <Star className="w-4 h-4" />,
    color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  },
  other: {
    label: "Other",
    icon: <Globe className="w-4 h-4" />,
    color: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  },
};

const METHOD_LABELS: Record<string, { label: string; color: string }> = {
  google_cse_api: {
    label: "Google API",
    color: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  llm_analysis: {
    label: "AI Analysis",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
};

export function WebMentionsPanel({ details, score }: WebMentionsPanelProps) {
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
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Web Mentions</CardTitle>
            {method && (
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${method.color}`}
              >
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
            <p className="text-2xl font-bold">{details.total_mentions ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total Mentions</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-2xl font-bold">
              {Object.keys(details.platform_counts ?? {}).length}
            </p>
            <p className="text-xs text-muted-foreground">Platform Types</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-2xl font-bold">
              {new Set(mentions.map((m) => m.domain)).size}
            </p>
            <p className="text-xs text-muted-foreground">Unique Domains</p>
          </div>
        </div>

        {/* Sub-scores breakdown */}
        {details.sub_scores && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Score Breakdown</p>
            <div className="space-y-1.5">
              {Object.entries(details.sub_scores).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-36 capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/80 transition-all"
                      style={{ width: `${Math.min(100, value)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono w-8 text-right">
                    {Math.round(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reasoning */}
        {details.reasoning && (
          <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {details.reasoning}
            </p>
          </div>
        )}

        {/* Grouped mentions */}
        {sortedTypes.length > 0 && (
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
