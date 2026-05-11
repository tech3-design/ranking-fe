import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Analyzer",
  description: "Run and review GEO analysis runs in your Signalor workspace.",
  noindex: true,
});

export default function AnalyzerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
