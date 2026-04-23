import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explorer",
  description:
    "Surface emerging prompts, citations, and competitor gaps — so your GEO roadmap stays ahead of the prompts buyers are starting to ask.",
};

export default function ExplorerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
