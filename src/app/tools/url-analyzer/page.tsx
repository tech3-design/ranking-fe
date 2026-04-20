"use client";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { HeroAnalyzerForm } from "@/components/analyzer/hero-analyzer-form";
import { ToolPage } from "@/components/tools/tool-page";

export default function UrlAnalyzerToolPage() {
  return (
    <LandingMarketingShell>
      <ToolPage
        theme="orange"
        eyebrow="[ free tool · url analyzer ]"
        title="Score any URL for"
        titleAccent="AI visibility"
        description="Paste a domain and see how ChatGPT, Gemini, Perplexity, and other AI engines summarize, cite, or skip it. Free, no sign-up required."
        form={<HeroAnalyzerForm />}
        features={[
          { title: "Full GEO score", description: "Structure, schema, citability and trust signals rolled into one 0-100 read." },
          { title: "Per-engine view", description: "See how each AI surface sees the page—cited, paraphrased, or absent." },
          { title: "Fix list", description: "Prioritized recommendations ranked by impact on the score." },
          { title: "Free forever", description: "Run unlimited audits on public URLs without an account." },
        ]}
        previewEyebrow="[ what you see ]"
        previewTitle="A taste of the"
        previewTitleAccent="full audit"
        previewDescription="Free tool shows the headline GEO score. Unlock the full per-engine breakdown, fix queue, and competitor benchmarking on a paid plan."
        previewRows={[
          { content: <PreviewGeoScore /> },
          { content: <PreviewSummary />, locked: true },
          { content: <PreviewFixQueue />, locked: true },
        ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}

function PreviewGeoScore() {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">GEO score</p>
        <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight text-neutral-900">
          78<span className="text-xl font-semibold text-neutral-400">/100</span>
        </p>
        <p className="mt-1 text-[12px] text-neutral-500">signalor.ai · United States · 12 pages scanned</p>
      </div>
      <div className="hidden shrink-0 gap-2 sm:flex">
        {[
          { label: "Citability", v: 82 },
          { label: "Schema", v: 71 },
          { label: "Content", v: 74 },
        ].map((p) => (
          <div key={p.label} className="rounded-md border border-black/8 bg-neutral-50 px-3 py-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">{p.label}</p>
            <p className="mt-0.5 text-base font-bold tabular-nums text-neutral-900">{p.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewSummary() {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Per-engine summary</p>
      <p className="mt-1 text-xs text-muted-foreground">
        ChatGPT cites you for 14 tracked prompts · Gemini shows partial coverage on 6 · Perplexity missing on 4
      </p>
    </div>
  );
}

function PreviewFixQueue() {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Prioritized fix queue</p>
      <p className="mt-1 text-xs text-muted-foreground">
        +8 projected lift · Add Organization JSON-LD, tighten /pricing FAQ, publish author bios
      </p>
    </div>
  );
}
