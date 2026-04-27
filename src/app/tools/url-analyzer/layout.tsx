import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free URL Analyzer",
  description:
    "Analyze any URL for AI search readiness — meta tags, headings, structured data, performance, and crawlability. Free, no signup.",
  path: "/tools/url-analyzer",
  keywords: [
    "URL analyzer",
    "free SEO tool",
    "page audit",
    "meta tags checker",
    "structured data check",
    "AI readiness",
    "GEO audit",
  ],
});

export default function UrlAnalyzerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
