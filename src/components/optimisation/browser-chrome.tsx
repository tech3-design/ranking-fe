"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Loader2, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentPage } from "@/lib/api/content-optimisation";

type Props = {
  url: string;
  pages: ContentPage[];
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  onUrlChange: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
};

export function BrowserChrome({
  url,
  pages,
  canGoBack,
  canGoForward,
  isLoading,
  onUrlChange,
  onBack,
  onForward,
  onRefresh,
}: Props) {
  const [draftUrl, setDraftUrl] = useState(url);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => setDraftUrl(url), [url]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const filtered =
    draftUrl && draftUrl !== url
      ? pages.filter(
          (p) =>
            p.url.toLowerCase().includes(draftUrl.toLowerCase()) ||
            p.path.toLowerCase().includes(draftUrl.toLowerCase()) ||
            p.title.toLowerCase().includes(draftUrl.toLowerCase()),
        )
      : pages;

  function commit(next: string) {
    setOpen(false);
    if (!next) return;
    onUrlChange(next);
  }

  return (
    <div className="flex items-center gap-2 border-b border-border bg-background px-3 py-2">
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        className={cn(
          "flex size-8 items-center justify-center rounded-md transition",
          canGoBack ? "text-foreground hover:bg-muted" : "cursor-not-allowed text-muted-foreground/40",
        )}
        aria-label="Back"
      >
        <ArrowLeft className="size-4" />
      </button>
      <button
        type="button"
        onClick={onForward}
        disabled={!canGoForward}
        className={cn(
          "flex size-8 items-center justify-center rounded-md transition",
          canGoForward ? "text-foreground hover:bg-muted" : "cursor-not-allowed text-muted-foreground/40",
        )}
        aria-label="Forward"
      >
        <ArrowRight className="size-4" />
      </button>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="flex size-8 items-center justify-center rounded-md text-foreground transition hover:bg-muted disabled:opacity-50"
        aria-label="Refresh"
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RotateCw className="size-4" />
        )}
      </button>

      <div className="relative flex-1" ref={wrapperRef}>
        <div className="flex h-9 items-center gap-2 rounded-full border border-border bg-muted/35 px-3">
          <Globe2 className="size-3.5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={draftUrl}
            onChange={(e) => {
              setDraftUrl(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit(draftUrl);
              if (e.key === "Escape") {
                setOpen(false);
                setDraftUrl(url);
              }
            }}
            placeholder="https://your-site.com/page"
            className="flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        {open && filtered.length > 0 ? (
          <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-md border border-border bg-popover py-1 shadow-lg">
            {filtered.slice(0, 30).map((p) => (
              <button
                key={p.url}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(p.url)}
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-[12px] transition",
                  p.url === url ? "bg-muted/60" : "hover:bg-muted/40",
                )}
              >
                <span className="truncate font-medium text-foreground">
                  {p.title || p.path || p.url}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">{p.url}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
