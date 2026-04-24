"use client";

import { useMemo } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageScore } from "@/lib/api/analyzer";

export function PillarBreakdownCard({ pageScore }: { pageScore: PageScore | null }) {
  const breakdownRows = useMemo(() => {
    if (!pageScore) return [];
    return [
      { label: "Content", score: pageScore.content_score, tone: "bg-[#2563eb]/80" },
      { label: "Schema", score: pageScore.schema_score, tone: "bg-emerald-500/90" },
      { label: "E-E-A-T", score: pageScore.eeat_score, tone: "bg-amber-500/90" },
      { label: "Technical", score: pageScore.technical_score, tone: "bg-primary/85" },
    ].sort((a, b) => b.score - a.score);
  }, [pageScore]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col rounded-xl border border-neutral-100 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)]">
      <div className="mb-2 flex shrink-0 items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Pillar Breakdown</p>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground"
          aria-label="Pillar breakdown options"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col rounded-sm border border-black/6 bg-background p-2">
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-black/8 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <ul className="min-h-0 flex-1 space-y-1.5 text-[11px] font-medium text-neutral-700">
            {breakdownRows.length > 0 ? (
              breakdownRows.map((row) => (
                <li key={row.label} className="flex items-center gap-2">
                  <div className="min-w-0 flex flex-1 items-center gap-2">
                    <span className="w-18 shrink-0 truncate text-muted-foreground">{row.label}</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className={`h-full rounded-full ${row.tone}`}
                        style={{ width: `${Math.max(8, Math.min(100, Math.round(row.score)))}%` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 font-semibold text-foreground">{Math.round(row.score)}/100</span>
                </li>
              ))
            ) : (
              <li className="py-4 text-center text-[11px] text-muted-foreground">No pillar data yet</li>
            )}
          </ul>
        </div>
      </div>
      {breakdownRows.length > 0 && (
        <div className="mt-1.5 flex shrink-0 justify-between text-[8px] text-muted-foreground">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      )}
    </div>
  );
}
