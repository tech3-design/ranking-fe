"use client";

import { Search } from "@/components/icons";
import { Button } from "@/components/ui/button";

// Schedule analysis lives on the dashboard overview now (top action row).
// This component just hosts the search trigger; we keep the wrapper so the
// layout still has a consistent slot to render top-bar controls into.
export function DashboardTopBarActions({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onOpenSearch}
        className="hidden h-9 w-52 shrink-0 justify-start gap-2 border-neutral-200/90 bg-card px-3 text-[13px] font-normal text-muted-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-accent md:inline-flex"
      >
        <Search className="size-4 shrink-0 opacity-80" aria-hidden />
        <span className="flex-1 truncate text-left text-xs">Search…</span>
        <kbd className="pointer-events-none rounded border border-border bg-muted/80 px-1.5 py-px font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onOpenSearch}
        className="size-9 shrink-0 border-neutral-200/90 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:hidden"
        aria-label="Open search"
      >
        <Search className="size-4" />
      </Button>
    </div>
  );
}
