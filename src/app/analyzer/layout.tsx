import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Analyzer",
  path: "/analyzer",
  noindex: true,
});

export default function AnalyzerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
