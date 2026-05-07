import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";
import { CONTENT_SIGNALS_FAQ } from "@/lib/landing-content-signals-content";

export const metadata: Metadata = buildMetadata({
  title: "AI visibility tracking",
  description:
    "Score how AI engines see, cite, and recommend your brand across ChatGPT, Claude, Gemini, Perplexity, and Google AI Overviews. Track presence over time and lift it with prioritized fixes.",
  path: "/ai-visibility",
});

export default function AiVisibilityLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-ai-visibility-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "AI visibility", path: "/ai-visibility" },
        ])}
      />
      <JsonLd id="ld-ai-visibility-faq" data={faqJsonLd([...CONTENT_SIGNALS_FAQ])} />
      {children}
    </>
  );
}
