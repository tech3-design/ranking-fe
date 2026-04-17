"use client";

import type { BrandVisibility } from "@/lib/api/analyzer";
import type { GoogleDetails, RedditDetails, WebMentionsDetails } from "@/lib/api/visibility";
import { GoogleDetailsPanel } from "@/components/visibility/google-details-panel";
import { RedditDetailsPanel } from "@/components/visibility/reddit-details-panel";
import { WebMentionsPanel } from "@/components/visibility/web-mentions-panel";
import {
  MessageSquare, HelpCircle, BookOpen,
  Linkedin, Youtube, Twitter,
  Search, CheckCircle2, XCircle, ExternalLink,
} from "lucide-react";

interface BrandVisibilityTabProps {
  brandName: string;
  visibility: BrandVisibility;
}

const PLATFORM_CONFIG: Array<{
  key: string;
  label: string;
  color: string;
  icon: React.ReactNode;
}> = [
  { key: "Google", label: "Google", color: "#ea4335", icon: <Search className="w-4 h-4" /> },
  { key: "Reddit", label: "Reddit", color: "#ff4500", icon: <MessageSquare className="w-4 h-4" /> },
  { key: "Quora", label: "Quora", color: "#b92b27", icon: <HelpCircle className="w-4 h-4" /> },
  { key: "Wikipedia", label: "Wikipedia", color: "#636466", icon: <BookOpen className="w-4 h-4" /> },
  { key: "LinkedIn", label: "LinkedIn", color: "#0a66c2", icon: <Linkedin className="w-4 h-4" /> },
  { key: "YouTube", label: "YouTube", color: "#ff0000", icon: <Youtube className="w-4 h-4" /> },
  { key: "X (Twitter)", label: "X (Twitter)", color: "#1da1f2", icon: <Twitter className="w-4 h-4" /> },
];

export function BrandVisibilityTab({ brandName, visibility }: BrandVisibilityTabProps) {
  // Extract platform data from the checks
  const checks = (visibility as unknown as Record<string, unknown>)?.checks as Record<string, unknown> | undefined;
  const platformPresence = (checks?.platform_presence ?? {}) as Record<string, { found: boolean; mentions: number; top_urls?: string[] }>;
  const platformsFound = (checks?.platforms_found ?? []) as string[];
  const platformsNotFound = (checks?.platforms_not_found ?? []) as string[];
  const googleData = (checks?.google_presence ?? {}) as { found?: boolean; signals?: string[] };
  const siteData = (checks?.brand_site_quality ?? {}) as Record<string, unknown>;

  // Detail panel data (from the original visibility response)
  const googleDetails = visibility.google_details as GoogleDetails | undefined;
  const redditDetails = visibility.reddit_details as RedditDetails | undefined;
  const webMentionsDetails = visibility.web_mentions_details as WebMentionsDetails | undefined;

  const foundCount = platformsFound.length + (googleData.found ? 1 : 0);
  const totalChecked = PLATFORM_CONFIG.length;
  const overall = Math.round(visibility.overall_score ?? 0);
  const googleScore = Math.round(visibility.google_score ?? 0);
  const redditScore = Math.round(visibility.reddit_score ?? 0);
  const webScore = Math.round(visibility.web_mentions_score ?? 0);
  const marketCoverage = Math.round((foundCount / Math.max(totalChecked, 1)) * 100);

  function scoreColor(s: number) {
    if (s >= 70) return "#22c55e";
    if (s >= 40) return "#D97706";
    return "#F95C4B";
  }

  return (
    <div className="space-y-4">
      {/* Score summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Overall Score",    value: overall,        suffix: "/100" },
          { label: "Market Coverage",  value: marketCoverage, suffix: "%" },
          { label: "Google",           value: googleScore,    suffix: "/100" },
          { label: "Reddit",           value: redditScore,    suffix: "/100" },
          { label: "Web Mentions",     value: webScore,       suffix: "/100" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl bg-card border border-border p-4 flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{card.label}</p>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-bold tabular-nums" style={{ color: scoreColor(card.value) }}>
                {card.value}
              </span>
              <span className="text-xs text-muted-foreground">{card.suffix}</span>
            </div>
            <div className="h-1 rounded-full bg-muted mt-1 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, card.suffix === "%" ? card.value : card.value)}%`,
                  backgroundColor: scoreColor(card.value),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Mentions by Platform */}
      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Mentions by Platform</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Brand presence across {totalChecked} platforms</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" /> Found ({foundCount})</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-muted-foreground/30" /> Not found ({totalChecked - foundCount})</span>
          </div>
        </div>

        {/* Visual bar chart */}
        <div className="space-y-3 mb-6">
          {PLATFORM_CONFIG
            .map((plat) => ({ ...plat, data: platformPresence[plat.key] ?? { found: false, mentions: 0, top_urls: [] } }))
            .sort((a, b) => (b.data.mentions ?? 0) - (a.data.mentions ?? 0))
            .map((plat) => {
              const found = plat.data.found;
              const mentions = plat.data.mentions ?? 0;
              const urls = plat.data.top_urls ?? [];
              const maxMentions = Math.max(...Object.values(platformPresence).map((d) => d?.mentions ?? 0), 1);
              const barWidth = found ? Math.max((mentions / maxMentions) * 100, 8) : 0;

              return (
                <div key={plat.key} className="flex items-center gap-3">
                  {/* Platform icon + name */}
                  <div className="flex items-center gap-2 w-32 shrink-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${plat.color}15` }}>
                      <span style={{ color: plat.color }}>{plat.icon}</span>
                    </div>
                    <span className="text-xs font-medium text-foreground truncate">{plat.label}</span>
                  </div>

                  {/* Bar */}
                  <div className="flex-1 h-8 bg-muted/20 rounded-lg overflow-hidden relative">
                    {found ? (
                      <div
                        className="h-full rounded-lg flex items-center px-3 transition-all duration-500"
                        style={{ width: `${barWidth}%`, backgroundColor: `${plat.color}25`, borderLeft: `3px solid ${plat.color}` }}
                      >
                        <span className="text-[11px] font-bold text-foreground">{mentions} mentions</span>
                      </div>
                    ) : (
                      <div className="h-full flex items-center px-3">
                        <span className="text-[11px] text-muted-foreground/50">Not found</span>
                      </div>
                    )}
                  </div>

                  {/* Status + link */}
                  <div className="w-16 shrink-0 flex items-center justify-end gap-1">
                    {found ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        {urls.length > 0 && (
                          <a href={urls[0]} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </>
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground/30" />
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Platform cards grid (compact) */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {PLATFORM_CONFIG.map((plat) => {
            const data = platformPresence[plat.key] ?? { found: false, mentions: 0 };
            const found = data.found;
            const mentions = data.mentions ?? 0;

            return (
              <div
                key={plat.key}
                className={`rounded-xl border p-3 text-center transition ${
                  found
                    ? "bg-card border-border hover:border-green-500/30"
                    : "bg-muted/5 border-border/30 opacity-50"
                }`}
              >
                <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${plat.color}15` }}>
                  <span style={{ color: plat.color }}>{plat.icon}</span>
                </div>
                <p className="text-[10px] font-semibold text-foreground">{plat.label}</p>
                {found ? (
                  <p className="text-lg font-bold mt-1" style={{ color: plat.color }}>{mentions}</p>
                ) : (
                  <p className="text-[10px] text-muted-foreground/50 mt-1">—</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Brand Site Quality */}
      {siteData && (
        <div className="rounded-2xl bg-card p-5 border border-border">
          <p className="text-sm font-semibold text-foreground mb-3">Brand Website Signals</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "About Page", value: siteData.has_about },
              { label: "Contact Page", value: siteData.has_contact },
              { label: "Blog", value: siteData.has_blog },
              { label: "Social Links", value: siteData.has_social_links },
              { label: "Content Depth", value: siteData.content_depth },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                {item.value && item.value !== "thin" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                )}
                <span className="text-muted-foreground">{item.label}</span>
                {typeof item.value === "string" && (
                  <span className="text-foreground font-medium capitalize">{item.value as string}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Panels */}
      <div className="grid gap-4 md:grid-cols-2">
        {googleDetails && (
          <GoogleDetailsPanel details={googleDetails} score={visibility.google_score ?? null} />
        )}
        {redditDetails && (
          <RedditDetailsPanel details={redditDetails} score={visibility.reddit_score ?? null} />
        )}
      </div>
      {webMentionsDetails && (
        <WebMentionsPanel details={webMentionsDetails} score={visibility.web_mentions_score ?? null} />
      )}
    </div>
  );
}
