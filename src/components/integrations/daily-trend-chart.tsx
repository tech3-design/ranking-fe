"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { GADataSnapshot } from "@/lib/api/integrations";

interface DailyTrendChartProps {
  data: GADataSnapshot;
}

export function DailyTrendChart({ data }: DailyTrendChartProps) {
  const chartData = data.daily_trend.map((d) => ({
    date: d.date.slice(5), // MM-DD
    sessions: d.sessions,
    organic: d.organic_sessions,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily Sessions (30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <YAxis
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
              <Legend />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                name="All Sessions"
              />
              <Line
                type="monotone"
                dataKey="organic"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                name="Organic"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
