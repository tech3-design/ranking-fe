import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms and Conditions",
  description:
    "The terms governing your use of Signalor's GEO and AI visibility platform, products, and services.",
  path: "/terms-and-conditions",
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
