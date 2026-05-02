import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free Schema.org validator — JSON-LD coverage check",
  description:
    "Paste any URL and Signalor scans the page for Organization, Product, Article, FAQ, HowTo, BreadcrumbList, and other Schema.org JSON-LD — flagging missing, partial, or malformed entries.",
  path: "/tools/schema-validator",
});

const schemaValidatorJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Signalor Schema Validator",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/tools/schema-validator`,
  description:
    "Free Schema.org JSON-LD validator. Checks Organization, Product, Article, FAQ, HowTo, BreadcrumbList, and other types for completeness and validity.",
  publisher: { "@id": `${SITE_URL}#organization` },
};

export default function SchemaValidatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-schema-validator-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools/schema-validator" },
          { name: "Schema validator", path: "/tools/schema-validator" },
        ])}
      />
      <JsonLd id="ld-schema-validator-tool" data={schemaValidatorJsonLd} />
      {children}
    </>
  );
}
