import Link from "next/link";
import { routes } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { HeroAnalyzerForm } from "@/components/analyzer/hero-analyzer-form";

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-white text-slate-900">
      <section className="relative left-1/2 h-screen w-[100dvw] -translate-x-1/2 overflow-hidden border-y border-[#5a6cf5]/25 bg-[#030416] px-6 py-3 text-slate-100 shadow-lg md:px-10 md:py-7">
        <div
          className="pointer-events-none absolute inset-0 bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/hero-bg.jpg.jpg')",
            backgroundSize: "100% 100%",
          }}
        />
        <div className="mx-auto w-full max-w-6xl">
          <header className="relative z-20 flex items-center justify-between py-2">
            <div className="text-lg font-semibold tracking-tight text-white">Signalor GEO</div>
            <nav className="hidden items-center gap-6 text-xs text-slate-200/90 md:flex">
              <a href="#services" className="hover:text-white">Services</a>
              <a href="#how-it-works" className="hover:text-white">How it works</a>
              <a href="#our-work" className="hover:text-white">Our Work</a>
              <a href="#pricing" className="hover:text-white">Pricing</a>
              <a href="#our-team" className="hover:text-white">Our Team</a>
            </nav>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="ghost" className="rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link href={routes.signIn}>Sign in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-[#ff8c3a] text-black hover:bg-[#ffa35f]">
                <Link href={routes.signUp}>Get started</Link>
              </Button>
            </div>
          </header>

          <div className="relative z-10 flex min-h-[78vh] flex-col items-center justify-center pt-4 text-center">
            <p className="inline-flex rounded-full border border-white/25 bg-black/35 px-3 py-1 text-xs font-medium text-slate-100">
              AI Search Visibility Platform
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-7xl">
              Track GEO performance
              <br />
              and improve what AI engines see first
            </h1>
            <p className="mt-5 max-w-3xl text-sm text-slate-200/90 md:text-base">
              Signalor gives you run-level scoring, visibility diagnostics, competitor benchmarks,
              and prioritized actions in one clean workflow.
            </p>
            <HeroAnalyzerForm />
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-200/90">
              <span>Run-level composite GEO scoring</span>
              <span>Competitor and AI visibility diagnostics</span>
              <span>Prioritized actions and reporting exports</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col px-6 py-12 md:px-10">
        <section id="services" className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Fast Analysis Runs",
              description: "Launch new audits quickly and monitor status in real time.",
            },
            {
              title: "Actionable Insights",
              description: "Get practical next steps tied to each analyzed page and score pillar.",
            },
            {
              title: "Built for Teams",
              description: "Use integrations and reporting to align SEO, content, and growth teams.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-[#134a9f]">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </section>

        <section id="our-work" className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold text-[#1f6fd1]">Platform Snapshot</p>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {[
              { label: "Core GEO Pillars", value: "6" },
              { label: "Visibility Channels", value: "3" },
              { label: "Run Sections", value: "7+" },
              { label: "Export Ready", value: "PDF" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-2xl font-bold tracking-tight text-[#ff8c3a]">{item.value}</p>
                <p className="mt-1 text-xs text-slate-600">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mt-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">How It Works</h2>
            <p className="mt-1 text-sm text-slate-600">
              A simple workflow from URL input to prioritized GEO actions.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "1. Analyze",
                description:
                  "Run a GEO audit for your primary site URL and fetch scoring across content, schema, E-E-A-T, technical, entity, and AI visibility.",
              },
              {
                title: "2. Diagnose",
                description:
                  "Review AI logs, visibility checks, and competitor benchmarks to understand where and why your brand is underperforming.",
              },
              {
                title: "3. Improve",
                description:
                  "Execute prioritized recommendations, track actions, and re-run analysis to measure progress over time.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-[#134a9f]">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="our-team" className="mt-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Who Uses Signalor</h2>
            <p className="mt-1 text-sm text-slate-600">
              Built for teams that need reliable GEO visibility and execution clarity.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "In-house SEO Teams",
                description: "Track technical/content gaps and align roadmap with measurable GEO improvements.",
              },
              {
                title: "Content & Brand Teams",
                description: "Understand how AI surfaces your brand mentions and where authority signals are weak.",
              },
              {
                title: "Agencies & Consultants",
                description: "Deliver clear diagnostics, recommendations, and report-ready outputs for clients.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-[#134a9f]">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "Do I need integrations before running analysis?",
                a: "No. You can run GEO analysis immediately. Integrations add business and traffic context later.",
              },
              {
                q: "Can I compare multiple runs over time?",
                a: "Yes. Use history and reports to compare score changes and recommendation progress.",
              },
              {
                q: "Is this only for one domain?",
                a: "No. You can run analyses for different domains and manage them from the analyzer workspace.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{item.q}</p>
                <p className="mt-1 text-sm text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mt-12 rounded-2xl border border-[#ff8c3a]/35 bg-[#fff4eb] p-6 md:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Ready to improve your AI search presence?</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-700">
            Start a new analysis, identify the exact blockers, and ship improvements with confidence.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-[#ff8c3a] text-black hover:bg-[#ffa35f]">
              <Link href={routes.signUp}>Create Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-[#1f6fd1]/45 text-[#134a9f] hover:bg-[#eaf3ff]">
              <Link href={routes.analyzer}>Go to Analyzer</Link>
            </Button>
          </div>
        </section>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm text-slate-600">
          <p>(c) {new Date().getFullYear()} Signalor GEO</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-slate-900">About</Link>
            <Link href="/privacy-policy" className="hover:text-slate-900">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="hover:text-slate-900">Terms & Conditions</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

