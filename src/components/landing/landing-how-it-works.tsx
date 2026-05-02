"use client";

import { Globe, Gauge, Link2, Rocket } from "lucide-react";

import { HOW_IT_WORKS_STEPS, type HowItWorksStep } from "@/lib/landing-how-it-works-content";
import { ScreenHR } from "@/components/ui/intersection-diamonds";

export function LandingHowItWorks() {
  return (
    <section
      className="relative bg-background"
      aria-labelledby="how-it-works-heading"
    >
      <ScreenHR />
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-14 lg:px-12 lg:pb-14 lg:pt-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          [ how it works ]
        </p>
        <h2
          id="how-it-works-heading"
          className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]"
        >
          From pasted URL to{" "}
          <span className="relative whitespace-nowrap text-primary">
            shipped fix
            <span
              className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
              aria-hidden
            />
          </span>{" "}
          in four steps
        </h2>
        <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
          No setup calls, no integrations headache. Every step uses the product you just signed up
          for — no separate onboarding tool.
        </p>
      </div>

      <ScreenHR />

      <div className="mx-auto max-w-7xl bg-black-10">
        <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((s) => (
            <StepCard key={s.n} step={s} />
          ))}
        </div>
      </div>

      <ScreenHR />
    </section>
  );
}

function StepCard({ step }: { step: HowItWorksStep }) {
  return (
    <div className="flex flex-col gap-6 bg-white px-6 py-12 md:px-8 md:py-14 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
          {step.n}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Step {step.n}
        </span>
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
        {step.title}
      </h3>
      <p className="max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
        {step.body}
      </p>
      <div className="mt-auto flex items-center justify-center rounded-sm border border-black/6 bg-background p-4">
        <StepIllustration illo={step.illo} />
      </div>
    </div>
  );
}

function StepIllustration({ illo }: { illo: HowItWorksStep["illo"] }) {
  if (illo === "connect") {
    return (
      <div className="flex w-full items-center gap-2 rounded-lg border border-black/8 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <Globe className="h-4 w-4 text-muted-foreground" aria-hidden />
        <span className="flex-1 truncate text-[12px] text-neutral-600">signalor.ai</span>
        <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
          Connect
        </span>
      </div>
    );
  }
  if (illo === "audit") {
    return (
      <div className="w-full rounded-lg border border-black/8 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500">
          <Gauge className="h-3.5 w-3.5" aria-hidden />
          GEO score
        </div>
        <p className="mt-1 text-2xl font-bold tabular-nums text-neutral-900">
          78<span className="text-sm text-neutral-400">/100</span>
        </p>
        <div className="mt-2 flex gap-1">
          {[82, 71, 74].map((v) => (
            <div key={v} className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${v}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (illo === "track") {
    return (
      <div className="w-full rounded-lg border border-black/8 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500">
          <Link2 className="h-3.5 w-3.5" aria-hidden />
          Citations this week
        </div>
        <ul className="mt-2 space-y-1.5 text-[11px] font-medium text-neutral-700">
          <li className="flex items-center justify-between">
            <span className="truncate">perplexity.ai</span>
            <span className="tabular-nums text-primary">8</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="truncate">gemini</span>
            <span className="tabular-nums text-neutral-500">5</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="truncate">chatgpt</span>
            <span className="tabular-nums text-neutral-500">3</span>
          </li>
        </ul>
      </div>
    );
  }
  // ship
  return (
    <div className="w-full rounded-lg border border-black/8 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500">
        <Rocket className="h-3.5 w-3.5" aria-hidden />
        Fix queue
      </div>
      <ul className="mt-2 space-y-1.5 text-[11px] font-medium">
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          <span className="flex-1 truncate text-neutral-800">Organization JSON-LD</span>
          <span className="rounded bg-red-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-red-700">
            Critical
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="flex-1 truncate text-neutral-800">FAQ block · /docs</span>
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-800">
            Shipped
          </span>
        </li>
      </ul>
    </div>
  );
}
