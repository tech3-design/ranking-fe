import Link from "next/link";
import { routes } from "@/lib/config";
import { HeroAnalyzerForm } from "@/components/analyzer/hero-analyzer-form";
import { Spotlight } from "@/components/ui/spotlight";

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-background text-foreground">
      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden">
        <div
          className="absolute inset-0 overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero2.jfif"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 md:px-6 lg:px-12">
          {/* Nav */}
          <header className="flex items-center justify-between py-4 md:py-5">
            <div className="text-sm font-light tracking-[0.25em] uppercase text-foreground">Signalor</div>
            <div className="flex items-center gap-3">
              <Link
                href={routes.signIn}
                className="px-5 py-2 text-sm text-muted-foreground transition hover:text-sidebar-foreground"
              >
                Access Portal
              </Link>
              <Link
                href={routes.signUp}
                className="gradient-btn px-5 py-2 text-sm font-medium"
              >
                Begin Journey &rarr;
              </Link>
            </div>
          </header>

          {/* Hero content — bottom-left */}
          <div className="flex flex-1 items-end pb-16 md:pb-24">
            <div className="flex w-full flex-col gap-12 md:flex-row md:items-end md:justify-between">
              {/* Left: heading + subtitle + analyzer */}
              <div className="max-w-2xl flex-1">
                <h1 className="text-3xl font-light leading-[1.1] tracking-tight text-foreground md:text-4xl lg:text-7xl">
                  Check your AI<br />
                  visibility score
                </h1>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                  See how ChatGPT, Gemini, and Perplexity see your brand — analyze, diagnose, and auto-fix what they miss.
                </p>

                {/* Free Analyzer Form */}
                <HeroAnalyzerForm />

                <div className="mt-6 flex items-center gap-3">
                  <Link
                    href={routes.signUp}
                    className="gradient-btn px-6 py-3 text-sm font-medium"
                  >
                    Begin Journey &rarr;
                  </Link>
                  <Link
                    href={routes.signIn}
                    className="border border-white/20 bg-transparent px-6 py-3 text-sm text-foreground transition hover:bg-white/[0.06]"
                  >
                    Explore More
                  </Link>
                </div>
              </div>

              {/* Right: stats */}
              <div className="flex gap-6 md:gap-10 lg:gap-14">
                <div>
                  <p className="text-4xl font-light tracking-tight text-foreground md:text-5xl">6</p>
                  <p className="mt-1 text-xs text-muted-foreground">GEO pillars<br />analyzed</p>
                </div>
                <div>
                  <p className="text-4xl font-light tracking-tight text-foreground md:text-5xl">4</p>
                  <p className="mt-1 text-xs text-muted-foreground">AI engines<br />tracked</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Efficiency Stats */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 md:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <p className="text-xs uppercase tracking-widest text-primary">Why Signalor</p>
            <h2 className="mt-3 text-3xl font-light tracking-tight text-foreground md:text-4xl">
              Boost Visibility by<br />Automating GEO
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Save time by eliminating manual SEO audits, allowing teams to focus on high-value content strategy.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              value: "40",
              unit: "%",
              label: "Visibility Boost",
              desc: "Citation-optimized content lifts AI mentions",
              accent: false,
            },
            {
              value: "10",
              unit: "+",
              label: "Auto-Fix Types",
              desc: "AI applies schema, content, and file fixes",
              accent: false,
            },
            {
              value: "2",
              unit: "min",
              label: "Full GEO Audit",
              desc: "Analyze 6 pillars across any URL instantly",
              accent: true,
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl p-8 transition-all ${
                item.accent
                  ? "bg-gradient-to-br from-primary/20 to-primary/80/10 border border-primary/20"
                  : "bg-white/[0.03] border border-white/[0.08]"
              }`}
            >
              <p className={`text-5xl font-light tracking-tight md:text-6xl ${item.accent ? "text-primary" : "text-foreground"}`}>
                {item.value}<span className="text-3xl md:text-4xl">{item.unit}</span>
              </p>
              <p className="mt-3 text-sm font-medium text-foreground">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <div className="mx-auto flex w-full max-w-6xl flex-col px-6 pb-16 md:px-12">
        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Fast Analysis Runs",
              description: "Launch audits quickly and monitor status in real time. Get results in under 2 minutes.",
            },
            {
              title: "AI-Powered Auto-Fix",
              description: "One click to apply recommendations directly to your Shopify or WordPress store.",
            },
            {
              title: "Visibility Tracking",
              description: "Monitor your brand mentions across ChatGPT, Gemini, Perplexity, and Google AI.",
            },
          ].map((item) => (
            <Spotlight key={item.title} className="rounded-xl">
              <div className="glass-card rounded-xl p-6 h-full">
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </Spotlight>
          ))}
        </section>

        {/* How it works */}
        <section className="mt-16">
          <h2 className="text-2xl font-light tracking-tight text-foreground">How It Works</h2>
          <p className="mt-1 text-sm text-muted-foreground">From URL input to AI-powered improvements.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { step: "01", title: "Analyze", description: "Enter your URL and run a full GEO audit across 6 pillars." },
              { step: "02", title: "Diagnose", description: "Review visibility checks and brand mentions across AI engines." },
              { step: "03", title: "Auto-Fix", description: "Click 'Fix All' to let AI apply fixes to your connected store." },
            ].map((item) => (
              <div key={item.step} className="glass-card rounded-xl p-6">
                <span className="text-3xl font-light gradient-text-primary">{item.step}</span>
                <h3 className="mt-3 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 glass-card glow-border rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-light tracking-tight text-foreground md:text-3xl">Ready to improve your AI search presence?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Start a free analysis and ship AI-powered improvements with one click.
          </p>
          <div className="mt-6">
            <Link href={routes.signUp} className="gradient-btn inline-block px-8 py-3 text-sm font-medium">
              Get Started Free &rarr;
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-sidebar-border pt-6 text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} Signalor</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-sidebar-foreground transition">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-sidebar-foreground transition">Terms</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
