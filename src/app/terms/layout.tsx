import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms and conditions",
  description:
    "The terms of service governing the use of Signalor.ai, including subscription, acceptable use, and liability terms.",
  path: "/terms",
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-terms-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Terms and conditions", path: "/terms" },
        ])}
      />
      {children}
    </>
  );
}
