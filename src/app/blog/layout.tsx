import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, SITE_BRAND, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Blog — GEO playbooks, AI visibility research",
  description:
    "Playbooks, research, and guides on GEO, AI search visibility, citation attribution, llms.txt, and the schemas that move the needle — written by operators shipping Signalor every day.",
  path: "/blog",
});

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: `${SITE_BRAND} Blog`,
  url: `${SITE_URL}/blog`,
  description:
    "Playbooks, research, and guides on GEO, AI search visibility, citation attribution, and Schema.org.",
  publisher: { "@id": `${SITE_URL}#organization` },
  inLanguage: "en-US",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-blog-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
      <JsonLd id="ld-blog" data={blogJsonLd} />
      {children}
    </>
  );
}
