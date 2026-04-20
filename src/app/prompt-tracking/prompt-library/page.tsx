import type { Metadata } from "next";
import { ListChecks } from "lucide-react";

import { FeatureDetailHero } from "@/components/landing/feature-detail-hero";
import { IntegrationDetailCta } from "@/components/landing/integration-detail-cta";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { PROMPT_LIBRARY_PAGE, PROMPT_TRACKING_LIBRARY_FAQ } from "@/lib/landing-prompt-tracking-content";

export const metadata: Metadata = {
  title: "Prompt library — prompt tracking",
  description: PROMPT_LIBRARY_PAGE.subhead,
};

export default function PromptLibraryPage() {
  return (
    <LandingMarketingShell>
      <FeatureDetailHero
        backHref="/prompt-tracking"
        backLabel="Prompt tracking"
        eyebrow="Feature"
        copy={PROMPT_LIBRARY_PAGE}
        Icon={ListChecks}
      />
      <IntegrationDetailCta />
      <LandingFaq
        sectionId="prompt-tracking-library-faq"
        headingId="prompt-tracking-library-faq-heading"
        heading="FAQs"
        description="Libraries, exports, and collaboration in Signalor."
        items={[...PROMPT_TRACKING_LIBRARY_FAQ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}
