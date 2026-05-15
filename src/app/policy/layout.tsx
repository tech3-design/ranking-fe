import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy policy",
  description:
    "How Signalor handles user, account, and crawl data. Plain-English overview of what we collect, why, and your rights.",
  path: "/policy",
});

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-privacy-policy-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy policy", path: "/policy" },
        ])}
      />
      {children}
    </>
  );
}
