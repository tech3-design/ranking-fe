import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms and Conditions",
  description:
    "The terms governing your use of Signalor's GEO and AI visibility platform, products, and services.",
  // Canonical points to /terms-and-conditions to avoid duplicate-content split.
  path: "/terms-and-conditions",
});

export default function TermsAliasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
