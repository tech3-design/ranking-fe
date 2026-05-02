import type { Metadata } from "next";
import { LayoutGrid } from "lucide-react";

import { FeatureDetailHero } from "@/components/landing/feature-detail-hero";
import { IntegrationDetailCta } from "@/components/landing/integration-detail-cta";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { AI_SURFACES_PAGE, PROMPT_TRACKING_SURFACES_FAQ } from "@/lib/landing-prompt-tracking-content";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AI surfaces — prompt tracking",
  description: AI_SURFACES_PAGE.subhead,
  path: "/prompt-tracking/ai-surfaces",
});

export default function AiSurfacesPromptTrackingPage() {
  return (
    <LandingMarketingShell>
      <JsonLd
        id="ld-ai-surfaces-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Prompt tracking", path: "/prompt-tracking" },
          { name: "AI surfaces", path: "/prompt-tracking/ai-surfaces" },
        ])}
      />
      <JsonLd id="ld-ai-surfaces-faq" data={faqJsonLd([...PROMPT_TRACKING_SURFACES_FAQ])} />
      <FeatureDetailHero
        backHref="/prompt-tracking"
        backLabel="Prompt tracking"
        eyebrow="Feature"
        copy={AI_SURFACES_PAGE}
        Icon={LayoutGrid}
      />
      <IntegrationDetailCta />
      <LandingFaq
        sectionId="prompt-tracking-surfaces-faq"
        headingId="prompt-tracking-surfaces-faq-heading"
        heading="FAQs"
        description="How surface-level tracking works inside your workspace."
        items={[...PROMPT_TRACKING_SURFACES_FAQ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}
