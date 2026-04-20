"use client";

import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { PromptTrackingFeaturesGrid } from "@/components/landing/prompt-tracking-features-grid";
import { PromptTrackingHero } from "@/components/landing/prompt-tracking-hero";
import { PromptTrackingWhySection } from "@/components/landing/prompt-tracking-why-section";
import {
  CONTENT_SIGNALS_CAPABILITY_ROWS,
  CONTENT_SIGNALS_FAQ,
  CONTENT_SIGNALS_FEATURES_FOOTER_CTAS,
  CONTENT_SIGNALS_FEATURES_INTRO,
  CONTENT_SIGNALS_FEATURE_CELLS,
  CONTENT_SIGNALS_HERO,
  CONTENT_SIGNALS_HUB_CARDS,
  CONTENT_SIGNALS_PILLAR_ROWS,
  CONTENT_SIGNALS_PROOF_METRICS,
  CONTENT_SIGNALS_WHY,
} from "@/lib/landing-content-signals-content";

export default function ContentSignalsPage() {
  return (
    <LandingMarketingShell>
      <PromptTrackingHero hero={CONTENT_SIGNALS_HERO} cards={CONTENT_SIGNALS_HUB_CARDS} />
      <PromptTrackingFeaturesGrid
        intro={CONTENT_SIGNALS_FEATURES_INTRO}
        cells={CONTENT_SIGNALS_FEATURE_CELLS}
        footerCtas={CONTENT_SIGNALS_FEATURES_FOOTER_CTAS}
        headingId="content-signals-features-heading"
        theme="blue"
      />
      <PromptTrackingWhySection
        content={CONTENT_SIGNALS_WHY}
        proofMetrics={CONTENT_SIGNALS_PROOF_METRICS}
        pillarRows={CONTENT_SIGNALS_PILLAR_ROWS}
        capabilityRows={CONTENT_SIGNALS_CAPABILITY_ROWS}
        primaryCta={CONTENT_SIGNALS_HERO.primaryCta}
        secondaryCtaLabel="Run free GEO audit"
        secondaryCtaHref="/analyzer"
        headingId="content-signals-why-heading"
      />
      <LandingFaq
        sectionId="content-signals-faq"
        headingId="content-signals-faq-heading"
        heading="Content signal FAQs"
        description="How Signalor grades structure, schema, and trust on your site."
        items={[...CONTENT_SIGNALS_FAQ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}
