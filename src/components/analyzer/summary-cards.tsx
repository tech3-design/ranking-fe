"use client";

import type { ScoreHistoryPoint } from "@/lib/api/analyzer";
import { TrendingUp, TrendingDown, BarChart3, Eye, Bot, Globe } from "lucide-react";

interface SummaryCardsProps {
  geoScore: number;
  contentScore: number;
  aiVisibilityScore: number;
  brandVisibilityScore: number | null;
  scoreHistory: ScoreHistoryPoint[];
}

export function SummaryCards({
  geoScore, contentScore, aiVisibilityScore, brandVisibilityScore, scoreHistory,
}: SummaryCardsProps) {
  const prevScore = scoreHistory.length >= 2 ? scoreHistory[scoreHistory.length - 2].composite_score : null;
  const geoChange = prevScore !== null ? Math.round(geoScore - prevScore) : null;

  const cards = [
    { label: "GEO Score", value: Math.round(geoScore), change: geoChange, icon: BarChart3, accent: true },
    { label: "Content Score", value: Math.round(contentScore), change: null, icon: Globe, accent: false },
    { label: "AI Visibility", value: Math.round(aiVisibilityScore), change: null, icon: Bot, accent: false },
    { label: "Brand Visibility", value: brandVisibilityScore !== null ? Math.round(brandVisibilityScore) : "--", change: null, icon: Eye, accent: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`rounded-2xl border p-4 transition-all ${
              card.accent
                ? "border-[#3ecf8e]/30 bg-[#3ecf8e]/[0.06] shadow-[0_0_20px_rgba(62,207,142,0.1)]"
                : "border-white/[0.08] bg-white/[0.03]"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500">{card.label}</p>
                <p className={`mt-1 text-3xl font-bold tracking-tight ${card.accent ? "text-[#3ecf8e]" : "text-white"}`}>
                  {card.value}
                </p>
              </div>
              <div className={`rounded-lg p-2 ${card.accent ? "bg-[#3ecf8e]/20" : "bg-white/[0.06]"}`}>
                <Icon className={`h-4 w-4 ${card.accent ? "text-[#3ecf8e]" : "text-slate-400"}`} />
              </div>
            </div>
            {card.change !== null ? (
              <div className="mt-2 flex items-center gap-1.5">
                {card.change >= 0 ? (
                  <span className="flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                    <TrendingUp className="h-3 w-3" />↑ {card.change} pts
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
                    <TrendingDown className="h-3 w-3" />↓ {Math.abs(card.change)} pts
                  </span>
                )}
                <span className="text-[10px] text-slate-600">vs last run</span>
              </div>
            ) : (
              <p className="mt-2 text-[10px] text-slate-600">/100</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
