"use client";

import type { DashboardSentiment } from "./types";
import { CORAL } from "./constants";

export function SentimentAnalysisCard({ sentiment }: { sentiment: DashboardSentiment | null }) {
  return (
    <div className="col-span-5 bg-white rounded-xl p-6 border border-neutral-100 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <p className="text-sm font-semibold mb-1 text-foreground">Sentiment Analysis</p>
      <p className="text-xs mb-5 text-muted-foreground">What people say about your brand online</p>

      {sentiment ? (
        <div className="space-y-5">
          <div className="flex items-center gap-5">
            <div className="text-center shrink-0">
              <p
                className="text-4xl font-bold"
                style={{
                  color:
                    sentiment.score > 0 ? "#22c55e" : sentiment.score < 0 ? CORAL : "var(--muted-foreground)",
                }}
              >
                {sentiment.score > 0 ? "+" : ""}
                {sentiment.score}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {sentiment.score >= 5
                  ? "Very Positive"
                  : sentiment.score >= 1
                    ? "Positive"
                    : sentiment.score === 0
                      ? "Neutral"
                      : sentiment.score >= -4
                        ? "Negative"
                        : "Very Negative"}
              </p>
            </div>

            <div className="flex-1">
              <div className="relative h-3 rounded-full bg-muted">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "linear-gradient(to right, #F95C4B, #D97706, #22c55e)" }}
                />
                <div
                  className="absolute -top-2 flex flex-col items-center"
                  style={{
                    left: `${((sentiment.score + 10) / 20) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <span className="text-[9px] font-bold text-foreground bg-card border border-border rounded px-1 mb-0.5 shadow-sm">
                    {sentiment.score > 0 ? "+" : ""}
                    {sentiment.score}
                  </span>
                  <div className="w-0.5 h-7 bg-foreground rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground mt-4">
                <span>-10</span>
                <span>0</span>
                <span>+10</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-xl p-3 bg-[#22c55e]/10 border border-[#22c55e]/20 text-center">
              <p className="text-lg font-bold text-[#22c55e]">{sentiment.positive}</p>
              <p className="text-[9px] text-muted-foreground">Positive</p>
            </div>
            <div className="rounded-xl p-3 bg-background border border-border text-center">
              <p className="text-lg font-bold text-muted-foreground">{sentiment.neutral}</p>
              <p className="text-[9px] text-muted-foreground">Neutral</p>
            </div>
            <div className="rounded-xl p-3 bg-primary/10 border border-primary/20 text-center">
              <p className="text-lg font-bold text-primary">{sentiment.negative}</p>
              <p className="text-[9px] text-muted-foreground">Negative</p>
            </div>
            <div className="rounded-xl p-3 bg-background border border-border text-center">
              <p className="text-lg font-bold text-foreground">
                {sentiment.aiMentioned}/{sentiment.aiTotal}
              </p>
              <p className="text-[9px] text-muted-foreground">AI Mentions</p>
            </div>
          </div>

          {sentiment.totalMentions > 0 && (
            <div>
              <div className="flex h-2.5 rounded-full overflow-hidden">
                {sentiment.positive > 0 && (
                  <div
                    className="h-full"
                    style={{
                      width: `${(sentiment.positive / sentiment.totalMentions) * 100}%`,
                      backgroundColor: "#22c55e",
                    }}
                  />
                )}
                {sentiment.neutral > 0 && (
                  <div
                    className="h-full"
                    style={{
                      width: `${(sentiment.neutral / sentiment.totalMentions) * 100}%`,
                      backgroundColor: "var(--border)",
                    }}
                  />
                )}
                {sentiment.negative > 0 && (
                  <div
                    className="h-full"
                    style={{
                      width: `${(sentiment.negative / sentiment.totalMentions) * 100}%`,
                      backgroundColor: CORAL,
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-10">
          <p className="text-xs text-muted-foreground">No sentiment data available yet</p>
        </div>
      )}
    </div>
  );
}
