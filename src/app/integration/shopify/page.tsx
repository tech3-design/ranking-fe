import type { Metadata } from "next";

import { IntegrationDetailCta } from "@/components/landing/integration-detail-cta";
import { IntegrationPlatformHero } from "@/components/landing/integration-platform-hero";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { INTEGRATION_DETAIL_FAQ, SHOPIFY_INTEGRATION_PAGE } from "@/lib/landing-integration-content";

export const metadata: Metadata = {
  title: "Shopify integration",
  description: SHOPIFY_INTEGRATION_PAGE.subhead,
};

export default function ShopifyIntegrationPage() {
  return (
    <LandingMarketingShell>
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
