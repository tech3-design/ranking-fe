"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EntityDetailsPanelProps {
  details: Record<string, unknown>;
  score: number;
}

const CHECK_LABELS: Record<string, string> = {
  brand_name: "Detected brand name",
  brand_extracted: "Brand extraction",
  wikipedia_presence: "Wikipedia presence",
  knowledge_panel: "Knowledge panel (AI)",
  kp_confidence: "Knowledge panel confidence",
  third_party_score: "Third-party mentions (0-10)",
  mention_confidence: "Mention confidence",
  social_profiles: "Social profiles linked",
  social_count: "Number of social links",
  domain: "Domain",
};

export function EntityDetailsPanel({ details, score }: EntityDetailsPanelProps) {
  const checks = (details?.checks ?? {}) as Record<string, unknown>;

  return (
    <Card className="border-border/60 bg-card/65 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>Entity Authority</span>
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
            } else if (typeof value === "number") {
              displayValue = String(Math.round(value * 100) / 100);
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
