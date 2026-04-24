"use client";

import type { ReactNode } from "react";
import type { BrandVisibility } from "@/lib/api/analyzer";
import type { GoogleDetails, RedditDetails, WebMentionsDetails } from "@/lib/api/visibility";
import { GoogleDetailsPanel } from "@/components/visibility/google-details-panel";
import { RedditDetailsPanel } from "@/components/visibility/reddit-details-panel";
import { WebMentionsPanel } from "@/components/visibility/web-mentions-panel";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import {
  MessageSquare,
  HelpCircle,
  BookOpen,
  Linkedin,
  Youtube,
  Twitter,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Activity,
  TrendingUp,
  Globe,
  Zap,
} from "lucide-react";

interface BrandVisibilityTabProps {
  brandName: string;
  visibility: BrandVisibility;
}

const PLATFORM_CONFIG: Array<{
  key: string;
  label: string;
  color: string;
  icon: ReactNode;
}> = [
    { key: "Google", label: "Google", color: "#ea4335", icon: <Search className="size-4" /> },
    { key: "Reddit", label: "Reddit", color: "#ff4500", icon: <MessageSquare className="size-4" /> },
    { key: "Quora", label: "Quora", color: "#b92b27", icon: <HelpCircle className="size-4" /> },
    { key: "Wikipedia", label: "Wikipedia", color: "#636466", icon: <BookOpen className="size-4" /> },
    { key: "LinkedIn", label: "LinkedIn", color: "#0a66c2", icon: <Linkedin className="size-4" /> },
    { key: "YouTube", label: "YouTube", color: "#ff0000", icon: <Youtube className="size-4" /> },
    { key: "X (Twitter)", label: "X (Twitter)", color: "#1da1f2", icon: <Twitter className="size-4" /> },
  ];

function scoreTone(s: number): { bar: string; text: string; fill: string } {
  if (s >= 70) return { bar: "bg-emerald-500", text: "text-emerald-600", fill: "hsl(152, 57%, 42%)" };
  if (s >= 40) return { bar: "bg-amber-500", text: "text-amber-600", fill: "hsl(38, 92%, 50%)" };
  return { bar: "bg-primary", text: "text-primary", fill: "var(--primary)" };
}

const gaugeConfig: ChartConfig = {
  score: { label: "Score", color: "var(--primary)" },
};

function ScoreGauge({ value, size = 100 }: { value: number; size?: number }) {
  const tone = scoreTone(value);
  const data = [{ name: "score", value, fill: tone.fill }];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ChartContainer config={gaugeConfig} className="!aspect-square" style={{ width: size, height: size }}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="72%"
          outerRadius="100%"
          barSize={10}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            dataKey="value"
            cornerRadius={12}
            background={{ fill: "var(--muted)" }}
          />
        </RadialBarChart>
      </ChartContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-bold tabular-nums tracking-tight", tone.text)}>
          {value}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">/100</span>
      </div>
    </div>
  );
}

function MiniScorePill({
  label,
  value,
  suffix,
  icon,
}: {
  label: string;
  value: number;
  suffix: string;
  icon: ReactNode;
}) {
  const tone = scoreTone(value);
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/15 px-3 py-2 transition-colors hover:bg-muted/30">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/40">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-0.5">
          <span className={cn("text-base font-bold tabular-nums tracking-tight", tone.text)}>{value}</span>
          <span className="text-[10px] text-muted-foreground">{suffix}</span>
        </div>
      </div>
    </div>
  );
}

export function BrandVisibilityTab({ brandName, visibility }: BrandVisibilityTabProps) {
  const checks = (visibility as unknown as Record<string, unknown>)?.checks as Record<string, unknown> | undefined;
  const platformPresence = (checks?.platform_presence ?? {}) as Record<
    string,
    { found: boolean; mentions: number; top_urls?: string[] }
  >;
  const platformsFound = (checks?.platforms_found ?? []) as string[];
  const googleData = (checks?.google_presence ?? {}) as { found?: boolean; signals?: string[] };
  const siteData = (checks?.brand_site_quality ?? {}) as Record<string, unknown>;

  const googleDetails = visibility.google_details as GoogleDetails | undefined;
  const redditDetails = visibility.reddit_details as RedditDetails | undefined;
  const webMentionsDetails = visibility.web_mentions_details as WebMentionsDetails | undefined;

  const totalChecked = PLATFORM_CONFIG.length;
  const foundCount = platformsFound.length + (googleData.found ? 1 : 0);
  const overall = Math.round(visibility.overall_score ?? 0);
  const googleScore = Math.round(visibility.google_score ?? 0);
  const redditScore = Math.round(visibility.reddit_score ?? 0);
  const webScore = Math.round(visibility.web_mentions_score ?? 0);
  const marketCoverage = Math.round((foundCount / Math.max(totalChecked, 1)) * 100);

  const platformRows = PLATFORM_CONFIG.map((plat) => ({
    ...plat,
    data: platformPresence[plat.key] ?? { found: false, mentions: 0, top_urls: [] },
  })).sort((a, b) => (b.data.mentions ?? 0) - (a.data.mentions ?? 0));

  const hasSiteSignals =
    siteData &&
    (siteData.has_about != null ||
      siteData.has_contact != null ||
      siteData.has_blog != null ||
      siteData.has_social_links != null ||
      siteData.content_depth != null);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      {/* Row 1 — Snapshot + Channel detail cards */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none lg:col-span-4 animate-enter">
        <div className="px-5 py-5">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="size-3.5 text-primary" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Visibility snapshot
            </p>
          </div>
          <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">
            {brandName}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {foundCount} of {totalChecked} platforms with signals · AI &amp; search footprint
          </p>

          {/* Score gauge + mini stats */}
          <div className="mt-4 flex items-center gap-4">
            <ScoreGauge value={overall} size={96} />
            <div className="flex-1 grid grid-cols-2 gap-2">
              <MiniScorePill
                label="Coverage"
                value={marketCoverage}
                suffix="%"
                icon={<Zap className="size-3.5 text-amber-500" />}
              />
              <MiniScorePill
                label="Google"
                value={googleScore}
                suffix="/100"
                icon={<Search className="size-3.5 text-red-500" />}
              />
              <MiniScorePill
                label="Reddit"
                value={redditScore}
                suffix="/100"
                icon={<MessageSquare className="size-3.5 text-orange-500" />}
              />
              <MiniScorePill
                label="Web"
                value={webScore}
                suffix="/100"
                icon={<Globe className="size-3.5 text-blue-500" />}
              />
            </div>
          </div>
        </div>

        {hasSiteSignals ? (
          <div className="border-t border-border/50 bg-muted/10 px-5 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Your site</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "About", ok: siteData.has_about },
                { label: "Contact", ok: siteData.has_contact },
                { label: "Blog", ok: siteData.has_blog },
                { label: "Social links", ok: siteData.has_social_links },
              ].map((item) => (
                <span
                  key={item.label}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    item.ok
                      ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-700"
                      : "border-border/60 bg-background/80 text-muted-foreground",
                  )}
                >
                  {item.ok ? (
                    <CheckCircle2 className="size-3 shrink-0" />
                  ) : (
                    <XCircle className="size-3 shrink-0 opacity-50" />
                  )}
                  {item.label}
                </span>
              ))}
              {typeof siteData.content_depth === "string" ? (
                <span className="inline-flex items-center rounded-lg border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-medium capitalize text-foreground">
                  Content: {siteData.content_depth as string}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {googleDetails ? (
        <div className="min-h-0 lg:col-span-4 animate-enter animate-enter-delay-1">
          <GoogleDetailsPanel details={googleDetails} score={visibility.google_score ?? null} compact />
        </div>
      ) : null}

      {redditDetails ? (
        <div className="min-h-0 lg:col-span-4 animate-enter animate-enter-delay-2">
          <RedditDetailsPanel details={redditDetails} score={visibility.reddit_score ?? null} compact />
        </div>
      ) : null}

      {/* Row 2 — Platforms grid + Web mentions */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none lg:col-span-5 animate-enter animate-enter-delay-2">
        <div className="border-b border-border/50 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-3.5 text-muted-foreground" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Platforms</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Presence across search and social surfaces</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3.5 sm:grid-cols-3 sm:gap-2.5 sm:p-4">
          {platformRows.map((plat) => {
            const found = plat.data.found;
            const mentions = plat.data.mentions ?? 0;
            const urls = plat.data.top_urls ?? [];
            return (
              <div
                key={plat.key}
                className={cn(
                  "flex min-h-0 flex-col rounded-xl border p-3 transition-all",
                  found
                    ? "border-border/60 bg-muted/10 hover:bg-muted/25 hover:border-border"
                    : "border-border/40 bg-muted/5 opacity-75 hover:opacity-100",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform hover:scale-105"
                    style={{ backgroundColor: `${plat.color}12` }}
                  >
                    <span style={{ color: plat.color }}>{plat.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{plat.label}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                      {found ? `${mentions} mentions` : "No signals"}
                    </p>
                  </div>
                  {found && urls[0] ? (
                    <a
                      href={urls[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-muted-foreground transition hover:text-foreground"
                      aria-label={`Open ${plat.label} result`}
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : null}
                </div>
                <div className="mt-2.5">
                  {found ? (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/8 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <CheckCircle2 className="size-3 shrink-0" />
                      Found
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <XCircle className="size-3 shrink-0 opacity-60" />
                      None
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {webMentionsDetails ? (
        <div className="min-h-0 lg:col-span-7 animate-enter animate-enter-delay-3">
          <WebMentionsPanel details={webMentionsDetails} score={visibility.web_mentions_score ?? null} compact />
        </div>
      ) : null}
    </div>
  );
}
