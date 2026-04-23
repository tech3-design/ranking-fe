import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Playbooks, research, and guides on GEO, AI search visibility, and citation attribution — written by operators who run Signalor every day.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
