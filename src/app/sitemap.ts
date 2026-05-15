import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";

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
  { path: "/policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

const BLOG_POSTS_FOR_SITEMAP = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    "slug": slug.current,
    "lastModified": coalesce(_updatedAt, publishedAt)
  }
`;

type BlogPostEntry = { slug: string; lastModified: string };

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const posts = await client
    .fetch<BlogPostEntry[]>(BLOG_POSTS_FOR_SITEMAP)
    .catch(() => [] as BlogPostEntry[]);

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.lastModified ? new Date(p.lastModified) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...postEntries];
}
