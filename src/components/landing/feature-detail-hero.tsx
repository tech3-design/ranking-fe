import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

import { HeroBackgroundGrid } from "@/components/landing/hero-background-grid";
import type { IntegrationPlatformCopy } from "@/components/landing/integration-platform-hero";

type FeatureDetailHeroProps = {
  backHref: string;
  backLabel: string;
  eyebrow: string;
  copy: IntegrationPlatformCopy;
  Icon: LucideIcon;
};

export function FeatureDetailHero({ backHref, backLabel, eyebrow, copy, Icon }: FeatureDetailHeroProps) {
  return (
    <section className="relative bg-background px-6 pb-14 pt-14 lg:px-12 lg:pb-20 lg:pt-16">
      <HeroBackgroundGrid spotlight={false} />
      <div className="relative z-10 mx-auto max-w-3xl">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {backLabel}
        </Link>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-black/8 bg-white shadow-sm">
            <Icon className="h-7 w-7 text-[#e04a3d]" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{copy.headline}</h1>
          </div>
        </div>
        <p className="mt-5 text-base font-light leading-relaxed text-muted-foreground sm:text-lg">{copy.subhead}</p>
        <ul className="mt-8 space-y-3 border-t border-black/8 pt-8">
          {copy.bullets.map((line) => (
            <li key={line} className="flex gap-3 text-sm leading-relaxed text-foreground sm:text-[15px]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e04a3d]" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
