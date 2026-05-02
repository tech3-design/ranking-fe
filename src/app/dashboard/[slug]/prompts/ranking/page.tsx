import type { Metadata } from "next";
import { RankTrackerShell } from "@/components/analyzer/rank-tracker-shell";

export const metadata: Metadata = {
  title: "Ranking · Signalor",
  description:
    "See what's ranking in Google, Reddit, Quora, and across AI models for queries tailored to your brand.",
};

export default async function RankingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <RankTrackerShell slug={slug} />;
}
