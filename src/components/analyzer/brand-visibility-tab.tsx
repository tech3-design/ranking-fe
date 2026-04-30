"use client";

import { useMemo, type ReactNode } from "react";
import type { BrandVisibility, ShareOfVoiceItem } from "@/lib/api/analyzer";
import type { GoogleDetails, RedditDetails, WebMentionsDetails } from "@/lib/api/visibility";
import { GoogleDetailsPanel } from "@/components/visibility/google-details-panel";
import { RedditDetailsPanel } from "@/components/visibility/reddit-details-panel";
import { WebMentionsPanel } from "@/components/visibility/web-mentions-panel";
import {
  ScoreGauge,
  BrandBarChart,
  BrandDonutChart,
  BRAND_COLOR,
  BRAND_PALETTE,
  type BarChartDatum,
  type DonutDatum,
} from "@/components/ui/vis-charts";
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
  Activity,
  Globe,
  Zap,
  TrendingUp,
  Layers,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BrandVisibilityTabProps {
  brandName: string;
  visibility: BrandVisibility;
  sov?: ShareOfVoiceItem[];
}

// ─── Static config ────────────────────────────────────────────────────────────

const PLATFORM_CONFIG: Array<{ key: string; label: string; icon: ReactNode }> = [
  { key: "Google",      label: "Google",      icon: <Search className="size-3.5" /> },
  { key: "Reddit",      label: "Reddit",      icon: <MessageSquare className="size-3.5" /> },
  { key: "Quora",       label: "Quora",       icon: <HelpCircle className="size-3.5" /> },
  { key: "Wikipedia",   label: "Wikipedia",   icon: <BookOpen className="size-3.5" /> },
  { key: "LinkedIn",    label: "LinkedIn",    icon: <Linkedin className="size-3.5" /> },
  { key: "YouTube",     label: "YouTube",     icon: <Youtube className="size-3.5" /> },
  { key: "X (Twitter)", label: "X",           icon: <Twitter className="size-3.5" /> },
];

const ENGINE_LABELS: Record<string, string> = {
  google: "Google", bing: "Bing", chatgpt: "ChatGPT",
  claude: "Claude",  gemini: "Gemini", perplexity: "Perplexity",
};

const ENGINE_ORDER = ["google", "chatgpt", "perplexity", "gemini", "claude", "bing"];

// ─── ① Executive KPI Strip ───────────────────────────────────────────────────

function OverallScoreCard({
  overall, brandName, foundCount, totalChecked,
}: {
  overall: number; brandName: string; foundCount: number; totalChecked: number;
}) {
  return (
    <div
      className="flex h-full items-center gap-4 rounded-xl border px-5 py-4"
      style={{ backgroundColor: `${BRAND_COLOR}08`, borderColor: `${BRAND_COLOR}28` }}
    >
      <ScoreGauge value={overall} size={76} color={BRAND_COLOR} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: BRAND_COLOR }}>
          Overall Visibility
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{brandName}</p>
        <div className="flex items-baseline gap-0.5">
          <span className="text-3xl font-bold tabular-nums text-foreground">{overall}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {foundCount} of {totalChecked} platforms detected
        </p>
      </div>
    </div>
  );
}

function KPITile({
  label, value, suffix = "/100", icon,
}: {
  label: string; value: number; suffix?: string; icon: ReactNode;
}) {
  const pct = Math.min(100, value);
  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-card px-4 py-3.5 transition-colors hover:border-border hover:bg-muted/10">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-muted-foreground opacity-70">{icon}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-0.5">
        <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{suffix}</span>
      </div>
      <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-muted/50">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: BRAND_COLOR }}
        />
      </div>
    </div>
  );
}

// ─── ② Unified Insights Row ──────────────────────────────────────────────────

interface InsightsRowProps {
  sov: ShareOfVoiceItem[];
  platformRows: Array<{
    key: string; label: string; icon: ReactNode;
    data: { found: boolean; mentions: number; top_urls?: string[] };
  }>;
  hasSiteSignals: boolean;
  siteData: Record<string, unknown>;
  marketCoverage: number;
}

function InsightsRow({
  sov, platformRows, hasSiteSignals, siteData, marketCoverage,
}: InsightsRowProps) {
  const hasSov = sov.length > 0;

  const avg           = hasSov ? Math.round(sov.reduce((s, d) => s + d.sov_pct, 0) / sov.length) : 0;
  const totalMentions = hasSov ? sov.reduce((s, d) => s + d.mentioned, 0) : 0;
  const totalRuns     = hasSov ? sov.reduce((s, d) => s + d.total, 0) : 0;

  const barData: BarChartDatum[] = useMemo(
    () =>
      sov.map((item) => {
        const idx = ENGINE_ORDER.indexOf(item.engine);
        return {
          label: ENGINE_LABELS[item.engine] ?? item.engine,
          value: item.sov_pct,
          color: BRAND_PALETTE[idx >= 0 ? idx : 0],
          meta: { mentioned: item.mentioned, total: item.total } as Record<string, unknown>,
        };
      }),
    [sov],
  );

  const donutData: DonutDatum[] = useMemo(
    () =>
      sov
        .filter((d) => d.mentioned > 0)
        .map((item) => {
          const idx = ENGINE_ORDER.indexOf(item.engine);
          return {
            name: ENGINE_LABELS[item.engine] ?? item.engine,
            value: item.mentioned,
            color: BRAND_PALETTE[idx >= 0 ? idx : 0],
          };
        }),
    [sov],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none">
      {/* ── Unified header ── */}
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3">
        <TrendingUp className="size-3.5 shrink-0" style={{ color: BRAND_COLOR }} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          AI Engine & Platform Signals
        </span>
        {hasSov && (
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground">
              {totalMentions}/{totalRuns} prompts
            </span>
            <span
              className="rounded-md border px-2 py-0.5 text-xs font-bold tabular-nums"
              style={{
                color: BRAND_COLOR,
                borderColor: `${BRAND_COLOR}30`,
                backgroundColor: `${BRAND_COLOR}0c`,
              }}
            >
              {avg}% avg SOV
            </span>
          </div>
        )}
      </div>

      {/* ── Three-column body ── */}
      <div className="grid grid-cols-1 divide-y divide-border/40 lg:grid-cols-12 lg:divide-x lg:divide-y-0">

        {/* Column 1 — Share of Voice bar chart */}
        {hasSov && (
          <div className="lg:col-span-5 p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Share of Voice
            </p>
            <BrandBarChart
              data={barData}
              height={192}
              yDomain={[0, 100]}
              yTickFormatter={(v) => `${v}%`}
              tooltipFormatter={(v, d) => {
                const meta = d.meta as { mentioned: number; total: number };
                return [`${v}% (${meta.mentioned}/${meta.total})`, d.label];
              }}
              barSize={28}
            />
          </div>
        )}

        {/* Column 2 — Mention Split donut */}
        {hasSov && (
          <div className="lg:col-span-3 flex flex-col items-center justify-start p-4">
            <p className="mb-3 w-full text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Mention Split
            </p>
            <BrandDonutChart
              data={donutData}
              size={128}
              innerRadius={34}
              outerRadius={56}
              centerLabel={String(totalMentions)}
              centerSub="mentions"
            />
            <div className="mt-3 w-full space-y-1.5">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-[11px]">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="flex-1 text-muted-foreground">{d.name}</span>
                  <span className="font-mono font-semibold tabular-nums text-foreground">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Column 3 — Platform Reach + optional Site Signals */}
        <div className={cn("p-4", hasSov ? "lg:col-span-4" : "lg:col-span-12")}>
          <div className="mb-2.5 flex items-center gap-1.5">
            <Layers className="size-3 text-muted-foreground" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Platform Reach
            </p>
          </div>

          {/* Platform list — compact rows */}
          <div className="space-y-1">
            {platformRows.map((plat) => {
              const found    = plat.data.found;
              const mentions = plat.data.mentions ?? 0;
              return (
                <div
                  key={plat.key}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5 transition-colors",
                    found
                      ? "border-border/50 bg-muted/10 hover:bg-muted/20"
                      : "border-border/30 bg-transparent opacity-50",
                  )}
                >
                  <span
                    className="shrink-0"
                    style={{ color: found ? BRAND_COLOR : "var(--muted-foreground)" }}
                  >
                    {plat.icon}
                  </span>
                  <span className="flex-1 truncate text-xs font-medium text-foreground">
                    {plat.label}
                  </span>
                  {found ? (
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {mentions > 0 ? `${mentions}` : ""}
                    </span>
                  ) : null}
                  {found ? (
                    <CheckCircle2 className="size-3 shrink-0" style={{ color: BRAND_COLOR }} />
                  ) : (
                    <XCircle className="size-3 shrink-0 text-muted-foreground/40" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Site Signals — compact, inline */}
          {hasSiteSignals && (
            <div className="mt-3 space-y-2.5 border-t border-border/40 pt-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-muted-foreground">Coverage</span>
                  <span className="text-[11px] font-bold tabular-nums text-foreground">
                    {marketCoverage}%
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted/40">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${marketCoverage}%`, backgroundColor: BRAND_COLOR }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {[
                  { label: "About",   ok: siteData.has_about },
                  { label: "Contact", ok: siteData.has_contact },
                  { label: "Blog",    ok: siteData.has_blog },
                  { label: "Social",  ok: siteData.has_social_links },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium",
                      item.ok
                        ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-700"
                        : "border-border/50 bg-muted/20 text-muted-foreground",
                    )}
                  >
                    {item.ok ? (
                      <CheckCircle2 className="size-2.5 shrink-0" />
                    ) : (
                      <XCircle className="size-2.5 shrink-0 opacity-50" />
                    )}
                    {item.label}
                  </div>
                ))}
              </div>
              {typeof siteData.content_depth === "string" && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Depth</span>
                  <span
                    className="rounded border px-1.5 py-0.5 text-[10px] font-semibold capitalize"
                    style={{
                      color: BRAND_COLOR,
                      borderColor: `${BRAND_COLOR}30`,
                      backgroundColor: `${BRAND_COLOR}0c`,
                    }}
                  >
                    {siteData.content_depth as string}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function BrandVisibilityTab({
  brandName, visibility, sov = [],
}: BrandVisibilityTabProps) {
  const checks = (visibility as unknown as Record<string, unknown>)?.checks as
    Record<string, unknown> | undefined;

  const platformPresence = (checks?.platform_presence ?? {}) as Record<
    string,
    { found: boolean; mentions: number; top_urls?: string[] }
  >;
  const platformsFound = (checks?.platforms_found ?? []) as string[];
  const googleData     = (checks?.google_presence ?? {}) as { found?: boolean; signals?: string[] };
  const siteData       = (checks?.brand_site_quality ?? {}) as Record<string, unknown>;

  const googleDetails      = visibility.google_details as GoogleDetails | undefined;
  const redditDetails      = visibility.reddit_details as RedditDetails | undefined;
  const webMentionsDetails = visibility.web_mentions_details as WebMentionsDetails | undefined;

  const totalChecked   = PLATFORM_CONFIG.length;
  const foundCount     = platformsFound.length + (googleData.found ? 1 : 0);
  const overall        = Math.round(visibility.overall_score ?? 0);
  const googleScore    = Math.round(visibility.google_score ?? 0);
  const redditScore    = Math.round(visibility.reddit_score ?? 0);
  const webScore       = Math.round(visibility.web_mentions_score ?? 0);
  const marketCoverage = Math.round((foundCount / Math.max(totalChecked, 1)) * 100);

  const platformRows = PLATFORM_CONFIG.map((plat) => ({
    ...plat,
    data: platformPresence[plat.key] ?? { found: false, mentions: 0, top_urls: [] },
  })).sort((a, b) => (b.data.mentions ?? 0) - (a.data.mentions ?? 0));

  const hasSiteSignals = !!(
    siteData &&
    (siteData.has_about != null || siteData.has_contact != null ||
     siteData.has_blog != null  || siteData.has_social_links != null ||
     siteData.content_depth != null)
  );

  const detailPanelCount = [googleDetails, redditDetails, webMentionsDetails].filter(Boolean).length;

  return (
    <div className="space-y-4">

      {/* ─── ① Executive KPI Strip ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <OverallScoreCard
            overall={overall}
            brandName={brandName}
            foundCount={foundCount}
            totalChecked={totalChecked}
          />
        </div>
        <KPITile label="Google Score"  value={googleScore}    icon={<Search className="size-3.5" />} />
        <KPITile label="Reddit Score"  value={redditScore}    icon={<MessageSquare className="size-3.5" />} />
        <KPITile label="Web Score"     value={webScore}       icon={<Globe className="size-3.5" />} />
        <KPITile label="Coverage"      value={marketCoverage} suffix="%" icon={<Zap className="size-3.5" />} />
      </div>

      {/* ─── ② Unified Insights Row ─────────────────────────────────────── */}
      <InsightsRow
        sov={sov}
        platformRows={platformRows}
        hasSiteSignals={hasSiteSignals}
        siteData={siteData}
        marketCoverage={marketCoverage}
      />

      {/* ─── ③ Platform Deep Dives ──────────────────────────────────────── */}
      {detailPanelCount > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Activity className="size-3.5 text-muted-foreground" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Platform Analysis
            </h3>
          </div>

          {/* Web + (Google/Reddit): Web spans 2 cols, Google+Reddit stack in 1 col */}
          {webMentionsDetails && (googleDetails || redditDetails) ? (
            <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-3">
              {/* Left column — Google on top, Reddit below */}
              <div className="flex flex-col gap-4 lg:col-span-1">
                {googleDetails && (
                  <GoogleDetailsPanel
                    details={googleDetails}
                    score={visibility.google_score ?? null}
                    compact
                  />
                )}
                {redditDetails && (
                  <RedditDetailsPanel
                    details={redditDetails}
                    score={visibility.reddit_score ?? null}
                    compact
                  />
                )}
              </div>
              {/* Right column — Web primary, spans 2 cols */}
              <div className="lg:col-span-2">
                <WebMentionsPanel
                  details={webMentionsDetails}
                  score={visibility.web_mentions_score ?? null}
                  compact
                />
              </div>
            </div>
          ) : (
            /* Fallback: no Web card, or Web only — equal-width grid */
            <div
              className={cn(
                "grid grid-cols-1 gap-4 items-start",
                detailPanelCount === 2 ? "lg:grid-cols-2" :
                detailPanelCount === 1 ? "" : "lg:grid-cols-3",
              )}
            >
              {googleDetails && (
                <GoogleDetailsPanel
                  details={googleDetails}
                  score={visibility.google_score ?? null}
                  compact
                />
              )}
              {redditDetails && (
                <RedditDetailsPanel
                  details={redditDetails}
                  score={visibility.reddit_score ?? null}
                  compact
                />
              )}
              {webMentionsDetails && (
                <WebMentionsPanel
                  details={webMentionsDetails}
                  score={visibility.web_mentions_score ?? null}
                  compact
                />
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
