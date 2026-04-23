"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Globe, Lock } from "lucide-react";
import type { Competitor } from "@/lib/api/analyzer";

function hostOf(url: string): string {
  try {
    const u = new URL(url.includes("://") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function SiteLogo({ url, size = 28 }: { url: string; size?: number }) {
  const host = hostOf(url);
  const [failed, setFailed] = useState(false);
  const src = host
    ? `https://www.google.com/s2/favicons?domain=${host}&sz=${size * 2}`
    : "";

  if (!host || failed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground"
        style={{ width: size, height: size }}
      >
        <Globe className="h-3.5 w-3.5" aria-hidden />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="shrink-0 rounded-md border border-border/60 bg-white object-contain p-0.5"
      style={{ width: size, height: size }}
    />
  );
}

interface CompetitorTableProps {
  competitors: Competitor[];
  yourScore: number | null;
  locked?: boolean;
  query?: string;
  scoreBand?: ScoreBandFilter;
  confidence?: ConfidenceFilter;
}

export type ScoreBandFilter = "all" | "leaders" | "mid" | "low";
export type ConfidenceFilter = "all" | "scored" | "unscored";

export function CompetitorTable({
  competitors,
  yourScore,
  locked = false,
  query = "",
  scoreBand = "all",
  confidence = "all",
}: CompetitorTableProps) {
  if (!competitors.length) return null;

  const sorted = useMemo(
    () =>
      [...competitors].sort(
        (a, b) =>
          Number(Boolean(b.scored)) - Number(Boolean(a.scored)) ||
          (b.composite_score ?? -1) - (a.composite_score ?? -1),
      ),
    [competitors],
  );

  const filtered = useMemo(
    () =>
      sorted.filter((comp) => {
        const hay = `${comp.name} ${comp.url} ${hostOf(comp.url)}`.toLowerCase();
        const matchQuery = !query.trim() || hay.includes(query.toLowerCase());
        const matchConfidence =
          confidence === "all" ||
          (confidence === "scored" ? comp.scored : !comp.scored);
        const score = comp.composite_score ?? 0;
        const matchScore =
          scoreBand === "all" ||
          (scoreBand === "leaders" && score >= 70) ||
          (scoreBand === "mid" && score >= 40 && score < 70) ||
          (scoreBand === "low" && score < 40);
        return matchQuery && matchConfidence && matchScore;
      }),
    [confidence, query, scoreBand, sorted],
  );

  return (
    <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none py-0 bg-white">
      <div className={cn("relative", locked && "blur-[2px] select-none pointer-events-none")}>
        <Table>
          <TableHeader className="bg-muted/35">
            <TableRow className="border-border/60 hover:bg-muted/35">
              <TableHead className="w-10 pl-4">#</TableHead>
              <TableHead>Competitor</TableHead>
              <TableHead className="hidden md:table-cell">Domain</TableHead>
              <TableHead className="w-[108px]">Confidence</TableHead>
              <TableHead className="w-[84px] text-right pr-4">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {yourScore !== null ? (
              <TableRow className="border-border/60 bg-primary/5 hover:bg-primary/10">
                <TableCell className="pl-4 align-middle">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-[10px] font-semibold text-primary">
                    You
                  </span>
                </TableCell>
                <TableCell className="align-middle">
                  <p className="text-sm font-medium text-foreground">Your site</p>
                </TableCell>
                <TableCell className="hidden align-middle text-xs text-muted-foreground md:table-cell">
                  Current project
                </TableCell>
                <TableCell className="align-middle">
                  <span className="inline-flex rounded-md border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    Verified
                  </span>
                </TableCell>
                <TableCell className="pr-4 text-right font-mono text-sm font-semibold align-middle">
                  {Math.round(yourScore)}
                </TableCell>
              </TableRow>
            ) : null}

            {filtered.length === 0 ? (
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                  No competitors match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((comp, idx) => (
                <TableRow key={comp.id} className="border-border/60">
                  <TableCell className="pl-4 align-middle">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </TableCell>
                  <TableCell className="align-middle">
                    <div className="flex items-center gap-2.5">
                      {locked ? (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground">
                          <Globe className="h-3.5 w-3.5" aria-hidden />
                        </div>
                      ) : (
                        <SiteLogo url={comp.url} />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {locked ? `Competitor ${idx + 1}` : comp.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground md:hidden">
                          {locked ? "hidden-domain.com" : hostOf(comp.url) || comp.url}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden align-middle text-xs text-muted-foreground md:table-cell">
                    {locked ? "hidden-domain.com" : hostOf(comp.url) || comp.url}
                  </TableCell>
                  <TableCell className="align-middle">
                    {comp.scored ? (
                      <span className="inline-flex rounded-md border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex rounded-md border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                        Low confidence
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="pr-4 text-right font-mono text-sm align-middle">
                    {locked ? "?" : comp.composite_score != null ? Math.round(comp.composite_score) : "\u2014"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

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
    </Card>
  );
}
