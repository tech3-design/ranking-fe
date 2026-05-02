import type { Metadata } from "next";

import { IntegrationHero } from "@/components/landing/integration-hero";
import { IntegrationMidSection } from "@/components/landing/integration-mid-section";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { INTEGRATION_HUB_FAQ } from "@/lib/landing-integration-content";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Integrations — Shopify & WordPress",
  description:
    "Connect Shopify and WordPress to Signalor so GEO audits and AI visibility scores reflect your live catalog and CMS. One-click schema fixes from inside the admin.",
  path: "/integration",
});

export default function IntegrationPage() {
  return (
    <LandingMarketingShell>
      <JsonLd
        id="ld-integration-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Integrations", path: "/integration" },
        ])}
      />
      <JsonLd id="ld-integration-faq" data={faqJsonLd([...INTEGRATION_HUB_FAQ])} />
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
