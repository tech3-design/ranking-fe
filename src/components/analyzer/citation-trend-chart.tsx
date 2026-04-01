"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { CitationTrendPoint, Engine } from "@/lib/api/analyzer";

const ENGINE_COLORS: Record<Engine, string> = {
  google: "#ea4335",
  chatgpt: "#4ade80",
  claude: "#fb923c",
  gemini: "#60a5fa",
  perplexity: "#c084fc",
};

const ENGINE_LABELS: Record<Engine, string> = {
  google: "Google",
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

interface CitationTrendChartProps {
  data: CitationTrendPoint[];
}

export function CitationTrendChart({ data }: CitationTrendChartProps) {
  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Citation trend data will appear after multiple check-ins.
      </p>
    );
  }

  // Pivot: week_start + engine → { week_start, chatgpt: %, claude: %, ... }
  const weeks = Array.from(new Set(data.map((d) => d.week_start))).sort();
  const engines = Array.from(new Set(data.map((d) => d.engine))) as Engine[];
  const chartData = weeks.map((week) => {
    const row: Record<string, string | number> = { week };
    for (const engine of engines) {
      const pt = data.find((d) => d.week_start === week && d.engine === engine);
      row[engine] = pt ? pt.rate_pct : 0;
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(v) => v?.slice(5) ?? ""}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          domain={[0, 100]}
          unit="%"
        />
        <Tooltip
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
          formatter={(value, name) => [
            `${value ?? 0}%`,
            ENGINE_LABELS[String(name) as Engine] ?? String(name),
          ]}
        />
        <Legend
          formatter={(value) => ENGINE_LABELS[value as Engine] ?? value}
          wrapperStyle={{ fontSize: 12 }}
        />
        {engines.map((engine) => (
          <Line
            key={engine}
            type="monotone"
            dataKey={engine}
            stroke={ENGINE_COLORS[engine] ?? "#888"}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
