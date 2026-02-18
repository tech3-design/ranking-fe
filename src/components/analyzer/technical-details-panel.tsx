"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TechnicalDetailsPanelProps {
  details: Record<string, unknown>;
  score: number;
}

const CHECK_LABELS: Record<string, string> = {
  llms_txt: "llms.txt exists",
  has_robots_txt: "robots.txt found",
  ai_bots_allowed: "AI bots allowed",
  blocked_bots: "Blocked bot agents",
  has_sitemap: "sitemap.xml exists",
  meta_robots_ok: "Meta robots allows indexing",
  is_https: "HTTPS enabled",
  load_time: "Page load time (s)",
  has_viewport: "Viewport meta tag",
  has_canonical: "Canonical URL tag",
};

export function TechnicalDetailsPanel({ details, score }: TechnicalDetailsPanelProps) {
  const checks = (details?.checks ?? {}) as Record<string, unknown>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>Technical GEO</span>
          <span className="font-mono">{Math.round(score)}/100</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(checks).map(([key, value]) => {
            let displayValue: string;
            let colorClass = "";

            if (typeof value === "boolean") {
              displayValue = value ? "Pass" : "Fail";
              colorClass = value ? "text-green-500" : "text-red-500";
            } else if (Array.isArray(value)) {
              displayValue = value.length ? value.join(", ") : "None";
              colorClass = value.length ? "text-red-500" : "text-green-500";
            } else if (key === "load_time" && typeof value === "number") {
              displayValue = `${value}s`;
              colorClass = value < 3 ? "text-green-500" : "text-red-500";
            } else {
              displayValue = String(value ?? "—");
            }

            return (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {CHECK_LABELS[key] || key.replace(/_/g, " ")}
                </span>
                <span className={`font-mono text-sm ${colorClass}`}>
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
