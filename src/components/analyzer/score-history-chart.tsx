"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { ScoreHistoryPoint } from "@/lib/api/analyzer";

interface ScoreHistoryChartProps {
  data: ScoreHistoryPoint[];
  onPointClick?: (slug: string) => void;
}

export function ScoreHistoryChart({ data, onPointClick }: ScoreHistoryChartProps) {
  if (data.length < 2) return null;

  const chartData = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: d.composite_score,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
          onClick={(e: unknown) => {
            const ev = e as { activePayload?: Array<{ payload?: { slug?: string } }> };
            if (ev?.activePayload?.[0]?.payload?.slug && onPointClick) {
              onPointClick(ev.activePayload[0].payload.slug!);
            }
          }}
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3ecf8e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3ecf8e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
          <Tooltip
            contentStyle={{
              background: "#1c1c1c",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
            }}
            formatter={(value) => [`${value}/100`, "GEO Score"]}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#3ecf8e"
            strokeWidth={2}
            fill="url(#scoreGradient)"
            dot={{ r: 4, fill: "#3ecf8e", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#3ecf8e", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
