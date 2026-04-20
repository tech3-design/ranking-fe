import { PRICING_STATS } from "@/lib/pricing-marketing-content";

export function PricingStatsSection() {
  return (
    <section className="border-t border-border/60 bg-background/80 px-6 py-14 backdrop-blur-sm lg:px-12">
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
        {PRICING_STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-black/8 bg-white/80 px-5 py-6 text-center shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{s.value}</p>
            <p className="mt-2 text-sm font-light leading-snug text-muted-foreground">{s.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
