import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Clock } from "lucide-react";

import { client } from "@/sanity/lib/client";
import {
  POST_BY_SLUG_QUERY,
  ALL_POST_SLUGS_QUERY,
  type SanityBlogPost,
} from "@/sanity/lib/queries";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { LandingFooter } from "@/components/landing/landing-footer";
import { HeroBackgroundGrid } from "@/components/landing/hero-background-grid";
import { ScreenHR } from "@/components/ui/intersection-diamonds";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildMetadata,
  breadcrumbJsonLd,
  articleJsonLd,
  SITE_URL,
} from "@/lib/seo";
import type { BlogPost } from "@/lib/landing-blog-content";
import { cn } from "@/lib/utils";

export const revalidate = 60;

// ─── Static params (pre-render known slugs) ───────────────────────────────────

export async function generateStaticParams() {
  const slugs = await client
    .fetch<Array<{ slug: string }>>(ALL_POST_SLUGS_QUERY)
    .catch(() => [] as Array<{ slug: string }>);
  return slugs.map(({ slug }) => ({ blog_id: slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ blog_id: string }>;
}): Promise<Metadata> {
  const { blog_id } = await params;
  const post = await client
    .fetch<SanityBlogPost | null>(POST_BY_SLUG_QUERY, { slug: blog_id })
    .catch(() => null);

  if (!post) {
    return buildMetadata({ title: "Post Not Found", path: "/blog", noindex: true });
  }

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    ogType: "article",
  });
}

// ─── Category colours (mirrors blog listing page) ────────────────────────────

const CATEGORY_TONE: Record<BlogPost["category"], { bg: string; fg: string }> = {
  Playbooks: { bg: "bg-amber-100", fg: "text-amber-800" },
  "AI visibility": { bg: "bg-[#2563eb]/10", fg: "text-[#2563eb]" },
  Product: { bg: "bg-primary/10", fg: "text-primary" },
  Research: { bg: "bg-violet-100", fg: "text-violet-700" },
  Guides: { bg: "bg-emerald-100", fg: "text-emerald-700" },
};

function formatDate(iso: string) {
  const normalized = iso.length === 10 ? iso + "T00:00:00" : iso;
  return new Date(normalized).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Portable Text renderer ───────────────────────────────────────────────────
// Handles: normal, h1–h4, blockquote, bullet lists, strong, em, link, image

type PTSpan = {
  _type: "span";
  _key?: string;
  text: string;
  marks?: string[];
};

type PTMarkDef = {
  _key: string;
  _type: string;
  href?: string;
};

type PTBlock = {
  _type: "block";
  _key?: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: PTSpan[];
  markDefs?: PTMarkDef[];
};

type PTImage = {
  _type: "image";
  _key?: string;
  asset?: { _ref?: string; url?: string };
  alt?: string;
};

type PTValue = PTBlock | PTImage;

function renderSpan(
  span: PTSpan,
  markDefs: PTMarkDef[],
  key: string | number,
): React.ReactNode {
  const marks = span.marks ?? [];
  let node: React.ReactNode = span.text;

  for (const mark of marks) {
    if (mark === "strong") {
      node = <strong key={key}>{node}</strong>;
    } else if (mark === "em") {
      node = <em key={key}>{node}</em>;
    } else {
      const def = markDefs.find((d) => d._key === mark);
      if (def?._type === "link" && def.href) {
        node = (
          <a
            key={key}
            href={def.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#b45309] underline underline-offset-2 hover:brightness-110"
          >
            {node}
          </a>
        );
      }
    }
  }

  return node;
}

function renderBlock(block: PTBlock, idx: number): React.ReactNode {
  const markDefs = block.markDefs ?? [];
  const children = (block.children ?? []).map((span, i) =>
    renderSpan(span, markDefs, `${idx}-${i}`),
  );

  if (block.listItem === "bullet") {
    return (
      <li key={block._key ?? idx} className="ml-5 list-disc text-[15px] leading-relaxed text-foreground/80">
        {children}
      </li>
    );
  }

  switch (block.style) {
    case "h1":
      return <h1 key={block._key ?? idx} className="mt-10 mb-4 text-3xl font-bold tracking-tight text-foreground">{children}</h1>;
    case "h2":
      return <h2 key={block._key ?? idx} className="mt-8 mb-3 text-2xl font-bold tracking-tight text-foreground">{children}</h2>;
    case "h3":
      return <h3 key={block._key ?? idx} className="mt-6 mb-2.5 text-xl font-semibold tracking-tight text-foreground">{children}</h3>;
    case "h4":
      return <h4 key={block._key ?? idx} className="mt-5 mb-2 text-lg font-semibold text-foreground">{children}</h4>;
    case "blockquote":
      return (
        <blockquote
          key={block._key ?? idx}
          className="my-6 border-l-4 border-[#b45309]/40 pl-5 text-[15px] italic leading-relaxed text-foreground/70"
        >
          {children}
        </blockquote>
      );
    default:
      return (
        <p key={block._key ?? idx} className="my-4 text-[15px] leading-relaxed text-foreground/80">
          {children}
        </p>
      );
  }
}

function PortableTextContent({ value }: { value: PTValue[] }) {
  const nodes: React.ReactNode[] = [];
  let listBuffer: PTBlock[] = [];

  function flushList() {
    if (listBuffer.length === 0) return;
    nodes.push(
      <ul key={`list-${nodes.length}`} className="my-4 space-y-1">
        {listBuffer.map((b, i) => renderBlock(b, i))}
      </ul>,
    );
    listBuffer = [];
  }

  for (let i = 0; i < value.length; i++) {
    const block = value[i];

    if (block._type === "block") {
      const b = block as PTBlock;
      if (b.listItem === "bullet") {
        listBuffer.push(b);
        continue;
      }
      flushList();
      nodes.push(renderBlock(b, i));
    } else if (block._type === "image") {
      flushList();
      const img = block as PTImage;
      const src = img.asset?.url;
      if (src) {
        nodes.push(
          <figure key={img._key ?? i} className="my-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={img.alt ?? ""}
              className="w-full rounded-sm border border-black/6 object-cover shadow-sm"
            />
            {img.alt && (
              <figcaption className="mt-2 text-center text-[11px] text-muted-foreground">
                {img.alt}
              </figcaption>
            )}
          </figure>,
        );
      }
    }
  }

  flushList();
  return <>{nodes}</>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ blog_id: string }>;
}) {
  const { blog_id } = await params;
  const post = await client
    .fetch<SanityBlogPost | null>(POST_BY_SLUG_QUERY, { slug: blog_id })
    .catch(() => null);

  if (!post) notFound();

  const tone =
    CATEGORY_TONE[post.category as BlogPost["category"]] ??
    { bg: "bg-neutral-100", fg: "text-neutral-700" };

  const articleLd = articleJsonLd({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    datePublished: post.publishedAt,
    author: post.author,
  });

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  return (
    <LandingMarketingShell>
      <JsonLd id="ld-article" data={articleLd} />
      <JsonLd id="ld-article-breadcrumb" data={breadcrumbLd} />

      {/* ─── Hero ───────────────────────────────────────────────────── */}
      <section className="relative bg-background px-6 pb-12 pt-14 lg:px-12 lg:pb-14 lg:pt-16">
        <HeroBackgroundGrid />
        <div className="relative z-10 mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Blog
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                tone.bg,
                tone.fg,
              )}
            >
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {post.readingMinutes} min read
            </span>
            <span className="text-[11px] text-muted-foreground">
              · {formatDate(post.publishedAt)}
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[2.4rem]">
            {post.title}
          </h1>

          <p className="mt-4 text-base font-light leading-relaxed text-accent-foreground lg:text-[17px]">
            {post.excerpt}
          </p>

          <div className="mt-8 flex items-center gap-3 border-t border-black/6 pt-6">
            <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[#b45309] to-amber-400" />
            <div>
              <p className="text-[13px] font-semibold text-foreground">{post.author}</p>
              <p className="text-[11px] text-muted-foreground">{post.authorRole}</p>
            </div>
          </div>
        </div>
      </section>

      <ScreenHR />

      {/* ─── Body ───────────────────────────────────────────────────── */}
      <section className="bg-background px-6 py-12 lg:px-12 lg:py-14">
        <div className="mx-auto max-w-3xl">
          {post.coverImage?.url && (
            <figure className="mb-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage.url}
                alt={post.coverImage.alt ?? post.title}
                className="w-full rounded-sm border border-black/6 object-cover shadow-sm"
                style={{ maxHeight: "480px" }}
              />
            </figure>
          )}
          {post.body && post.body.length > 0 ? (
            <PortableTextContent value={post.body as PTValue[]} />
          ) : (
            <p className="text-[15px] italic text-muted-foreground">
              Full article content coming soon.
            </p>
          )}
        </div>
      </section>

      <ScreenHR />

      {/* ─── Back link ──────────────────────────────────────────────── */}
      <section className="bg-background px-6 pb-14 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-sm border border-black/10 bg-white px-4 py-2 text-[12px] font-semibold text-foreground shadow-sm transition hover:bg-neutral-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All posts
          </Link>
        </div>
      </section>

      <LandingFooter />
    </LandingMarketingShell>
  );
}
