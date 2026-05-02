// TODO: replace with real customer quotes before production.
// These are plausible mocks shaped from the kind of feedback operators give
// GEO tools — intentionally specific about outcomes (not vague "great product" fluff).

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  tint: "orange" | "blue" | "emerald";
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We stopped guessing which pages ChatGPT cites. Signalor's citation attribution showed us three URLs we'd never have prioritized — one of them now drives 40% of our AI traffic.",
    name: "Priya M.",
    role: "Head of Growth",
    company: "Nimbus Commerce",
    initials: "PM",
    tint: "orange",
  },
  {
    quote:
      "The competitor delta view changed our content roadmap overnight. Instead of chasing SEO volume, we brief writers against the exact rival URLs Perplexity is pulling from.",
    name: "Daniel K.",
    role: "Content Lead",
    company: "Ardent Labs",
    initials: "DK",
    tint: "blue",
  },
  {
    quote:
      "Auto-fix shipping Organization + FAQ schema straight into our Shopify theme saved us a three-week engineering slot. GEO score jumped 14 points in the first recheck.",
    name: "Sofia R.",
    role: "DTC Operator",
    company: "Vault Apparel",
    initials: "SR",
    tint: "emerald",
  },
];
