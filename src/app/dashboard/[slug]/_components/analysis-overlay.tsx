"use client";

import { useState } from "react";
import { Globe } from "lucide-react";

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
  const brand =
    run?.display_brand_name?.trim() ||
    run?.brand_name?.trim() ||
    "Your brand";
  const host = hostOf(run?.url || "");

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      {/* Radar (left) + Brand identity (right) */}
      <div className="flex items-center justify-center gap-10 md:gap-16">
        <AnalyzingRadar size={220} />
        <div className="min-w-0 max-w-[520px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
            Analyzing
          </p>
          <div className="mt-3 flex items-center gap-4">
            <BrandFavicon host={host} size={56} />
            <div className="min-w-0">
              <h1 className="break-words text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
                {brand}
              </h1>
              {host ? (
                <p className="mt-2 truncate text-sm text-muted-foreground">
                  {host}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Rotating brand fact */}
      <RotatingGeoFact
        intervalMs={4500}
        className="mx-auto mt-12 max-w-lg"
      />
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
