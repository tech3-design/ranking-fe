"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LANDING_PRIMARY_CTA_CLASS } from "@/components/landing/constants";
import { HeroBackgroundGrid } from "@/components/landing/hero-background-grid";
import { PROMPT_TRACKING_HERO, PROMPT_TRACKING_HUB_CARDS } from "@/lib/landing-prompt-tracking-content";

export function PromptTrackingHero() {
  const h = PROMPT_TRACKING_HERO;
  return (
    <section className="relative bg-background px-6 pb-16 pt-16 lg:px-12 lg:pb-24 lg:pt-20">
      <HeroBackgroundGrid />
      <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:items-center lg:gap-8 xl:gap-12">
        <div className="relative z-10 min-w-0 max-w-xl text-left lg:max-w-none">
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
            {h.titleLine1}{" "}
            <span className="inline-flex items-center gap-1.5 align-middle">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-xs font-bold text-white sm:h-9 sm:w-9">
                {h.titleBadge}
              </span>
            </span>{" "}
            {h.titleLine2}{" "}
            <span className="relative whitespace-nowrap text-[#e04a3d]">
              {h.titleAccent}
              <span
                className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-[#e04a3d]/50"
                aria-hidden
              />
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-base font-light leading-relaxed text-accent-foreground sm:text-lg">{h.subhead}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild className={cn(LANDING_PRIMARY_CTA_CLASS, "px-5")}>
              <Link href="/sign-up">
                {h.primaryCta}
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-black/15 px-5">
              <Link href="/analyzer">{h.secondaryCta}</Link>
            </Button>
          </div>

          <p className="mt-5 text-xs font-medium text-neutral-500">{h.footnote}</p>
        </div>

        <div className="relative z-10 grid min-w-0 gap-3 sm:grid-cols-2 lg:max-w-xl lg:justify-self-end">
          {PROMPT_TRACKING_HUB_CARDS.map((card) => {
            const CardIcon = card.Icon;
            return (
              <Link
                key={card.slug}
                href={card.href}
                className="group flex flex-col rounded-xl border border-black/8 bg-white/90 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:border-black/12 hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-black/8 bg-white">
                  <CardIcon className="h-5 w-5 text-[#e04a3d]" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="mt-3 text-lg font-semibold tracking-tight text-neutral-900">{card.title}</span>
                <span className="mt-1.5 text-sm font-light leading-snug text-muted-foreground">{card.description}</span>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#e04a3d]">
                  {card.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
