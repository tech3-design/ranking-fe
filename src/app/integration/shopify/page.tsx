import type { Metadata } from "next";

import { IntegrationDetailCta } from "@/components/landing/integration-detail-cta";
import { IntegrationPlatformHero } from "@/components/landing/integration-platform-hero";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import {
  INTEGRATION_DETAIL_FAQ,
  SHOPIFY_INTEGRATION_PAGE,
} from "@/lib/landing-integration-content";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Shopify integration, GEO scoring for Shopify",
  description: SHOPIFY_INTEGRATION_PAGE.subhead,
  path: "/integration/shopify",
});

export default function ShopifyIntegrationPage() {
  return (
    <LandingMarketingShell>
      <div className="mx-auto max-w-3xl px-6 pt-10 pb-2 text-center">
        <p className="text-sm leading-relaxed text-muted-foreground">
          The Signalor Shopify integration pulls your live product catalog into GEO scoring so AI
          engines can accurately cite your inventory. Once connected, Signalor reads product titles,
          descriptions, prices, and existing schema markup, then surfaces prioritized
          recommendations for improving how ChatGPT, Claude, Gemini, and Perplexity describe and
          link to your store. The integration uses a read-only sync and does not modify your
          storefront. You can disconnect at any time from your Signalor workspace settings.
        </p>
      </div>
      <JsonLd
        id="ld-shopify-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Integrations", path: "/integration" },
          { name: "Shopify", path: "/integration/shopify" },
        ])}
      />
      <JsonLd id="ld-shopify-faq" data={faqJsonLd([...INTEGRATION_DETAIL_FAQ])} />
      <IntegrationPlatformHero copy={SHOPIFY_INTEGRATION_PAGE} logoSrc="/logos/shopify.svg" />
      <IntegrationDetailCta />
      <LandingFaq
        sectionId="shopify-integration-faq"
        headingId="shopify-integration-faq-heading"
        heading="FAQs"
        description="Security, tokens, and how Shopify data flows into GEO scoring."
        items={[...INTEGRATION_DETAIL_FAQ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}
