"use client";

const LLM_LOGOS = [
  { name: "ChatGPT", src: "/logos/chatgpt.svg" },
  { name: "Perplexity", src: "/logos/perplexity.svg" },
  { name: "Gemini", src: "/logos/gemini.svg" },
  { name: "Google AI", src: "/logos/google.svg" },
  { name: "Claude", src: "/logos/claude.svg" },
] as const;
import { LandingFeaturesGrid } from "@/components/landing/landing-features-grid";
import { LandingWhySignalor } from "@/components/landing/landing-why-signalor";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingTestimonials } from "@/components/landing/landing-testimonials";
import { LandingIntegrationsStrip } from "@/components/landing/landing-integrations-strip";
import { LandingPricingTeaser } from "@/components/landing/landing-pricing-teaser";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { CornerDiamonds } from "@/components/ui/intersection-diamonds";


export default function Home() {
  return (
    <LandingMarketingShell>
      <LandingHero />

      <section className="relative border-t border-border/60 bg-background/80 py-12 backdrop-blur-sm">
        <CornerDiamonds top />
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
            [ works with every major AI engine ]
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-12 gap-y-8 md:gap-x-16">
            {LLM_LOGOS.map(({ name, src }) => (
              <div
                key={name}
                className="group flex shrink-0 flex-col items-center gap-2"
                title={name}
              >
                <img
                  src={src}
                  alt={name}
                  width={160}
                  height={48}
                  decoding="async"
                  className="h-9 w-auto max-w-40 object-contain object-center transition duration-300 ease-out group-hover:scale-[1.04] md:h-10 md:max-w-44"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingHowItWorks />
      <LandingFeaturesGrid />
      <LandingTestimonials />
      <LandingWhySignalor />
      <LandingIntegrationsStrip />
      <LandingPricingTeaser />
      <LandingFaq />
      <LandingFooter />
    </LandingMarketingShell>
  );
}
