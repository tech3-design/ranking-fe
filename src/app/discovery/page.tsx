"use client";

import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { PromptTrackingFeaturesGrid } from "@/components/landing/prompt-tracking-features-grid";
import { PromptTrackingHero } from "@/components/landing/prompt-tracking-hero";
import { PromptTrackingWhySection } from "@/components/landing/prompt-tracking-why-section";
import {
  REPORTING_CAPABILITY_ROWS,
  REPORTING_FAQ,
  REPORTING_FEATURES_FOOTER_CTAS,
  REPORTING_FEATURES_INTRO,
  REPORTING_FEATURE_CELLS,
  REPORTING_HERO,
  REPORTING_HUB_CARDS,
  REPORTING_PILLAR_ROWS,
  REPORTING_PROOF_METRICS,
  REPORTING_WHY,
} from "@/lib/landing-reporting-content";

export default function ReportingPage() {
  return (
    <LandingMarketingShell>
      <PromptTrackingHero hero={REPORTING_HERO} cards={REPORTING_HUB_CARDS} />
      <PromptTrackingFeaturesGrid
        intro={REPORTING_FEATURES_INTRO}
        cells={REPORTING_FEATURE_CELLS}
        footerCtas={REPORTING_FEATURES_FOOTER_CTAS}
        headingId="discovery-features-heading"
        theme="violet"
      />
      <PromptTrackingWhySection
        content={REPORTING_WHY}
        proofMetrics={REPORTING_PROOF_METRICS}
        pillarRows={REPORTING_PILLAR_ROWS}
        capabilityRows={REPORTING_CAPABILITY_ROWS}
        primaryCta={REPORTING_HERO.primaryCta}
        secondaryCtaLabel="Run free GEO audit"
        secondaryCtaHref="/analyzer"
        headingId="reporting-why-heading"
      />
      <LandingFaq
        sectionId="reporting-faq"
        headingId="reporting-faq-heading"
        heading="Reporting FAQs"
        description="How Signalor turns GEO runs into stakeholder-ready stories."
        items={[...REPORTING_FAQ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}
