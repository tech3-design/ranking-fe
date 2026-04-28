import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Explorer — emerging AI prompts and citations",
  description:
    "Surface emerging prompts, citations, and competitor gaps so your GEO roadmap stays ahead of the questions buyers are starting to ask AI.",
  path: "/explorer",
});

export default function ExplorerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
