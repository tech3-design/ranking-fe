"use client";

import { useMemo } from "react";
import { BrandBarChart, BRAND_PALETTE, type BarChartDatum } from "@/components/ui/vis-charts";

interface PlatformBarChartProps {
  google: number;
  reddit: number;
  web?: number;
}

export function PlatformBarChart({ google, reddit, web }: PlatformBarChartProps) {
  const data: BarChartDatum[] = useMemo(
    () => [
      { label: "Google", value: google, color: BRAND_PALETTE[0] },
      { label: "Reddit", value: reddit, color: BRAND_PALETTE[2] },
      { label: "Web", value: web ?? 0, color: BRAND_PALETTE[4] },
    ],
    [google, reddit, web],
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="mb-4 text-sm font-semibold text-foreground">Platform Comparison</p>
      <BrandBarChart
        data={data}
        height={200}
        yDomain={[0, 100]}
        yTickFormatter={String}
        tooltipFormatter={(v, d) => [`${Math.round(v)} / 100`, d.label]}
        barSize={40}
      />
    </div>
  );
}
