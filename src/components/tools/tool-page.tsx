"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScreenHR } from "@/components/ui/intersection-diamonds";

export type ToolTheme = "orange" | "blue" | "emerald" | "violet";

const THEME: Record<
  ToolTheme,
  {
    sectionBg: string;
    eyebrow: string;
    accent: string;
    accentBg: string;
    accentSoftBg: string;
    accentBorder: string;
    cardRadius: string;
  }
> = {
  orange: {
    sectionBg: "bg-background",
    eyebrow: "text-neutral-400",
    accent: "text-primary",
    accentBg: "bg-primary",
    accentSoftBg: "bg-primary/10",
    accentBorder: "border-primary/20",
    cardRadius: "rounded-sm",
  },
  blue: {
    sectionBg: "bg-[var(--feature-blue-tint)]",
    eyebrow: "text-[#2563eb]/70",
    accent: "text-[#2563eb]",
    accentBg: "bg-[#2563eb]",
    accentSoftBg: "bg-[#2563eb]/10",
    accentBorder: "border-[#2563eb]/20",
    cardRadius: "rounded-lg",
  },
  emerald: {
    sectionBg: "bg-[var(--feature-emerald-tint)]",
    eyebrow: "text-emerald-700/70",
    accent: "text-emerald-700",
    accentBg: "bg-emerald-700",
    accentSoftBg: "bg-emerald-700/10",
    accentBorder: "border-emerald-700/20",
    cardRadius: "rounded-2xl",
  },
  violet: {
    sectionBg: "bg-[var(--feature-violet-tint)]",
    eyebrow: "text-violet-700/70",
    accent: "text-violet-700",
    accentBg: "bg-violet-700",
    accentSoftBg: "bg-violet-700/10",
    accentBorder: "border-violet-700/20",
    cardRadius: "rounded-xl",
  },
};

export type ToolFeature = { title: string; description: string };
export type ToolPreviewRow = {
  locked?: boolean;
  content: ReactNode;
};

export function ToolPage({
  theme,
  eyebrow,
  title,
  titleAccent,
  description,
  form,
  features,
  previewEyebrow,
  previewTitle,
  previewTitleAccent,
  previewDescription,
  previewRows,
  lockedCta = "View pricing",
}: {
  theme: ToolTheme;
  /** Uppercase eyebrow, wrap the topic in brackets e.g. `[ free tool ]` */
  eyebrow: string;
  title: string;
  /** Optional dashed-underline accent span within the title */
  titleAccent?: string;
  description: string;
  form: ReactNode;
  features: ToolFeature[];
  previewEyebrow: string;
  previewTitle: string;
  previewTitleAccent?: string;
  previewDescription: string;
  previewRows: ToolPreviewRow[];
  lockedCta?: string;
}) {
  const t = THEME[theme];
  const featuresCols = Math.min(features.length, 4);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className={cn("relative px-6 pb-14 pt-14 lg:px-12 lg:pb-16 lg:pt-16", t.sectionBg)}>
        <div className="mx-auto max-w-7xl">
          <p className={cn("text-[11px] font-medium uppercase tracking-[0.22em]", t.eyebrow)}>{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem] xl:text-5xl">
            {title}{" "}
            {titleAccent && (
              <span className={cn("relative whitespace-nowrap", t.accent)}>
                {titleAccent}
                <span
                  className={cn("absolute -bottom-1 left-0 right-0 border-b-2 border-dashed", t.accentBorder)}
                  aria-hidden
                />
              </span>
            )}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
            {description}
          </p>
          <div className="mt-8 max-w-2xl">{form}</div>
        </div>
      </section>

      {/* ── Features (landing-features-grid divide pattern) ───────────────── */}
      <ScreenHR />
      <section className={cn("relative", t.sectionBg)} aria-labelledby="tool-features-heading">
        <div className="mx-auto max-w-7xl bg-black-10">
          <div
            className={cn(
              "grid grid-cols-1 divide-y divide-black/6 md:divide-x md:divide-y-0 md:divide-black/6",
              featuresCols === 2 && "md:grid-cols-2",
              featuresCols === 3 && "md:grid-cols-3",
              featuresCols >= 4 && "md:grid-cols-4",
            )}
          >
            {features.map((f) => (
              <div key={f.title} className={cn("flex flex-col gap-4 bg-white px-6 py-12 md:px-8 md:py-14 lg:px-10", t.cardRadius)}>
                <span className={cn("inline-flex h-8 w-8 items-center justify-center", t.cardRadius, t.accentSoftBg)}>
                  <span className={cn("h-2 w-2 rounded-full", t.accentBg)} aria-hidden />
                </span>
                <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">{f.title}</h3>
                <p className="max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preview with locked rows ──────────────────────────────────────── */}
      <ScreenHR />
      <section className={cn("relative px-6 pb-14 pt-14 lg:px-12 lg:pb-16 lg:pt-16", t.sectionBg)}>
        <div className="mx-auto max-w-7xl">
          <p className={cn("text-[11px] font-medium uppercase tracking-[0.22em]", t.eyebrow)}>{previewEyebrow}</p>
          <h2 className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]">
            {previewTitle}{" "}
            {previewTitleAccent && (
              <span className={cn("relative whitespace-nowrap", t.accent)}>
                {previewTitleAccent}
                <span
                  className={cn("absolute -bottom-1 left-0 right-0 border-b-2 border-dashed", t.accentBorder)}
                  aria-hidden
                />
              </span>
            )}
          </h2>
          <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
            {previewDescription}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-7xl bg-black-10">
          <div className="grid grid-cols-1 divide-y divide-black/6">
            {previewRows.map((row, i) => (
              <div key={i} className={cn("relative flex flex-col gap-4 bg-white px-6 py-10 md:px-8 md:py-12 lg:px-10", t.cardRadius)}>
                <div className={row.locked ? "pointer-events-none select-none blur-[2px] opacity-60" : ""}>
                  {row.content}
                </div>
                {row.locked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Link
                      href="/pricing"
                      className={cn(
                        "inline-flex items-center gap-2 border bg-white px-4 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:shadow",
                        t.cardRadius,
                        t.accentBorder,
                      )}
                    >
                      <Lock className={cn("h-3.5 w-3.5", t.accent)} aria-hidden />
                      {lockedCta}
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl justify-center">
          <Link
            href="/pricing"
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110",
              t.cardRadius,
              t.accentBg,
            )}
          >
            See all plans
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
      <ScreenHR />
    </>
  );
}
