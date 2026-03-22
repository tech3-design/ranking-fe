"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";

interface ScoreCardProps {
  title: string;
  score: number;
  details: Record<string, unknown>;
  color?: string;
}

function getScoreBadge(score: number): string {
  if (score >= 80) return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
  if (score >= 60) return "bg-yellow-500/15 text-yellow-500 border-yellow-500/30";
  if (score >= 40) return "bg-orange-500/15 text-orange-500 border-orange-500/30";
  return "bg-red-500/15 text-red-500 border-red-500/30";
}

function getScoreFill(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

export function ScoreCard({ title, score, details }: ScoreCardProps) {
  const checks = (details?.checks ?? {}) as Record<string, unknown>;
  const findings = (details?.findings ?? []) as string[];

  return (
    <Spotlight className="rounded-xl">
      <Card className="h-full border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getScoreBadge(score)}`}
              style={{ textShadow: '0 0 20px rgba(59,130,246,0.5)' }}
            >
              {Math.round(score)}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/70">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5 rounded-lg border border-border/40 bg-background/35 p-2.5">
            {Object.entries(checks)
              .filter(([, value]) => typeof value !== "object" || value === null)
              .slice(0, 4)
              .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{key.replace(/_/g, " ")}</span>
                  <span className="font-mono">
                    {typeof value === "boolean" ? (value ? "Pass" : "Fail") : String(value ?? "\u2014")}
                  </span>
                </div>
              ))}
          </div>
          {findings.length > 0 && (
            <div className="mt-3 border-t border-border/40 pt-2">
              <p className="mb-1 text-xs text-muted-foreground">Issues found:</p>
              {findings.slice(0, 2).map((f) => (
                <p key={f} className="text-xs text-destructive">
                  {f.replace(/_/g, " ")}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Spotlight>
  );
}
