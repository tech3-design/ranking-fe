"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Loader2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Code2,
  FileText,
  ChevronDown,
  ChevronUp,
  Target,
} from "lucide-react";
import {
  generatePromptSchema,
  type PromptSchemaResponse,
  type PromptSchemaType,
  type PromptTrack,
} from "@/lib/api/analyzer";

type ActionKind = "generate" | "deeplink";

interface ActionDef {
  id: string;
  title: string;
  why: string;
  pillar: "Authority" | "Content" | "Structural";
  pillarWeight: string;
  impact: "high" | "medium" | "low";
  effort: string;
  kind: ActionKind;
  // For generate-kind actions:
  schemaType?: PromptSchemaType;
  // For deeplink-kind actions:
  href?: string;
  cta?: string;
}

const ACTIONS: ActionDef[] = [
  // ── Highest leverage first ────────────────────────────────────────────
  {
    id: "answer",
    title: "Direct-answer paragraph for this prompt",
    why: "AI engines lift verbatim answer paragraphs at the highest extraction rate. Generate one in your brand voice.",
    pillar: "Content",
    pillarWeight: "35%",
    impact: "high",
    effort: "5 min",
    kind: "generate",
    schemaType: "answer",
  },
  {
    id: "faq",
    title: "FAQPage JSON-LD with this prompt as the question",
    why: "Verbatim Q→A pairs with FAQPage schema dramatically increase the chance AI engines cite this page.",
    pillar: "Structural",
    pillarWeight: "25%",
    impact: "high",
    effort: "10 min",
    kind: "generate",
    schemaType: "faq",
  },
  {
    id: "buy_backlink",
    title: "Buy a backlink on a domain AI engines already cite for this prompt",
    why: "50+ referring domains is the threshold AI engines weight as authority. One quality link from a cited domain compounds.",
    pillar: "Authority",
    pillarWeight: "40%",
    impact: "high",
    effort: "5 min to order",
    kind: "deeplink",
    href: "/prompts/backlinks",
    cta: "Open marketplace",
  },
  {
    id: "article",
    title: "Article JSON-LD for the page targeting this prompt",
    why: "Article schema with proper author, datePublished, and mainEntity wires this prompt to the right page in AI's index.",
    pillar: "Structural",
    pillarWeight: "25%",
    impact: "medium",
    effort: "10 min",
    kind: "generate",
    schemaType: "article",
  },
  {
    id: "person",
    title: "Person JSON-LD for the author bylined on this page",
    why: "Verifiable author = strongest E-E-A-T signal. AI engines weight content with credentialed authors above unsigned content.",
    pillar: "Authority",
    pillarWeight: "40%",
    impact: "medium",
    effort: "10 min",
    kind: "generate",
    schemaType: "person",
  },
  {
    id: "organization",
    title: "Organization JSON-LD anchoring your brand on this topic",
    why: "Tells AI engines you're the canonical primary source for this prompt's topic — over aggregators that mention you.",
    pillar: "Authority",
    pillarWeight: "40%",
    impact: "medium",
    effort: "10 min",
    kind: "generate",
    schemaType: "organization",
  },
  {
    id: "free_outreach",
    title: "Pitch HARO / industry directories for this prompt's topic",
    why: "Free path to building the 50-RD threshold. Each accepted pitch becomes a high-trust referring domain.",
    pillar: "Authority",
    pillarWeight: "40%",
    impact: "medium",
    effort: "30 min",
    kind: "deeplink",
    href: "/prompts/backlinks",
    cta: "See free targets",
  },
  {
    id: "llms_txt",
    title: "Add the page targeting this prompt to llms.txt",
    why: "Emerging AI-only standard. Direct opt-in declaration of canonical content for AI engines that respect the spec.",
    pillar: "Authority",
    pillarWeight: "40%",
    impact: "low",
    effort: "5 min",
    kind: "deeplink",
    href: "/prompts/domain-authority",
    cta: "Open Domain authority",
  },
  {
    id: "wikipedia_targets",
    title: "Find Wikipedia articles where you could be cited as a source",
    why: "Wikipedia drives ~8% of AI citations. Adding your brand as a source citation in an existing article is far easier than getting a new article approved.",
    pillar: "Authority",
    pillarWeight: "40%",
    impact: "medium",
    effort: "30-60 min",
    kind: "deeplink",
    href: "/prompts/wikipedia",
    cta: "Find targets",
  },
];

const PILLAR_STYLES: Record<ActionDef["pillar"], string> = {
  Authority: "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  Content: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  Structural: "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300",
};

const IMPACT_STYLES: Record<ActionDef["impact"], string> = {
  high: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  medium: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  low: "border-border bg-muted/40 text-muted-foreground",
};

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted/60"
    >
      {done ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}

export function PromptRankPlanPanel({ track }: { track: PromptTrack }) {
  const { slug } = useParams<{ slug: string }>();

  const [generated, setGenerated] = useState<Record<string, PromptSchemaResponse>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function runGenerate(action: ActionDef) {
    if (!slug || !action.schemaType) return;
    setLoadingId(action.id);
    setErrors((e) => ({ ...e, [action.id]: "" }));
    try {
      const r = await generatePromptSchema(slug, track.id, action.schemaType);
      setGenerated((g) => ({ ...g, [action.id]: r }));
      setOpenId(action.id);
    } catch (err) {
      setErrors((e) => ({
        ...e,
        [action.id]: err instanceof Error ? err.message : "Failed to generate.",
      }));
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-300">
          <Target className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-foreground">
            Rank &ldquo;{track.prompt_text.slice(0, 80)}{track.prompt_text.length > 80 ? "…" : ""}&rdquo; on AI platforms
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            {ACTIONS.length} achievable actions across Authority (40%), Content (35%), and Structural (25%).
            Click any row to generate the artifact or open the dedicated tool.
          </p>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {ACTIONS.map((a) => {
          const isOpen = openId === a.id;
          const result = generated[a.id];
          const isLoading = loadingId === a.id;
          const error = errors[a.id];
          return (
            <li
              key={a.id}
              className="rounded-md border border-border/70 bg-muted/15 transition hover:border-border"
            >
              <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-foreground">{a.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{a.why}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    <span
                      className={`rounded border px-1.5 py-px text-[9px] font-semibold uppercase ${PILLAR_STYLES[a.pillar]}`}
                    >
                      {a.pillar} · {a.pillarWeight}
                    </span>
                    <span
                      className={`rounded border px-1.5 py-px text-[9px] font-semibold uppercase ${IMPACT_STYLES[a.impact]}`}
                    >
                      {a.impact} impact
                    </span>
                    <span className="rounded border border-border bg-card px-1.5 py-px text-[9px] text-muted-foreground">
                      {a.effort}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {a.kind === "generate" ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (result) {
                          setOpenId(isOpen ? null : a.id);
                        } else {
                          runGenerate(a);
                        }
                      }}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 rounded-md bg-orange-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-orange-700 disabled:opacity-60 dark:bg-orange-600 dark:hover:bg-orange-500"
                    >
                      {isLoading ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : result ? (
                        isOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
                      ) : (
                        <Sparkles className="size-3" />
                      )}
                      {isLoading ? "Generating…" : result ? (isOpen ? "Hide" : "View") : "Generate"}
                    </button>
                  ) : (
                    <Link
                      href={`/dashboard/${slug}${a.href}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted/60"
                    >
                      {a.cta ?? "Open"}
                      <ArrowRight className="size-3" />
                    </Link>
                  )}
                </div>
              </div>

              {error ? (
                <div className="border-t border-border/60 bg-destructive/5 px-3 py-1.5 text-[11px] text-destructive">
                  {error}
                </div>
              ) : null}

              {isOpen && result ? (
                <div className="border-t border-border/60 bg-card px-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                      {a.schemaType === "answer" ? (
                        <FileText className="size-3.5 text-orange-600 dark:text-orange-300" />
                      ) : (
                        <Code2 className="size-3.5 text-orange-600 dark:text-orange-300" />
                      )}
                      Generated artifact
                    </div>
                    <CopyButton text={result.output} />
                  </div>
                  <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
                    {result.explanation}
                  </p>
                  <pre className="mt-2 max-h-72 overflow-auto rounded border border-border bg-muted/20 p-2.5 text-[11px] leading-relaxed text-foreground">
                    {result.output}
                  </pre>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-border/60 pt-3 text-[10px] text-muted-foreground">
        <ShoppingBag className="size-3" />
        Want a hands-off path? Open the
        <Link
          href={`/dashboard/${slug}/prompts/backlinks`}
          className="text-orange-600 hover:underline dark:text-orange-300"
          onClick={(e) => e.stopPropagation()}
        >
          Backlinks marketplace
        </Link>
        and we&apos;ll do the outreach for you.
      </div>
    </div>
  );
}
