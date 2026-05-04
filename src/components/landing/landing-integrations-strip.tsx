"use client";

import { BarChart3, Search, Slack, Zap } from "lucide-react";

import { ScreenHR } from "@/components/ui/intersection-diamonds";
import { cn } from "@/lib/utils";

type IntegrationTile =
  | { kind: "logo"; name: string; src: string }
  | {
      kind: "icon";
      name: string;
      icon: typeof BarChart3;
      comingSoon?: boolean;
    };

const INTEGRATIONS: IntegrationTile[] = [
  { kind: "logo", name: "Shopify", src: "/logos/shopify.svg" },
  { kind: "logo", name: "WordPress", src: "/logos/wordpress.svg" },
  { kind: "icon", name: "Google Analytics", icon: BarChart3, comingSoon: true },
  { kind: "icon", name: "Search Console", icon: Search, comingSoon: true },
  { kind: "icon", name: "Slack", icon: Slack, comingSoon: true },
  { kind: "icon", name: "Zapier", icon: Zap, comingSoon: true },
];

export function LandingIntegrationsStrip() {
  return (
    <section
      className="relative bg-background"
      aria-labelledby="landing-integrations-heading"
    >
      <ScreenHR />
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-14 lg:px-12 lg:pb-14 lg:pt-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          [ integrations ]
        </p>
        <h2
          id="landing-integrations-heading"
          className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]"
        >
          Works where your{" "}
          <span className="relative whitespace-nowrap text-primary">
            team already ships
            <span
              className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
              aria-hidden
            />
          </span>
        </h2>
        <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
          Auto-fix schema and meta on Shopify or WordPress today. Analytics, alerts, and
          workflow tiles land over the next two sprints.
        </p>
      </div>

      <ScreenHR />

      <div className="mx-auto max-w-7xl bg-black-10">
        <div className="grid grid-cols-2 divide-x divide-y divide-black/6 sm:grid-cols-3 lg:grid-cols-6">
          {INTEGRATIONS.map((t, i) => (
            <IntegrationCell key={t.name} tile={t} index={i} />
          ))}
        </div>
      </div>

      <ScreenHR />
    </section>
  );
}

function IntegrationCell({ tile, index }: { tile: IntegrationTile; index: number }) {
  // Remove left border on first cell of each row / top border on first row
  // visually; since we're using divide utilities, Tailwind handles that for us.
  void index;
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 bg-white px-4 py-10 md:py-12",
      )}
    >
      {tile.kind === "logo" ? (
        <img
          src={tile.src}
          alt={tile.name}
          width={120}
          height={32}
          decoding="async"
          className="h-8 w-auto max-w-32 object-contain opacity-80 transition hover:opacity-100 md:h-9"
        />
      ) : (
        <tile.icon
          className="h-7 w-7 text-neutral-500 transition hover:text-foreground"
          strokeWidth={1.5}
          aria-hidden
        />
      )}
      <p className="text-[11px] font-semibold text-neutral-700">{tile.name}</p>
      {"comingSoon" in tile && tile.comingSoon ? (
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-neutral-500">
          Coming soon
        </span>
      ) : (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
          Live
        </span>
      )}
    </div>
  );
}
