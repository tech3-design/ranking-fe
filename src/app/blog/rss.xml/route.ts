import { NextResponse } from "next/server";
import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const FEED_QUERY = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) [0...50] {
    "slug": slug.current,
    title,
    excerpt,
    publishedAt,
    "updatedAt": _updatedAt,
    author,
    category
  }
`;

type FeedPost = {
  slug: string;
  title?: string;
  excerpt?: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
  category?: string;
};

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await client
    .fetch<FeedPost[]>(FEED_QUERY)
    .catch(() => [] as FeedPost[]);

  const updated = posts[0]?.updatedAt ?? posts[0]?.publishedAt ?? new Date().toISOString();

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date().toUTCString();
      const title = escapeXml(post.title ?? post.slug);
      const description = escapeXml(post.excerpt ?? "");
      const author = "Signalor";
      const category = post.category ? `<category>${escapeXml(post.category)}</category>` : "";
      return `    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <dc:creator>${author}</dc:creator>
      ${category}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Signalor Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Playbooks, research, and guides on Generative Engine Optimization (GEO), Answer Engine Optimization (AEO), and AI search visibility.</description>
    <language>en</language>
    <lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
