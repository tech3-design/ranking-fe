"use client";

import { Plus_Jakarta_Sans } from "next/font/google";
import LogoComp from "@/components/LogoComp";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { HeroAnalyzerForm } from "../page";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function AnalyzerPage() {
  return (
    <main
      className={`${plusJakarta.className} min-h-screen bg-background text-foreground selection:bg-primary/20`}
    >
      {/* Simple Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <LogoComp />
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </div>
      </header>

      <section className="relative flex flex-col items-center justify-center px-6 pt-20 pb-32">
        {/* Background Decoration */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 blur-[100px] rounded-full" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <div className="relative z-10 w-full max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary border border-primary/20">
            <Sparkles className="h-3 w-3" />
            Free GEO Audit Tool
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Analyze Your Website’s <br />
            <span className="text-muted-foreground">AI Visibility</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Enter your URL below to see how AI search engines like ChatGPT, Claude, and Perplexity 
            index and recommend your brand.
          </p>

          {/* The Form Component */}
          <div className="mt-12 w-full">
            <HeroAnalyzerForm />
          </div>

          {/* Benefits Grid */}
          <div className="mt-24 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card/50 p-6 text-left backdrop-blur-sm">
              <h3 className="font-bold text-foreground">Detailed Scoring</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get a 0-100 GEO score based on technical and content signals.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/50 p-6 text-left backdrop-blur-sm">
              <h3 className="font-bold text-foreground">Competitor Gaps</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Identify why competitors might be cited over your brand.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/50 p-6 text-left backdrop-blur-sm">
              <h3 className="font-bold text-foreground">Actionable Steps</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Receive clear, prioritized tasks to improve your AI rankings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Minimal */}
      <footer className="mt-auto border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Signalor Ltd. All Rights Reserved.</p>
      </footer>
    </main>
  );
}