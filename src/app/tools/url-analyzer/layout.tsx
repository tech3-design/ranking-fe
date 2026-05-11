import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free URL analyzer — GEO + AI visibility score",
  description:
    "Paste any URL and get a free GEO score, citation signals, and the top three fixes — across ChatGPT, Claude, Gemini, Perplexity, and Google AI. No sign-up required.",
  path: "/tools/url-analyzer",
});

const urlAnalyzerJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Signalor URL Analyzer",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/tools/url-analyzer`,
  description:
    "Free GEO and AEO score for any public URL. Reports citation signals across ChatGPT, Claude, Gemini, Perplexity, and Google AI.",
  publisher: { "@id": `${SITE_URL}#organization` },
};

export default function UrlAnalyzerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-url-analyzer-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools/url-analyzer" },
          { name: "URL analyzer", path: "/tools/url-analyzer" },
        ])}
      />
      <JsonLd id="ld-url-analyzer-tool" data={urlAnalyzerJsonLd} />
      {children}
    </>
  );
}
