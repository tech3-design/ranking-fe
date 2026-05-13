import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";
import { REPORTING_FAQ } from "@/lib/landing-reporting-content";

export const metadata: Metadata = buildMetadata({
  title: "Explorer, emerging AI prompts and citations",
  description:
    "Surface emerging prompts, citations, and competitor gaps so your GEO roadmap stays ahead of the questions buyers are starting to ask AI.",
  path: "/explorer",
});

export default function ExplorerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-explorer-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Explorer", path: "/explorer" },
        ])}
      />
      <JsonLd id="ld-explorer-faq" data={faqJsonLd([...REPORTING_FAQ])} />
      {children}
    </>
  );
}
