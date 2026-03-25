import Link from "next/link";
import { Play, CheckCircle2, TrendingUp, Brain, BarChart3, Zap } from "lucide-react";
import { HeroAnalyzerForm } from "@/components/analyzer/hero-analyzer-form";
import Image from "next/image";
import LogoComp from "@/components/LogoComp";

export default function Home() {
  return (
    <main 
      className="light overflow-x-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary"
      style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
    >
      {/* Navigation */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-12">
          {/* Logo */}
          <LogoComp/>
          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm font-semibold text-foreground">Home</Link>
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
            <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link>
          </nav>

          {/* Actions */}
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/sign-in" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
              Log In
            </Link>
            <Link href="/sign-up" className="rounded-full bg-[#0A251C] px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 shadow-md">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>
     

      {/* Hero Section */}
      <section className="relative min-h-screen pt-32 pb-20 lg:pt-40 lg:pb-24 flex flex-col justify-center">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-12">
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-bold tracking-wide text-muted-foreground backdrop-blur-sm shadow-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Optimize for ChatGPT, Perplexity, Gemini & Google AI
          </div>
          
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Get Found by <br className="hidden md:block" />
            AI-Powered <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50">Search Engines</span> <br className="hidden md:block" />
            Starting Today
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg font-medium">
            Signalor analyzes and optimizes your website for Generative Engine Optimization (GEO) — so AI assistants cite, recommend, and surface your brand.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/sign-up" className="w-full sm:w-auto rounded-full bg-primary px-8 py-4 text-sm font-bold text-[#0A251C] shadow-lg shadow-primary/20 hover:opacity-90 transition-all hover:-translate-y-1">
              Start Free Analysis
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-[#0A251C] px-8 py-4 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-all hover:-translate-y-1">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                <Play className="h-3 w-3 fill-white" />
              </div>
              How It Works
            </Link>
          </div>

          {/* Floating GEO Score Cards */}
          <div className="absolute top-40 left-[5%] xl:left-[10%] hidden animate-pulse md:block">
            <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-xl border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-extrabold text-base">
                73
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-foreground">GEO Score</p>
                <p className="text-[10px] font-semibold text-emerald-600">+5 pts this week</p>
              </div>
            </div>
          </div>
          <div className="absolute top-32 right-[5%] xl:right-[15%] hidden animate-pulse md:block delay-150">
            <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-xl border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-foreground">AI Citations</p>
                <p className="text-[10px] font-semibold text-emerald-600">+40% increase</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Analyzer CTA with Animated Logo */}
      <section className="py-16 flex flex-col items-center text-center px-6">
        {/* Animated Logo */}
        <div className="w-16 h-16 mb-6">
          <svg viewBox="0 0 1080 1080" className="w-full h-full">
            <path d="M565.79,201.17c43.67-3.79,81.17,9.26,114.46,37.06,72.34,60.41,69.67,134.55,104.91,214.09,45.59,102.92,157.65,196.05,41.43,299.84-44.78,39.99-108.24,55.11-162.85,76.4-85,33.15-130.62,64.56-228.66,44.72-279.35-56.53-309.76-455.82-77.76-594.82,46.15-27.65,156.07-72.76,208.47-77.3ZM568,214.45c-58.22,5.52-189.54,65.9-234.39,104.54-164.55,141.78-133.25,460.72,89.16,526.74,99.37,29.49,151.25-3.57,239.8-36.07,73.92-27.13,214.99-62.76,202.49-169.19-5.05-43-71.95-132.08-93.19-179.28-34.95-77.64-30.97-157.5-101.48-215.3-30.04-24.62-63.48-35.13-102.39-31.44Z" fill="#F95C4B" className="origin-center animate-[signalor-ring1_3s_ease-in-out_infinite]" style={{ transformOrigin: "540px 540px" }} />
            <path d="M541.41,267.61c43.38-3.96,85.03,14.63,115.42,44.99,46.12,46.07,53.19,108.76,79.59,166.31,18.03,39.32,45.84,78.9,61.27,118.16,30.53,77.71-34.74,131.9-98.61,160.49-47.32,21.18-166.45,71.33-213.74,72.07-259.82,4.08-322.49-377.1-108.88-501.03,37.36-21.68,122.92-57.16,164.96-61ZM757.75,699.92c65.98-66.57,15.37-111.39-17.66-175.94-24.71-48.28-35.17-87.92-53.21-137.3-20.87-57.16-75.06-108.91-139.43-104.17-40.85,3-130.99,43.35-165.77,66.84-207.44,140.12-95.06,536.35,176.85,442.68,53.98-18.6,161.1-53.63,199.23-92.1Z" fill="#F95C4B" className="origin-center animate-[signalor-ring2_2.7s_ease-in-out_infinite]" style={{ transformOrigin: "540px 540px" }} />
            <path d="M523.7,334.09c45.4-2.29,88.35,25.85,114.34,61.55,18.67,25.65,23.9,52.81,36.35,81.06,14.28,32.38,58.57,110.48,57.82,141.04-.89,36.43-35.5,70.71-64.8,88.23-30.42,18.19-149.74,69.78-182.07,72.69-187.11,16.86-254.37-250.97-131.8-368.83,34.85-33.51,122.05-73.31,170.15-75.73ZM517.01,351.76c-34.96,3.97-105.39,39.33-132.45,62.5-116.74,99.92-67.45,357.74,103,342.25,28.53-2.59,134-44.3,162.96-58.57,28.08-13.84,64.06-44.33,66.14-77.96,1.67-26.97-36.61-86.82-48.9-114.48-20.07-45.18-26.48-92.97-66.05-126.68-25.35-21.6-51.12-30.86-84.7-27.05Z" fill="#F95C4B" className="origin-center animate-[signalor-ring3_2.4s_ease-in-out_infinite]" style={{ transformOrigin: "540px 540px" }} />
            <path d="M383.15,695.95c-75.08-75.11-59.14-217.22,36.79-268.47,103.24-55.16,165.88-17.39,208.72,81.67,31.43,72.67,49.43,119.77-29.92,165.81-27.84,16.15-110.47,55.8-139.96,55.15-26.54-.58-57.13-15.65-75.63-34.16ZM499.28,418.23c-41.99,4.08-96.65,38.5-117.29,75.42-44.51,79.65-.35,244.88,112.29,207.54,30.61-10.15,98.42-37.76,121.74-57.7,34.09-29.15,25.13-49.63,12.29-87.48-19.82-58.41-52.18-145.26-129.03-137.79Z" fill="#F95C4B" className="origin-center animate-[signalor-ring4_2.1s_ease-in-out_infinite]" style={{ transformOrigin: "540px 540px" }} />
            <path d="M466.02,469.13c51.39-6.95,91.95,17.75,110.77,65.3,16.09,40.65,14.25,67.74-20.9,95.46-12.94,10.21-75.24,48.51-88.75,50.81-71.7,12.21-98.77-92.71-79.84-146.29,11.3-32,44.89-60.7,78.72-65.28ZM474.88,486.85c-32.42,4.44-61.84,34.68-65.69,67.23-4.13,34.98,14.09,119.35,64,99.45,15.86-6.33,72.23-34.89,83.05-45.43,20.53-19.98,14.37-44.5,4.41-68.61-14.93-36.14-45.63-58.14-85.78-52.64Z" fill="#F95C4B" className="origin-center animate-[signalor-ring5_1.8s_ease-in-out_infinite]" style={{ transformOrigin: "540px 540px" }} />
          </svg>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          Paste Your URL.
        </h2>
        <p className="text-base text-muted-foreground font-medium mt-2">
          Get Your Full GEO Audit in 60 Seconds.
        </p>

        <HeroAnalyzerForm />
      </section>

      {/* Trusted By */}
      <section className="border-y border-border/50 bg-muted/20 py-10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-6 opacity-50 grayscale md:gap-16 lg:px-12">
          {["Perplexity", "ChatGPT", "Gemini", "Google", "Claude", "Bing Copilot", "Reddit"].map((brand) => (
            <span key={brand} className="text-xl font-extrabold tracking-tight">{brand}</span>
          ))}
        </div>
      </section>

      {/* About Platform / Stats */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-32 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
          <div className="flex flex-col items-start justify-center">
            <span className="text-sm font-bold uppercase tracking-widest text-primary">About Our Platform</span>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
              Make AI Work <br /> For Your Brand With <span className="text-muted-foreground">GEO-Driven Insights.</span>
            </h2>
            <p className="mt-6 text-base font-medium text-muted-foreground leading-relaxed">
              Signalor gives you a full GEO audit of your website — scoring your AI citability, structured data, brand mentions, and platform-specific visibility — then gives you a clear action plan to improve.
            </p>
            <Link href="/about" className="mt-8 rounded-full bg-primary/10 px-8 py-3.5 text-sm font-bold text-primary hover:bg-primary/20 transition-colors">
              Learn More
            </Link>
          </div>

          <div className="flex flex-col justify-center gap-6">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 shadow-sm transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 blur-3xl" />
              <h3 className="text-5xl font-extrabold tracking-tight text-foreground md:text-6xl">
                5k+ <span className="text-2xl text-muted-foreground font-bold tracking-normal">Websites</span>
              </h3>
              <p className="mt-4 text-sm font-medium text-muted-foreground">Websites actively improving their AI search visibility and GEO score with Signalor.</p>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 shadow-sm transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 blur-3xl" />
              <h3 className="text-5xl font-extrabold tracking-tight text-foreground md:text-6xl">
                40% <span className="text-2xl text-muted-foreground font-bold tracking-normal">Avg. Lift</span>
              </h3>
              <p className="mt-4 text-sm font-medium text-muted-foreground">Average increase in AI citations after implementing Signalor recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 md:py-32 lg:px-12 bg-muted/30 rounded-3xl my-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Our Features</span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Everything You Need to Rank <br /> in the Age of AI Search
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {/* Card 1 — GEO Score */}
          <div className="flex flex-col justify-between overflow-hidden rounded-3xl bg-[#0A251C] p-8 text-white min-h-[450px] shadow-lg">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">GEO Score Tracking</h3>
              <p className="mt-3 text-sm font-medium text-white/70 leading-relaxed">Get a real-time GEO score (0–100) that measures how well your site is optimized for AI-powered search engines.</p>
            </div>
            {/* Mockup Score UI */}
            <div className="mt-8 rounded-2xl bg-white/5 p-5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-white/60">GEO Score</span>
                <span className="text-xs font-bold text-primary">+5 pts</span>
              </div>
              <div className="flex items-end gap-2 h-16">
                {[30, 45, 40, 55, 60, 58, 73].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-primary/80 transition-all hover:bg-primary" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="flex justify-between mt-3">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m) => (
                  <span key={m} className="text-[10px] font-medium text-white/40">{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2 — Recommendations */}
          <div className="flex flex-col justify-between overflow-hidden rounded-3xl bg-[#EAF5F0] p-8 text-[#0A251C] min-h-[450px] shadow-lg">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A251C]/10">
                <Brain className="h-6 w-6 text-[#0A251C]" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">AI Recommendations</h3>
              <p className="mt-3 text-sm font-medium text-[#0A251C]/70 leading-relaxed">Actionable, prioritized fixes — from adding JSON-LD schema to improving authoritative citations and content.</p>
            </div>
            {/* Mockup Recommendations */}
            <div className="mt-8 space-y-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500 flex-shrink-0" />
                <div className="space-y-1.5 w-full">
                  <div className="h-2 w-3/4 rounded bg-slate-200" />
                  <div className="text-[10px] font-bold text-[#0A251C]/50 uppercase tracking-wider">Critical · JSON-LD</div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                <div className="space-y-1.5 w-full">
                  <div className="h-2 w-1/2 rounded bg-slate-200" />
                  <div className="text-[10px] font-bold text-[#0A251C]/50 uppercase tracking-wider">High · Citations</div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/60 p-4 shadow-sm flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <div className="space-y-1.5 w-full">
                  <div className="h-2 w-2/3 rounded bg-slate-200" />
                  <div className="text-[10px] font-bold text-[#0A251C]/50 uppercase tracking-wider">Med · Publish</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 — Platform Visibility */}
          <div className="flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-border p-8 min-h-[450px] shadow-lg">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Platform Visibility</h3>
              <p className="mt-3 text-sm font-medium text-muted-foreground leading-relaxed">See exactly how you appear across Google AI Overviews, Reddit, Medium, and the open web — and where to focus next.</p>
            </div>
            {/* Mockup Bar Chart */}
            <div className="mt-8">
              <div className="flex items-end justify-around gap-4 h-32 px-2">
                {[{ label: "Google", val: 9 }, { label: "Reddit", val: 99 }, { label: "Medium", val: 15 }, { label: "Web", val: 63 }].map(({ label, val }) => (
                  <div key={label} className="flex flex-col items-center gap-2 flex-1 group">
                    <span className="text-[11px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
                    <div className="w-full rounded-t-lg bg-primary/80 transition-all group-hover:bg-primary group-hover:shadow-md" style={{ height: `${val}%` }} />
                    <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto w-full max-w-7xl px-6 py-20 md:py-32 text-center lg:px-12">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center justify-center pt-20 pb-10">
          {/* Abstract Arc Layout */}
          <div className="absolute top-0 w-full h-[300px] border-t-2 border-dashed border-border rounded-t-full opacity-50" />
          
          <div className="z-10 mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary text-[#0A251C] shadow-2xl shadow-primary/20">
            <Zap className="h-10 w-10" />
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Connect Your Site & <br /> <span className="text-muted-foreground">Let Signalor Do The Rest</span>
          </h2>
          <p className="mt-6 text-base font-medium text-muted-foreground">
            Add your URL, run a full GEO audit in seconds, and get a prioritized <br className="hidden md:block" /> action plan to dominate AI-powered search results.
          </p>
          <Link href="/sign-up" className="mt-10 rounded-full bg-[#0A251C] px-10 py-4 text-sm font-bold text-white hover:opacity-90 hover:-translate-y-1 transition-all shadow-xl">
            Analyze My Website
          </Link>
        </div>
      </section>

      {/* Pricing Section - Unified Single Plan */}
      <section id="pricing" className="mx-auto w-full max-w-7xl px-6 py-20 md:py-32 lg:px-12">
        <div className="text-center mb-16">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Our Pricing</span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Simple, Transparent Pricing. <br /> <span className="text-muted-foreground">Everything You Need.</span>
          </h2>
        </div>

        {/* Single Premium Pricing Card */}
        <div className="mx-auto flex max-w-5xl flex-col md:flex-row rounded-[2.5rem] border border-border bg-card shadow-2xl overflow-hidden">
          {/* Price side */}
          <div className="w-full md:w-2/5 bg-[#0A251C] p-10 md:p-14 text-center flex flex-col justify-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold tracking-tight mb-2">Pro Plan</h3>
              <p className="text-sm text-white/60 font-medium mb-8">For businesses serious about AI search visibility.</p>
              
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl font-extrabold tracking-tighter">£19</span>
                <span className="text-white/60 font-semibold">/mo</span>
              </div>
              
              <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Annual plan coming soon
              </div>
              
              <Link href="/sign-up" className="mt-10 block w-full rounded-full bg-primary py-4 text-center text-sm font-bold text-[#0A251C] hover:bg-primary/90 transition-all hover:shadow-lg">
                Get Started Free
              </Link>
              <p className="mt-4 text-xs font-medium text-white/40">Cancel anytime. No hidden fees.</p>
            </div>
          </div>

          {/* Features side */}
          <div className="w-full md:w-3/5 p-10 md:p-14 bg-background flex flex-col justify-center">
             <h3 className="text-xl font-bold mb-8 text-foreground">Everything you need to dominate AI search:</h3>
             <ul className="grid gap-4 sm:grid-cols-2">
               {[
                 'Unlimited websites tracking', 
                 'Full GEO audit per site', 
                 'AI citability scoring', 
                 'JSON-LD schema generator', 
                 'Platform-specific optimization', 
                 'Priority AI recommendations',
                 'Auto re-analyze & monitoring',
                 'White-label PDF reports'
               ].map((feature) => (
                 <li key={feature} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                   <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                   {feature}
                 </li>
               ))}
             </ul>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-20 mx-auto max-w-5xl rounded-3xl bg-[#EAF5F0] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm">
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0A251C] md:text-4xl max-w-md">
              Be The Brand That AI <span className="text-[#0A251C]/50">Recommends Every Time.</span>
            </h2>
            <p className="mt-4 text-sm font-medium text-[#0A251C]/70 max-w-sm mx-auto md:mx-0">
              Start your free GEO analysis and see exactly where AI search engines rank your website today.
            </p>
            <Link href="/sign-up" className="mt-8 inline-block rounded-full bg-primary px-10 py-4 text-sm font-bold text-[#0A251C] shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">
              Analyze My Site Free
            </Link>
          </div>
          {/* Abstract Graphic Right side */}
          <div className="hidden md:block relative w-72 h-48">
             <div className="absolute top-0 right-0 w-full h-16 bg-white rounded-2xl shadow-sm opacity-90 flex items-center px-4 gap-3 transform hover:-translate-x-2 transition-transform">
               <div className="h-8 w-8 rounded-full bg-primary/20" />
               <div className="h-3 w-1/2 rounded-full bg-[#0A251C]/10" />
             </div>
             <div className="absolute top-20 right-4 w-5/6 h-16 bg-white rounded-2xl shadow-sm opacity-100 flex items-center px-4 gap-3 transform hover:-translate-x-2 transition-transform">
               <div className="h-8 w-8 rounded-full bg-emerald-100" />
               <div className="h-3 w-2/3 rounded-full bg-[#0A251C]/10" />
             </div>
             <div className="absolute bottom-0 right-8 w-4/6 h-16 bg-white rounded-2xl shadow-sm flex items-center px-4 gap-3 transform hover:-translate-x-2 transition-transform">
               <div className="h-8 w-8 rounded-full bg-amber-100" />
               <div className="h-3 w-1/2 rounded-full bg-[#0A251C]/10" />
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                Signalor
              </div>
              <p className="text-sm font-medium text-muted-foreground max-w-sm mb-8 leading-relaxed">
                The GEO platform that helps your brand get cited, recommended, and surfaced by AI-powered search engines.
              </p>
              <div className="flex gap-2 max-w-sm bg-card p-1 rounded-full border border-border shadow-sm">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 rounded-full bg-transparent px-4 py-2 text-sm outline-none font-medium placeholder:text-muted-foreground"
                />
                <button className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-[#0A251C] hover:opacity-90 transition-opacity">
                  Subscribe
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6">Product</h4>
              <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition-colors">GEO Score</Link></li>
                <li><Link href="#features" className="hover:text-primary transition-colors">AI Recommendations</Link></li>
                <li><Link href="#features" className="hover:text-primary transition-colors">Platform Visibility</Link></li>
                <li><Link href="#features" className="hover:text-primary transition-colors">JSON-LD Generator</Link></li>
                <li><Link href="#features" className="hover:text-primary transition-colors">Analytics</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6">Support</h4>
              <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Community</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-and-conditions" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-20 border-t border-border pt-8 text-center text-sm font-medium text-muted-foreground">
            &copy; {new Date().getFullYear()} Signalor Ltd. All Rights Reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}