"use client";

import { useMemo } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageScore } from "@/lib/api/analyzer";
import { ScoreGauge } from "@/components/ui/vis-charts";

const PILLARS = [
  { key: "content_score" as const, label: "Content", color: "#2563eb" },
  { key: "technical_score" as const, label: "Technical", color: "#e04a3d" },
  { key: "eeat_score" as const, label: "E-E-A-T", color: "#f59e0b" },
  { key: "schema_score" as const, label: "Schema", color: "#10b981" },
];

export function PillarBreakdownCard({ pageScore }: { pageScore: PageScore | null }) {
  const pillars = useMemo(
    () =>
      PILLARS.map((p) => ({
        ...p,
        score: pageScore ? Math.round((pageScore[p.key] as number) ?? 0) : 0,
      })),
    [pageScore],
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col rounded-xl border border-neutral-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex shrink-0 items-center justify-between">
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

      {pillars[0].score === 0 && pillars.every((p) => p.score === 0) ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-muted-foreground">No pillar data yet</p>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-4 items-center gap-6 px-2">
          {pillars.map((pillar) => (
            <div key={pillar.label} className="flex flex-col items-center gap-3">
              <ScoreGauge value={pillar.score} size={100} color={pillar.color} />
              <div className="text-center">
                <p className="text-[12px] font-semibold text-neutral-800">{pillar.label}</p>
                <p className="text-[11px] text-muted-foreground">{pillar.score}/100</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
