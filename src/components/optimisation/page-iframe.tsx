"use client";

import { Globe2, Loader2 } from "lucide-react";

type Props = {
  /** Sandbox-friendly HTML returned by the BE. */
  previewHtml: string;
  isLoading: boolean;
  emptyMessage?: string;
};

export function PageIframe({ previewHtml, isLoading, emptyMessage }: Props) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/15">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!previewHtml) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/15 px-8 text-center">
        <Globe2 className="size-7 text-muted-foreground/60" />
        <p className="text-[13px] text-muted-foreground">
          {emptyMessage || "Enter a URL to load a page."}
        </p>
      </div>
    );
  }

  return (
    <iframe
      title="Page preview"
      srcDoc={previewHtml}
      // Scripts run inside a unique origin (no allow-same-origin), so theme JS
      // can hydrate hero/product/lazy sections without being able to reach the
      // parent app.
      sandbox="allow-scripts allow-popups allow-forms"
      className="h-full w-full bg-background"
    />
  );
}
