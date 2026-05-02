import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqJsonLd,
  SITE_BRAND,
  SITE_URL,
} from "@/lib/seo";
import { PRICING_FAQ_ITEMS } from "@/lib/pricing-marketing-content";

export const metadata: Metadata = buildMetadata({
  title: "Pricing — GEO + AEO platform plans",
  description:
    "Signalor pricing for GEO scoring, AI visibility tracking, and team workflows. GBP plans: Starter (£19.99), Pro (£49.99), Max (£59.99). Cancel anytime.",
  path: "/pricing",
});

const pricingProductJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: SITE_BRAND,
  description:
    "Generative Engine Optimization and AI visibility platform with three monthly plans.",
  brand: { "@type": "Brand", name: "Signalor" },
  url: `${SITE_URL}/pricing`,
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "19.99",
      priceCurrency: "GBP",
      url: `${SITE_URL}/pricing`,
      availability: "https://schema.org/InStock",
      category: "subscription",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "49.99",
      priceCurrency: "GBP",
      url: `${SITE_URL}/pricing`,
      availability: "https://schema.org/InStock",
      category: "subscription",
    },
    {
      "@type": "Offer",
      name: "Max",
      price: "59.99",
      priceCurrency: "GBP",
      url: `${SITE_URL}/pricing`,
      availability: "https://schema.org/InStock",
      category: "subscription",
    },
  ],
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-pricing-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ])}
      />
      <JsonLd id="ld-pricing-product" data={pricingProductJsonLd} />
      <JsonLd id="ld-pricing-faq" data={faqJsonLd([...PRICING_FAQ_ITEMS])} />
      {children}
    </>
  );
}
