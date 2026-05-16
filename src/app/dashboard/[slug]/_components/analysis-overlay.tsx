"use client";

import { useState } from "react";
import { Globe } from "@/components/icons";

import { useRun } from "./run-context";
import { AnalyzingRadar } from "@/components/ui/analyzing-radar";
import { RotatingGeoFact } from "@/components/ui/rotating-geo-fact";

function hostOf(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url.includes("://") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^www\./, "").split("/")[0];
  }
}

export function AnalysisOverlay() {
  const { run } = useRun();
  const brand = run?.display_brand_name?.trim() || run?.brand_name?.trim() || "Your brand";
  const host = hostOf(run?.url || "");
  const progress = Math.max(0, Math.min(100, run?.progress ?? 0));

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/98 backdrop-blur-sm">
      {/* Radar (left) + Info (right) */}
      <div className="flex items-center justify-center gap-10 md:gap-16">
        <AnalyzingRadar size={220} />

        <div className="w-[420px] min-w-0">
          {/* Eyebrow with live pulse dot */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
              Analyzing
            </p>
          </div>

          {/* Brand identity — logo + name properly aligned */}
          <div className="mt-4 flex items-center gap-3">
            <BrandFavicon host={host} size={44} />
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground capitalize">
                {brand}
              </h1>
              {host ? (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{host}</p>
              ) : null}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Progress
              </p>
              <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {Math.round(progress)}%
              </p>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rotating brand fact */}
      <RotatingGeoFact intervalMs={4500} className="mx-auto mt-10 max-w-lg" />
    </div>
  );
}

function BrandFavicon({ host, size = 56 }: { host: string; size?: number }) {
  // Try Clearbit (full brand logo) → Google favicon (sz=128) → Globe placeholder
  const sources = host
    ? [
        `https://logo.clearbit.com/${host}`,
        `https://www.google.com/s2/favicons?domain=${host}&sz=128`,
      ]
    : [];
  const [srcIdx, setSrcIdx] = useState(0);
  const exhausted = !sources.length || srcIdx >= sources.length;

  if (exhausted) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/40 text-muted-foreground"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Globe style={{ width: size * 0.5, height: size * 0.5 }} />
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      key={sources[srcIdx]}
      src={sources[srcIdx]}
      alt=""
      width={size}
      height={size}
      loading="eager"
      decoding="async"
      onError={() => setSrcIdx((i) => i + 1)}
      className="shrink-0 rounded-xl border border-border/70 bg-white object-contain p-2 shadow-sm"
      style={{ width: size, height: size }}
    />
  );
}
