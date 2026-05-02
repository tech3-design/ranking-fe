import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free competitor analysis for AI search",
  description:
    "Paste your domain and rank the brands buyers actually compare you against — pulled from live 'vs' and 'alternatives' autocomplete and AI co-mentions. Free, no sign-up.",
  path: "/tools/competitors-analysis",
});

const competitorsToolJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Signalor Competitor Analysis",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/tools/competitors-analysis`,
  description:
    "Free competitor analysis for AI search. Ranks brands by co-mention frequency in live autocomplete and AI answer citations.",
  publisher: { "@id": `${SITE_URL}#organization` },
};

export default function CompetitorsAnalysisLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-competitors-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools/competitors-analysis" },
          { name: "Competitor analysis", path: "/tools/competitors-analysis" },
        ])}
      />
      <JsonLd id="ld-competitors-tool" data={competitorsToolJsonLd} />
      {children}
    </>
  );
}
