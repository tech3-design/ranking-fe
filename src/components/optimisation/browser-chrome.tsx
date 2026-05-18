"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Loader2,
  Globe2,
  ChevronDown,
  Lock,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import type { ContentPage } from "@/lib/api/content-optimisation";

type Props = {
  url: string;
  baseUrl: string;
  pages: ContentPage[];
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  onUrlChange: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
};

function getPath(fullUrl: string, base: string): string {
  if (base && fullUrl.startsWith(base)) {
    return fullUrl.slice(base.length) || "/";
  }
  return fullUrl;
}

export function BrowserChrome({
  url,
  baseUrl,
  pages,
  canGoBack,
  canGoForward,
  isLoading,
  onUrlChange,
  onBack,
  onForward,
  onRefresh,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const path = getPath(url, baseUrl);

  return (
    <div className="flex items-center gap-2 border-b border-border bg-background px-3 py-2">
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        className={cn(
          "flex size-8 items-center justify-center rounded-md transition",
          canGoBack
            ? "text-foreground hover:bg-muted"
            : "cursor-not-allowed text-muted-foreground/40",
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
          canGoForward
            ? "text-foreground hover:bg-muted"
            : "cursor-not-allowed text-muted-foreground/40",
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
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <RotateCw className="size-4" />}
      </button>

      {/* URL display — read-only, not editable */}
      <div className="relative flex-1" ref={wrapperRef}>
        <div className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-muted/35 px-3 select-none">
          <Globe2 className="size-3.5 shrink-0 text-muted-foreground" />
          {baseUrl ? (
            <>
              <span
                className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded bg-muted/60 px-1.5 py-0.5 text-[12px] font-medium text-muted-foreground/80"
                title="Domain locked to your project URL"
              >
                <Lock className="size-2.5 shrink-0" />
                {baseUrl}
              </span>
              <span className="min-w-0 truncate text-[13px] text-foreground">{path || "/"}</span>
            </>
          ) : (
            <span className="min-w-0 truncate text-[13px] text-muted-foreground">
              {url || "No URL configured"}
            </span>
          )}

          {/* Pages dropdown toggle */}
          {pages.length > 0 ? (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setOpen((v) => !v)}
              className="ml-auto flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
              aria-label="Browse site pages"
              title="Browse site pages"
            >
              <span className="font-medium">{pages.length} pages</span>
              <ChevronDown className={cn("size-3 transition", open && "rotate-180")} />
            </button>
          ) : null}
        </div>

        {/* Pages dropdown */}
        {open && pages.length > 0 ? (
          <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-md border border-border bg-popover py-1 shadow-lg">
            {pages.slice(0, 50).map((p) => (
              <button
                key={p.url}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setOpen(false);
                  onUrlChange(p.url);
                }}
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-[12px] transition",
                  p.url === url ? "bg-muted/60" : "hover:bg-muted/40",
                )}
              >
                <span className="truncate font-medium text-foreground">{p.path || "/"}</span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {p.title || p.url}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
