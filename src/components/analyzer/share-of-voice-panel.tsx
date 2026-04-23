"use client";

import type { ShareOfVoiceItem, Engine } from "@/lib/api/analyzer";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  PieChart,
  Pie,
} from "recharts";

const ENGINE_LABELS: Record<Engine, string> = {
  google: "Google",
  bing: "Bing",
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

const ENGINE_COLORS: Record<Engine, string> = {
  google: "#ea4335",
  bing: "#00809d",
  chatgpt: "#10a37f",
  claude: "#d97706",
  gemini: "#4285f4",
  perplexity: "#7c3aed",
};

interface ShareOfVoicePanelProps {
  data: ShareOfVoiceItem[];
}

export function ShareOfVoicePanel({ data }: ShareOfVoicePanelProps) {
  if (!data.length) return null;

  const avg = Math.round(data.reduce((s, d) => s + d.sov_pct, 0) / data.length);
  const totalMentions = data.reduce((s, d) => s + d.mentioned, 0);
  const totalRuns = data.reduce((s, d) => s + d.total, 0);

  const chartData = data.map((item) => ({
    engine: ENGINE_LABELS[item.engine as Engine] ?? item.engine,
    sov: item.sov_pct,
    mentioned: item.mentioned,
    total: item.total,
    color: ENGINE_COLORS[item.engine as Engine] ?? "#94a3b8",
  }));

  // Split share pie — each engine's mentions as slice
  const piData = data
    .filter((d) => d.mentioned > 0)
    .map((item) => ({
      name: ENGINE_LABELS[item.engine as Engine] ?? item.engine,
      value: item.mentioned,
      fill: ENGINE_COLORS[item.engine as Engine] ?? "#94a3b8",
    }));

  return (
    <div className="rounded-xl bg-card border border-border/70 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/70">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Share of Voice</p>
          <p className="text-lg font-semibold tabular-nums text-foreground mt-0.5">
            {avg}
            <span className="text-xs text-muted-foreground font-normal">% avg · {totalMentions}/{totalRuns} prompts</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 p-4">
        {/* Bar chart — SoV per engine */}
        <div className="col-span-12 lg:col-span-8">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
              <XAxis
                dataKey="engine"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                width={32}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", fillOpacity: 0.3 }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value, _name, item) => {
                  const v = typeof value === "number" ? value : Number(value ?? 0);
                  const payload = (item as { payload?: { mentioned?: number; total?: number; engine?: string } } | undefined)?.payload;
                  return [
                    `${v}% (${payload?.mentioned ?? 0}/${payload?.total ?? 0})`,
                    payload?.engine ?? "Engine",
                  ];
                }}
              />
              <Bar dataKey="sov" radius={[6, 6, 0, 0]} barSize={32}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie — mention split across engines */}
        <div className="col-span-12 lg:col-span-4 flex flex-col items-center justify-center min-h-[260px] border-t lg:border-t-0 lg:border-l border-border/60 pt-4 lg:pt-0 lg:pl-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground self-start mb-2">
            Mention Split
          </p>
          <div className="relative w-full flex-1 flex items-center justify-center">
            {piData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={piData}
                      innerRadius={50}
                      outerRadius={82}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {piData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value, name) => {
                        const v = typeof value === "number" ? value : Number(value ?? 0);
                        return [`${v} mentions`, String(name ?? "Engine")];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-semibold tabular-nums text-foreground leading-none">{totalMentions}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">total</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No mentions yet</p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
            {piData.map((p) => (
              <span key={p.name} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.fill }} />
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
