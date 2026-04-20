import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Signalor plans for GEO scoring, AI visibility tracking, and team workflows. GBP pricing with Starter, Pro, and Max tiers.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
