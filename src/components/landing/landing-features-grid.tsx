"use client";

import { ScreenHR, GridDividerDiamonds } from "@/components/ui/intersection-diamonds";

export function LandingFeaturesGrid() {
  return (
    <section
      className="relative bg-background"
      aria-labelledby="landing-features-grid-heading"
    >
      <ScreenHR />
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-14 lg:px-12 lg:pb-14 lg:pt-16 rounded-sm ">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          [ platform ]
        </p>
        <h2
          id="landing-features-grid-heading"
          className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem] xl:text-5xl"
        >
          Everything you need to{" "}
          <span className="relative whitespace-nowrap text-primary">
            win in AI search
            <span
              className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
              aria-hidden
            />
          </span>
        </h2>
        <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
          Track, analyze, and optimize your brand&apos;s presence across
          ChatGPT, Claude, Gemini, Perplexity, and other AI search engines.
        </p>
      </div>
      <ScreenHR />
      <div className="mx-auto max-w-7xl bg-black-10">
        <div className="relative grid grid-cols-1 divide-y divide-black/6 md:grid-cols-3 md:divide-x md:divide-y-0 md:divide-black/6">
        <GridDividerDiamonds columns={3} top bottom />
        {/* Prompt tracking */}
        <div className="flex flex-col gap-8 px-6 py-12 md:px-8 md:py-16 lg:px-10 rounded-sm bg-white">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
              Prompt tracking
            </h3>
            <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
              Track real user prompts and see when AI mentions your brand in its
              responses.
            </p>
          </div>
          <div className="w-full h-full flex justify-center items-center bg-background rounded-sm border p-4">
            <div className="mt-auto rounded-xl border border-black/8 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="space-y-3 text-[13px] leading-snug">
                <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-neutral-100 px-3.5 py-2.5 text-neutral-700">
                  What CRM do you recommend for a small sales team?
                </div>
                <div className="ml-auto max-w-[94%] rounded-2xl rounded-br-md bg-neutral-900 px-3.5 py-2.5 text-[12px] font-medium text-neutral-100">
                  Popular picks include{" "}
                  <span className="font-semibold text-orange-400">HubSpot</span>
                  {" and "}
                  <span className="text-white underline decoration-white/40">
                    Salesforce
                  </span>{" "}
                  for pipeline and reporting.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Citations analysis */}
        <div className="flex flex-col gap-8 px-6 py-12 md:px-8 md:py-16 lg:px-10 bg-white rounded-sm">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
              Citations analysis
            </h3>
            <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
              Understand which citations drive visibility and discover what
              content gets recommended.
            </p>
          </div>
          <div className="w-full h-full flex justify-center items-center bg-background rounded-sm border p-4">
            <div className="mt-auto w-full rounded-xl border border-black/8 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="mb-3 flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                <span>Mentioned</span>
                <span>Missing</span>
              </div>
              <div className="mb-4 flex h-2.5 overflow-hidden rounded-full bg-neutral-200">
                <div className="w-[40%] bg-[#2563eb]" />
                <div
                  className="relative flex-1 bg-neutral-200"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 5px)",
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-semibold tabular-nums text-neutral-600">
                <span>40%</span>
                <span>60%</span>
              </div>
              <ul className="mt-4 space-y-2 border-t border-black/6 pt-3 text-[12px] font-medium text-neutral-700">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563eb]" />
                  Listicle (23%) · missing
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  Guide (18%) · cited
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  Comparison (12%) · partial
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Agent analytics */}
        <div className="flex flex-col gap-8 px-6 py-12 md:px-8 md:py-16 lg:px-10 bg-white rounded-sm ">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
              Agent analytics
            </h3>
            <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
              See in real time when AI crawlers from ChatGPT, Gemini, and others
              read your pages.
            </p>
          </div>
          <div className="w-full h-full flex justify-center items-center bg-background rounded-sm border p-4">
            <div className="mt-auto w-full rounded-xl border border-black/8 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <ul className="divide-y divide-black/6 text-[12px] font-medium">
                {[
                  {
                    name: "ChatGPT",
                    path: "/blog/security-…",
                    tone: "bg-emerald-600",
                  },
                  {
                    name: "Claude",
                    path: "/pricing/com…",
                    tone: "bg-violet-600",
                  },
                  {
                    name: "Perplexity",
                    path: "/docs/api-v2…",
                    tone: "bg-sky-600",
                  },
                  {
                    name: "Copilot",
                    path: "/resources/…",
                    tone: "bg-blue-600",
                  },
                ].map((row) => (
                  <li
                    key={row.name}
                    className="flex items-center gap-2.5 py-2.5 first:pt-1 last:pb-1"
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white ${row.tone}`}
                      aria-hidden
                    >
                      {row.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-neutral-900">
                        {row.name}
                      </div>
                      <div className="truncate text-[11px] text-neutral-500">
                        {row.path}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md border border-black/8 bg-neutral-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
                      Cited
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        </div>

        <div
          aria-hidden
          className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6"
        />

        <div className="relative grid grid-cols-1 divide-y divide-black/6 md:grid-cols-3 md:divide-x md:divide-y-0 md:divide-black/6">
        <GridDividerDiamonds columns={3} top bottom />
        {/* GEO score */}
        <div className="flex flex-col gap-8 rounded-sm bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
              GEO score
            </h3>
            <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
              One 0–100 score that rolls up citability, schema, and content signals
              so you know where you stand in AI answers.
            </p>
          </div>
          <div className="flex h-full w-full items-center justify-center rounded-sm border bg-background p-4">
            <div className="mt-auto w-full rounded-xl border border-black/8 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    Overall
                  </p>
                  <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-neutral-900">
                    78
                    <span className="text-lg font-semibold text-neutral-400">
                      /100
                    </span>
                  </p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-[#2563eb]/25 text-[11px] font-bold text-[#2563eb]">
                  +12
                </div>
              </div>
              <ul className="mt-4 space-y-2.5 border-t border-black/6 pt-3 text-[12px] font-medium text-neutral-700">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-8 shrink-0 rounded-full bg-[#2563eb]/80" />
                  Citability · 82
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-6 shrink-0 rounded-full bg-emerald-500/90" />
                  Schema · 71
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-7 shrink-0 rounded-full bg-amber-500/90" />
                  Content · 74
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Fix queue */}
        <div className="flex flex-col gap-8 rounded-sm bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
              Fix queue
            </h3>
            <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
              Prioritized recommendations with impact estimates so your team ships
              the changes that move citations first.
            </p>
          </div>
          <div className="flex h-full w-full items-center justify-center rounded-sm border bg-background p-4">
            <div className="mt-auto w-full rounded-xl border border-black/8 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <ul className="divide-y divide-black/6 text-[12px] font-medium">
                <li className="flex items-start gap-2 py-2.5 first:pt-1">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-neutral-900">
                      Add Organization JSON-LD
                    </div>
                    <div className="mt-0.5 text-[11px] text-neutral-500">
                      High impact · ~2h
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
                    Critical
                  </span>
                </li>
                <li className="flex items-start gap-2 py-2.5">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-neutral-900">
                      Rewrite meta for /pricing
                    </div>
                    <div className="mt-0.5 text-[11px] text-neutral-500">
                      Medium · ~45m
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
                    Next
                  </span>
                </li>
                <li className="flex items-start gap-2 py-2.5 last:pb-1">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-neutral-900">
                      Publish FAQ block on /docs
                    </div>
                    <div className="mt-0.5 text-[11px] text-neutral-500">
                      Shipped · cited in Perplexity
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                    Done
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Competitor lens */}
        <div className="flex flex-col gap-8 rounded-sm bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
              Competitor lens
            </h3>
            <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">
              Compare citation share and prompt coverage against rivals so you can
              close gaps before they show up in AI answers.
            </p>
          </div>
          <div className="flex h-full w-full items-center justify-center rounded-sm border bg-background p-4">
            <div className="mt-auto w-full rounded-xl border border-black/8 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                <span>Share of AI citations</span>
                <span className="tabular-nums text-neutral-400">7d</span>
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex justify-between text-[12px] font-semibold text-neutral-800">
                    <span>You</span>
                    <span className="tabular-nums text-[#2563eb]">38%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full w-[38%] rounded-full bg-[#2563eb]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[12px] font-semibold text-neutral-800">
                    <span>Acme</span>
                    <span className="tabular-nums text-neutral-600">44%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full w-[44%] rounded-full bg-neutral-400" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[12px] font-semibold text-neutral-800">
                    <span>Northwind</span>
                    <span className="tabular-nums text-neutral-600">18%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full w-[18%] rounded-full bg-neutral-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
