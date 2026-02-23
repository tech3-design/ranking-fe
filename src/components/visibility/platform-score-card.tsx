"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";

function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-500 bg-green-500/10 border-green-500/20";
  if (score >= 50) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
  if (score >= 30) return "text-orange-500 bg-orange-500/10 border-orange-500/20";
  return "text-red-500 bg-red-500/10 border-red-500/20";
}

interface PlatformScoreCardProps {
  platform: string;
  icon: React.ReactNode;
  score: number | null;
  subScores?: Record<string, number>;
}

export function PlatformScoreCard({
  platform,
  icon,
  score,
  subScores,
}: PlatformScoreCardProps) {
  const displayScore = score != null ? Math.round(score) : 0;

  return (
    <Spotlight className="rounded-xl">
      <Card className="backdrop-blur-xl bg-card/50 border-border/50 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle className="text-base">{platform}</CardTitle>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-sm font-bold border ${getScoreColor(displayScore)}`}
            >
              {displayScore}
            </span>
          </div>
        </CardHeader>
        {subScores && Object.keys(subScores).length > 0 && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Object.entries(subScores).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.min(100, value)}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs w-8 text-right">
                      {Math.round(value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </Spotlight>
  );
}
