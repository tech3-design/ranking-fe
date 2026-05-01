"use client";

import { useState } from "react";
import {
  Loader2,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Edit3,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateWikipediaDraft,
  type PromptTrack,
  type WikipediaDraftResponse,
} from "@/lib/api/analyzer";
import { useParams } from "next/navigation";

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
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
      {done ? "Copied" : label}
    </button>
  );
}

function buildFullDraftMarkdown(d: WikipediaDraftResponse["draft"]): string {
  const infobox = Object.entries(d.infobox || {})
    .map(([k, v]) => `| ${k} | ${v} |`)
    .join("\n");
  const sections = (d.sections || [])
    .map((s) => `## ${s.heading}\n\n${s.body_markdown}`)
    .join("\n\n");
  return [
    `# ${d.title}`,
    infobox ? `\n| Field | Value |\n|---|---|\n${infobox}\n` : "",
    d.lead,
    sections,
    `## References\n\n${d.references_markdown}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function WikipediaPromptPanel({ track }: { track: PromptTrack }) {
  const { slug } = useParams<{ slug: string }>();
  const promptText = track.prompt_text;

  const [data, setData] = useState<WikipediaDraftResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDraft, setShowDraft] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);

  async function generate() {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const r = await generateWikipediaDraft(slug, track.id);
      setData(r);
      setShowDraft(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't generate draft.");
    } finally {
      setLoading(false);
    }
  }

  const verdictStyles: Record<string, { Icon: typeof CheckCircle2; cls: string; label: string }> = {
    qualifies: {
      Icon: CheckCircle2,
      cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      label: "Qualifies for Wikipedia",
    },
    borderline: {
      Icon: AlertTriangle,
      cls: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      label: "Borderline — possible with stronger sources",
    },
    needs_more_coverage: {
      Icon: XCircle,
      cls: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
      label: "Needs more independent coverage first",
    },
  };

  return (
    <div className="border-t border-border bg-muted/20 p-3 sm:p-4">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-300">
          <BookOpen className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-foreground">
            Get on Wikipedia for this prompt
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            Wikipedia drives ~8% of AI citations. Generate a notability
            assessment, a draft article, and a list of existing articles where
            your brand could be cited — for the topic of &ldquo;{promptText.slice(0, 80)}
            {promptText.length > 80 ? "…" : ""}&rdquo;.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={generate}
          disabled={loading}
          className="shrink-0 gap-1.5 bg-orange-600 px-3 text-xs font-semibold text-white hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500"
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
          {loading ? "Generating…" : data ? "Regenerate" : "Generate Wikipedia kit"}
        </Button>
      </div>

      {error ? (
        <p className="mt-3 text-[11px] text-destructive">{error}</p>
      ) : null}

      {!data && !loading ? (
        <p className="mt-4 text-[11px] text-muted-foreground">
          Click <span className="font-medium text-foreground">Generate Wikipedia kit</span> to
          run notability assessment + draft article + edit targets in one shot.
          Takes ~30 seconds.
        </p>
      ) : null}

      {data ? (
        <div className="mt-4 space-y-3">
          {/* ── Notability verdict ──────────────────────────────────── */}
          {(() => {
            const v = verdictStyles[data.notability.verdict] ?? verdictStyles.borderline;
            const VIcon = v.Icon;
            return (
              <div className={`rounded-md border px-3 py-2.5 ${v.cls}`}>
                <div className="flex items-center gap-2">
                  <VIcon className="size-4 shrink-0" />
                  <p className="text-[12px] font-semibold">{v.label}</p>
                  <span className="ml-auto rounded border border-current/30 bg-current/10 px-1.5 py-px text-[10px] font-bold tabular-nums">
                    {data.notability.score} / 100
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-foreground/85">
                  {data.notability.summary}
                </p>
                {data.notability.missing_evidence?.length ? (
                  <ul className="mt-2 space-y-0.5 text-[11px] text-foreground/80">
                    {data.notability.missing_evidence.map((m, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="mt-1 size-1 shrink-0 rounded-full bg-current opacity-60" />
                        {m}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })()}

          {/* ── Draft article (collapsible) ─────────────────────────── */}
          <div className="rounded-md border border-border bg-card">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDraft((s) => !s);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
            >
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-orange-600 dark:text-orange-300" />
                <p className="text-[12px] font-semibold text-foreground">
                  Draft article: {data.draft.title}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <CopyButton
                  text={buildFullDraftMarkdown(data.draft)}
                  label="Copy full draft"
                />
                {showDraft ? (
                  <ChevronUp className="size-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                )}
              </div>
            </button>
            {showDraft ? (
              <div className="space-y-3 border-t border-border px-3 py-3">
                {/* Infobox */}
                {Object.keys(data.draft.infobox || {}).length > 0 ? (
                  <div className="rounded-md border border-border/60 bg-muted/20 p-2">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Infobox
                    </p>
                    <dl className="mt-1.5 grid grid-cols-1 gap-x-3 gap-y-0.5 text-[11px] sm:grid-cols-2">
                      {Object.entries(data.draft.infobox).map(([k, v]) => (
                        <div key={k} className="flex min-w-0 items-baseline gap-1.5">
                          <dt className="shrink-0 text-muted-foreground capitalize">
                            {k}:
                          </dt>
                          <dd className="truncate text-foreground">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}

                {/* Lead */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Lead
                    </p>
                    <CopyButton text={data.draft.lead} />
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-foreground">
                    {data.draft.lead}
                  </p>
                </div>

                {/* Sections */}
                {data.draft.sections.map((s) => (
                  <div key={s.heading}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold text-foreground">
                        {s.heading}
                      </p>
                      <CopyButton text={`## ${s.heading}\n\n${s.body_markdown}`} />
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-foreground">
                      {s.body_markdown}
                    </p>
                  </div>
                ))}

                {/* References */}
                {data.draft.references_markdown ? (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        References
                      </p>
                      <CopyButton text={data.draft.references_markdown} />
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-[11px] leading-relaxed text-muted-foreground">
                      {data.draft.references_markdown}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* ── Edit targets ────────────────────────────────────────── */}
          {data.edit_targets?.length ? (
            <div className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <Edit3 className="size-4 text-orange-600 dark:text-orange-300" />
                <p className="text-[12px] font-semibold text-foreground">
                  Existing articles where you could be cited
                </p>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Easier than getting a new article approved. Edit one of these
                with the suggested addition.
              </p>
              <ul className="mt-2.5 space-y-2">
                {data.edit_targets.map((e, i) => (
                  <li
                    key={i}
                    className="rounded-md border border-border/60 bg-muted/15 p-2.5"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-w-0 items-center gap-1 truncate text-[12px] font-semibold text-foreground hover:underline"
                      >
                        {e.title}
                        <ExternalLink className="size-3 shrink-0 opacity-60" />
                      </a>
                      <CopyButton text={e.suggested_edit} label="Copy edit" />
                    </div>
                    <p className="mt-1.5 text-[11px] leading-snug text-foreground/85">
                      {e.suggested_edit}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* ── Submit instructions ─────────────────────────────────── */}
          <div className="rounded-md border border-border bg-card">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSubmit((s) => !s);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-orange-600 dark:text-orange-300" />
                <p className="text-[12px] font-semibold text-foreground">
                  How to submit (Articles for Creation)
                </p>
              </div>
              {showSubmit ? (
                <ChevronUp className="size-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-3.5 text-muted-foreground" />
              )}
            </button>
            {showSubmit ? (
              <div className="border-t border-border px-3 py-3">
                <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground">
                  {data.submit_instructions_markdown}
                </p>
                <a
                  href="https://en.wikipedia.org/wiki/Wikipedia:Articles_for_creation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-orange-600 hover:underline dark:text-orange-300"
                >
                  Open Articles for Creation
                  <ExternalLink className="size-3" />
                </a>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
