"use client";

import type { ReactNode } from "react";
import type { BrandVisibility } from "@/lib/api/analyzer";
import type { GoogleDetails, RedditDetails, WebMentionsDetails } from "@/lib/api/visibility";
import { GoogleDetailsPanel } from "@/components/visibility/google-details-panel";
import { RedditDetailsPanel } from "@/components/visibility/reddit-details-panel";
import { WebMentionsPanel } from "@/components/visibility/web-mentions-panel";
import { cn } from "@/lib/utils";
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

function scoreTone(s: number): { bar: string; text: string } {
  if (s >= 70) return { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" };
  if (s >= 40) return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
  return { bar: "bg-primary", text: "text-primary" };
}

function MiniStat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix: string;
}) {
  const tone = scoreTone(value);
  return (
    <div className="min-w-[4.5rem]">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-0.5 flex items-baseline gap-0.5">
        <span className={cn("text-lg font-bold tabular-nums tracking-tight", tone.text)}>{value}</span>
        <span className="text-[11px] text-muted-foreground">{suffix}</span>
      </div>
      <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", tone.bar)}
          style={{ width: `${Math.min(100, suffix === "%" ? value : value)}%` }}
        />
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
  const overallTone = scoreTone(overall);

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
    <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-12">
      {/* Row 1 — snapshot + channel detail cards (bento) */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none lg:col-span-4">
        <div className="border-b border-border/60 px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Visibility snapshot
          </p>
          <h2 className="mt-1 truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {brandName}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {foundCount} of {totalChecked} platforms with signals · AI &amp; search footprint
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-4 sm:gap-5">
            <div className="flex min-w-[5.5rem] flex-col">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Overall</p>
              <div className="mt-0.5 flex items-baseline gap-1">
                <span
                  className={cn("text-3xl font-bold tabular-nums tracking-tight sm:text-4xl", overallTone.text)}
                >
                  {overall}
                </span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <div className="mt-2 h-1 max-w-[8rem] overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all", overallTone.bar)}
                  style={{ width: `${Math.min(100, overall)}%` }}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 border-l border-border/60 pl-4 sm:gap-4 lg:pl-5">
              <MiniStat label="Coverage" value={marketCoverage} suffix="%" />
              <MiniStat label="Google" value={googleScore} suffix="/100" />
              <MiniStat label="Reddit" value={redditScore} suffix="/100" />
              <MiniStat label="Web" value={webScore} suffix="/100" />
            </div>
          </div>
        </div>

        {hasSiteSignals ? (
          <div className="bg-muted/15 px-4 py-3 sm:px-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Your site</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                { label: "About", ok: siteData.has_about },
                { label: "Contact", ok: siteData.has_contact },
                { label: "Blog", ok: siteData.has_blog },
                { label: "Social links", ok: siteData.has_social_links },
              ].map((item) => (
                <span
                  key={item.label}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium sm:text-[11px]",
                    item.ok
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400"
                      : "border-border bg-background/80 text-muted-foreground",
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
                <span className="inline-flex items-center rounded-md border border-border bg-background/80 px-2 py-0.5 text-[10px] font-medium capitalize text-foreground sm:text-[11px]">
                  Content: {siteData.content_depth as string}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {googleDetails ? (
        <div className="min-h-0 lg:col-span-4">
          <GoogleDetailsPanel details={googleDetails} score={visibility.google_score ?? null} compact />
        </div>
      ) : null}

      {redditDetails ? (
        <div className="min-h-0 lg:col-span-4">
          <RedditDetailsPanel details={redditDetails} score={visibility.reddit_score ?? null} compact />
        </div>
      ) : null}

      {/* Row 2 — dense platform grid + web */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none lg:col-span-5">
        <div className="border-b border-border/60 px-4 py-3 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Platforms</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Presence across search and social surfaces</p>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:gap-2.5 sm:p-4">
          {platformRows.map((plat) => {
            const found = plat.data.found;
            const mentions = plat.data.mentions ?? 0;
            const urls = plat.data.top_urls ?? [];
            return (
              <div
                key={plat.key}
                className="flex min-h-0 flex-col rounded-lg border border-border/60 bg-muted/10 p-2.5 sm:p-3"
              >
                <div className="flex items-start gap-2">
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${plat.color}14` }}
                  >
                    <span style={{ color: plat.color }}>{plat.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground sm:text-sm">{plat.label}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground tabular-nums sm:text-[11px]">
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
                      <ExternalLink className="size-3.5 sm:size-4" />
                    </a>
                  ) : null}
                </div>
                <div className="mt-2">
                  {found ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="size-3 shrink-0" />
                      Found
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
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
        <div className="min-h-0 lg:col-span-7">
          <WebMentionsPanel details={webMentionsDetails} score={visibility.web_mentions_score ?? null} compact />
        </div>
      ) : null}
    </div>
  );
}
