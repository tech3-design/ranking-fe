import type { Metadata } from "next";

import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { PromptTrackingFeaturesGrid } from "@/components/landing/prompt-tracking-features-grid";
import { PromptTrackingHero } from "@/components/landing/prompt-tracking-hero";
import { PromptTrackingWhySection } from "@/components/landing/prompt-tracking-why-section";
import { PROMPT_TRACKING_HUB_FAQ, PROMPT_TRACKING_SITE } from "@/lib/landing-prompt-tracking-content";

export const metadata: Metadata = {
  title: PROMPT_TRACKING_SITE.title,
  description: PROMPT_TRACKING_SITE.description,
};

export default function PromptTrackingPage() {
  return (
    <LandingMarketingShell>
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
