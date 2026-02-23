"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";

interface ScoreCardProps {
  title: string;
  score: number;
  details: Record<string, unknown>;
  color?: string;
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-green-500/10 text-green-500";
  if (score >= 60) return "bg-yellow-500/10 text-yellow-500";
  if (score >= 40) return "bg-orange-500/10 text-orange-500";
  return "bg-red-500/10 text-red-500";
}

export function ScoreCard({ title, score, details }: ScoreCardProps) {
  const checks = (details?.checks ?? {}) as Record<string, unknown>;
  const findings = (details?.findings ?? []) as string[];

  return (
    <Spotlight className="rounded-xl">
      <Card className="backdrop-blur-xl bg-card/50 border-border/50 h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getScoreBg(score)}`}
            >
              {Math.round(score)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {Object.entries(checks)
              .filter(([, value]) => typeof value !== "object" || value === null)
              .slice(0, 6)
              .map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="font-mono">
                  {typeof value === "boolean"
                    ? value
                      ? "Pass"
                      : "Fail"
                    : String(value ?? "\u2014")}
                </span>
              </div>
            ))}
          </div>
          {findings.length > 0 && (
            <div className="mt-3 pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">Issues found:</p>
              {findings.slice(0, 3).map((f) => (
                <p key={f} className="text-xs text-destructive">
                  {f.replace(/_/g, " ")}
                </p>
              ))}
              {findings.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{findings.length - 3} more
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Spotlight>
  );
}
