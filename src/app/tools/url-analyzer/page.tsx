"use client";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { UrlAnalyzerToolInline } from "@/components/tools/url-analyzer-inline";
import { ToolPage } from "@/components/tools/tool-page";

export default function UrlAnalyzerToolPage() {
  return (
    <LandingMarketingShell>
      <ToolPage
        theme="orange"
        eyebrow="[ free tool · url analyzer ]"
        title="Score any URL for"
        titleAccent="AI visibility"
        description="Paste a domain and see how AI engines summarize, cite, or skip it. Free — no sign-up required for the summary."
        form={<UrlAnalyzerToolInline />}
        features={[
          { title: "Full GEO score", description: "Structure, schema, citability and trust signals rolled into one 0-100 read." },
          { title: "Per-engine view", description: "See how each AI surface sees the page—cited, paraphrased, or absent." },
          { title: "Fix list", description: "Prioritized recommendations ranked by impact on the score." },
          { title: "Free forever", description: "Run unlimited audits on public URLs without an account." },
        ]}
        previewEyebrow="[ what's inside the full report ]"
        previewTitle="Unlock the full"
        previewTitleAccent="audit trail"
        previewDescription="The free summary above shows the headline score, pillar breakdown, and top fix. Sign up or upgrade to see every recommendation, per-engine AI probes, competitor share, and monitoring."
        previewRows={[
          { content: <PreviewPerEngine />, locked: true },
          { content: <PreviewFullFixQueue />, locked: true },
          { content: <PreviewMonitoring />, locked: true },
        ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}

function PreviewPerEngine() {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Per-engine AI probes</p>
      <p className="mt-1 text-xs text-muted-foreground">
        ChatGPT, Claude, Gemini, and Perplexity tested against your brand prompts — see every response, mention, and citation.
      </p>
    </div>
  );
}

function PreviewFullFixQueue() {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Full fix queue</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Every recommendation ranked by projected lift, with ready-to-paste code and one-click auto-fix on Shopify & WordPress.
      </p>
    </div>
  );
}

function PreviewMonitoring() {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Scheduled re-analysis</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Weekly or monthly re-runs, score history, and competitor benchmarks so you spot drift before it hurts.
      </p>
    </div>
  );
}
