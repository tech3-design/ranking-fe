"use client";

import { Loader2, RefreshCcw, Sparkles, FileText } from "lucide-react";
import { SuggestionCard } from "./suggestion-card";
import type { ContentSuggestion } from "@/lib/api/content-optimisation";

type Props = {
  suggestions: ContentSuggestion[];
  applyingId: number | null;
  appliedIds: Set<number>;
  isLoading: boolean;
  isGenerating: boolean;
  hasPage: boolean;
  applyDisabled: boolean;
  applyDisabledHint?: string;
  onGenerate: () => void;
  onApply: (s: ContentSuggestion) => void;
  onDismiss: (s: ContentSuggestion) => void;
};

export function SuggestionsRail({
  suggestions,
  applyingId,
  appliedIds,
  isLoading,
  isGenerating,
  hasPage,
  applyDisabled,
  applyDisabledHint,
  onGenerate,
  onApply,
  onDismiss,
}: Props) {
  return (
    <div className="flex h-full flex-col border-l border-border bg-background">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-1.5 text-foreground">
          <Sparkles className="size-3.5 text-primary" />
          <span className="text-[12px] font-semibold">AI suggestions</span>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={!hasPage || isGenerating}
          className="flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <RefreshCcw className="size-3" />
          )}
          {suggestions.length > 0 ? "Regenerate" : "Generate"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {!hasPage ? (
          <Empty
            icon={<FileText className="size-5 text-muted-foreground/60" />}
            title="Open a page"
            body="Pick a page from the URL bar to see suggestions."
          />
        ) : isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : suggestions.length === 0 ? (
          <Empty
            icon={<Sparkles className="size-5 text-muted-foreground/60" />}
            title={isGenerating ? "Generating…" : "No suggestions yet"}
            body={
              isGenerating
                ? "Asking the model to review this page."
                : "Click Generate to ask the AI for AI-discoverability edits."
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {suggestions.map((s) => (
              <SuggestionCard
                key={s.id}
                suggestion={s}
                isApplying={applyingId === s.id}
                isApplied={appliedIds.has(s.id)}
                applyDisabled={applyDisabled}
                applyDisabledHint={applyDisabledHint}
                onApply={() => onApply(s)}
                onDismiss={() => onDismiss(s)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
      {icon}
      <p className="text-[12px] font-semibold text-foreground">{title}</p>
      <p className="text-[11px] leading-snug text-muted-foreground">{body}</p>
    </div>
  );
}
