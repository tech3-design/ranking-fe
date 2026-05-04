import type { Metadata } from "next";

import { IntegrationDetailCta } from "@/components/landing/integration-detail-cta";
import { IntegrationPlatformHero } from "@/components/landing/integration-platform-hero";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { INTEGRATION_DETAIL_FAQ, WORDPRESS_INTEGRATION_PAGE } from "@/lib/landing-integration-content";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "WordPress plugin — GEO scoring & schema fixes",
  description: WORDPRESS_INTEGRATION_PAGE.subhead,
  path: "/integration/wordpress",
});

const wordpressPluginJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Signalor GEO for WordPress",
  applicationCategory: "BrowserApplication",
  operatingSystem: "WordPress",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/integration/wordpress`,
  downloadUrl: `${SITE_URL}/downloads/signalor-geo.zip`,
  description:
    "Self-hosted WordPress plugin that surfaces Signalor GEO recommendations and applies one-click schema fixes inside the WordPress admin.",
  publisher: { "@id": `${SITE_URL}#organization` },
};

export default function WordPressIntegrationPage() {
  return (
    <LandingMarketingShell>
      <JsonLd
        id="ld-wordpress-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Integrations", path: "/integration" },
          { name: "WordPress", path: "/integration/wordpress" },
        ])}
      />
      <JsonLd id="ld-wordpress-plugin" data={wordpressPluginJsonLd} />
      <JsonLd id="ld-wordpress-faq" data={faqJsonLd([...INTEGRATION_DETAIL_FAQ])} />
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
