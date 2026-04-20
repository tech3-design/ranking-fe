"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LANDING_PRIMARY_CTA_CLASS } from "@/components/landing/constants";
import { PromptTrackingChatAnswerParts } from "@/components/landing/prompt-tracking-chat-answer-parts";
import {
  PROMPT_TRACKING_CAPABILITY_ROWS,
  PROMPT_TRACKING_HERO,
  PROMPT_TRACKING_PILLAR_ROWS,
  PROMPT_TRACKING_PROOF_METRICS,
  PROMPT_TRACKING_WHY,
} from "@/lib/landing-prompt-tracking-content";

/**
 * Same structural pattern as {@link LandingWhySignalor}: eyebrow, headline with dashed primary span,
 * intro copy, then bg-black-10 md:grid-cols-2 band with proof tiles, preview, breakdown, capability list.
 */
export function PromptTrackingWhySection({
  content = PROMPT_TRACKING_WHY,
  proofMetrics = PROMPT_TRACKING_PROOF_METRICS,
  pillarRows = PROMPT_TRACKING_PILLAR_ROWS,
  capabilityRows = PROMPT_TRACKING_CAPABILITY_ROWS,
  primaryCta = PROMPT_TRACKING_HERO.primaryCta,
  secondaryCtaLabel = "Browse prompt library",
  secondaryCtaHref = "/prompt-tracking/prompt-library",
  headingId = "prompt-tracking-why-heading",
}: {
  content?: typeof PROMPT_TRACKING_WHY;
  proofMetrics?: readonly { value: string; label: string }[];
  pillarRows?: readonly { label: string; value: number; tone: string }[];
  capabilityRows?: readonly { icon: typeof PROMPT_TRACKING_CAPABILITY_ROWS[number]["icon"]; title: string; description: string }[];
  primaryCta?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  headingId?: string;
} = {}) {
  const w = content;
  return (
    <section className="relative bg-background" aria-labelledby={headingId}>
      <div aria-hidden className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6" />

      <div className="mx-auto max-w-7xl px-6 pb-12 pt-14 lg:px-12 lg:pb-14 lg:pt-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">{w.eyebrow}</p>
        <h2
          id={headingId}
          className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem] xl:text-5xl"
        >
          {w.titleBefore}{" "}
          <span className="relative whitespace-nowrap text-primary">
            {w.titleAccent}
            <span
              className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
              aria-hidden
            />
          </span>{" "}
          {w.titleAfter}
        </h2>
        <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">{w.intro}</p>
      </div>

      <div aria-hidden className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6" />

      <div className="mx-auto max-w-7xl bg-black-10">
        <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-2 md:divide-x md:divide-y-0 md:divide-black/6">
          {/* Proof + CTAs */}
          <div className="flex flex-col gap-8 rounded-sm border border-black/6 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">{w.proofTitle}</h3>
              <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
                {w.proofBody}
              </p>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="grid grid-cols-2 gap-px border border-black/6 bg-border">
                {proofMetrics.map((m) => (
                  <div
                    key={m.label}
                    className="bg-background p-6 transition-colors hover:bg-muted/50 sm:p-7"
                  >
                    <p className="font-sans text-3xl font-bold tabular-nums tracking-tight text-foreground md:text-4xl">
                      {m.value}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-snug text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-auto flex flex-wrap gap-3">
              <Button asChild className={`${LANDING_PRIMARY_CTA_CLASS} h-10 px-5`}>
                <Link href="/sign-up">
                  {primaryCta}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-10 border-black/15 bg-background px-5 text-sm font-semibold shadow-sm hover:bg-muted/50"
              >
                <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
              </Button>
            </div>
          </div>

          {/* Live preview */}
          <div className="flex flex-col gap-8 rounded-sm border border-black/6 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">{w.liveTitle}</h3>
              <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
                {w.liveBody}
              </p>
            </div>
            <div className="flex min-h-0 flex-1 flex-col justify-center">
              <div className="rounded-sm border border-black/6 bg-background p-4">
                <div className="rounded-xl border border-black/8 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="space-y-3 text-[13px] leading-snug">
                    <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-neutral-100 px-3.5 py-2.5 text-neutral-700">
                      {w.livePrompt}
                    </div>
                    <div className="ml-auto max-w-[94%] rounded-2xl rounded-br-md bg-neutral-900 px-3.5 py-2.5 text-[12px] font-medium text-neutral-100">
                      <PromptTrackingChatAnswerParts parts={w.liveAnswerParts} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt coverage breakdown */}
          <div className="flex flex-col gap-8 rounded-sm border border-black/6 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">{w.coverageTitle}</h3>
              <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
                {w.coverageBody}
              </p>
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <div className="rounded-sm border border-black/6 bg-background p-4">
                <div className="rounded-xl border border-black/8 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                        {w.coverageScoreLabel}
                      </p>
                      <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-neutral-900">
                        {w.coverageScore}
                        <span className="text-lg font-semibold text-neutral-400">{w.coverageSuffix}</span>
                      </p>
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-[#2563eb]/25 text-[11px] font-bold text-[#2563eb]">
                      {w.coverageDelta}
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2.5 border-t border-black/6 pt-3 text-[12px] font-medium text-neutral-700">
                    {pillarRows.map((row) => (
                      <li key={row.label} className="flex items-center gap-2">
                        <span className={`h-1.5 w-8 shrink-0 rounded-full ${row.tone}`} aria-hidden />
                        <span>
                          {row.label} · {row.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                      <span>{w.citedLabel}</span>
                      <span>{w.missedLabel}</span>
                    </div>
                    <div className="flex h-2.5 overflow-hidden rounded-full bg-neutral-200">
                      <div className="bg-[#2563eb]" style={{ width: `${w.coverageCitedBarPct}%` }} />
                      <div
                        className="relative flex-1 bg-neutral-200"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 5px)",
                        }}
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[11px] font-semibold tabular-nums text-neutral-600">
                      <span>{w.citedPct}</span>
                      <span>{w.missedPct}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What you ship */}
          <div className="flex flex-col gap-8 rounded-sm border border-black/6 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">{w.shipTitle}</h3>
              <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
                {w.shipBody}
              </p>
            </div>
            <div className="flex flex-1 flex-col">
              <div className="rounded-sm border border-black/6 bg-background p-4">
                <div className="rounded-xl border border-black/8 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <ul className="divide-y divide-black/6 text-[12px] font-medium">
                    {capabilityRows.map(({ icon: Icon, title, description }) => (
                      <li key={title} className="flex gap-3 py-3 first:pt-1 last:pb-1">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-black/8 bg-neutral-50 text-[#e04a3d]">
                          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-neutral-900">{title}</div>
                          <p className="mt-1 text-[11px] font-normal leading-relaxed text-neutral-500">{description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6" />
    </section>
  );
}
