"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Brain, TrendingUp } from "lucide-react";
import { LANDING_PRIMARY_CTA_CLASS } from "@/components/landing/constants";

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
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { Button } from "@/components/ui/button";


export default function Home() {
  return (
    <LandingMarketingShell>
        <LandingHero />
        <section className="border-t border-border/60 bg-background/80 py-10 backdrop-blur-sm">
          <p className="mb-8 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Optimize for every major AI search engine
          </p>
          <div className="mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-8 px-6 md:gap-x-16 lg:px-12">
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
                  className="h-9 w-auto max-w-40 object-contain object-center transition duration-300 ease-out grayscale opacity-55 group-hover:scale-[1.04] group-hover:grayscale-0 group-hover:opacity-100 md:h-10 md:max-w-44"
                />
              </div>
            ))}
          </div>
        </section>
        <LandingFeaturesGrid />

        <LandingWhySignalor />

        {/* Feature Cards Section */}

        {/* CTA / How It Works */}
        {/* <section id="how-it-works" className="px-6 py-32 text-center lg:px-12 bg-muted/30"> */}
          {/* <div className="mx-auto max-w-3xl">
            <h2 className="font-sans text-4xl font-bold tracking-tighter text-foreground md:text-5xl">
              Paste Your URL. <br />
              <span className="text-muted-foreground">Get Audited in 60 Seconds.</span>
            </h2>
            <p className="mt-6 text-base font-medium text-muted-foreground max-w-xl mx-auto">
              No setup, no integrations. Signalor scores your GEO signals and hands you a prioritized blueprint.
            </p>
            <div className="mt-10">
              <Button asChild className={`${LANDING_PRIMARY_CTA_CLASS} px-8`}>
                <Link href="/analyzer">
                  Run My Free Audit
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div> */}
           {/* <DiamondGrid cols={3}>
  <div>anything</div>
  <div>anything</div>
  <div>anything</div>
</DiamondGrid>

<DiamondGrid cols={1} raw>
  <DiamondCell span={2}>wide</DiamondCell>
  <DiamondCell>narrow</DiamondCell>
</DiamondGrid> */}

        {/* </section> */}

        <LandingFaq />

        <LandingFooter />
    </LandingMarketingShell>
  );
}