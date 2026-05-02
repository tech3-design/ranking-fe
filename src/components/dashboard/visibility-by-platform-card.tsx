"use client";

import { useMemo } from "react";
import type { BrandVisibility } from "@/lib/api/analyzer";
import { FEATURE_COLORS } from "./constants";

export function VisibilityByPlatformCard({ brandVis }: { brandVis: BrandVisibility | null | undefined }) {
  const visibilityCards = useMemo(() => {
    if (!brandVis) return [];
    return [
      {
        label: "Google",
        value: Math.round(brandVis.google_score),
        featured: true,
        icon: (
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        ),
      },
      {
        label: "Reddit",
        value: Math.round(brandVis.reddit_score),
        featured: false,
        icon: (
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#FF4500">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 13.38c.15.24.23.53.23.84 0 1.7-1.98 3.08-4.43 3.08s-4.43-1.38-4.43-3.08c0-.31.08-.6.23-.84a1.39 1.39 0 0 1-.33-.9 1.4 1.4 0 0 1 2.39-.98c.97-.63 2.25-1.02 3.65-1.06l.72-3.3a.27.27 0 0 1 .33-.21l2.38.52a.96.96 0 1 1-.1.46l-2.13-.47-.64 2.97c1.36.06 2.6.44 3.55 1.06a1.4 1.4 0 0 1 2.39.98c0 .35-.13.67-.33.9zM9.83 13.2a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm4.34 0a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.3 3.17c.1.1.26.1.36 0 .5-.5 1.24-.75 1.97-.75s1.47.25 1.97.75c.1.1.26.1.36 0 .1-.1.1-.26 0-.36-.6-.6-1.44-.93-2.33-.93s-1.73.33-2.33.93c-.1.1-.1.26 0 .36z" />
          </svg>
        ),
      },
      {
        label: "Medium",
        value: Math.round(0),
        featured: false,
        icon: (
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-foreground">
            <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42zm3.04 0c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75c.66 0 1.19 2.58 1.19 5.75z" />
          </svg>
        ),
      },
      {
        label: "Web",
        value: Math.round(brandVis.web_mentions_score),
        featured: false,
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="w-3.5 h-3.5 text-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        ),
      },
    ];
  }, [brandVis]);

  return (
    <div className="col-span-4 flex h-full min-h-0 flex-col rounded-xl border border-neutral-100 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <p className="mb-2 shrink-0 text-sm font-semibold text-foreground">Visibility by Platform</p>
      {visibilityCards.length > 0 ? (
        <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2">
          {visibilityCards.map((card) => {
            const delta = card.value - 50;
            const deltaPct = Math.max(1, Math.round(Math.abs(delta) / 10));
            const isPositive = delta >= 0;
            return (
              <div
                key={card.label}
                className="relative flex min-h-0 flex-col overflow-hidden rounded-lg border border-black/6 p-2.5"
                style={
                  card.featured
                    ? {
                        backgroundImage: `linear-gradient(
                            to bottom,
                            ${FEATURE_COLORS.orange},
                            color-mix(in srgb, ${FEATURE_COLORS.orange} 88%, black),
                            color-mix(in srgb, ${FEATURE_COLORS.orange} 62%, black)
                          )`,
                      }
                    : undefined
                }
              >
                <div className={card.featured ? "relative z-10 flex min-h-0 flex-1 flex-col" : "flex min-h-0 flex-1 flex-col"}>
                  <div className="mb-2 flex shrink-0 items-center justify-between">
                    <p className={card.featured ? "text-xs font-medium text-white" : "text-xs font-medium text-foreground/80"}>
                      {card.label}
                    </p>
                    <span className={card.featured ? "rounded-full border border-white/35 bg-white/20 p-0.5 text-white" : "rounded-full border border-black/10 bg-black/5 p-0.5 text-foreground/60"}>
                      {card.icon}
                    </span>
                  </div>
                  <p className={card.featured ? "text-[26px] font-bold leading-none tracking-tight text-white" : "text-[26px] font-bold leading-none tracking-tight text-foreground"}>
                    {card.value}
                  </p>
                  <div className="mt-auto flex shrink-0 flex-wrap items-center gap-1 pt-1.5">
                    <span
                      className={
                        isPositive
                          ? card.featured
                            ? "rounded-full bg-white/25 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm shadow-black/10"
                            : "rounded-full bg-emerald-500/12 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600"
                          : card.featured
                            ? "rounded-full bg-black/25 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm shadow-black/10"
                            : "rounded-full bg-rose-500/12 px-1.5 py-0.5 text-[9px] font-semibold text-rose-600"
                      }
                    >
                      {isPositive ? "↑" : "↓"} {deltaPct}%
                    </span>
                    <span className={card.featured ? "text-[10px] font-medium text-white" : "text-[10px] text-muted-foreground"}>
                      Visibility score
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center" style={{ height: 140 }}>
          <p className="text-xs text-muted-foreground">No visibility data yet</p>
        </div>
      )}
    </div>
  );
}
