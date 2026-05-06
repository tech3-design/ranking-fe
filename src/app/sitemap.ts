import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

type Route = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const PUBLIC_ROUTES: Route[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.7 },
  { path: "/blog", changeFrequency: "daily", priority: 0.9 },
  { path: "/ai-visibility", changeFrequency: "weekly", priority: 0.8 },
  { path: "/recommendations", changeFrequency: "weekly", priority: 0.7 },
  { path: "/prompt-tracking", changeFrequency: "weekly", priority: 0.8 },
  { path: "/prompt-tracking/ai-surfaces", changeFrequency: "weekly", priority: 0.7 },
  { path: "/prompt-tracking/prompt-library", changeFrequency: "weekly", priority: 0.7 },
  { path: "/integration", changeFrequency: "monthly", priority: 0.7 },
  { path: "/integration/shopify", changeFrequency: "monthly", priority: 0.6 },
  { path: "/integration/wordpress", changeFrequency: "monthly", priority: 0.6 },
  { path: "/tools/competitors-analysis", changeFrequency: "weekly", priority: 0.7 },
  { path: "/tools/llms-check", changeFrequency: "weekly", priority: 0.7 },
  { path: "/tools/schema-validator", changeFrequency: "weekly", priority: 0.7 },
  { path: "/tools/url-analyzer", changeFrequency: "weekly", priority: 0.7 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PUBLIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
