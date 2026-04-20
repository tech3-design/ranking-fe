"use client";

import { useState } from "react";
import { ArrowRight, Globe, Users } from "lucide-react";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { ToolPage } from "@/components/tools/tool-page";
import { Button } from "@/components/ui/button";

const SAMPLE_COMPETITORS = [
  { name: "You", pct: 41, barClass: "bg-emerald-700" },
  { name: "Acme", pct: 34, barClass: "bg-neutral-400" },
  { name: "Northwind", pct: 18, barClass: "bg-neutral-300" },
  { name: "Velocity", pct: 14, barClass: "bg-neutral-300" },
  { name: "Stratos", pct: 9, barClass: "bg-neutral-300" },
  { name: "Crestline", pct: 6, barClass: "bg-neutral-300" },
];

export default function CompetitorsAnalysisToolPage() {
  const [url, setUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <LandingMarketingShell>
      <ToolPage
        theme="emerald"
        eyebrow="[ free tool · competitors analysis ]"
        title="See who wins AI citations in"
        titleAccent="your category"
        description="Paste your domain and we'll rank your share of AI citations against up to 5 competitors on the prompts buyers actually ask."
        form={
          <form onSubmit={handleSubmit} className="flex w-full items-center gap-2 rounded-2xl border border-emerald-700/25 bg-white p-1.5 shadow-sm">
            <Globe className="ml-2 h-4 w-4 text-muted-foreground" aria-hidden />
            <input
              type="text"
              placeholder="Enter your domain (e.g. signalor.ai)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button type="submit" className="shrink-0 rounded-xl bg-emerald-700 px-4 text-xs font-semibold text-white hover:brightness-110">
              Compare
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </form>
        }
        features={[
          { title: "Share of AI mentions", description: "See who gets cited most on the prompts your buyers use—not legacy rank trackers." },
          { title: "Per-engine lens", description: "Breakdown across ChatGPT, Claude, Gemini, and Perplexity in a single benchmark." },
          { title: "Prompt gaps", description: "Spot prompts where rivals are mentioned and you are not—fuel your next content sprint." },
          { title: "Shareable report", description: "Send a clean summary link to leadership, agencies, or clients in one click." },
        ]}
        previewEyebrow="[ what you see ]"
        previewTitle="Your share of"
        previewTitleAccent="AI citations"
        previewDescription="Free tool shows the top 3 competitors and the overall share bar. Unlock the full 10-rival lens, per-engine drilldowns, and prompt-level gaps on a paid plan."
        previewRows={[
          { content: <PreviewCompetitorBars /> },
          { content: <PreviewEngineSplit />, locked: true },
          { content: <PreviewPromptGaps />, locked: true },
        ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}

function PreviewCompetitorBars() {
  const visible = SAMPLE_COMPETITORS.slice(0, 3);
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-emerald-700" aria-hidden />
        <p className="text-sm font-semibold text-foreground">Share of AI mentions · 30d</p>
      </div>
      <div className="space-y-3">
        {visible.map((r) => (
          <div key={r.name}>
            <div className="flex justify-between text-[12px] font-semibold text-neutral-800">
              <span>{r.name}</span>
              <span className={`tabular-nums ${r.name === "You" ? "text-emerald-700" : "text-neutral-600"}`}>{r.pct}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-200">
              <div className={`h-full rounded-full ${r.barClass}`} style={{ width: `${r.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewEngineSplit() {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Per-engine breakdown</p>
      <p className="mt-1 text-xs text-muted-foreground">
        See who wins on ChatGPT, Claude, Gemini, and Perplexity separately — the engines rarely agree.
      </p>
    </div>
  );
}

function PreviewPromptGaps() {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Prompt-level gaps</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Prompts where competitors are cited and you are not — ready to drop into a content brief.
      </p>
    </div>
  );
}
