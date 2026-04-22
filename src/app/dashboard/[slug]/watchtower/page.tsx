import type { Metadata } from "next";
import { SchemaWatchPanel } from "@/components/analyzer/schema-watch-panel";

export const metadata: Metadata = {
  title: "Schema Watchtower · Signalor",
  description: "Catch broken Product, Article, and FAQ structured data before AI assistants stop citing you.",
};

export default async function WatchtowerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SchemaWatchPanel slug={slug} />;
}
