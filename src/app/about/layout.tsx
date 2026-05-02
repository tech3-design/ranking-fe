import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About Signalor",
  description:
    "Signalor helps brands understand and improve how they appear in AI-driven search. Learn what we build, who it's for, and the team behind the GEO + AEO platform.",
  path: "/about",
});

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Signalor",
  description:
    "Signalor helps brands understand and improve how they appear in AI-driven search.",
  mainEntity: { "@id": "https://signalor.ai#organization" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-about-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <JsonLd id="ld-about-page" data={aboutJsonLd} />
      {children}
    </>
  );
}
