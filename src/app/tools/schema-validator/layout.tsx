import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free Schema Validator",
  description:
    "Validate JSON-LD, Microdata, and RDFa structured data on any page. Spot missing types and required properties for richer AI citations.",
  path: "/tools/schema-validator",
  keywords: [
    "schema validator",
    "JSON-LD validator",
    "structured data testing",
    "rich results",
    "schema.org",
    "free SEO tool",
  ],
});

export default function SchemaValidatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
