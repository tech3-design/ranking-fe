"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Globe, Lock, Plus, User } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Competitor } from "@/lib/api/analyzer";

export type ScoreBandFilter = "all" | "leaders" | "mid" | "low";
export type ConfidenceFilter = "all" | "scored" | "unscored";

type Relation = "direct" | "indirect" | "adjacent" | "unknown";

const RELATION_LABEL: Record<Relation, string> = {
  direct: "Direct competitors",
  indirect: "Indirect competitors",
  adjacent: "Adjacent brand",
  unknown: "Select relation",
};

interface BrandRow {
  key: string;
  name: string;
  url: string;
  domain: string;
  score: number | null;
  isMine: boolean;
  locked: boolean;
  scored: boolean;
  defaultRelation: Relation;
}

interface CompetitorTableProps {
  competitors: Competitor[];
  yourScore: number | null;
  yourName?: string;
  yourUrl?: string;
  locked?: boolean;
  query?: string;
  scoreBand?: ScoreBandFilter;
  confidence?: ConfidenceFilter;
}

function deriveRelation(c: Competitor): Exclude<Relation, "unknown"> {
  // AI-suggested default from backend signals. User can override via dropdown.
  const tier = (c.tier || "").toLowerCase();
  if (tier.includes("tier 1") || tier.includes("direct")) return "direct";
  if (tier.includes("tier 2")) return "indirect";
  const tm = (c.target_market || "").toLowerCase();
  if (tm && (tm.includes("same") || tm.includes("identical"))) return "direct";
  // Fallback: treat unclassified as adjacent rather than leaving unselected
  return "adjacent";
}

function hostOf(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url.includes("://") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^www\./, "").split("/")[0];
  }
}

function SiteLogo({ url, size = 32 }: { url: string; size?: number }) {
  const host = hostOf(url);
  const [failed, setFailed] = useState(false);
  const src = host ? `https://www.google.com/s2/favicons?domain=${host}&sz=${size * 2}` : "";

  if (!host || failed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/50 text-muted-foreground"
        style={{ width: size, height: size }}
      >
        <Globe className="h-4 w-4" aria-hidden />
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
      className="shrink-0 rounded-md border border-border/60 bg-white object-contain p-1"
      style={{ width: size, height: size }}
    />
  );
}

export function CompetitorTable({
  competitors,
  yourScore,
  yourName,
  yourUrl,
  locked = false,
  query = "",
  scoreBand = "all",
  confidence = "all",
}: CompetitorTableProps) {
  const [relations, setRelations] = useState<Record<string, Relation>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const rows = useMemo<BrandRow[]>(() => {
    const list: BrandRow[] = [];
    if (yourUrl) {
      list.push({
        key: "mine",
        name: yourName || hostOf(yourUrl) || "Your brand",
        url: yourUrl,
        domain: hostOf(yourUrl),
        score: yourScore,
        isMine: true,
        locked: false,
        scored: true,
        defaultRelation: "unknown",
      });
    }
    const sorted = [...competitors].sort(
      (a, b) =>
        Number(Boolean(b.scored)) - Number(Boolean(a.scored)) ||
        (b.composite_score ?? -1) - (a.composite_score ?? -1),
    );
    const q = query.trim().toLowerCase();
    const filtered = sorted.filter((c) => {
      const hay = `${c.name} ${c.url} ${hostOf(c.url)}`.toLowerCase();
      const matchQuery = !q || hay.includes(q);
      const matchConfidence =
        confidence === "all" ||
        (confidence === "scored" ? c.scored : !c.scored);
      const score = c.composite_score ?? 0;
      const matchScore =
        scoreBand === "all" ||
        (scoreBand === "leaders" && score >= 70) ||
        (scoreBand === "mid" && score >= 40 && score < 70) ||
        (scoreBand === "low" && score < 40);
      return matchQuery && matchConfidence && matchScore;
    });
    filtered.forEach((c, idx) => {
      list.push({
        key: `c-${c.id}`,
        name: locked ? `Competitor ${idx + 1}` : c.name,
        url: locked ? "" : c.url,
        domain: locked ? "hidden-domain.com" : hostOf(c.url),
        score: c.composite_score,
        isMine: false,
        locked,
        scored: c.scored,
        defaultRelation: deriveRelation(c),
      });
    });
    return list;
  }, [competitors, yourScore, yourName, yourUrl, locked, query, confidence, scoreBand]);

  if (!rows.length) return null;

  const allSelected = rows.every((r) => selected[r.key]) && rows.length > 0;
  const toggleAll = () => {
    if (allSelected) {
      setSelected({});
    } else {
      setSelected(Object.fromEntries(rows.map((r) => [r.key, true])));
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-border/60 bg-muted/30">
            <tr className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={locked}
                  className="h-4 w-4 rounded border-border accent-primary"
                  aria-label="Select all"
                />
              </th>
              <th className="px-3 py-3">Brand</th>
              <th className="px-3 py-3">Domain</th>
              <th className="px-3 py-3">Tags</th>
              <th className="px-3 py-3 text-right">Score</th>
              <th className="px-3 py-3 w-56">Relation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const rel: Relation = r.isMine
                ? "unknown"
                : (relations[r.key] ?? r.defaultRelation);
              const scoreVal =
                r.score != null ? Math.round(r.score) : null;
              return (
                <tr
                  key={r.key}
                  className={cn(
                    "border-b border-border/40 last:border-0 transition-colors hover:bg-muted/30",
                    r.isMine && "bg-primary/5",
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!!selected[r.key]}
                      onChange={() =>
                        setSelected((s) => ({ ...s, [r.key]: !s[r.key] }))
                      }
                      disabled={locked}
                      className="h-4 w-4 rounded border-border accent-primary"
                      aria-label={`Select ${r.name}`}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      {r.locked ? (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/50 text-muted-foreground">
                          <Globe className="h-4 w-4" aria-hidden />
                        </div>
                      ) : (
                        <SiteLogo url={r.url} />
                      )}
                      <span className="font-semibold text-foreground">
                        {r.name}
                        {!r.locked && !r.isMine && !r.scored ? (
                          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                            Low confidence
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[13px]">
                    {r.locked || !r.url ? (
                      <span className="text-muted-foreground">{r.domain}</span>
                    ) : (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {r.domain}
                      </a>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-border/80 hover:text-foreground"
                      aria-label="Add tag"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-[13px] tabular-nums">
                    {r.locked ? (
                      <span className="text-muted-foreground">?</span>
                    ) : scoreVal != null ? (
                      <ScoreChip value={scoreVal} />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {r.isMine ? (
                      <div className="inline-flex h-9 items-center gap-2 rounded-md border border-border/60 bg-background px-3 text-[13px] font-medium text-foreground">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        My brand
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={rel}
                          onChange={(e) =>
                            setRelations((s) => ({
                              ...s,
                              [r.key]: e.target.value as Relation,
                            }))
                          }
                          disabled={r.locked}
                          className={cn(
                            "h-9 w-full appearance-none rounded-md border border-border/60 bg-background pl-3 pr-8 text-[13px] font-medium text-foreground transition hover:border-border focus:border-primary focus:outline-none",
                            rel === "unknown" && "text-muted-foreground",
                          )}
                        >
                          <option value="unknown">Select relation</option>
                          <option value="direct">Direct competitors</option>
                          <option value="indirect">Indirect competitors</option>
                          <option value="adjacent">Adjacent brand</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {locked ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
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
      ) : null}
    </div>
  );
}

function ScoreChip({ value }: { value: number }) {
  const tint =
    value >= 70
      ? "bg-emerald-100 text-emerald-700"
      : value >= 40
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";
  return (
    <span
      className={cn(
        "inline-flex min-w-[40px] justify-center rounded-md px-2 py-0.5 text-[12px] font-semibold",
        tint,
      )}
    >
      {value}
    </span>
  );
}

export { RELATION_LABEL };
