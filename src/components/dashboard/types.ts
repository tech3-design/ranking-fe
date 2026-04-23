export type DashboardSentiment = {
  positive: number;
  negative: number;
  neutral: number;
  score: number;
  totalMentions: number;
  aiMentioned: number;
  aiTotal: number;
};

export type ScorePrediction = {
  projected: number;
  gain: number;
  days: { day: string; score: number }[];
  pillarImpacts: Record<string, number>;
};

export type HistoryPathData = {
  line: string;
  area: string;
  labels: string[];
  points?: { x: number; y: number; score: number }[];
};
