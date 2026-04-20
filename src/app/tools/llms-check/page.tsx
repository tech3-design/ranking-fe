"use client";

import { useState } from "react";
import { ArrowRight, Globe } from "lucide-react";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { ToolPage } from "@/components/tools/tool-page";
import { Button } from "@/components/ui/button";

export default function LlmsCheckToolPage() {
  const [url, setUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Tool flow wired to real backend in a later pass — for now, surface the preview.
  }

  return (
    <LandingMarketingShell>
      <ToolPage
        theme="blue"
        eyebrow="[ free tool · llm checker ]"
        title="Check how AI models talk about"
        titleAccent="your brand"
        description="Enter a domain and we'll show how ChatGPT, Claude, Gemini, and Perplexity describe, cite, or skip your brand on buyer-intent prompts."
        form={
          <form onSubmit={handleSubmit} className="flex w-full items-center gap-2 rounded-lg border border-[#2563eb]/25 bg-white p-1.5 shadow-sm">
            <Globe className="ml-2 h-4 w-4 text-muted-foreground" aria-hidden />
            <input
              type="text"
              placeholder="Enter your domain (e.g. signalor.ai)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button type="submit" className="shrink-0 rounded-md bg-[#2563eb] px-4 text-xs font-semibold text-white hover:brightness-110">
              Check AI
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </form>
        }
        features={[
          { title: "4 AI engines", description: "ChatGPT, Claude, Gemini, and Perplexity checked in parallel against the same brand prompts." },
          { title: "Mention share", description: "See whether models name you, cite you, paraphrase you, or leave you out entirely." },
          { title: "Sentiment read", description: "Positive, neutral, negative—catch brand drift before it shapes buyer choice." },
          { title: "Exportable", description: "Download a one-pager summary to paste into slides and reviews." },
        ]}
        previewEyebrow="[ what you see ]"
        previewTitle="Sample LLM"
        previewTitleAccent="visibility report"
        previewDescription="The free tool surfaces the first engine's response. Unlock the full 4-engine comparison, sentiment tagging, and prompt trend lines on a paid plan."
        previewRows={[
          { content: <PreviewChat /> },
          { content: <PreviewOtherEngines />, locked: true },
          { content: <PreviewSentiment />, locked: true },
        ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}

function PreviewChat() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-emerald-600 text-[10px] font-bold text-white">C</span>
        <p className="text-sm font-semibold text-foreground">ChatGPT · brand prompt</p>
        <span className="ml-auto text-[11px] text-muted-foreground">Sampled · 2h ago</span>
      </div>
      <p className="mt-3 rounded-2xl rounded-bl-md bg-neutral-100 px-3.5 py-2.5 text-[13px] text-neutral-700">
        Who are the best AI visibility tools for 2026?
      </p>
      <p className="mt-2 rounded-2xl rounded-br-md bg-neutral-900 px-3.5 py-2.5 text-[12px] font-medium leading-snug text-neutral-100">
        Top picks include <span className="font-semibold text-[#7aa9ff]">Signalor</span> for GEO scoring and fix queues, alongside a handful of SEO-adjacent platforms broadening into AI search coverage.
      </p>
    </div>
  );
}

function PreviewOtherEngines() {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Claude · Gemini · Perplexity</p>
      <p className="mt-1 text-xs text-muted-foreground">
        See how the other three engines describe your brand, with paraphrase & citation tagging per line.
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
