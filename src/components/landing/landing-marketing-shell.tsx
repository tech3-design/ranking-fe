"use client";

import Link from "next/link";

import { LANDING_PRIMARY_CTA_CLASS } from "@/components/landing/constants";
import { LandingMegaNav } from "@/components/landing/LandingMegaNav";
import LogoComp from "@/components/LogoComp";
import { Button } from "@/components/ui/button";

export function LandingMarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-black-10 font-sans text-foreground antialiased selection:bg-orange-100 selection:text-orange-900">
      <div className="relative z-10 mx-auto w-full max-w-7xl border-x border-black/6 bg-black-10 backdrop-blur-[1px]">
        <header className="sticky top-0 z-100 rounded-sm bg-black-10 backdrop-blur-md">
          <div className="relative flex w-full items-center justify-between gap-4 px-6 py-3.5 lg:px-10">
            <div className="shrink-0">
              <LogoComp />
            </div>
            <LandingMegaNav />
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Button asChild variant="link" className="hidden px-4 sm:inline-flex">
                <Link href="/sign-in">Log In</Link>
              </Button>
              <Button asChild className={`${LANDING_PRIMARY_CTA_CLASS} px-4`}>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 h-px w-screen -translate-x-1/2 bg-black/8"
          />
        </header>
        {children}
      </div>
    </main>
  );
}
