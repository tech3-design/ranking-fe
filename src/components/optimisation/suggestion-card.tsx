"use client";

import { Check, Loader2, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentField, ContentSuggestion } from "@/lib/api/content-optimisation";

const FIELD_LABEL: Record<ContentField, string> = {
  title: "Title",
  meta_description: "Meta",
  body_html: "Body",
  schema_jsonld: "Schema",
};

type Props = {
  suggestion: ContentSuggestion;
  isApplying: boolean;
  isApplied: boolean;
  applyDisabled: boolean;
  applyDisabledHint?: string;
  onApply: () => void;
  onDismiss: () => void;
};

export function SuggestionCard({
  suggestion,
  isApplying,
  isApplied,
  applyDisabled,
  applyDisabledHint,
  onApply,
  onDismiss,
}: Props) {
  const showProposed = !!suggestion.proposed_value;
  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition",
        isApplied
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-border bg-card hover:border-border/80",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {FIELD_LABEL[suggestion.target_field]}
            </span>
            {isApplied ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                <Check className="size-2.5" /> Applied
              </span>
            ) : null}
          </div>
          <p className="text-[12px] font-semibold text-foreground">{suggestion.title}</p>
          <p className="text-[11px] leading-snug text-muted-foreground">
            {suggestion.rationale}
          </p>
          {showProposed ? (
            <details className="mt-1">
              <summary className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground">
                Preview change
              </summary>
              <div className="mt-1.5 max-h-40 overflow-auto rounded border border-border/60 bg-background px-2 py-1.5 font-mono text-[10.5px] leading-snug text-foreground">
                <pre className="whitespace-pre-wrap break-words">{suggestion.proposed_value.slice(0, 1500)}</pre>
              </div>
            </details>
          ) : null}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={onDismiss}
          disabled={isApplying || isApplied}
          className="flex h-7 items-center gap-1 rounded-md px-2 text-[11px] text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <X className="size-3" />
          Dismiss
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={isApplying || isApplied || applyDisabled}
          title={applyDisabled ? applyDisabledHint : undefined}
          className={cn(
            "flex h-7 items-center gap-1 rounded-md px-2.5 text-[11px] font-semibold transition",
            isApplied
              ? "cursor-default bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : applyDisabled
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground hover:opacity-90",
          )}
        >
          {isApplying ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Sparkles className="size-3" />
          )}
          {isApplied ? "Applied" : isApplying ? "Applying…" : "Apply"}
        </button>
      </div>
    </div>
  );
}
