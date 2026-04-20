import type { Metadata } from "next";

import { IntegrationDetailCta } from "@/components/landing/integration-detail-cta";
import { IntegrationPlatformHero } from "@/components/landing/integration-platform-hero";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { INTEGRATION_DETAIL_FAQ, WORDPRESS_INTEGRATION_PAGE } from "@/lib/landing-integration-content";

export const metadata: Metadata = {
  title: "WordPress integration",
  description: WORDPRESS_INTEGRATION_PAGE.subhead,
};

export default function WordPressIntegrationPage() {
  return (
    <LandingMarketingShell>
      <IntegrationPlatformHero copy={WORDPRESS_INTEGRATION_PAGE} logoSrc="/logos/wordpress.svg" />
      <IntegrationDetailCta />
      <LandingFaq
        sectionId="wordpress-integration-faq"
        headingId="wordpress-integration-faq-heading"
        heading="FAQs"
        description="Security, tokens, and how WordPress content feeds GEO scoring."
        items={[...INTEGRATION_DETAIL_FAQ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}
