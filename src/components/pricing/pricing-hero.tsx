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
    <section className="relative bg-background px-6 pb-12 pt-12 lg:px-12 lg:pb-16 lg:pt-16">
      <HeroBackgroundGrid />
      <div className="relative z-10 mx-auto max-w-3xl text-center lg:max-w-4xl">
        {showBackLink ? (
          <Link
            href={backHref}
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {backLabel}
          </Link>
        ) : null}

        <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
          Simple plans for{" "}
          <span className="relative whitespace-nowrap text-[#e04a3d]">
            serious GEO teams
            <span
              className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-[#e04a3d]/50"
              aria-hidden
            />
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground sm:text-lg">
          Every tier includes GEO scoring, recommendations, and exports. Upgrade for more projects,
          prompts, AI engines, and integrations—pricing in GBP, billed monthly.
        </p>

        <p className="mx-auto mt-4 max-w-xl text-sm font-medium text-muted-foreground">
          New here?{" "}
          <Link href={routes.signUp} className="font-semibold text-[#e04a3d] underline-offset-4 hover:underline">
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
              "mx-auto mt-8 max-w-lg rounded-lg border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm leading-relaxed text-emerald-950",
            )}
          >
            You&apos;ve finished setup — choose a plan below to launch GEO analysis from the final step.
          </p>
        ) : null}
      </div>
    </section>
  );
}
