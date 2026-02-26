"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  getScoreTrafficCorrelation,
  type CorrelationDataPoint,
} from "@/lib/api/integrations";

interface ScoreTrafficChartProps {
  email: string;
}

export function ScoreTrafficChart({ email }: ScoreTrafficChartProps) {
  const [data, setData] = useState<CorrelationDataPoint[]>([]);
  const [hasGA, setHasGA] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;
    getScoreTrafficCorrelation(email)
      .then((res) => {
        setData(res.data_points);
        setHasGA(res.has_ga_data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [email]);

  if (loading) return null;
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    date: d.date.slice(5), // MM-DD
    "GEO Score": d.geo_score,
    Sessions: d.sessions,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">GEO Score vs Traffic</CardTitle>
        <CardDescription>
          {hasGA
            ? "Track how GEO improvements correlate with traffic changes."
            : "Connect Google Analytics to see traffic data alongside scores."}
        </CardDescription>
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
                yAxisId="score"
                orientation="left"
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                label={{
                  value: "GEO Score",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 11 },
                }}
              />
              {hasGA && (
                <YAxis
                  yAxisId="sessions"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                  label={{
                    value: "Sessions",
                    angle: 90,
                    position: "insideRight",
                    style: { fontSize: 11 },
                  }}
                />
              )}
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
                yAxisId="score"
                type="monotone"
                dataKey="GEO Score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              {hasGA && (
                <Bar
                  yAxisId="sessions"
                  dataKey="Sessions"
                  fill="#22c55e"
                  opacity={0.4}
                  radius={[2, 2, 0, 0]}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
