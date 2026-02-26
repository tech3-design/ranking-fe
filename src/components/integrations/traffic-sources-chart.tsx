"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { GADataSnapshot } from "@/lib/api/integrations";

interface TrafficSourcesChartProps {
  data: GADataSnapshot;
}

export function TrafficSourcesChart({ data }: TrafficSourcesChartProps) {
  // Group by medium for cleaner view
  const byMedium: Record<string, number> = {};
  for (const src of data.traffic_sources) {
    const medium = src.medium || "unknown";
    byMedium[medium] = (byMedium[medium] || 0) + src.sessions;
  }

  const chartData = Object.entries(byMedium)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([medium, sessions]) => ({ medium, sessions }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Traffic Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <YAxis
                type="category"
                dataKey="medium"
                width={100}
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="sessions"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
