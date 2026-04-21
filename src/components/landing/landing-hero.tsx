"use client";

import { HeroAnalyzerForm } from "../analyzer/hero-analyzer-form";
import { HeroBackgroundGrid } from "./hero-background-grid";

export function LandingHero() {
  return (
    <section className="relative bg-background px-6 pb-16 pt-16 lg:px-12 lg:pb-24 lg:pt-20">
      <HeroBackgroundGrid />
      <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:items-center lg:gap-8 xl:gap-12">
        <div className="relative z-10 min-w-0 max-w-xl text-left lg:max-w-none">
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
            Turn{" "}
            <span className="inline-flex items-center gap-1.5 align-middle">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-xs font-bold text-white sm:h-9 sm:w-9">
                AI
              </span>
            </span>{" "}
            search into{" "}
            <br className="hidden sm:block" />
            <span className="relative whitespace-nowrap text-[#e04a3d]">
              your highest-intent pipeline
              <span
                className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-[#e04a3d]/50"
                aria-hidden
              />
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-base font-light leading-relaxed text-accent-foreground sm:text-lg">
            Measure how AI engines describe your brand, where competitors are winning citations,
            and exactly what to fix next. Audit, scoring, and execution-ready recommendations in one workflow.
          </p>

          {/* <HeroAnalyzerForm /> */}
          <HeroAnalyzerForm />


          <p className="mt-4 flex items-center gap-2 text-xs font-medium text-neutral-500">
            <span className="inline-flex text-amber-500" aria-hidden>
              ★★★★★
            </span>
            <span>4.8/5 from growth teams running weekly GEO sprints</span>
          </p>
        </div>

        {/* <div className="relative z-20 order-last mt-10 flex min-h-0 w-full justify-center lg:order-0 lg:mt-0 lg:min-h-[min(480px,68vh)] lg:items-center lg:justify-end lg:pl-0 xl:min-h-[min(540px,72vh)]">
              <Image
                src="/carousel1.png"
                alt="Signalor dashboard preview"
                width={2000}
                height={2000}
                unoptimized
                className="h-auto w-full max-w-full select-none rounded-xl border border-black/[0.07] bg-white object-contain object-bottom shadow-[0_22px_56px_-14px_rgba(15,23,42,0.22)] sm:max-w-[min(100%,600px)] lg:max-h-[min(78vh,860px)] lg:w-[min(124%,920px)] lg:max-w-none lg:translate-x-2 lg:rounded-2xl xl:w-[min(128%,1000px)] xl:translate-x-4 2xl:w-[min(132%,1080px)]"
                sizes="(min-width: 1536px) 1080px, (min-width: 1024px) 920px, (min-width: 640px) 600px, 100vw"
                priority
              />
            </div> */}
      </div>
    </section>
  );
}
