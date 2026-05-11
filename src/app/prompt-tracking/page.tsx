import type { Metadata } from "next";

import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { PromptTrackingFeaturesGrid } from "@/components/landing/prompt-tracking-features-grid";
import { PromptTrackingHero } from "@/components/landing/prompt-tracking-hero";
import { PromptTrackingWhySection } from "@/components/landing/prompt-tracking-why-section";
import { PROMPT_TRACKING_HUB_FAQ, PROMPT_TRACKING_SITE } from "@/lib/landing-prompt-tracking-content";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: PROMPT_TRACKING_SITE.title,
  description: PROMPT_TRACKING_SITE.description,
  path: "/prompt-tracking",
});

export default function PromptTrackingPage() {
  return (
    <LandingMarketingShell>
      <JsonLd
        id="ld-prompt-tracking-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Prompt tracking", path: "/prompt-tracking" },
        ])}
      />
      <JsonLd id="ld-prompt-tracking-faq" data={faqJsonLd([...PROMPT_TRACKING_HUB_FAQ])} />
      <PromptTrackingHero />
      <PromptTrackingFeaturesGrid />
      <PromptTrackingWhySection />
      <LandingFaq
        sectionId="prompt-tracking-faq"
        headingId="prompt-tracking-faq-heading"
        heading="Prompt tracking FAQs"
        description="How surfaces, libraries, and plans fit together inside Signalor."
        items={[...PROMPT_TRACKING_HUB_FAQ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}
