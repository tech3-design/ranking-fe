"use client";

import type { BrandVisibility } from "@/lib/api/analyzer";

interface VisibilitySummaryProps {
  visibility: BrandVisibility;
  onViewDetails: () => void;
}

const PLATFORMS = [
  { key: "google_score" as const, label: "Google", color: "#3ecf8e" },
  { key: "reddit_score" as const, label: "Reddit", color: "#f97316" },
  { key: "medium_score" as const, label: "Medium", color: "#3b82f6" },
];

export function VisibilitySummary({ visibility, onViewDetails }: VisibilitySummaryProps) {
  return (
    <button onClick={onViewDetails} className="w-full text-left">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
        {PLATFORMS.map((p) => {
          const score = Math.round(visibility[p.key] ?? 0);
          const circumference = 2 * Math.PI * 20;
          const offset = circumference - (score / 100) * circumference;
          return (
            <div
              key={p.key}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-center transition-all hover:border-white/[0.15] hover:bg-white/[0.05]"
            >
              <div className="mx-auto mb-2 relative h-14 w-14">
                <svg viewBox="0 0 48 48" className="h-14 w-14 -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle
                    cx="24" cy="24" r="20" fill="none"
                    stroke={p.color} strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    style={{ filter: `drop-shadow(0 0 4px ${p.color}60)` }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                  {score}
                </span>
              </div>
              <p className="text-xs text-slate-400">{p.label}</p>
            </div>
          );
        })}
      </div>
    </button>
  );
}
