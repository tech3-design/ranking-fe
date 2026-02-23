"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ShopifyDataSnapshot } from "@/lib/api/integrations";

interface ShopifyOrdersTrendChartProps {
  data: ShopifyDataSnapshot;
}

export function ShopifyOrdersTrendChart({ data }: ShopifyOrdersTrendChartProps) {
  const chartData = data.daily_orders.map((d) => ({
    date: d.date.slice(5), // MM-DD
    orders: d.orders,
    revenue: parseFloat(d.revenue),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily Orders & Revenue (30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={((value: number | undefined, name: string | undefined) => {
                  const v = value ?? 0;
                  const n = name ?? "";
                  return n === "Revenue"
                    ? [`$${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, n]
                    : [v, n];
                }) as never}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="orders"
                fill="hsl(var(--primary))"
                opacity={0.6}
                name="Orders"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                name="Revenue"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
