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

// ─── Colored Platform Logos ───────────────────────────────────────────────────

function GoogleLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function RedditLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FF4500" d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
  );
}

function QuoraLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#B92B27" d="M12.555 18.368c-.473-1.337-1.086-2.57-2.145-2.57-.243 0-.484.048-.704.145l-.437-1.025c.56-.412 1.38-.71 2.48-.71 1.864 0 2.916.95 3.648 2.284A6.2 6.2 0 0 0 18.2 12c0-3.423-2.78-6.2-6.2-6.2C8.577 5.8 5.8 8.578 5.8 12c0 3.42 2.777 6.2 6.2 6.2.19 0 .378-.011.555-.032zm2.67 1.21C14.112 20.716 13.1 21.6 12 21.6 8.246 21.6 5.2 18.553 5.2 14.8V12c0-3.754 3.046-6.8 6.8-6.8s6.8 3.046 6.8 6.8c0 2.68-1.527 5.008-3.78 6.183.476.838.98 1.397 1.524 1.397v2.106c-1.5 0-2.44-.94-3.1-1.908z"/>
    </svg>
  );
}

function WikipediaLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#000000" d="M12.09 13.119c-.936 1.932-2.217 4.548-2.853 5.728-.616 1.074-1.127.931-1.532.029L4.299 8.631H2.223c.016-.338.033-.67.05-1H6.22l3.328 7.027c.205.43.37.979.304 1.977.157-.532.278-1.115.508-1.625l2.22-4.81H10.7l.118-1h3.763l-2.491 2.9zm9.481-5.488h-2.08l-2.85 6.028c-.209.447-.313 1.047-.279 1.59.144-.6.348-1.197.597-1.79l2.27-5.828H22l-.43 1h-1.508l-2.27 6.028c-.426 1.034-.72 1.736-.875 2.106-.31.75-1.127.931-1.532.029l-2.852-6.028H11.62l.119-1h3.762l-2.49 2.9c-.046-.032-.096-.06-.15-.084zM7.92 18.919c-.616 1.074-1.127.931-1.532.029L2.573 9.631H.001l.43-1h2.06l3.297 6.96c.205.43.37.979.304 1.977.157-.532.278-1.115.508-1.625l2.22-4.81H6.955l.118-1h3.762l-2.915 6.786z"/>
    </svg>
  );
}

function LinkedInLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function YouTubeLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function XLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#000000" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

// ─── Static config ────────────────────────────────────────────────────────────

const PLATFORM_CONFIG: Array<{ key: string; label: string; icon: ReactNode }> = [
  { key: "Google",      label: "Google",    icon: <GoogleLogo /> },
  { key: "Reddit",      label: "Reddit",    icon: <RedditLogo /> },
  { key: "Quora",       label: "Quora",     icon: <QuoraLogo /> },
  { key: "Wikipedia",   label: "Wikipedia", icon: <WikipediaLogo /> },
  { key: "LinkedIn",    label: "LinkedIn",  icon: <LinkedInLogo /> },
  { key: "YouTube",     label: "YouTube",   icon: <YouTubeLogo /> },
  { key: "X (Twitter)", label: "X",         icon: <XLogo /> },
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
                  <span className="shrink-0">
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
            <div className="grid grid-cols-1 gap-4 items-stretch lg:grid-cols-3">
              {/* Left column — Google on top, Reddit below (stretches to match Web height) */}
              <div className="flex flex-col gap-4 h-full lg:col-span-1">
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
                    className="flex-1"
                  />
                )}
              </div>
              {/* Right column — Web primary, spans 2 cols */}
              <div className="h-full lg:col-span-2">
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
