import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free llms.txt checker — LLM readiness score",
  description:
    "Enter a domain and Signalor checks llms.txt, robots.txt rules for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, sitemap, and on-page schema — an honest LLM-readiness score.",
  path: "/tools/llms-check",
});

const llmsCheckJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Signalor llms.txt Checker",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/tools/llms-check`,
  description:
    "Free llms.txt validator. Verifies the llms.txt manifest, AI crawler rules in robots.txt (GPTBot, ClaudeBot, PerplexityBot, Google-Extended), sitemap presence, and on-page schema.",
  publisher: { "@id": `${SITE_URL}#organization` },
};

export default function LlmsCheckLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-llms-check-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools/llms-check" },
          { name: "llms.txt checker", path: "/tools/llms-check" },
        ])}
      />
      <JsonLd id="ld-llms-check-tool" data={llmsCheckJsonLd} />
      {children}
    </>
  );
}
