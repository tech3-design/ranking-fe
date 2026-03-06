"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { MovingBorder } from "@/components/ui/moving-border";
import type { Competitor } from "@/lib/api/analyzer";

interface CompetitorTableProps {
  competitors: Competitor[];
  yourScore: number | null;
}

export function CompetitorTable({ competitors, yourScore }: CompetitorTableProps) {
  if (!competitors.length) return null;

  const sorted = [...competitors].sort(
    (a, b) =>
      Number(Boolean(b.scored)) - Number(Boolean(a.scored)) ||
      (b.composite_score ?? -1) - (a.composite_score ?? -1),
  );

  return (
    <Spotlight className="rounded-xl">
      <Card className="border-border/60 bg-card/65 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle>Competitor Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {yourScore !== null && (
              <MovingBorder className="rounded-lg">
                <div className="flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/10 p-2.5">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Your Site</p>
                  </div>
                  <div className="w-40">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all"
                        style={{ width: `${yourScore}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-10 text-right font-mono text-sm font-bold">
                    {Math.round(yourScore)}
                  </span>
                </div>
              </MovingBorder>
            )}

            {sorted.map((comp) => (
              <div
                key={comp.id}
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/35 p-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {comp.name}
                    {!comp.scored && (
                      <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                        Low confidence
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{comp.url}</p>
                </div>
                <div className="w-40">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-muted-foreground/50 transition-all"
                      style={{ width: `${comp.composite_score ?? 0}%` }}
                    />
                  </div>
                </div>
                <span className="w-10 text-right font-mono text-sm">
                  {comp.composite_score != null ? Math.round(comp.composite_score) : "\u2014"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Spotlight>
  );
}
