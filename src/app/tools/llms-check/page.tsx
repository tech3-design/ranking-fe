"use client";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { ToolPage } from "@/components/tools/tool-page";
import { LlmsCheckInline } from "@/components/tools/llms-check-inline";

export default function LlmsCheckToolPage() {
  return (
    <LandingMarketingShell>
      <ToolPage
        theme="blue"
        eyebrow="[ free tool · llm checker ]"
        title="See if AI can find and cite"
        titleAccent="your site"
        description="Enter a domain and we'll check llms.txt, robots.txt AI-bot rules, sitemap, and on-page schema — an honest LLM-readiness score, free."
        form={<LlmsCheckInline />}
        features={[
          { title: "llms.txt check", description: "Verifies whether you publish a llms.txt manifest and how many sections it exposes." },
          { title: "AI crawler rules", description: "Parses robots.txt for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and more." },
          { title: "On-page signals", description: "Title, description, Open Graph, canonical, Organization schema, sitemap reachability." },
          { title: "Free forever", description: "Run unlimited checks without an account." },
        ]}
        previewEyebrow="[ what's inside the full report ]"
        previewTitle="Go beyond readiness —"
        previewTitleAccent="real AI probes"
        previewDescription="The free tool shows crawlability and schema signals. Sign up or upgrade to run live probes across ChatGPT, Claude, Gemini, and Perplexity."
        previewRows={[
          { content: <PreviewOtherEngines />, locked: true },
          { content: <PreviewSentiment />, locked: true },
        ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}

function PreviewOtherEngines() {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Live AI probes · 4 engines</p>
      <p className="mt-1 text-xs text-muted-foreground">
        See how ChatGPT, Claude, Gemini, and Perplexity actually describe your brand, with paraphrase & citation tagging per line.
      </p>
    </div>
  );
}

function PreviewSentiment() {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Sentiment + prompt trend</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Week-over-week sentiment delta and the prompts that drove the biggest shifts.
      </p>
    </div>
  );
}
