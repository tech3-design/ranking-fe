import { NextResponse } from "next/server";
import { groq } from "next-sanity";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

// Bypass the CDN so newly published posts appear immediately
const freshClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

const QUERY = groq`*[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc)[0...3] {
  "slug": slug.current,
  title,
  publishedAt
}`;

// Revalidate every 30 seconds so a fresh publish shows up quickly
export const revalidate = 30;

export async function GET() {
  try {
    const posts = await freshClient.fetch(QUERY, {}, { cache: "no-store" });
    return NextResponse.json(posts ?? [], {
      headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json([]);
  }
}
