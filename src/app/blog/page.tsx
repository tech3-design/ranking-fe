"use client";

import Link from "next/link";
import { ArrowRight, Clock, Mail } from "lucide-react";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { HeroBackgroundGrid } from "@/components/landing/hero-background-grid";
import { ScreenHR } from "@/components/ui/intersection-diamonds";
import { BlogStackIllustration } from "@/components/blog/blog-stack-illustration";
import {
  BLOG_CATEGORIES,
  BLOG_FEATURED,
  BLOG_NEWSLETTER,
  BLOG_POSTS,
  BLOG_STATS,
  type BlogPost,
} from "@/lib/landing-blog-content";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const CATEGORY_TONE: Record<BlogPost["category"], { bg: string; fg: string }> = {
  Playbooks: { bg: "bg-amber-100", fg: "text-amber-800" },
  "AI visibility": { bg: "bg-[#2563eb]/10", fg: "text-[#2563eb]" },
  Product: { bg: "bg-primary/10", fg: "text-primary" },
  Research: { bg: "bg-violet-100", fg: "text-violet-700" },
  Guides: { bg: "bg-emerald-100", fg: "text-emerald-700" },
};

export default function BlogPage() {
  return (
    <LandingMarketingShell>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-background px-6 pb-14 pt-14 lg:px-12 lg:pb-16 lg:pt-16">
        <HeroBackgroundGrid />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-5">
          <div className="md:col-span-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
              [ blog · playbooks · research ]
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem] xl:text-5xl">
              Field notes on{" "}
              <span className="relative whitespace-nowrap text-[#b45309]">
                AI search visibility
                <span
                  className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-[#b45309]/45"
                  aria-hidden
                />
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
              Playbooks, research, and honest guides on GEO, citation attribution, llms.txt,
              and the schemas that actually move the needle — written by operators shipping
              Signalor every day.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold text-foreground">
                All posts
              </span>
              {BLOG_CATEGORIES.map((c) => (
                <span
                  key={c}
                  className={cn(
                    "inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-neutral-50 hover:text-foreground",
                  )}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden md:col-span-2 md:block">
            <BlogStackIllustration />
          </div>
        </div>
      </section>

      <ScreenHR />

      {/* ─── Featured post ───────────────────────────────────────────── */}
      <section className="relative bg-background px-6 py-14 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
            [ featured ]
          </p>
          <h2 className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]">
            This week&apos;s{" "}
            <span className="relative whitespace-nowrap text-[#b45309]">
              must-read
              <span
                className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-[#b45309]/45"
                aria-hidden
              />
            </span>
          </h2>
        </div>

        <FeaturedCard post={BLOG_FEATURED} />
      </section>

      <ScreenHR />

      {/* ─── Posts grid ──────────────────────────────────────────────── */}
      <section className="relative bg-background px-6 py-14 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
            [ latest posts ]
          </p>
          <h2 className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]">
            Fresh from the{" "}
            <span className="relative whitespace-nowrap text-[#b45309]">
              Signalor studio
              <span
                className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-[#b45309]/45"
                aria-hidden
              />
            </span>
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-7xl bg-black-10">
          <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-3 md:divide-x md:divide-y-0">
            {BLOG_POSTS.slice(0, 6).map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      <ScreenHR />

      {/* ─── Blog stats band ─────────────────────────────────────────── */}
      <section className="relative bg-background px-6 py-14 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
            [ in numbers ]
          </p>
          <h2 className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]">
            Honest output, no{" "}
            <span className="relative whitespace-nowrap text-[#b45309]">
              fluff posts
              <span
                className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-[#b45309]/45"
                aria-hidden
              />
            </span>
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-7xl bg-black-10">
          <div className="grid grid-cols-1 divide-y divide-black/6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {BLOG_STATS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col gap-2 bg-white px-6 py-10 md:px-8 md:py-12 lg:px-10"
              >
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
                <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground md:text-4xl">
                  {s.value}
                </p>
                <p className="text-sm font-light leading-snug text-muted-foreground">
                  {s.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ScreenHR />

      {/* ─── Newsletter CTA ──────────────────────────────────────────── */}
      <section className="relative bg-[var(--feature-amber-tint)] px-6 py-14 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#b45309]/70">
                [ newsletter ]
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl">
                {BLOG_NEWSLETTER.title}
              </h2>
              <p className="mt-5 max-w-xl text-base font-light leading-relaxed text-accent-foreground">
                {BLOG_NEWSLETTER.description}
              </p>
            </div>
            <form
              className="flex w-full items-center gap-2 rounded-sm border border-[#b45309]/30 bg-white p-1.5 shadow-sm lg:col-span-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <Mail className="ml-2 h-4 w-4 text-muted-foreground" aria-hidden />
              <input
                type="email"
                placeholder="you@domain.com"
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-sm bg-[#b45309] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
              >
                {BLOG_NEWSLETTER.cta}
                <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <LandingFooter />
    </LandingMarketingShell>
  );
}

function FeaturedCard({ post }: { post: BlogPost }) {
  const tone = CATEGORY_TONE[post.category];
  return (
    <div className="mx-auto mt-10 max-w-7xl">
      <Link
        href={`/blog/${post.slug}`}
        className="group block overflow-hidden rounded-sm border border-black/6 bg-white shadow-sm transition hover:shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-5">
          <div className="relative flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100/40 p-8 md:col-span-2 md:p-10">
            <BlogStackIllustration />
          </div>
          <div className="flex flex-col justify-center gap-4 border-t border-black/6 p-8 md:col-span-3 md:border-l md:border-t-0 md:p-10">
            <div className="flex items-center gap-2">
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
                {post.readingMinutes} min
              </span>
              <span className="text-[11px] text-muted-foreground">
                · {formatDate(post.publishedAt)}
              </span>
            </div>
            <h3 className="text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
              {post.title}
            </h3>
            <p className="max-w-2xl text-[15px] font-light leading-relaxed text-accent-foreground">
              {post.excerpt}
            </p>
            <div className="mt-2 flex items-center gap-3 border-t border-black/5 pt-4">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#b45309] to-amber-400" />
              <div>
                <p className="text-[13px] font-semibold text-foreground">{post.author}</p>
                <p className="text-[11px] text-muted-foreground">{post.authorRole}</p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#b45309] transition group-hover:translate-x-0.5">
                Read the playbook
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  const tone = CATEGORY_TONE[post.category];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-4 bg-white px-6 py-10 transition hover:bg-neutral-50/70 md:px-8 md:py-12 lg:px-10"
    >
      <div className="flex items-center gap-2">
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
          {post.readingMinutes} min
        </span>
      </div>
      <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground md:text-xl">
        {post.title}
      </h3>
      <p className="max-w-sm text-sm font-light leading-relaxed text-muted-foreground md:text-[15px]">
        {post.excerpt}
      </p>
      <div className="mt-auto flex items-center gap-2 pt-2 text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground">{post.author}</span>
        <span>·</span>
        <span>{formatDate(post.publishedAt)}</span>
        <ArrowRight className="ml-auto h-3.5 w-3.5 text-[#b45309] opacity-0 transition group-hover:opacity-100" />
      </div>
    </Link>
  );
}
