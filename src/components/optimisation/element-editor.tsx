"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles, X, Check } from "@/components/icons";
import type { PreviewElement } from "@/lib/api/content-optimisation";

type Props = {
  element: PreviewElement;
  applyDisabled: boolean;
  applyDisabledHint?: string;
  isRewriting: boolean;
  isApplying: boolean;
  onClose: () => void;
  onRewrite: (instruction: string) => Promise<string>;
  onApply: (newText: string) => Promise<void>;
};

export function ElementEditor({
  element,
  applyDisabled,
  applyDisabledHint,
  isRewriting,
  isApplying,
  onClose,
  onRewrite,
  onApply,
}: Props) {
  // Reset draft when a new element is selected.
  const [draft, setDraft] = useState(element.text);
  const [instruction, setInstruction] = useState("");

  useEffect(() => {
    setDraft(element.text);
    setInstruction("");
  }, [element.id]);

  async function handleAiRewrite() {
    const next = await onRewrite(instruction);
    if (next) setDraft(next);
  }

  const dirty = draft !== element.text;

  return (
    <div className="flex h-full flex-col border-l border-border bg-background">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
            {element.tag}
          </span>
          <span className="truncate text-[12px] font-semibold text-foreground">
            Edit element
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-6 items-center justify-center rounded text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Close editor"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Text
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={Math.min(12, Math.max(4, Math.ceil(draft.length / 60)))}
            className="w-full resize-y rounded-md border border-border bg-muted/15 px-2.5 py-2 text-[12px] leading-relaxed text-foreground outline-none focus:border-primary/60 focus:bg-background"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Instruction (optional)
          </label>
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. shorter, more specific, add brand name"
            className="w-full rounded-md border border-border bg-muted/15 px-2.5 py-1.5 text-[12px] text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-background"
          />
        </div>

        <button
          type="button"
          onClick={handleAiRewrite}
          disabled={isRewriting || !element.text.trim()}
          className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-muted/40 text-[12px] font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRewriting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5 text-primary" />
          )}
          Rewrite with AI
        </button>

        {element.text !== draft ? (
          <div className="rounded-md border border-border bg-muted/15 p-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Original
            </p>
            <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-6 whitespace-pre-wrap">
              {element.text}
            </p>
          </div>
        ) : null}
      </div>

      <div className="border-t border-border p-3">
        {applyDisabled && applyDisabledHint ? (
          <p className="mb-2 text-[10px] leading-snug text-muted-foreground">
            {applyDisabledHint}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => onApply(draft)}
          disabled={!dirty || isApplying || applyDisabled}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-[12px] font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isApplying ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
          Apply to live site
        </button>
      </div>
    </div>
  );
}
