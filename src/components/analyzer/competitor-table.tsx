"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Competitor } from "@/lib/api/analyzer";

interface CompetitorTableProps {
  competitors: Competitor[];
  yourScore: number | null;
}

export function CompetitorTable({ competitors, yourScore }: CompetitorTableProps) {
  const scored = competitors.filter((c) => c.scored);
  if (!scored.length) return null;

  const sorted = [...scored].sort(
    (a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competitor Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Your score */}
          {yourScore !== null && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex-1">
                <p className="text-sm font-semibold">Your Site</p>
              </div>
              <div className="w-32">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${yourScore}%` }}
                  />
                </div>
              </div>
              <span className="font-mono text-sm font-bold w-10 text-right">
                {Math.round(yourScore)}
              </span>
            </div>
          )}

          {/* Competitors */}
          {sorted.map((comp) => (
            <div
              key={comp.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{comp.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {comp.url}
                </p>
              </div>
              <div className="w-32">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-muted-foreground/40 transition-all"
                    style={{ width: `${comp.composite_score ?? 0}%` }}
                  />
                </div>
              </div>
              <span className="font-mono text-sm w-10 text-right">
                {comp.composite_score != null
                  ? Math.round(comp.composite_score)
                  : "—"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
