import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About Signalor",
  description:
    "Signalor helps brands understand and improve how they appear in AI-driven search. Learn what we build, who it's for, and the team behind the GEO + AEO platform.",
  path: "/about-us",
});

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Signalor",
  description:
    "Signalor helps brands understand and improve how they appear in AI-driven search.",
  mainEntity: { "@id": "https://signalor.ai#organization" },
};

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-about-us-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about-us" },
        ])}
      />
      <JsonLd id="ld-about-us-page" data={aboutJsonLd} />
      {children}
    </>
  );
}
