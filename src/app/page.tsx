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
import { LandingMegaNav } from "@/components/landing/LandingMegaNav";
import LogoComp from "@/components/LogoComp";
import { Button } from "@/components/ui/button";

export { HeroAnalyzerForm } from "@/components/landing/landing-hero-analyzer-form";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black-10 font-sans text-foreground antialiased selection:bg-orange-100 selection:text-orange-900">

      <div className="relative z-10 mx-auto w-full max-w-7xl border-x border-black/6 bg-black-10 backdrop-blur-[1px]">

        <header className="sticky top-0 z-100 bg-black-10 backdrop-blur-md rounded-sm">
          <div className="relative flex w-full items-center justify-between gap-4 px-6 py-3.5 lg:px-10">
            <div className="shrink-0">
              <LogoComp />
            </div>
            <LandingMegaNav />
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Button
                asChild
                variant="link"
                className={` hidden px-4 sm:inline-flex`}
              >
                <Link href="/sign-in">
                  Log In
                  {/* <ArrowRight className="h-4 w-4" aria-hidden /> */}
                </Link>
              </Button>
              <Button asChild className={`${LANDING_PRIMARY_CTA_CLASS} px-4`}>
                <Link href="/sign-up">
                  Sign Up
                  {/* <ArrowRight className="h-4 w-4" aria-hidden /> */}
                </Link>
              </Button>
            </div>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 h-px w-screen -translate-x-1/2 bg-black/8"
          />
        </header>

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
        <section id="features" className="px-6 py-24 lg:px-12 border-b border-border/60">
          <div className="text-center mb-16">
            <h2 className="font-sans text-4xl font-bold tracking-tighter text-foreground md:text-5xl">
              Everything You Need to Win <br /> AI Search
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-8 h-[400px] shadow-sm hover:shadow-md transition-shadow">
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted">
                  <BarChart3 className="h-6 w-6 text-[#e04a3d]" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Your GEO Score</h3>
                <p className="mt-3 text-sm text-muted-foreground font-medium">
                  A single 0–100 score measuring how well AI models understand, trust, and cite your website.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-8 h-[400px] shadow-sm hover:shadow-md transition-shadow">
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted">
                  <Brain className="h-6 w-6 text-[#e04a3d]" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Actionable Fixes</h3>
                <p className="mt-3 text-sm text-muted-foreground font-medium">
                  Prioritized, plain-English recommendations — from JSON-LD schema to content restructuring.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-8 h-[400px] shadow-sm hover:shadow-md transition-shadow">
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted">
                  <TrendingUp className="h-6 w-6 text-[#e04a3d]" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Platform Visibility</h3>
                <p className="mt-3 text-sm text-muted-foreground font-medium">
                  See where your brand shows up across Google AI Overviews, Perplexity, and the open web.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA / How It Works */}
        <section id="how-it-works" className="px-6 py-32 text-center lg:px-12 bg-muted/30">
          <div className="mx-auto max-w-3xl">
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
          </div>
        </section>

        <LandingFaq />

        <LandingFooter />
      </div>
    </main>
  );
}