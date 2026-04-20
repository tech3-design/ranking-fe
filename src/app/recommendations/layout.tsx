import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recommendations",
  description:
    "Prioritized fixes ranked by impact on your GEO score and citations — schema, structure, content, and trust signals in one queue.",
};

export default function RecommendationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
