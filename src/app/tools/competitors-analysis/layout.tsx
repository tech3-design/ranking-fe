import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free Competitor Analysis",
  description:
    "Compare your AI visibility, citations, and GEO score against competitors across ChatGPT, Claude, Gemini, and Perplexity.",
  path: "/tools/competitors-analysis",
  keywords: [
    "competitor analysis",
    "AI visibility benchmark",
    "share of voice",
    "GEO competitive",
    "ChatGPT mentions",
    "free SEO tool",
  ],
});

export default function CompetitorsAnalysisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
