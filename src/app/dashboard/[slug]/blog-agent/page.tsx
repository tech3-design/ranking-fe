"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  Loader2,
  RefreshCw,
  Send,
  Trash2,
  X,
} from "@/components/icons";
import { useRun } from "../_components/run-context";
import {
  getBlogPosts,
  generateBlogDraft,
  publishBlogDraft,
  deleteBlogPost,
  type BlogDraft,
  type BlogPostsResponse,
} from "@/lib/api/integrations";
import { cn } from "@/lib/utils";

type Step = "generate" | "preview";
type Tone = "informative" | "conversational" | "authoritative" | "educational";

const TONES: { value: Tone; label: string }[] = [
  { value: "informative", label: "Informative" },
  { value: "conversational", label: "Conversational" },
  { value: "authoritative", label: "Authoritative" },
  { value: "educational", label: "Educational" },
];

const WORD_COUNTS = [
  { label: "Short (~500 words)", value: 500 },
  { label: "Medium (~800 words)", value: 800 },
  { label: "Long (~1 200 words)", value: 1200 },
];

function formatDate(iso: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function extractErrorMessage(err: unknown): string {
  const e = err as { response?: { data?: { error?: string } }; message?: string };
  return e?.response?.data?.error ?? e?.message ?? "Something went wrong. Please try again.";
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
      {children}
    </label>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md bg-red-50 px-3 py-2.5 text-xs text-red-700">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {message}
    </div>
  );
}

// ─── Create panel (Write yourself + Generate with AI) ────────────────────────

type CreateMode = "manual" | "ai";

function textToHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function CreatePanel({
  onGenerate,
  onManual,
}: {
  onGenerate: (topic: string, tone: Tone, wordCount: number) => Promise<void>;
  onManual: (draft: BlogDraft) => void;
}) {
  const [mode, setMode] = useState<CreateMode>("manual");

  // AI mode state
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("informative");
  const [wordCount, setWordCount] = useState(800);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Manual mode state
  const [manTitle, setManTitle] = useState("");
  const [manContent, setManContent] = useState("");
  const [manMeta, setManMeta] = useState("");
  const [manTags, setManTags] = useState("");

  async function handleAiSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAiError(null);
    setAiLoading(true);
    try {
      await onGenerate(topic.trim(), tone, wordCount);
    } catch (err) {
      setAiError(extractErrorMessage(err));
    } finally {
      setAiLoading(false);
    }
  }

  function handleManualContinue(e: React.FormEvent) {
    e.preventDefault();
    const title = manTitle.trim();
    const raw = manContent.trim();
    if (!title || !raw) return;
    onManual({
      title,
      slug: slugify(title),
      meta_description: manMeta.trim(),
      tags: manTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      content_html: textToHtml(raw),
    });
  }

  return (
    <SectionCard>
      {/* Mode toggle */}
      <div className="mb-5 flex gap-1 rounded-lg border border-black/[0.07] bg-neutral-50 p-1">
        {(["manual", "ai"] as CreateMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition-colors",
              mode === m
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m === "manual" ? (
              <>
                <svg
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden
                >
                  <path d="M2 12.5V14h1.5l7-7L9 5.5l-7 7zM13.7 4.3a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0l-1.1 1.1 3 3 1.1-1.1z" />
                </svg>
                Write yourself
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden
                >
                  <path d="M8 1v3M8 12v3M1 8h3M12 8h3M3.5 3.5l2 2M10.5 10.5l2 2M3.5 12.5l2-2M10.5 5.5l2-2" />
                </svg>
                Generate with AI
              </>
            )}
          </button>
        ))}
      </div>

      {/* ── Manual mode ── */}
      {mode === "manual" && (
        <form onSubmit={handleManualContinue} className="space-y-3">
          <div>
            <FieldLabel>Title</FieldLabel>
            <input
              type="text"
              placeholder="Your blog post title"
              value={manTitle}
              onChange={(e) => setManTitle(e.target.value)}
              className="w-full rounded-md border border-black/[0.1] bg-white px-3 py-2 text-sm font-medium outline-none ring-offset-2 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <FieldLabel>Content</FieldLabel>
            <textarea
              placeholder={
                "Write your blog post here.\n\nSeparate paragraphs with a blank line. No HTML needed."
              }
              value={manContent}
              onChange={(e) => setManContent(e.target.value)}
              rows={14}
              className="w-full resize-y rounded-md border border-black/[0.1] bg-white px-3 py-2 text-sm leading-relaxed outline-none ring-offset-2 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              required
            />
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {manContent.trim().split(/\s+/).filter(Boolean).length} words · Blank lines create new
              paragraphs.
            </p>
          </div>

          <div>
            <FieldLabel>
              Meta description{" "}
              <span className="font-normal normal-case tracking-normal text-neutral-400">
                (optional)
              </span>
            </FieldLabel>
            <input
              type="text"
              placeholder="Short SEO summary under 155 chars"
              value={manMeta}
              onChange={(e) => setManMeta(e.target.value)}
              maxLength={155}
              className="w-full rounded-md border border-black/[0.1] bg-white px-3 py-2 text-sm outline-none ring-offset-2 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <FieldLabel>
              Tags{" "}
              <span className="font-normal normal-case tracking-normal text-neutral-400">
                (optional, comma-separated)
              </span>
            </FieldLabel>
            <input
              type="text"
              placeholder="seo, ai, content marketing"
              value={manTags}
              onChange={(e) => setManTags(e.target.value)}
              className="w-full rounded-md border border-black/[0.1] bg-white px-3 py-2 text-sm outline-none ring-offset-2 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={!manTitle.trim() || !manContent.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Continue to publish
          </button>
        </form>
      )}

      {/* ── AI mode ── */}
      {mode === "ai" && (
        <form onSubmit={handleAiSubmit} className="space-y-4">
          <div>
            <FieldLabel>Topic / Keyword</FieldLabel>
            <input
              type="text"
              placeholder="e.g. How AI search is changing B2B content marketing"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-md border border-black/[0.1] bg-white px-3 py-2 text-sm outline-none ring-offset-2 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Tone</FieldLabel>
              <div className="relative">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                  className="w-full appearance-none rounded-md border border-black/[0.1] bg-white px-3 py-2 pr-8 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-ring"
                >
                  {TONES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div>
              <FieldLabel>Length</FieldLabel>
              <div className="relative">
                <select
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full appearance-none rounded-md border border-black/[0.1] bg-white px-3 py-2 pr-8 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-ring"
                >
                  {WORD_COUNTS.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>

          {aiError && <ErrorNote message={aiError} />}

          <button
            type="submit"
            disabled={aiLoading || !topic.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {aiLoading ? "Generating, this may take 20–40 s…" : "Generate with AI"}
          </button>
        </form>
      )}
    </SectionCard>
  );
}

function PreviewPanel({
  draft,
  runSlug,
  onPublished,
  onDiscard,
}: {
  draft: BlogDraft;
  runSlug: string;
  onPublished: (result: { post_url: string; edit_url: string; status: string }) => void;
  onDiscard: () => void;
}) {
  const [title, setTitle] = useState(draft.title);
  const [metaDescription, setMetaDescription] = useState(draft.meta_description);
  const [slug, setSlug] = useState(draft.slug);
  const [tags, setTags] = useState<string[]>(draft.tags);
  const [tagInput, setTagInput] = useState("");
  const [contentHtml, setContentHtml] = useState(draft.content_html);
  const [publishStatus, setPublishStatus] = useState<"draft" | "publish">("draft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentMode, setContentMode] = useState<"edit" | "preview">("edit");

  function addTag() {
    const t = tagInput.trim().replace(/,+$/, "");
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  async function handlePublish() {
    setError(null);
    setLoading(true);
    try {
      const result = await publishBlogDraft(runSlug, {
        title,
        slug,
        meta_description: metaDescription,
        tags,
        content_html: contentHtml,
        status: publishStatus,
      });
      onPublished(result);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Review & publish</p>
          <button
            onClick={onDiscard}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← Generate new
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <FieldLabel>Title</FieldLabel>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-black/[0.1] bg-white px-3 py-2 text-sm font-medium outline-none ring-offset-2 focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <FieldLabel>URL slug</FieldLabel>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-md border border-black/[0.1] bg-neutral-50 px-3 py-2 font-mono text-xs outline-none ring-offset-2 focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <FieldLabel>Meta description</FieldLabel>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-md border border-black/[0.1] bg-white px-3 py-2 text-xs outline-none ring-offset-2 focus:ring-2 focus:ring-ring"
            />
            <p
              className={cn(
                "mt-0.5 text-[10px]",
                metaDescription.length > 155 ? "text-red-500" : "text-muted-foreground",
              )}
            >
              {metaDescription.length} / 155 chars
            </p>
          </div>

          <div>
            <FieldLabel>Tags</FieldLabel>
            <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-black/[0.1] bg-white p-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
                    className="ml-0.5 text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                  if (e.key === "Backspace" && !tagInput && tags.length) {
                    setTags((prev) => prev.slice(0, -1));
                  }
                }}
                placeholder={tags.length === 0 ? "Add tags…" : ""}
                className="min-w-[70px] flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Publish mode toggle */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(["draft", "publish"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setPublishStatus(s)}
              className={cn(
                "rounded-md border py-2 text-xs font-medium transition-colors",
                publishStatus === s
                  ? "border-foreground bg-foreground text-background"
                  : "border-black/[0.1] bg-white text-muted-foreground hover:border-black/20",
              )}
            >
              {s === "draft" ? "Save as draft" : "Publish live"}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-3">
            <ErrorNote message={error} />
          </div>
        )}

        <button
          type="button"
          onClick={handlePublish}
          disabled={loading || !title}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {loading
            ? "Publishing…"
            : `${publishStatus === "publish" ? "Publish" : "Save draft"} to WordPress`}
        </button>
      </SectionCard>

      {/* Content editor / preview */}
      <SectionCard>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Content</p>
          <div className="flex gap-1 rounded-md border border-black/[0.07] bg-neutral-50 p-0.5">
            {(["edit", "preview"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setContentMode(m)}
                className={cn(
                  "rounded px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors",
                  contentMode === m
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {contentMode === "edit" ? (
          <textarea
            value={contentHtml}
            onChange={(e) => setContentHtml(e.target.value)}
            rows={18}
            className="w-full resize-y rounded-md border border-black/[0.1] bg-neutral-50 px-3 py-2.5 font-mono text-xs leading-relaxed outline-none ring-offset-2 focus:ring-2 focus:ring-ring"
            placeholder="HTML content…"
          />
        ) : (
          <div
            className="prose prose-sm max-w-none text-foreground [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_li]:text-sm [&_li]:leading-relaxed [&_p]:text-sm [&_p]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        )}
      </SectionCard>
    </div>
  );
}

// ─── Recent posts sidebar ─────────────────────────────────────────────────────

function RecentPostsSidebar({
  wpData,
  runSlug,
  onPostDeleted,
}: {
  wpData: BlogPostsResponse;
  runSlug: string;
  onPostDeleted: (postId: number) => void;
}) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(postId: number) {
    setDeletingId(postId);
    try {
      await deleteBlogPost(runSlug, postId);
      onPostDeleted(postId);
    } catch {
      // silently ignore, post remains in list
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <SectionCard>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Stats, last 30 days
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {wpData.total_posts ?? 0}
            </p>
            <p className="text-[11px] text-muted-foreground">Total posts</p>
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {wpData.published_posts_30d ?? 0}
            </p>
            <p className="text-[11px] text-muted-foreground">Published</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Recent posts
          </p>
          {wpData.site_url && (
            <a
              href={wpData.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        {wpData.posts.length === 0 ? (
          <p className="text-xs text-muted-foreground">No posts found yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {wpData.posts.map((post) => (
              <li key={post.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{post.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDate(post.published_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {post.url && (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="text-muted-foreground hover:text-red-500 disabled:opacity-40"
                  >
                    {deletingId === post.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function HowItWorksSidebar() {
  const steps = [
    "Connect your WordPress site using an Application Password.",
    "Enter a topic and choose your preferred tone and post length.",
    "AI generates a full SEO-optimised blog post in seconds.",
    "Edit the title, meta description, and tags if needed.",
    "Publish live or save as a draft, directly from this page.",
  ];
  return (
    <SectionCard>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        How it works
      </p>
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-500">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}

function NotConnectedPanel({ slug, platform }: { slug: string; platform: Platform }) {
  const label = platform === "shopify" ? "Shopify" : "WordPress";
  return (
    <SectionCard>
      <div className="flex flex-col items-start gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Connect your blog to get started</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Blog publishing is set up during onboarding. Once your {label} is connected, drafts you
            generate here can be published in one click.
          </p>
        </div>
        <Link
          href={`/dashboard/${slug}/settings/integrations`}
          className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-[12px] font-semibold text-white shadow-sm hover:brightness-110"
        >
          Manage integrations
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </SectionCard>
  );
}

export default function BlogAgentPage() {
  const { slug } = useParams<{ slug: string }>();
  const { run } = useRun();

  const [step, setStep] = useState<Step>("generate");

  const [draft, setDraft] = useState<BlogDraft | null>(null);
  const [publishResult, setPublishResult] = useState<{
    post_url: string;
    edit_url: string;
    status: string;
  } | null>(null);

  const email = run?.email ?? "";
  const queryClient = useQueryClient();

  // Blog posts list cached by slug — survives tab switches via QueryClient.
  const { data: wpData, isLoading: wpLoading } = useQuery({
    queryKey: ["blog-posts", slug],
    enabled: !!slug,
    queryFn: () =>
      getBlogPosts(slug).catch(() => ({ connected: false, posts: [] }) as BlogPostsResponse),
  });

  const loadWpStatus = () => queryClient.invalidateQueries({ queryKey: ["blog-posts", slug] });

  const setWpData = (
    updater: (prev: BlogPostsResponse | null | undefined) => BlogPostsResponse | undefined,
  ) =>
    queryClient.setQueryData<BlogPostsResponse | undefined>(
      ["blog-posts", slug],
      (prev) => updater(prev) ?? prev,
    );

  async function handleGenerate(topic: string, tone: Tone, wordCount: number) {
    setPublishResult(null);
    const result = await generateBlogDraft(slug, topic, tone, wordCount);
    setDraft(result);
    setStep("preview");
  }

  function handleManual(manualDraft: BlogDraft) {
    setPublishResult(null);
    setDraft(manualDraft);
    setStep("preview");
  }

  function handlePostDeleted(postId: number) {
    setWpData((prev) => {
      if (!prev) return undefined;
      return {
        ...prev,
        posts: prev.posts.filter((p) => p.id !== postId),
        total_posts: Math.max(0, (prev.total_posts ?? 1) - 1),
      };
    });
  }

  if (wpLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isConnected = !!wpData?.connected;

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-5 lg:p-7">
      <div className="flex items-center justify-between rounded-lg border border-black/[0.07] bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isConnected ? "bg-emerald-500" : "bg-neutral-300",
            )}
          />
          <span className="text-sm font-medium text-foreground">
            {isConnected ? wpData?.site_name || "WordPress" : "WordPress not connected"}
          </span>
          {isConnected && wpData?.site_url && (
            <a
              href={wpData.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-[11px] text-muted-foreground hover:text-foreground sm:inline"
            >
              {wpData.site_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isConnected && (
            <button
              type="button"
              onClick={loadStatus}
              title="Refresh"
              className="rounded p-1 text-muted-foreground hover:bg-neutral-50 hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {publishResult && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div className="flex-1 text-sm text-emerald-800">
            <span className="font-semibold">
              {publishResult.status === "publish" ? "Published!" : "Saved as draft!"}
            </span>{" "}
            Your post is now on WordPress.
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            {publishResult.post_url && (
              <a
                href={publishResult.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 underline hover:text-emerald-900"
              >
                View post
              </a>
            )}
            {publishResult.edit_url && (
              <a
                href={publishResult.edit_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 underline hover:text-emerald-900"
              >
                Edit in WP
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setPublishResult(null);
              setDraft(null);
              setStep("generate");
            }}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_272px]">
        <div className="min-w-0 space-y-4">
          {!isConnected && <NotConnectedPanel slug={slug} />}

          {step === "generate" && isConnected && (
            <CreatePanel onGenerate={handleGenerate} onManual={handleManual} />
          )}

          {step === "preview" && draft && (
            <PreviewPanel
              draft={draft}
              runSlug={slug}
              onPublished={(result) => {
                setPublishResult(result);
                setDraft(null);
                setStep("generate");
                loadWpStatus();
              }}
              onDiscard={() => {
                setDraft(null);
                setStep("generate");
              }}
            />
          )}
        </div>

        <div>
          {isConnected && wpData ? (
            <RecentPostsSidebar wpData={wpData} runSlug={slug} onPostDeleted={handlePostDeleted} />
          ) : (
            <HowItWorksSidebar />
          )}
        </div>
      </div>
    </div>
  );
}
