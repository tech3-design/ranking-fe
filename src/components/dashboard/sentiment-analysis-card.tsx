"use client";

import type { DashboardSentiment } from "./types";

function scoreLabel(score: number) {
  if (score >= 5) return "Very Positive";
  if (score >= 1) return "Positive";
  if (score === 0) return "Neutral";
  if (score >= -4) return "Negative";
  return "Very Negative";
}

export function SentimentAnalysisCard({ sentiment }: { sentiment: DashboardSentiment | null }) {
  const total = sentiment?.totalMentions ?? 0;

  const rows = sentiment
    ? [
        {
          label: "Positive",
          value: sentiment.positive,
          pct: total > 0 ? Math.round((sentiment.positive / total) * 100) : 0,
          barColor: "#22c55e",
          textColor: "text-emerald-600",
        },
        {
          label: "Neutral",
          value: sentiment.neutral,
          pct: total > 0 ? Math.round((sentiment.neutral / total) * 100) : 0,
          barColor: "#d1d5db",
          textColor: "text-muted-foreground",
        },
        {
          label: "Negative",
          value: sentiment.negative,
          pct: total > 0 ? Math.round((sentiment.negative / total) * 100) : 0,
          barColor: "var(--primary)",
          textColor: "text-primary",
        },
      ]
    : [];

  return (
    <div className="flex h-full min-h-0 w-full flex-col rounded-xl border border-neutral-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)]">
      {/* Header */}
      <div className="mb-3 shrink-0">
        <p className="text-sm font-semibold text-foreground">Sentiment Analysis</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          What people say about your brand online
        </p>
      </div>

      {sentiment ? (
        <>
          {/* Score strip */}
          <div className="mb-3 flex shrink-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-muted/20">
              <p
                className={`text-2xl font-bold leading-none tabular-nums ${
                  sentiment.score > 0
                    ? "text-emerald-600"
                    : sentiment.score < 0
                      ? "text-primary"
                      : "text-foreground"
                }`}
              >
                {sentiment.score > 0 ? "+" : ""}
                {sentiment.score}
              </p>
              <p className="mt-1 text-[9px] text-muted-foreground">{scoreLabel(sentiment.score)}</p>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">{total}</span> total mentions
              </p>
              {total > 0 && (
                <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.round((sentiment.positive / total) * 100)}%` }}
                  />
                  <div
                    className="h-full bg-neutral-300"
                    style={{ width: `${Math.round((sentiment.neutral / total) * 100)}%` }}
                  />
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.round((sentiment.negative / total) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Inner inset card — grows to fill remaining height */}
          <div className="flex flex-1 flex-col gap-3 rounded-lg border border-neutral-100 bg-[#f7f7f7] p-3">
            {rows.map((row) => (
              <div key={row.label} className="flex flex-1 flex-col justify-center space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-foreground">{row.label}</span>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className={`font-bold tabular-nums ${row.textColor}`}>{row.value}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{row.pct}%</span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${row.pct}%`, backgroundColor: row.barColor }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* AI mentions footer */}
          <div className="mt-3 flex shrink-0 items-center justify-between border-t border-border pt-3">
            <span className="text-[11px] text-muted-foreground">AI Mentions</span>
            <span className="text-[11px] font-semibold text-foreground">
              {sentiment.aiMentioned}/{sentiment.aiTotal}
            </span>
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-muted-foreground">No sentiment data available yet</p>
        </div>
      )}
    </div>
  );
}
