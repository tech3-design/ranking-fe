"use client";

import type { PageScore } from "@/lib/api/analyzer";

const PILLARS = [
  { key: "content_score" as const, label: "Content", color: "#3ecf8e" },
  { key: "schema_score" as const, label: "Schema", color: "#22d3ee" },
  { key: "eeat_score" as const, label: "E-E-A-T", color: "#f59e0b" },
  { key: "technical_score" as const, label: "Technical", color: "#3b82f6" },
  { key: "entity_score" as const, label: "Entity", color: "#f97316" },
  { key: "ai_visibility_score" as const, label: "AI Visibility", color: "#a855f7" },
];

interface PillarLegendProps {
  pageScore: PageScore;
}

export function PillarLegend({ pageScore }: PillarLegendProps) {
  return (
    <div className="space-y-3.5">
      {PILLARS.map((pillar) => {
        const score = Math.round(pageScore[pillar.key] ?? 0);
        return (
          <div key={pillar.key} className="flex items-center gap-3">
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: pillar.color, boxShadow: `0 0 6px ${pillar.color}60` }}
            />
            <span className="w-20 shrink-0 text-xs text-slate-400">{pillar.label}</span>
            <div className="flex-1">
              <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${score}%`, backgroundColor: pillar.color }}
                />
              </div>
            </div>
            <span className="w-8 shrink-0 text-right text-xs font-medium text-white">{score}</span>
          </div>
        );
      })}
    </div>
  );
}
