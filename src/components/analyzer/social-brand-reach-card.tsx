"use client";

import Link from "next/link";
import type { BrandVisibility } from "@/lib/api/analyzer";

export interface SocialPlatformSnapshot {
  url: string | null;
  followers: number | null;
  error?: string | null;
  source?: string;
  from_guess?: boolean;
}

export interface SocialPresenceDetails {
  instagram?: SocialPlatformSnapshot;
  facebook?: SocialPlatformSnapshot;
  youtube?: SocialPlatformSnapshot;
  twitter?: SocialPlatformSnapshot;
  linkedin?: SocialPlatformSnapshot;
  brand_presence_score?: number;
  market_capture_score?: number;
  platforms_linked?: number;
  method?: string;
  error?: string;
  interpretation?: string;
}

export interface AiBrandFactsBlock {
  facts?: string[];
  summary?: string;
  caveat?: string;
  method?: string;
  error?: string;
}

export interface PlatformPresenceItem {
  found: boolean;
  mentions: number;
  top_urls?: string[];
}

/* ── Presence dimension config ─────────────────────────────────── */

interface PresenceDimension {
  key: string;
  label: string;
  shortLabel: string;
  getValue: (bv: BrandVisibility, sp: SocialPresenceDetails | null) => number;
}

const DIMENSIONS: PresenceDimension[] = [
  {
    key: "search", label: "Search Presence", shortLabel: "Search",
    getValue: (bv) => Math.round(bv.google_score ?? 0),
  },
  {
    key: "social", label: "Social Presence", shortLabel: "Social",
    getValue: (_, sp) => Math.round(sp?.brand_presence_score ?? 0),
  },
  {
    key: "community", label: "Community Presence", shortLabel: "Community",
    getValue: (bv) => Math.round(bv.reddit_score ?? 0),
  },
  {
    key: "content", label: "Content Presence", shortLabel: "Content",
    getValue: (bv) => Math.round(bv.medium_score ?? 0),
  },
  {
    key: "web", label: "Internet Presence", shortLabel: "Internet",
    getValue: (bv) => Math.round(bv.web_mentions_score ?? 0),
  },
];

/* ── Social platform icons ─────────────────────────────────────── */

const SOCIAL_PLATFORMS: Array<{
  key: keyof Pick<SocialPresenceDetails, "instagram" | "facebook" | "youtube" | "twitter" | "linkedin">;
  label: string;
  color: string;
  bgColor: string;
  iconPath: string;
}> = [
  { key: "instagram", label: "Instagram", color: "#E4405F", bgColor: "#E4405F15",
    iconPath: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  { key: "facebook", label: "Facebook", color: "#1877F2", bgColor: "#1877F215",
    iconPath: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { key: "youtube", label: "YouTube", color: "#FF0000", bgColor: "#FF000015",
    iconPath: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  { key: "twitter", label: "X", color: "#000000", bgColor: "#00000010",
    iconPath: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { key: "linkedin", label: "LinkedIn", color: "#0A66C2", bgColor: "#0A66C215",
    iconPath: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
];

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

/* ── Component ─────────────────────────────────────────────────── */

interface SocialBrandReachCardProps {
  slug: string;
  brandName: string;
  details: SocialPresenceDetails | null | undefined;
  aiBrandFacts?: AiBrandFactsBlock | null;
  platformPresence?: Record<string, PlatformPresenceItem> | null;
  brandVisibility?: BrandVisibility | null;
  coral: string;
}

export function SocialBrandReachCard({
  slug, brandName, details, brandVisibility, coral,
}: SocialBrandReachCardProps) {
  const sp = details && typeof details === "object" ? details : null;
  const presence = sp?.brand_presence_score ?? 0;
  const capture = sp?.market_capture_score ?? 0;
  const topError = sp?.error;

  /* ── Build line graph data ── */
  const graphW = 500;
  const graphH = 100;
  const padX = 10;
  const padTop = 16;
  const padBot = 0;
  const plotH = graphH - padTop - padBot;

  const emptyBv: BrandVisibility = {
    google_score: 0, google_details: {}, reddit_score: 0, reddit_details: {},
    medium_score: 0, medium_details: {}, web_mentions_score: 0, web_mentions_details: {},
    overall_score: 0,
  };
  const bv = brandVisibility ?? emptyBv;

  const points = DIMENSIONS.map((dim, i) => {
    const val = dim.getValue(bv, sp);
    const x = padX + (i / (DIMENSIONS.length - 1)) * (graphW - 2 * padX);
    const y = padTop + plotH - (val / 100) * plotH;
    return { ...dim, val, x, y };
  });

  const hasGraphData = points.some((p) => p.val > 0);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${graphH} L ${points[0].x.toFixed(1)} ${graphH} Z`;

  /* ── Social platform list ── */
  const platforms = SOCIAL_PLATFORMS.map((cfg) => {
    const data = sp?.[cfg.key] as SocialPlatformSnapshot | undefined;
    return {
      ...cfg,
      url: data?.url ?? null,
      followers: data?.followers ?? null,
      error: data?.error ?? null,
      source: data?.source ?? "none",
      hasProfile: Boolean(data?.url),
    };
  });

  return (
    <div className="col-span-12 rounded-2xl border border-border bg-card p-5 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Brand Presence</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Online footprint of <span className="font-medium text-foreground">{brandName}</span>
            {" · "}
            <Link href={`/dashboard/${slug}/visibility`} className="underline-offset-2 hover:underline" style={{ color: coral }}>
              Full visibility
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-8 text-right lg:pl-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Brand presence</p>
            <p className="text-2xl font-bold tabular-nums text-foreground">{Math.round(presence)}</p>
            <p className="text-[10px] text-muted-foreground">/100</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Market capture</p>
            <p className="text-2xl font-bold tabular-nums text-foreground">{Math.round(capture)}</p>
            <p className="text-[10px] text-muted-foreground">/100</p>
          </div>
        </div>
      </div>

      {/* ── Presence Line Graph ── */}
      {hasGraphData ? (
        <div className="mt-4">
          <div className="relative w-full" style={{ maxHeight: "140px" }}>
            <svg
              viewBox={`0 0 ${graphW} ${graphH + 18}`}
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
              style={{ overflow: "visible", maxHeight: "140px" }}
            >
              {/* Grid lines */}
              {[0, 50, 100].map((v) => {
                const y = padTop + plotH - (v / 100) * plotH;
                return (
                  <g key={v}>
                    <line x1={padX} y1={y} x2={graphW - padX} y2={y} stroke="var(--border)" strokeWidth="0.4" strokeDasharray="3,4" opacity="0.5" />
                  </g>
                );
              })}

              {/* Area fill */}
              <defs>
                <linearGradient id="presenceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={coral} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={coral} stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#presenceGrad)" />

              {/* Line */}
              <path d={linePath} fill="none" stroke={coral} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

              {/* Data points */}
              {points.map((p) => (
                <g key={p.key}>
                  <circle cx={p.x} cy={p.y} r="3" fill="var(--card)" stroke={coral} strokeWidth="1.5" />
                  <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="var(--foreground)">
                    {p.val}
                  </text>
                </g>
              ))}

              {/* X-axis labels */}
              {points.map((p) => (
                <text key={`l-${p.key}`} x={p.x} y={graphH + 12} textAnchor="middle" fontSize="7.5" fontWeight="500" fill="var(--muted-foreground)">
                  {p.shortLabel}
                </text>
              ))}
            </svg>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/10 p-4">
          <p className="text-xs text-muted-foreground">
            No presence data yet. Run a <span className="font-medium text-foreground">new analysis</span> to generate the presence graph.
          </p>
        </div>
      )}

      {/* ── Social Platforms Row ── */}
      <div className="mt-5 flex items-center justify-between gap-2 flex-wrap">
        {platforms.map((plat) => {
          const found = plat.hasProfile;
          const hasFollowers = plat.followers != null && plat.followers > 0;

          return (
            <div key={plat.key} className="flex flex-col items-center gap-1.5 min-w-[60px] flex-1">
              <a
                href={found && plat.url ? plat.url : "#"}
                target={found ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                  found ? "hover:scale-110" : "opacity-30 cursor-default"
                }`}
                style={{ backgroundColor: found ? plat.bgColor : "var(--muted)" }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill={found ? plat.color : "var(--muted-foreground)"}>
                  <path d={plat.iconPath} />
                </svg>
              </a>
              <span className={`text-[10px] font-medium ${found ? "text-foreground" : "text-muted-foreground/40"}`}>
                {plat.label}
              </span>
              {hasFollowers ? (
                <span className="text-[10px] font-bold tabular-nums" style={{ color: plat.color }}>
                  {formatFollowers(plat.followers!)}
                </span>
              ) : found ? (
                <span className="text-[9px] text-muted-foreground/50">
                  {plat.error === "login_wall" ? "private" : "linked"}
                </span>
              ) : (
                <span className="text-[9px] text-muted-foreground/30">-</span>
              )}
            </div>
          );
        })}
      </div>

      {topError && (
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
          Social metrics unavailable: {topError}
        </p>
      )}

      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
        {typeof sp?.interpretation === "string" && sp.interpretation
          ? sp.interpretation
          : "Social links discovered from the brand's website. Follower counts are best-effort from public pages."}
      </p>
    </div>
  );
}
