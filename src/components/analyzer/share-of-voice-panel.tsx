"use client";

import type { ShareOfVoiceItem, Engine } from "@/lib/api/analyzer";

const ENGINE_LABELS: Record<Engine, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

const ENGINE_COLORS: Record<Engine, string> = {
  chatgpt: "text-green-400",
  claude: "text-orange-400",
  gemini: "text-blue-400",
  perplexity: "text-purple-400",
};

function sovColor(pct: number): string {
  if (pct >= 70) return "text-green-400";
  if (pct >= 40) return "text-yellow-400";
  return "text-red-400";
}

interface ShareOfVoicePanelProps {
  data: ShareOfVoiceItem[];
}

export function ShareOfVoicePanel({ data }: ShareOfVoicePanelProps) {
  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground">No data yet. Add prompts to start tracking.</p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {data.map((item) => (
        <div
          key={item.engine}
          className="glass-card rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className={`text-sm font-semibold ${ENGINE_COLORS[item.engine as Engine] ?? "text-foreground"}`}>
              {ENGINE_LABELS[item.engine as Engine] ?? item.engine}
            </span>
            <span className={`text-2xl font-bold tabular-nums ${sovColor(item.sov_pct)}`}>
              {item.sov_pct}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
            <div
              className="h-full rounded-full bg-current transition-all"
              style={{ width: `${item.sov_pct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {item.mentioned} / {item.total} prompts mentioned brand
          </p>
        </div>
      ))}
    </div>
  );
}
