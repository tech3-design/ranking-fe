"use client";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { ToolPage } from "@/components/tools/tool-page";
import { CompetitorsInline } from "@/components/tools/competitors-inline";

export default function CompetitorsAnalysisToolPage() {
  return (
    <LandingMarketingShell>
      <ToolPage
        theme="emerald"
        eyebrow="[ free tool · competitors analysis ]"
        title="See who wins comparison queries in"
        titleAccent="your category"
        description="Paste your domain and we'll rank the brands people actually compare you against — pulled from live search autocomplete, not a mock list."
        form={<CompetitorsInline />}
        features={[
          { title: "Real buyer queries", description: "Competitors pulled from live 'vs', 'alternatives', and 'compared to' autocomplete — the queries your buyers type." },
          { title: "Co-mention ranking", description: "Ranked by how often each rival surfaces next to you in real searches." },
          { title: "Expandable", description: "Sign up to benchmark against live AI citations across ChatGPT, Claude, Gemini, and Perplexity." },
          { title: "Free forever", description: "Run unlimited checks on public brands without an account." },
        ]}
        previewEyebrow="[ what's inside the full report ]"
        previewTitle="Go beyond search —"
        previewTitleAccent="live AI benchmarks"
        previewDescription="The free tool shows search-autocomplete co-mentions. Sign up or upgrade to benchmark AI citations per engine, per prompt."
        previewRows={[
          { content: <PreviewEngineSplit />, locked: true },
          { content: <PreviewPromptGaps />, locked: true },
        ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
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
