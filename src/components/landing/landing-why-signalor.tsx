"use client";

import Link from "next/link";
import { ArrowRight, Gauge, Layers, Link2, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANDING_PRIMARY_CTA_CLASS } from "./constants";
import { ScreenHR } from "@/components/ui/intersection-diamonds";

const FEATURE_ROWS = [
  {
    icon: Gauge,
    title: "GEO score",
    description:
      "One 0–100 read on how well AI systems understand, trust, and cite your site — not vanity traffic.",
  },
  {
    icon: Link2,
    title: "Citation & prompt signals",
    description:
      "See which pages and sources show up in answers so you can double down on what models actually use.",
  },
  {
    icon: ListChecks,
    title: "Prioritized fixes",
    description:
      "Plain-language tasks ordered by impact: schema, structure, and content tweaks that move citations.",
  },
  {
    icon: Layers,
    title: "Multi-engine view",
    description:
      "Track how ChatGPT, Perplexity, Gemini, and others treat your brand — in one place, updated continuously.",
  },
] as const;

const PROOF_METRICS = [
  { value: "5k+", label: "Websites optimizing with us" },
  { value: "40%", label: "Avg. lift in AI citations" },
  { value: "40%", label: "Higher buyer intent" },
  { value: "24h", label: "To see visibility growth" },
] as const;

const PILLAR_SCORES = [
  { label: "Citability", value: 82, tone: "bg-[#2563eb]/80" },
  { label: "Schema", value: 71, tone: "bg-emerald-500/90" },
  { label: "Content", value: 74, tone: "bg-amber-500/90" },
] as const;

export function LandingWhySignalor() {
  return (
    <section className="relative bg-background" aria-labelledby="why-signalor-heading">
      <ScreenHR />

      <div className="mx-auto max-w-7xl px-6 pb-12 pt-14 lg:px-12 lg:pb-14 lg:pt-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          [ why signalor ]
        </p>
        <h2
          id="why-signalor-heading"
          className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem] xl:text-5xl"
        >
          SEO got your site on Google. GEO gets you into{" "}
          <span className="relative whitespace-nowrap text-primary">
            AI answers
            <span
              className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
              aria-hidden
            />
          </span>
        </h2>
        <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
          Over 40% of searches now happen inside AI tools — and those tools don&apos;t rank links,
          they cite sources. Signalor runs a full GEO audit of your website, scoring AI citability,
          structured data, and where you win or lose against competitors.
        </p>
      </div>

      <ScreenHR />

      <div className="mx-auto max-w-7xl bg-black-10">
        <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-2 md:divide-x md:divide-y-0 md:divide-black/6 ">
          {/* 1 — Proof in numbers + CTAs */}
          <div className="flex flex-col gap-8 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10 rounded-sm border border-black/6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                Proof in numbers
              </h3>
              <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
                Benchmarks from teams using Signalor to grow citations and tighten GEO execution.
              </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="grid grid-cols-2 gap-px border border-black/6 bg-border">
                {PROOF_METRICS.map((m) => (
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
                <Link href="/analyzer">
                  Run free GEO audit
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-10 border-black/15 bg-background px-5 text-sm font-semibold shadow-sm hover:bg-muted/50"
              >
                <Link href="#features">Explore platform</Link>
              </Button>
            </div>
          </div>

          {/* 2 — Live preview (conversation only) */}
          <div className="flex flex-col gap-8 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10 rounded-sm border border-black/6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                Live preview
              </h3>
              <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
                Prompts and model answers the way your team reviews them — before you ship changes.
              </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col justify-center">
              <div className="rounded-sm border border-black/6 bg-background p-4">
                <div className="rounded-xl border border-black/8 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="space-y-3 text-[13px] leading-snug">
                    <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-neutral-100 px-3.5 py-2.5 text-neutral-700">
                      Why should we prioritize GEO over traditional SEO this quarter?
                    </div>
                    <div className="ml-auto max-w-[94%] rounded-2xl rounded-br-md bg-neutral-900 px-3.5 py-2.5 text-[12px] font-medium text-neutral-100">
                      Generative engines cite sources, not blue links. Teams using{" "}
                      <span className="font-semibold text-orange-400">Signalor</span> see clearer gaps
                      in schema, entity coverage, and prompts where they never appear.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 — Signal breakdown (fills the 4th grid slot on xl) */}
          <div className="flex flex-col gap-8 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10 rounded-sm border border-black/6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                Signal breakdown
              </h3>
              <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
                Roll-up score plus the three pillars that move fastest when models start citing you.
              </p>
            </div>

            <div className="flex flex-1 flex-col justify-center">
              <div className="rounded-sm border border-black/6 bg-background p-4">
                <div className="rounded-xl border border-black/8 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                        Overall
                      </p>
                      <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-neutral-900">
                        78
                        <span className="text-lg font-semibold text-neutral-400">/100</span>
                      </p>
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-[#2563eb]/25 text-[11px] font-bold text-[#2563eb]">
                      +12
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2.5 border-t border-black/6 pt-3 text-[12px] font-medium text-neutral-700">
                    {PILLAR_SCORES.map((row) => (
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
                      <span>Mentioned</span>
                      <span>Missing</span>
                    </div>
                    <div className="flex h-2.5 overflow-hidden rounded-full bg-neutral-200">
                      <div className="w-[40%] bg-[#2563eb]" />
                      <div
                        className="relative flex-1 bg-neutral-200"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 5px)",
                        }}
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[11px] font-semibold tabular-nums text-neutral-600">
                      <span>40%</span>
                      <span>60%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 — What you ship (capability list) */}
          <div className="flex flex-col gap-8 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10 rounded-sm border border-black/6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                What you ship
              </h3>
              <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
                The product surfaces you use every week — from score to fixes to engine-by-engine
                visibility.
              </p>
            </div>

            <div className="flex flex-1 flex-col">
              <div className="rounded-sm border border-black/6 bg-background p-4">
                <div className="rounded-xl border border-black/8 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <ul className="divide-y divide-black/6 text-[12px] font-medium">
                    {FEATURE_ROWS.map(({ icon: Icon, title, description }) => (
                      <li key={title} className="flex gap-3 py-3 first:pt-1 last:pb-1">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-black/8 bg-neutral-50 text-[#e04a3d]">
                          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-neutral-900">{title}</div>
                          <p className="mt-1 text-[11px] font-normal leading-relaxed text-neutral-500">
                            {description}
                          </p>
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

      <ScreenHR />
    </section>
  );
}
