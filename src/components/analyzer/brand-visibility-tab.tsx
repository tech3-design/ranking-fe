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
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

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
    if (s >= 70) return "#16a34a";
    if (s >= 40) return "#D97706";
    return "#F95C4B";
  }

  const maxMentions = Math.max(...Object.values(platformPresence).map((d) => d?.mentions ?? 0), 1);

  // ── Chart datasets ──────────────────────────────────────────────────────
  const coveragePie = [
    { name: "Found", value: foundCount, fill: "#F95C4B" },
    { name: "Missing", value: Math.max(0, totalChecked - foundCount), fill: "#e5e7eb" },
  ];

  const overallRadial = [{ name: "Overall", value: overall, fill: scoreColor(overall) }];

  const platformBars = PLATFORM_CONFIG.map((plat) => {
    const d = platformPresence[plat.key] ?? { found: false, mentions: 0, top_urls: [] };
    return {
      name: plat.label,
      mentions: d.found ? d.mentions ?? 0 : 0,
      found: d.found,
      urls: d.top_urls ?? [],
      color: plat.color,
    };
  }).sort((a, b) => b.mentions - a.mentions);

  return (
    <div className="space-y-3">
      {/* ── Hero row: Overall gauge + Coverage donut + score tiles ───────── */}
      <div className="grid grid-cols-12 gap-3">
        {/* Overall — Radial gauge */}
        <div className="col-span-12 md:col-span-4 rounded-xl bg-card border border-border/70 p-6 flex flex-col">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-1">Overall Score</p>
          <div className="relative flex-1 flex items-center justify-center min-h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart
                innerRadius="75%"
                outerRadius="100%"
                data={overallRadial}
                startAngle={220}
                endAngle={-40}
                barSize={14}
              >
                <defs>
                  <linearGradient id="overallGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={scoreColor(overall)} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={scoreColor(overall)} stopOpacity={1} />
                  </linearGradient>
                </defs>
                <RadialBar
                  background={{ fill: "var(--muted)" }}
                  dataKey="value"
                  cornerRadius={10}
                  fill="url(#overallGrad)"
                  domain={[0, 100] as never}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-semibold tabular-nums tracking-tight text-foreground leading-none">
                {overall}
              </span>
              <span className="text-xs text-muted-foreground mt-1">/ 100</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">
            {overall >= 70 ? "Strong" : overall >= 40 ? "Moderate" : "Needs work"} brand visibility
          </p>
        </div>

        {/* Coverage — Donut pie */}
        <div className="col-span-12 md:col-span-4 rounded-xl bg-card border border-border/70 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Market Coverage</p>
            <span className="text-[11px] tabular-nums font-medium text-foreground">{marketCoverage}%</span>
          </div>
          <div className="relative flex-1 flex items-center justify-center min-h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={coveragePie}
                  innerRadius={64}
                  outerRadius={92}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  {coveragePie.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-semibold tabular-nums tracking-tight text-foreground leading-none">
                {foundCount}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1">of {totalChecked} platforms</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground mt-1">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F95C4B]" /> Found
              <span className="tabular-nums text-foreground">{foundCount}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e5e7eb]" /> Missing
              <span className="tabular-nums text-foreground">{totalChecked - foundCount}</span>
            </span>
          </div>
        </div>

        {/* Channel scores tile */}
        <div className="col-span-12 md:col-span-4 rounded-xl bg-card border border-border/70 p-6 flex flex-col">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-4">Channel Breakdown</p>
          <div className="flex flex-col gap-4 flex-1 justify-center">
            {[
              { label: "Google", value: googleScore },
              { label: "Reddit", value: redditScore },
              { label: "Web Mentions", value: webScore },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    {row.value}<span className="text-muted-foreground font-normal text-xs">/100</span>
                  </span>
                </div>
                <div className="h-[3px] rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${row.value}%`, backgroundColor: scoreColor(row.value) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mentions by Platform — horizontal bar chart ─────────────────── */}
      <div className="rounded-xl bg-card border border-border/70 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/70">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Mentions by Platform</p>
            <p className="text-lg font-semibold tabular-nums text-foreground mt-0.5">
              {platformBars.reduce((s, b) => s + b.mentions, 0)}
              <span className="text-xs font-normal text-muted-foreground"> total mentions</span>
            </p>
          </div>
        </div>

        <div className="px-4 py-4">
          <ResponsiveContainer width="100%" height={Math.max(260, PLATFORM_CONFIG.length * 38)}>
            <BarChart
              data={platformBars}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 0, bottom: 4 }}
            >
              <CartesianGrid horizontal={false} stroke="var(--border)" strokeOpacity={0.4} />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                domain={[0, Math.max(maxMentions, 1)]}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--foreground)" }}
                width={110}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", fillOpacity: 0.3 }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number, _name, { payload }) =>
                  payload.found ? [`${v} mentions`, payload.name] : ["Not found", payload.name]
                }
              />
              <Bar dataKey="mentions" radius={[0, 6, 6, 0]} barSize={14}>
                {platformBars.map((entry, i) => (
                  <Cell key={i} fill={entry.found ? entry.color : "var(--muted)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Link row for found platforms with top URL */}
        <div className="px-6 pb-5 flex flex-wrap gap-2">
          {platformBars.filter((p) => p.found && p.urls.length > 0).map((p) => (
            <a
              key={p.name}
              href={p.urls[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border/70 px-2 h-7 text-[11px] text-muted-foreground hover:bg-muted/60 hover:text-foreground transition"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}
              <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      </div>

      {/* Brand Site Quality */}
      {siteData && (
        <div className="rounded-xl bg-card border border-border/70 p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-4">Brand Website Signals</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-3">
            {[
              { label: "About Page", value: siteData.has_about },
              { label: "Contact Page", value: siteData.has_contact },
              { label: "Blog", value: siteData.has_blog },
              { label: "Social Links", value: siteData.has_social_links },
              { label: "Content Depth", value: siteData.content_depth },
            ].map((item) => {
              const active = !!item.value && item.value !== "thin";
              return (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  {active ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className={active ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                  {typeof item.value === "string" && (
                    <span className="text-foreground font-medium capitalize ml-auto tabular-nums">{item.value as string}</span>
                  )}
                </div>
              );
            })}
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
