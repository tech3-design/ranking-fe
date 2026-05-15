import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";
import { INTEGRATIONS_FAQ } from "@/lib/landing-integrations-feature-content";

export const metadata: Metadata = buildMetadata({
  title: "Recommendations, prioritized GEO fixes",
  description:
    "Prioritized fixes ranked by impact on your GEO score and AI citations, schema, structure, content, and trust signals in one queue you can ship from.",
  path: "/recommendations",
});

export default function RecommendationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-recommendations-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Recommendations", path: "/recommendations" },
        ])}
      />
      <JsonLd id="ld-recommendations-faq" data={faqJsonLd([...INTEGRATIONS_FAQ])} />
      {children}
    </>
  );
}
