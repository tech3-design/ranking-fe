"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LANDING_PRIMARY_CTA_CLASS } from "@/components/landing/constants";
import { ScreenHR } from "@/components/ui/intersection-diamonds";
import { cn } from "@/lib/utils";

// Keep in sync with src/app/pricing/page.tsx PLANS constant.
const TEASER_PLANS = [
  { label: "Starter", price: 19.99, blurb: "1 project · 25 prompts" },
  { label: "Pro", price: 49.99, blurb: "3 projects · 75 prompts", popular: true },
  { label: "Max", price: 59.99, blurb: "6 projects · 200 prompts" },
];

export function LandingPricingTeaser() {
  return (
    <section
      className="relative bg-background"
      aria-labelledby="landing-pricing-teaser-heading"
    >
      <ScreenHR />
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-14 lg:px-12 lg:pb-14 lg:pt-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          [ pricing ]
        </p>
        <h2
          id="landing-pricing-teaser-heading"
          className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]"
        >
          Plans from{" "}
          <span className="relative whitespace-nowrap text-primary">
            £19.99 / month
            <span
              className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
              aria-hidden
            />
          </span>
        </h2>
        <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
          Cancel anytime. No setup fees, no seats, no surprise usage bills — just one clear monthly
          number in GBP.
        </p>
      </div>

      <ScreenHR />

      <div className="mx-auto max-w-7xl bg-black-10">
        <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-3 md:divide-x md:divide-y-0">
          {TEASER_PLANS.map((p) => (
            <div
              key={p.label}
              className={cn(
                "relative flex flex-col gap-5 px-6 py-10 md:px-8 md:py-12 lg:px-10",
                p.popular
                  ? "bg-gradient-to-br from-primary/5 via-white to-primary/10"
                  : "bg-white",
              )}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                  {p.label}
                </h3>
                {p.popular ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    Most Popular
                  </span>
                ) : null}
              </div>
              <div className="flex items-start">
                <span className="mt-1.5 text-base font-semibold text-foreground">
                  {"\u00A3"}
                </span>
                <span className="ml-0.5 text-4xl font-bold tabular-nums tracking-tight text-foreground">
                  {p.price}
                </span>
                <span className="ml-2 mt-4 text-xs font-medium text-muted-foreground">
                  / month
                </span>
              </div>
              <p className="flex items-center gap-2 text-[13px] text-accent-foreground">
                <Check
                  className="h-3.5 w-3.5 shrink-0 text-primary"
                  strokeWidth={2.25}
                  aria-hidden
                />
                {p.blurb}
              </p>
              <Link
                href="/pricing"
                className="mt-auto inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
              >
                See full plan
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 pb-14 lg:px-12 lg:pb-16">
        <p className="text-sm font-medium text-muted-foreground">
          Need a custom plan, agency seats, or annual billing?
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild className={`${LANDING_PRIMARY_CTA_CLASS} h-10 px-5`}>
            <Link href="/pricing">
              Compare plans
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-10 border-black/15 bg-background px-5 text-sm font-semibold shadow-sm hover:bg-muted/50"
          >
            <a href="mailto:hello@signalor.ai?subject=Talk%20to%20sales">Talk to sales</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
