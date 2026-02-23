"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GADataSnapshot } from "@/lib/api/integrations";

interface TrafficOverviewCardProps {
  data: GADataSnapshot;
}

export function TrafficOverviewCard({ data }: TrafficOverviewCardProps) {
  const organicPct =
    data.sessions > 0
      ? Math.round((data.organic_sessions / data.sessions) * 100)
      : 0;

  const avgMinutes = Math.floor(data.avg_session_duration / 60);
  const avgSeconds = Math.round(data.avg_session_duration % 60);

  const metrics = [
    { label: "Total Sessions", value: data.sessions.toLocaleString() },
    { label: "Organic Sessions", value: data.organic_sessions.toLocaleString() },
    { label: "Organic %", value: `${organicPct}%` },
    {
      label: "Bounce Rate",
      value: `${Math.round(data.bounce_rate * 100)}%`,
    },
    {
      label: "Avg Duration",
      value: `${avgMinutes}m ${avgSeconds}s`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Traffic Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-2xl font-bold">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          {data.date_start} — {data.date_end}
        </p>
      </CardContent>
    </Card>
  );
}
