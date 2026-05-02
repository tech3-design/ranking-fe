"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { HeroBackgroundGrid } from "@/components/landing/hero-background-grid";
import { routes } from "@/lib/config";
import { cn } from "@/lib/utils";

type PricingHeroProps = {
  showBackLink?: boolean;
  backHref: string;
  backLabel: string;
  onboardingBanner?: boolean;
};

export function PricingHero({
  showBackLink,
  backHref,
  backLabel,
  onboardingBanner,
}: PricingHeroProps) {
  return (
    <section className="relative bg-background px-6 pb-14 pt-14 lg:px-12 lg:pb-16 lg:pt-16">
      <HeroBackgroundGrid />
      <div className="relative z-10 mx-auto max-w-7xl">
        {showBackLink ? (
          <Link
            href={backHref}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {backLabel}
          </Link>
        ) : null}

        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          [ pricing ]
        </p>

        <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem] xl:text-5xl">
          Simple plans for{" "}
          <span className="relative whitespace-nowrap text-primary">
            serious GEO teams
            <span
              className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
              aria-hidden
            />
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
          Every tier includes GEO scoring, recommendations, and exports. Upgrade for more projects,
          prompts, AI engines, and integrations—pricing in GBP, billed monthly.
        </p>

        <p className="mt-4 max-w-xl text-sm font-medium text-muted-foreground">
          New here?{" "}
          <Link href={routes.signUp} className="font-semibold text-primary underline-offset-4 hover:underline">
            Create an account
          </Link>{" "}
          or{" "}
          <Link href={routes.signIn} className="font-semibold text-foreground underline-offset-4 hover:underline">
            log in
          </Link>{" "}
          to subscribe.
        </p>

        {onboardingBanner ? (
          <p
            className={cn(
              "mt-8 max-w-lg rounded-lg border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm leading-relaxed text-emerald-950",
            )}
          >
            You&apos;ve finished setup — choose a plan below to launch GEO analysis from the final step.
          </p>
        ) : null}
      </div>
    </section>
  );
}
