import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/seo";

const ROUTES: ReadonlyArray<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/ai-visibility", changeFrequency: "weekly", priority: 0.9 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/explorer", changeFrequency: "weekly", priority: 0.8 },
  { path: "/recommendations", changeFrequency: "weekly", priority: 0.8 },
  { path: "/prompt-tracking", changeFrequency: "weekly", priority: 0.8 },
  { path: "/integration", changeFrequency: "monthly", priority: 0.8 },
  { path: "/integration/shopify", changeFrequency: "monthly", priority: 0.7 },
  { path: "/integration/wordpress", changeFrequency: "monthly", priority: 0.7 },
  { path: "/tools/llms-check", changeFrequency: "monthly", priority: 0.8 },
  { path: "/tools/url-analyzer", changeFrequency: "monthly", priority: 0.8 },
  { path: "/tools/schema-validator", changeFrequency: "monthly", priority: 0.8 },
  { path: "/tools/competitors-analysis", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
