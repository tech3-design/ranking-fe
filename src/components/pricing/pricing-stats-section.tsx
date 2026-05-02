import { PRICING_STATS } from "@/lib/pricing-marketing-content";

export function PricingStatsSection() {
  return (
    <section className="relative bg-background px-6 py-14 lg:px-12 lg:py-16" aria-labelledby="pricing-stats-heading">
      <div className="mx-auto max-w-7xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          [ in numbers ]
        </p>
        <h2
          id="pricing-stats-heading"
          className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]"
        >
          What teams{" "}
          <span className="relative whitespace-nowrap text-primary">
            ship with Signalor
            <span
              className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
              aria-hidden
            />
          </span>
        </h2>
      </div>

      <div className="mx-auto mt-10 max-w-7xl bg-black-10">
        <div className="grid grid-cols-1 divide-y divide-black/6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:divide-black/6">
          {PRICING_STATS.map((s) => (
            <div key={s.label} className="flex flex-col gap-2 bg-white px-6 py-10 md:px-8 md:py-12 lg:px-10">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground md:text-4xl">{s.value}</p>
              <p className="text-sm font-light leading-snug text-muted-foreground">{s.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
