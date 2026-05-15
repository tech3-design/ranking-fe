"use client";

import { useMemo } from "react";
import { LabelList, RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { PageScore } from "@/lib/api/analyzer";

const PILLAR_DEFS = [
  { key: "schema_score" as const,    browser: "Schema"    },
  { key: "eeat_score" as const,      browser: "E-E-A-T"   },
  { key: "content_score" as const,   browser: "Content"   },
  { key: "technical_score" as const, browser: "Technical" },
];

/* #e46055 at increasing opacity by score */
function scoreColor(score: number): string {
  if (score <= 0)  return "rgba(228,96,85,0.18)";
  if (score < 25)  return "rgba(228,96,85,0.38)";
  if (score < 50)  return "rgba(228,96,85,0.58)";
  if (score < 75)  return "rgba(228,96,85,0.78)";
  return "#e46055";
}

const CHART_CONFIG: ChartConfig = {
  score:      { label: "Score" },
  Schema:     { label: "Schema"    },
  "E-E-A-T": { label: "E-E-A-T"   },
  Content:    { label: "Content"   },
  Technical:  { label: "Technical" },
};

export function PillarBreakdownCard({ pageScore }: { pageScore: PageScore | null }) {
  /* Sort ascending so highest score = outermost ring */
  const chartData = useMemo(() => {
    return PILLAR_DEFS
      .map((p) => {
        const score = pageScore ? Math.round((pageScore[p.key] as number) ?? 0) : 0;
        return { browser: p.browser, score, fill: scoreColor(score) };
      })
      .sort((a, b) => a.score - b.score); // lowest innermost
  }, [pageScore]);

  const hasData = chartData.some((d) => d.score > 0);

  return (
    <div className="flex h-full min-h-0 w-full flex-col rounded-xl border border-neutral-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)]">
      {/* Header */}
      <div className="mb-3 shrink-0">
        <p className="text-sm font-semibold text-foreground">Pillar Breakdown</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Score across GEO pillars</p>
      </div>

      {/* Inner inset card */}
      <div className="flex flex-1 flex-col rounded-lg border border-neutral-100 bg-[#f7f7f7] p-3">
        {!hasData ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-muted-foreground">No pillar data yet</p>
          </div>
        ) : (
          <ChartContainer
            config={CHART_CONFIG}
            className="mx-auto aspect-square max-h-[220px] w-full"
          >
            <RadialBarChart
              data={chartData}
              startAngle={-90}
              endAngle={380}
              innerRadius={30}
              outerRadius={110}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    nameKey="browser"
                    formatter={(value, _name, item) => (
                      <>
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: item.payload?.fill }}
                        />
                        <span className="text-xs font-semibold text-foreground">{item.payload?.browser}</span>
                        <span className="ml-auto text-xs font-bold tabular-nums" style={{ color: item.payload?.fill }}>
                          {value}<span className="text-muted-foreground font-normal text-[10px]">/100</span>
                        </span>
                      </>
                    )}
                  />
                }
              />
              <RadialBar dataKey="score" background>
                <LabelList
                  position="insideStart"
                  dataKey="browser"
                  className="fill-white capitalize mix-blend-luminosity"
                  fontSize={11}
                />
              </RadialBar>
            </RadialBarChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}
