import type { Metadata } from "next";

import { IntegrationHero } from "@/components/landing/integration-hero";
import { IntegrationMidSection } from "@/components/landing/integration-mid-section";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { INTEGRATION_HUB_FAQ } from "@/lib/landing-integration-content";

export const metadata: Metadata = {
  title: "Integrations",
  description:
    "Connect Shopify and WordPress to Signalor so GEO audits and visibility scores reflect your live catalog and CMS.",
};

export default function IntegrationPage() {
  return (
    <LandingMarketingShell>
      <IntegrationHero />
      <IntegrationMidSection />
      <LandingFaq
        sectionId="integration-faq"
        headingId="integration-faq-heading"
        heading="Integration FAQs"
        description="How connectors work with Signalor workspaces, data scope, and billing-friendly defaults."
        items={[...INTEGRATION_HUB_FAQ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}
