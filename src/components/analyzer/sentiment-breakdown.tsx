"use client";

import { useEffect, useMemo, useState } from "react";
import type { PromptTrack, Engine, Sentiment } from "@/lib/api/analyzer";
import { useSession } from "@/lib/auth-client";
import { getSubscriptionStatus } from "@/lib/api/payments";

const ENGINE_LABELS: Record<Engine, string> = {
  google: "Google",
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

/** LLM engines only (Google SERP is tracked elsewhere). */
const LLM_ENGINES: Engine[] = ["chatgpt", "claude", "gemini", "perplexity"];

interface SentimentBreakdownProps {
  tracks: PromptTrack[];
}

export function SentimentBreakdown({ tracks }: SentimentBreakdownProps) {
  const { data: session } = useSession();
  const [planEngines, setPlanEngines] = useState<Engine[] | null>(null);

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) {
      setPlanEngines(null);
      return;
    }
    getSubscriptionStatus(email)
      .then((s) => setPlanEngines((s.limits.engines as Engine[]) ?? null))
      .catch(() => setPlanEngines(null));
  }, [session?.user?.email]);

  const allEngines = useMemo(() => {
    if (!planEngines?.length) {
      return LLM_ENGINES;
    }
    const allowed = new Set(planEngines);
    return LLM_ENGINES.filter((e) => allowed.has(e));
  }, [planEngines]);

  const sentiments: Sentiment[] = ["positive", "neutral", "negative"];

  // Aggregate per engine
  const stats: Record<Engine, Record<Sentiment, number>> = {
    google: { positive: 0, neutral: 0, negative: 0 },
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
    sentiments.some((sent) => stats[e][sent] > 0),
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
