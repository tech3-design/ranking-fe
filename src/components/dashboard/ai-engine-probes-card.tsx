"use client";

import type { DashboardSentiment } from "./types";
import { CORAL } from "./constants";

export function AiEngineProbesCard({ sentiment }: { sentiment: DashboardSentiment | null }) {
  const r = 40;
  const c = 251.3;

  if (!sentiment || sentiment.aiTotal < 1) {
    return (
      <div className="col-span-12 bg-white rounded-xl p-5 border border-neutral-100 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col">
        <p className="text-sm font-semibold text-foreground mb-3">AI Engine Probes</p>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">No probe data</p>
        </div>
      </div>
    );
  }

  const mentionPct = sentiment.aiMentioned / sentiment.aiTotal;
  const missPct = 1 - mentionPct;

  return (
    <div className="col-span-12 bg-white rounded-xl p-5 border border-neutral-100 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col">
      <p className="text-sm font-semibold text-foreground mb-3">AI Engine Probes</p>
      <div className="flex flex-col items-center flex-1 justify-center">
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden>
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={CORAL}
              strokeWidth="20"
              strokeDasharray={`${mentionPct * c} ${c}`}
            />
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="var(--border)"
              strokeWidth="20"
              strokeDasharray={`${missPct * c} ${c}`}
              strokeDashoffset={`${-mentionPct * c}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center">
              <span className="text-lg font-bold text-foreground">{Math.round(mentionPct * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CORAL }} />
            <span className="text-[10px] text-muted-foreground">
              Mentioned <span className="font-bold text-foreground">{Math.round(mentionPct * 100)}%</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-border" />
            <span className="text-[10px] text-muted-foreground">
              Missed <span className="font-bold text-foreground">{Math.round(missPct * 100)}%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
