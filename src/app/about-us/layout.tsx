import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Meet the team building Signalor — operators making AI search visibility, citations, and GEO measurable for modern brands.",
  // Canonical points to /about so duplicate spelling does not split SEO.
  path: "/about",
});

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
