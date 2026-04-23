"use client";

import { useId } from "react";
import type { ScorePrediction } from "./types";
import { CORAL } from "./constants";

export function ScorePredictionCard({
  compositeScore,
  prediction,
}: {
  compositeScore: number;
  prediction: ScorePrediction;
}) {
  const gradId = useId().replace(/:/g, "");

  return (
    <div className="col-span-7 bg-white rounded-xl p-6 border border-neutral-100 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-foreground">7-Day Score Prediction</p>
          <p className="text-xs mt-0.5 text-muted-foreground">
            Projected improvement if you act on recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">{Math.round(compositeScore)}</span>
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden>
            <path
              d="M2 10L10 2L18 2"
              stroke={CORAL}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 2H18V7"
              stroke={CORAL}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-2xl font-bold" style={{ color: CORAL }}>
            {prediction.projected}
          </span>
        </div>
      </div>

      <div className="relative" style={{ height: 140 }}>
        <svg viewBox="0 0 350 100" className="w-full h-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={CORAL} stopOpacity="0.15" />
              <stop offset="100%" stopColor={CORAL} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1={100 - compositeScore}
            x2="350"
            y2={100 - compositeScore}
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <path
            d={`M 0 ${100 - compositeScore} ${prediction.days.map((d, i) => `L ${((i + 1) / 7) * 350} ${100 - d.score}`).join(" ")} L 350 100 L 0 100 Z`}
            fill={`url(#${gradId})`}
          />
          <path
            d={`M 0 ${100 - compositeScore} ${prediction.days.map((d, i) => `L ${((i + 1) / 7) * 350} ${100 - d.score}`).join(" ")}`}
            fill="none"
            stroke={CORAL}
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx="350" cy={100 - prediction.projected} r="4" fill={CORAL} />
          <circle cx="0" cy={100 - compositeScore} r="3" fill="var(--border)" />
        </svg>
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] font-medium text-muted-foreground">
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>
      </div>
      <div className="flex justify-between mt-2 px-1">
        <span className="text-[10px] font-medium text-muted-foreground">Today</span>
        {prediction.days.map((d, i) => (
          <span key={i} className="text-[10px] font-medium text-muted-foreground">
            {d.day}
          </span>
        ))}
      </div>

      {Object.keys(prediction.pillarImpacts).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(prediction.pillarImpacts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([pillar, impact]) => (
              <div
                key={pillar}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                style={{ backgroundColor: `${CORAL}08`, border: `1px solid ${CORAL}15` }}
              >
                <span className="text-[10px] font-semibold capitalize text-muted-foreground">
                  {pillar.replace("_", " ")}
                </span>
                <span className="text-[10px] font-bold" style={{ color: CORAL }}>
                  +{Math.round(impact)}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
