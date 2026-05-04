"use client";

import { useMemo } from "react";
import type { ShareOfVoiceItem, Engine } from "@/lib/api/analyzer";
import {
  BrandBarChart,
  BrandDonutChart,
  BRAND_PALETTE,
  type BarChartDatum,
  type DonutDatum,
} from "@/components/ui/vis-charts";

const ENGINE_LABELS: Record<Engine, string> = {
  google: "Google",
  bing: "Bing",
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

const ENGINE_ORDER: Engine[] = ["google", "chatgpt", "perplexity", "gemini", "claude", "bing"];

interface ShareOfVoicePanelProps {
  data: ShareOfVoiceItem[];
}

export function ShareOfVoicePanel({ data }: ShareOfVoicePanelProps) {
  if (!data.length) return null;

  const avg = Math.round(data.reduce((s, d) => s + d.sov_pct, 0) / data.length);
  const totalMentions = data.reduce((s, d) => s + d.mentioned, 0);
  const totalRuns = data.reduce((s, d) => s + d.total, 0);

  const barData: BarChartDatum[] = useMemo(
    () =>
      data.map((item) => {
        const idx = ENGINE_ORDER.indexOf(item.engine as Engine);
        return {
          label: ENGINE_LABELS[item.engine as Engine] ?? item.engine,
          value: item.sov_pct,
          color: BRAND_PALETTE[idx >= 0 ? idx : 0],
          meta: { mentioned: item.mentioned, total: item.total } as Record<string, unknown>,
        };
      }),
    [data],
  );

  const donutData: DonutDatum[] = useMemo(
    () =>
      data
        .filter((d) => d.mentioned > 0)
        .map((item) => {
          const idx = ENGINE_ORDER.indexOf(item.engine as Engine);
          return {
            name: ENGINE_LABELS[item.engine as Engine] ?? item.engine,
            value: item.mentioned,
            color: BRAND_PALETTE[idx >= 0 ? idx : 0],
          };
        }),
    [data],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none">
      <div className="flex items-center justify-between border-b border-border/70 px-6 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Share of Voice
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
            {avg}
            <span className="text-xs font-normal text-muted-foreground">
              % avg · {totalMentions}/{totalRuns} prompts
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 p-4">
        <div className="col-span-12 lg:col-span-8">
          <BrandBarChart
            data={barData}
            height={260}
            yDomain={[0, 100]}
            yTickFormatter={(v) => `${v}%`}
            tooltipFormatter={(v, d) => {
              const meta = d.meta as { mentioned: number; total: number };
              return [`${v}% (${meta.mentioned}/${meta.total})`, d.label];
            }}
          />
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col items-center justify-center min-h-[260px] border-t lg:border-t-0 lg:border-l border-border/60 pt-4 lg:pt-0 lg:pl-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground self-start mb-3">
            Mention Split
          </p>
          <BrandDonutChart
            data={donutData}
            size={200}
            innerRadius={50}
            outerRadius={82}
            centerLabel={String(totalMentions)}
            centerSub="total"
            tooltipFormatter={(v, name) => [`${v} mentions`, name]}
          />
          <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {donutData.map((d) => (
              <span
                key={d.name}
                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
