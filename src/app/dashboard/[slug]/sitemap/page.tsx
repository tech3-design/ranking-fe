import type { Metadata } from "next";
import { SitemapAuditShell } from "@/components/analyzer/sitemap-audit-shell";

export const metadata: Metadata = {
  title: "Sitemap · Signalor",
  description: "Page-level audit of speed, structure, and AI readiness.",
};

export default async function SitemapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SitemapAuditShell slug={slug} />;
}
