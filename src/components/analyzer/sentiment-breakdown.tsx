"use client";

import type { PromptTrack, Engine, Sentiment } from "@/lib/api/analyzer";

const ENGINE_LABELS: Record<Engine, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

const SENTIMENT_CLASS: Record<Sentiment, string> = {
  positive: "bg-green-500/20 text-green-400 border border-green-500/30",
  neutral: "bg-muted/50 text-muted-foreground border border-border",
  negative: "bg-red-500/20 text-red-400 border border-red-500/30",
};

interface SentimentBreakdownProps {
  tracks: PromptTrack[];
}

export function SentimentBreakdown({ tracks }: SentimentBreakdownProps) {
  const allEngines: Engine[] = ["chatgpt", "claude", "gemini", "perplexity"];
  const sentiments: Sentiment[] = ["positive", "neutral", "negative"];

  // Aggregate per engine
  const stats: Record<Engine, Record<Sentiment, number>> = {
    chatgpt: { positive: 0, neutral: 0, negative: 0 },
    claude: { positive: 0, neutral: 0, negative: 0 },
    gemini: { positive: 0, neutral: 0, negative: 0 },
    perplexity: { positive: 0, neutral: 0, negative: 0 },
  };

  for (const track of tracks) {
    for (const result of track.results) {
      const eng = result.engine as Engine;
      const sent = result.sentiment as Sentiment;
      if (stats[eng] && sent in stats[eng]) {
        stats[eng][sent]++;
      }
    }
  }

  const hasData = allEngines.some((e) =>
    sentiments.some((s) => stats[e][s] > 0),
  );

  if (!hasData) {
    return <p className="text-sm text-muted-foreground">No sentiment data yet.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {allEngines.map((engine) => {
        const counts = stats[engine];
        const total = sentiments.reduce((s, k) => s + counts[k], 0);
        if (total === 0) return null;
        return (
          <div key={engine} className="glass-card rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold">{ENGINE_LABELS[engine]}</p>
            <div className="flex flex-wrap gap-1.5">
              {sentiments.map((sent) => (
                <span key={sent} className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs capitalize ${SENTIMENT_CLASS[sent]}`}>
                  {sent} {counts[sent]}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
