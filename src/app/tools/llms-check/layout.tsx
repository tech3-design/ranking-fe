import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free LLM Readiness Checker",
  description:
    "Check llms.txt, AI-bot rules in robots.txt, sitemap reachability, and on-page schema. Get a free LLM-readiness score for any domain.",
  path: "/tools/llms-check",
  keywords: [
    "llms.txt",
    "LLM readiness",
    "AI crawler check",
    "GPTBot",
    "ClaudeBot",
    "PerplexityBot",
    "Google-Extended",
    "robots.txt AI",
    "free SEO tool",
  ],
});

export default function LlmsCheckLayout({ children }: { children: React.ReactNode }) {
  return children;
}
