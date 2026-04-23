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

          {/* 2 — Citation attribution (feature moat — the URL roll-up) */}
          <div className="flex flex-col gap-8 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10 rounded-sm border border-black/6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                Citation attribution
              </h3>
              <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
                See exactly which URLs AI engines cite for your prompts — yours, your rivals&apos;,
                and everyone else. The page to fix, not a guess.
              </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col justify-center">
              <div className="rounded-sm border border-black/6 bg-background p-4">
                <div className="rounded-xl border border-black/8 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="mb-3 flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                    <span>Top cited domains · 7d</span>
                    <span className="tabular-nums text-neutral-400">24 citations</span>
                  </div>
                  <ul className="space-y-2.5 text-[12px] font-medium">
                    {[
                      { domain: "signalor.ai", pct: 62, tag: "YOU", tagBg: "bg-emerald-100", tagFg: "text-emerald-700", bar: "bg-emerald-600" },
                      { domain: "tryprofound.com", pct: 38, tag: "RIVAL", tagBg: "bg-amber-100", tagFg: "text-amber-700", bar: "bg-amber-500" },
                      { domain: "siftly.ai", pct: 26, tag: "RIVAL", tagBg: "bg-amber-100", tagFg: "text-amber-700", bar: "bg-amber-500" },
                      { domain: "searchengineland.com", pct: 18, tag: "", tagBg: "", tagFg: "", bar: "bg-neutral-400" },
                    ].map((r) => (
                      <li key={r.domain}>
                        <div className="flex items-center justify-between gap-2 text-[12px] font-semibold text-neutral-800">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate">{r.domain}</span>
                            {r.tag && (
                              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${r.tagBg} ${r.tagFg}`}>
                                {r.tag}
                              </span>
                            )}
                          </span>
                          <span className="tabular-nums text-neutral-500">{r.pct}%</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                          <div className={`h-full rounded-full ${r.bar}`} style={{ width: `${r.pct}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 3 — Competitor delta (closing the gap week over week) */}
          <div className="flex flex-col gap-8 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10 rounded-sm border border-black/6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                Competitor delta
              </h3>
              <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
                Track which prompts you win back from rivals week over week — so you see the
                content sprint paying off, not just static scores.
              </p>
            </div>

            <div className="flex flex-1 flex-col justify-center">
              <div className="rounded-sm border border-black/6 bg-background p-4">
                <div className="rounded-xl border border-black/8 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                        Prompts won this week
                      </p>
                      <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-neutral-900">
                        +4
                        <span className="ml-1 text-sm font-semibold text-emerald-600">↑</span>
                      </p>
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-emerald-500/30 text-[11px] font-bold text-emerald-600">
                      +18%
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2.5 border-t border-black/6 pt-3 text-[12px] font-medium">
                    {[
                      { name: "Acme", prev: 44, now: 40, delta: -4, rival: true },
                      { name: "Northwind", prev: 22, now: 20, delta: -2, rival: true },
                      { name: "You", prev: 34, now: 40, delta: 6, rival: false },
                    ].map((row) => (
                      <li key={row.name} className="flex items-center gap-2">
                        <span className="min-w-0 flex-1">
                          <span className={row.rival ? "text-neutral-700" : "font-semibold text-emerald-700"}>
                            {row.name}
                          </span>
                          <span className="ml-1 text-[11px] text-neutral-500 tabular-nums">
                            {row.prev}% → {row.now}%
                          </span>
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                            row.delta > 0
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {row.delta > 0 ? "+" : ""}
                          {row.delta}
                        </span>
                      </li>
                    ))}
                  </ul>
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
