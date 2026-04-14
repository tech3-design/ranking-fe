"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  Play,
  CheckCircle2,
  Clock,
  TrendingUp,
  Brain,
  BarChart3,
  Zap,
  Globe,
  ArrowRight,
  Loader2,
} from "lucide-react";
import LogoComp from "@/components/LogoComp";
import { startAnalysis } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

/** Homepage #pricing — matches /pricing (single Starter checkout). */
const LANDING_PLANS = [
  {
    id: "starter",
    label: "Starter",
    price: 19.99,
    popular: true,
    description: "Everything you need to start improving GEO and AI visibility.",
    features: [
      "1 project",
      "Up to 25 prompts",
      "Gemini & Google prompt visibility",
      "GEO analysis & scoring",
      "Recommendations & verify",
      "PDF report exports",
    ],
    comingSoon: [
      "Higher tiers with more projects & engines",
      "Weekly AI visibility email digest",
      "Deeper Shopify & WordPress sync",
    ],
  },
];

const COUNTRY_OPTIONS = [
  { name: "United States", code: "US" },
  { name: "Canada", code: "CA" },
  { name: "United Kingdom", code: "GB" },
  { name: "Australia", code: "AU" },
  { name: "India", code: "IN" },
  { name: "Germany", code: "DE" },
  { name: "France", code: "FR" },
  { name: "Singapore", code: "SG" },
  { name: "United Arab Emirates", code: "AE" },
];

// --- Analyzer Form Component ---
export function HeroAnalyzerForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [country, setCountry] = useState("United States");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || loading) return;

    const normalizedUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url.trim()
        : `https://${url.trim()}`;

    setError("");
    setLoading(true);
    try {
      const run = await startAnalysis({
        url: normalizedUrl,
        run_type: "full_site",
        country,
      });
      router.push(routes.analyzerResults(run.id));
    } catch {
      setError(
        "Analysis failed to start. Please verify the URL and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-10 flex w-full max-w-2xl flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="group relative flex flex-col rounded-2xl bg-background p-1.5 shadow-lg ring-1 ring-border transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50 hover:shadow-xl md:flex-row md:items-center md:rounded-full md:p-2">
          {/* URL Input */}
          <div className="relative flex flex-1 items-center px-4 py-3 md:py-0">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter website URL "
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              required
            />
          </div>

          {/* Divider (Desktop Only) */}
          <div className="hidden h-8 w-[1px] bg-border md:block" />

          {/* Shadcn Country Select with Flags */}
          <div className="relative flex w-full items-center border-t border-border px-4 py-2 md:w-auto md:border-t-0 md:py-0">
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-full border-0 bg-transparent shadow-none focus:ring-0 md:w-[170px]">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.name}
                    value={option.name}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`} alt={option.code} width={20} height={15} className="rounded-sm" />
                      <span className="text-sm font-medium">{option.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-transform active:scale-95 disabled:opacity-70 md:mt-0 md:w-auto md:rounded-full hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <span>Analyze Free</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>

        {/* Trust note below form */}
        <p className="mt-3 text-center text-xs text-muted-foreground">
          No sign-up required · Results in under 60 seconds · Free for any
          website
        </p>

        {/* Error Message */}
        {error && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50/50 px-4 py-3 text-sm text-red-600 backdrop-blur-sm">
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

// --- Main Landing Page ---
export default function Home() {
  return (
    <main
      className={`${plusJakarta.className} overflow-x-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary`}
    >
      {/* Navigation */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-12">
          <LogoComp />

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm font-medium text-foreground">
              Home
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              How It Works
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Contact Us
            </Link>
          </nav>

          {/* Actions */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-foreground hover:text-primary"
            >
              Log In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-[#0A251C] px-6 py-2.5 text-sm font-medium text-white transition-transform hover:scale-105"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen pt-32 pb-20 lg:pt-40 lg:pb-24">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-12">
          {/* Top Badge */}
          <div className="flex flex-col items-center justify-center gap-3 mb-6">
            {/* <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 border border-amber-200">
              👑 The #1 GEO Scoring Platform for AI Search
            </div> */}
          </div>

          {/* Headline — clearer, more direct */}
          <h1 className="mx-auto max-w-4xl text-5xl leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Will AI Recommend <br className="hidden md:block" />
            <span className="text-foreground/60">Your Brand?</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Check your GEO score in seconds.
          </p>

          {/* Subheadline — specific and benefit-led */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Signalor audits your website for Generative Engine Optimization
            (GEO) — scoring how likely ChatGPT, Gemini, Perplexity, and Claude
            are to cite and recommend your brand. Then it tells you exactly what
            to fix.
          </p>

          {/* Integrated Form Component */}
          <HeroAnalyzerForm />

        </div>
      </section>

      {/* Trusted By / LLM Logos */}
      <section className="border-y border-border/50 bg-background/50 py-10 backdrop-blur-sm">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
          Optimize for every major AI search engine
        </p>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-10 px-6 opacity-60 grayscale transition-all hover:grayscale-0 md:gap-16 lg:px-12">
          <img
            src="/logos/chatgpt.svg"
            alt="ChatGPT"
            className="h-8 object-contain hidden sm:block"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span className="text-xl font-bold tracking-tight sm:hidden">
            ChatGPT
          </span>

          <img
            src="/logos/perplexity.svg"
            alt="Perplexity"
            className="h-8 object-contain hidden sm:block"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span className="text-xl font-bold tracking-tight sm:hidden">
            Perplexity
          </span>

          <img
            src="/logos/gemini.svg"
            alt="Gemini"
            className="h-8 object-contain hidden sm:block"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span className="text-xl font-bold tracking-tight sm:hidden">
            Gemini
          </span>

          <img
            src="/logos/google.svg"
            alt="Google AI"
            className="h-8 object-contain hidden sm:block"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span className="text-xl font-bold tracking-tight sm:hidden">
            Google
          </span>

          <img
            src="/logos/claude.svg"
            alt="Claude"
            className="h-8 object-contain hidden sm:block"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span className="text-xl font-bold tracking-tight sm:hidden">
            Claude
          </span>

          <img
            src="/logos/copilot.svg"
            alt="Bing Copilot"
            className="h-8 object-contain hidden sm:block"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span className="text-xl font-bold tracking-tight sm:hidden">
            Copilot
          </span>
        </div>
      </section>

      {/* About Platform / Stats */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div className="flex flex-col items-start justify-center">
            <span className="text-sm font-bold uppercase tracking-wider text-primary">
              Why Signalor //
            </span>
            <h2 className="mt-4 font-sans text-4xl leading-tight tracking-tight text-foreground md:text-5xl">
              SEO Got Your Site on Google. <br />{" "}
              <span className="text-muted-foreground">
                GEO Gets You Into AI Answers.
              </span>
            </h2>
            <p className="mt-6 text-base text-muted-foreground">
              Over 40% of searches now happen inside AI tools — and those tools
              don't rank links, they cite sources. Signalor runs a full GEO
              audit of your website, scoring your AI citability, structured
              data, brand authority, and platform-specific visibility. You get a
              clear, prioritized action plan — not just a report.
            </p>
            <Link
              href="/about"
              className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Learn More
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl" />
              <h3 className="font-sans text-4xl text-foreground md:text-5xl">
                5,000+{" "}
                <span className="text-xl text-muted-foreground">Websites</span>
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Brands already using Signalor to improve their visibility in
                AI-generated answers and recommendations.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl" />
              <h3 className="font-sans text-4xl text-foreground md:text-5xl">
                40%{" "}
                <span className="text-xl text-muted-foreground">
                  Avg. Lift
                </span>
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Average increase in AI citations within 90 days of implementing
                Signalor&apos;s recommendations.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl" />
              <h3 className="font-sans text-4xl text-foreground md:text-5xl">
                40%{" "}
                <span className="text-xl text-muted-foreground">
                  Higher Intent
                </span>
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                AI traffic carries 40% more buyer intent than traditional search — visitors from AI answers are ready to act.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl" />
              <h3 className="font-sans text-4xl text-foreground md:text-5xl">
                5%{" "}
                <span className="text-xl text-muted-foreground">
                  in 24 Hours
                </span>
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Average visibility growth within 24 hours of applying Signalor&apos;s auto-fix recommendations to your site.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-12 bg-muted/30 rounded-[3rem] my-12"
      >
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-primary">
            Features //
          </span>
          <h2 className="mt-4 font-sans text-4xl tracking-tight text-foreground md:text-5xl">
            Everything You Need to Win <br /> AI Search — In One Platform
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {/* Card 1 — GEO Score */}
          <div className="flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-[#0A251C] p-8 text-white h-[450px]">
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">
                Your GEO Score, Tracked Over Time
              </h3>
              <p className="mt-3 text-sm text-white/70">
                A single 0–100 score that measures how well AI models
                understand, trust, and cite your website — updated continuously
                as you make improvements.
              </p>
            </div>
            {/* Mockup Score UI */}
            <div className="mt-8 rounded-2xl bg-white/10 p-5 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/60">GEO Score</span>
                <span className="text-xs text-primary font-bold">↑ +5 pts</span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {[30, 45, 40, 55, 60, 58, 73].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-primary/60"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m) => (
                  <span key={m} className="text-[9px] text-white/40">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2 — Recommendations */}
          <div className="flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-[#EAF5F0] p-8 text-[#0A251C] h-[450px]">
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A251C]/10">
                <Brain className="h-5 w-5 text-[#0A251C]" />
              </div>
              <h3 className="text-2xl font-semibold">
                Fixes That Actually Move the Needle
              </h3>
              <p className="mt-3 text-sm text-[#0A251C]/70">
                Prioritized, plain-English recommendations — from adding JSON-LD
                schema and building authoritative citations to restructuring
                content the way AI models prefer to read it.
              </p>
            </div>
            {/* Mockup Recommendations */}
            <div className="mt-8 space-y-3">
              <div className="rounded-xl bg-white p-3 shadow-sm flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-400 flex-shrink-0" />
                <div className="space-y-1 w-full">
                  <div className="h-2 w-3/4 rounded bg-slate-200" />
                  <div className="text-[10px] text-[#0A251C]/50">
                    Critical · JSON-LD schema missing
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white/70 p-3 shadow-sm flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-400 flex-shrink-0" />
                <div className="space-y-1 w-full">
                  <div className="h-2 w-1/2 rounded bg-slate-200" />
                  <div className="text-[10px] text-[#0A251C]/50">
                    High · Add third-party citations
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white/50 p-3 shadow-sm flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <div className="space-y-1 w-full">
                  <div className="h-2 w-2/3 rounded bg-slate-200" />
                  <div className="text-[10px] text-[#0A251C]/50">
                    Medium · Publish to Medium & Reddit
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 — Platform Visibility */}
          <div className="flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-white border border-border p-8 h-[450px]">
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">
                See Where You Show Up — and Where You Don't
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Understand your brand's presence across Google AI Overviews,
                Reddit, Medium, and the open web. Know exactly which channels to
                invest in next.
              </p>
            </div>
            {/* Mockup Bar Chart */}
            <div className="mt-8">
              <div className="flex items-end justify-around gap-3 h-28 px-2">
                {[
                  { label: "Google", val: 9 },
                  { label: "Reddit", val: 99 },
                  { label: "Medium", val: 15 },
                  { label: "Web", val: 63 },
                ].map(({ label, val }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 flex-1"
                  >
                    <span className="text-[10px] font-medium text-foreground">
                      {val}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-primary/80"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="mx-auto w-full max-w-7xl px-6 py-24 text-center lg:px-12"
      >
        <div className="relative mx-auto flex max-w-3xl flex-col items-center justify-center pt-20 pb-10">
          <div className="absolute top-0 w-full h-[300px] border-t-2 border-dashed border-border rounded-t-full opacity-50" />

          <div className="z-10 mb-8 w-16 h-16">
            <svg viewBox="0 0 1080 1080" className="w-full h-full">
              <path d="M565.79,201.17c43.67-3.79,81.17,9.26,114.46,37.06,72.34,60.41,69.67,134.55,104.91,214.09,45.59,102.92,157.65,196.05,41.43,299.84-44.78,39.99-108.24,55.11-162.85,76.4-85,33.15-130.62,64.56-228.66,44.72-279.35-56.53-309.76-455.82-77.76-594.82,46.15-27.65,156.07-72.76,208.47-77.3ZM568,214.45c-58.22,5.52-189.54,65.9-234.39,104.54-164.55,141.78-133.25,460.72,89.16,526.74,99.37,29.49,151.25-3.57,239.8-36.07,73.92-27.13,214.99-62.76,202.49-169.19-5.05-43-71.95-132.08-93.19-179.28-34.95-77.64-30.97-157.5-101.48-215.3-30.04-24.62-63.48-35.13-102.39-31.44Z" fill="#F95C4B" className="origin-center animate-[signalor-ring1_3s_ease-in-out_infinite]" style={{transformOrigin:"540px 540px"}}/>
              <path d="M541.41,267.61c43.38-3.96,85.03,14.63,115.42,44.99,46.12,46.07,53.19,108.76,79.59,166.31,18.03,39.32,45.84,78.9,61.27,118.16,30.53,77.71-34.74,131.9-98.61,160.49-47.32,21.18-166.45,71.33-213.74,72.07-259.82,4.08-322.49-377.1-108.88-501.03,37.36-21.68,122.92-57.16,164.96-61ZM757.75,699.92c65.98-66.57,15.37-111.39-17.66-175.94-24.71-48.28-35.17-87.92-53.21-137.3-20.87-57.16-75.06-108.91-139.43-104.17-40.85,3-130.99,43.35-165.77,66.84-207.44,140.12-95.06,536.35,176.85,442.68,53.98-18.6,161.1-53.63,199.23-92.1Z" fill="#F95C4B" className="origin-center animate-[signalor-ring2_2.7s_ease-in-out_infinite]" style={{transformOrigin:"540px 540px"}}/>
              <path d="M523.7,334.09c45.4-2.29,88.35,25.85,114.34,61.55,18.67,25.65,23.9,52.81,36.35,81.06,14.28,32.38,58.57,110.48,57.82,141.04-.89,36.43-35.5,70.71-64.8,88.23-30.42,18.19-149.74,69.78-182.07,72.69-187.11,16.86-254.37-250.97-131.8-368.83,34.85-33.51,122.05-73.31,170.15-75.73ZM517.01,351.76c-34.96,3.97-105.39,39.33-132.45,62.5-116.74,99.92-67.45,357.74,103,342.25,28.53-2.59,134-44.3,162.96-58.57,28.08-13.84,64.06-44.33,66.14-77.96,1.67-26.97-36.61-86.82-48.9-114.48-20.07-45.18-26.48-92.97-66.05-126.68-25.35-21.6-51.12-30.86-84.7-27.05Z" fill="#F95C4B" className="origin-center animate-[signalor-ring3_2.4s_ease-in-out_infinite]" style={{transformOrigin:"540px 540px"}}/>
              <path d="M383.15,695.95c-75.08-75.11-59.14-217.22,36.79-268.47,103.24-55.16,165.88-17.39,208.72,81.67,31.43,72.67,49.43,119.77-29.92,165.81-27.84,16.15-110.47,55.8-139.96,55.15-26.54-.58-57.13-15.65-75.63-34.16ZM499.28,418.23c-41.99,4.08-96.65,38.5-117.29,75.42-44.51,79.65-.35,244.88,112.29,207.54,30.61-10.15,98.42-37.76,121.74-57.7,34.09-29.15,25.13-49.63,12.29-87.48-19.82-58.41-52.18-145.26-129.03-137.79Z" fill="#F95C4B" className="origin-center animate-[signalor-ring4_2.1s_ease-in-out_infinite]" style={{transformOrigin:"540px 540px"}}/>
              <path d="M466.02,469.13c51.39-6.95,91.95,17.75,110.77,65.3,16.09,40.65,14.25,67.74-20.9,95.46-12.94,10.21-75.24,48.51-88.75,50.81-71.7,12.21-98.77-92.71-79.84-146.29,11.3-32,44.89-60.7,78.72-65.28ZM474.88,486.85c-32.42,4.44-61.84,34.68-65.69,67.23-4.13,34.98,14.09,119.35,64,99.45,15.86-6.33,72.23-34.89,83.05-45.43,20.53-19.98,14.37-44.5,4.41-68.61-14.93-36.14-45.63-58.14-85.78-52.64Z" fill="#F95C4B" className="origin-center animate-[signalor-ring5_1.8s_ease-in-out_infinite]" style={{transformOrigin:"540px 540px"}}/>
            </svg>
          </div>

          <h2 className="font-sans text-4xl tracking-tight text-foreground md:text-5xl">
            Paste Your URL. <br />{" "}
            <span className="text-muted-foreground">
              Get Your Full GEO Audit in 60 Seconds.
            </span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-lg">
            No setup, no integrations, no waiting. Signalor scans your site,
            scores every GEO signal, and hands you a prioritized action plan —
            so you know exactly what to fix first.
          </p>
          <Link
            href="/analyzer"
            className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Run My Free Audit
          </Link>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-12"
      >
        <div className="text-center mb-10">
          <span className="text-sm font-bold uppercase tracking-wider text-primary">
            Pricing //
          </span>
          <h2 className="mt-4 font-sans text-4xl tracking-tight text-foreground md:text-5xl">
            Simple pricing. <span className="text-muted-foreground">Start with Starter.</span>
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-sm text-muted-foreground">
            One plan for now — full core GEO analysis. Prices in GBP, billed monthly.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
            <button type="button" className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm">
              Monthly
            </button>
            <button
              type="button"
              className="relative rounded-full px-6 py-2.5 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-70"
            >
              Annual
              <span className="absolute -top-3 -right-2 rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                Coming Soon
              </span>
            </button>
          </div>
        </div>

        <div className="mx-auto grid max-w-lg grid-cols-1 gap-6 md:items-stretch">
          {LANDING_PLANS.map((plan) => {
            const isDark = plan.popular === true;
            const priceLabel =
              Math.round(plan.price) === plan.price
                ? `${plan.price}`
                : plan.price.toFixed(2);
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-[2rem] p-8 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl md:p-9 ${
                  isDark
                    ? "bg-[#0A251C] text-white ring-2 ring-primary"
                    : "border border-border bg-card text-foreground"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0A251C]">
                    Most popular
                  </div>
                )}
                <div
                  className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    isDark ? "bg-white/10 text-primary" : "bg-primary/10 text-primary"
                  }`}
                >
                  {plan.label}
                </div>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className={`font-sans text-5xl tracking-tight ${isDark ? "" : "text-foreground"}`}>
                    £{priceLabel}
                  </span>
                  <span
                    className={`text-lg font-medium ${
                      isDark ? "text-white/60" : "text-muted-foreground"
                    }`}
                  >
                    / month
                  </span>
                </div>
                <p
                  className={`mt-3 text-sm leading-relaxed border-b pb-6 ${
                    isDark ? "text-white/65 border-white/10" : "text-muted-foreground border-border"
                  }`}
                >
                  {plan.description}
                </p>
                <Link
                  href="/pricing"
                  className={`mt-6 block w-full rounded-full py-3.5 text-center text-sm font-bold transition-colors ${
                    isDark
                      ? "bg-primary text-[#0A251C] hover:bg-primary/90"
                      : "bg-foreground text-background hover:opacity-90"
                  }`}
                >
                  Get {plan.label}
                </Link>
                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex items-start gap-2.5 text-sm ${
                        isDark ? "text-white/85" : "text-foreground/85"
                      }`}
                    >
                      <CheckCircle2
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          isDark ? "text-primary" : "text-primary"
                        }`}
                      />
                      {feature}
                    </li>
                  ))}
                  {"comingSoon" in plan &&
                    Array.isArray(plan.comingSoon) &&
                    plan.comingSoon.length > 0 && (
                      <li className="list-none pt-4 mt-1 border-t border-dashed border-border/60 dark:border-white/15">
                        <p
                          className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${
                            isDark ? "text-white/40" : "text-muted-foreground"
                          }`}
                        >
                          Coming Soon
                        </p>
                        <ul className="flex flex-col gap-2.5">
                          {plan.comingSoon.map((line) => (
                            <li
                              key={line}
                              className={`flex items-start gap-2.5 text-sm ${
                                isDark ? "text-white/50" : "text-muted-foreground"
                              }`}
                            >
                              <Clock
                                className={`mt-0.5 h-4 w-4 shrink-0 ${
                                  isDark ? "text-white/35" : "text-muted-foreground/70"
                                }`}
                              />
                              {line}
                            </li>
                          ))}
                        </ul>
                      </li>
                    )}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-20 mx-auto max-w-5xl rounded-[2.5rem] bg-[#EAF5F0] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-sans text-3xl text-[#0A251C] md:text-4xl max-w-md">
              Your Competitors Are Already{" "}
              <span className="text-[#0A251C]/60">
                Optimizing for AI Search.
              </span>
            </h2>
            <p className="mt-4 text-sm text-[#0A251C]/70 max-w-sm">
              Run a free GEO audit today and see exactly how AI engines
              currently perceive your brand — before someone else owns that
              space.
            </p>
            <Link
              href="/sign-up"
              className="mt-8 inline-block rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Get Started 
            </Link>
          </div>
          {/* Abstract Graphic Right side */}
          <div className="hidden md:block relative w-64 h-48">
            <div className="absolute top-0 right-0 w-full h-16 bg-white rounded-xl shadow-sm opacity-80 flex items-center px-4 gap-3 animate-pulse">
              <div className="h-6 w-6 rounded-full bg-primary/20" />
              <div className="h-2 w-1/2 rounded bg-[#0A251C]/10" />
            </div>
            <div className="absolute top-20 right-4 w-5/6 h-16 bg-white rounded-xl shadow-sm opacity-90 flex items-center px-4 gap-3 animate-pulse delay-75">
              <div className="h-6 w-6 rounded-full bg-emerald-100" />
              <div className="h-2 w-2/3 rounded bg-[#0A251C]/10" />
            </div>
            <div className="absolute bottom-0 right-8 w-4/6 h-16 bg-white rounded-xl shadow-sm flex items-center px-4 gap-3 animate-pulse delay-150">
              <div className="h-6 w-6 rounded-full bg-amber-100" />
              <div className="h-2 w-1/2 rounded bg-[#0A251C]/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 text-xl font-bold text-foreground mb-6">
                {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                Signalor */}
                <LogoComp />
              </div>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                The GEO platform that helps brands get cited, recommended, and
                surfaced by AI-powered search engines before their competitors
                do.
              </p>
              {/* <div className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary"
                />
                <button className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
                  Subscribe
                </button>
              </div> */}
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-primary">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-primary">
                    GEO Score
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-primary">
                    AI Recommendations
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-primary">
                    Platform Visibility
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-primary">
                    JSON-LD Generator
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-primary">
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions"
                    className="hover:text-primary"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-20 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Signalor Ltd. All Rights Reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
