"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { MovingBorder } from "@/components/ui/moving-border";
import { Lock } from "lucide-react";
import type { Competitor } from "@/lib/api/analyzer";

interface CompetitorTableProps {
  competitors: Competitor[];
  yourScore: number | null;
  locked?: boolean;
}

export function CompetitorTable({
  competitors,
  yourScore,
  locked = false,
}: CompetitorTableProps) {
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
          <div className="relative space-y-2">
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

            <div className={locked ? "space-y-2 blur-[3px] select-none pointer-events-none" : "space-y-2"}>
              {sorted.map((comp, idx) => (
                <div
                  key={comp.id}
                  className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/35 p-2.5 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {locked ? `Competitor ${idx + 1}` : comp.name}
                      {!locked && !comp.scored && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                          Low confidence
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {locked ? "hidden-domain.com" : comp.url}
                    </p>
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
                    {locked ? "?" : comp.composite_score != null ? Math.round(comp.composite_score) : "\u2014"}
                  </span>
                </div>
              ))}
            </div>

            {locked && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/45">
                <div className="max-w-xs rounded-xl border border-border bg-card px-4 py-3 text-center shadow-lg">
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/12">
                    <Lock className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">Unlock competitor details</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Upgrade to premium to reveal competitor names, scores, and ranking gaps.
                  </p>
                  <Link
                    href="/pricing"
                    className="mt-3 inline-flex rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                  >
                    Buy Premium
                  </Link>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Spotlight>
  );
}
