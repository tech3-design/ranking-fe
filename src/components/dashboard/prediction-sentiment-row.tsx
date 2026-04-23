"use client";

import type { DashboardSentiment, ScorePrediction } from "./types";
import { ScorePredictionCard } from "./score-prediction-card";
import { SentimentAnalysisCard } from "./sentiment-analysis-card";

export function PredictionSentimentRow({
  compositeScore,
  prediction,
  sentiment,
}: {
  compositeScore: number;
  prediction: ScorePrediction;
  sentiment: DashboardSentiment | null;
}) {
  return (
    <div className="grid grid-cols-12 gap-4 mb-4">
      <ScorePredictionCard compositeScore={compositeScore} prediction={prediction} />
      <SentimentAnalysisCard sentiment={sentiment} />
    </div>
  );
}
