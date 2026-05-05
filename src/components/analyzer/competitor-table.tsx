"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, Globe, Loader2, Lock, MoreHorizontal, Plus, Trash2, User } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Competitor } from "@/lib/api/analyzer";
import { deleteCompetitor } from "@/lib/api/analyzer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  id: number | null;
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
  slug?: string;
  onDelete?: (id: number) => void;
}

function deriveRelation(c: Competitor): Exclude<Relation, "unknown"> {
  const tier = (c.tier || "").toLowerCase();
  if (tier.includes("tier 1") || tier.includes("direct")) return "direct";
  if (tier.includes("tier 2")) return "indirect";
  const tm = (c.target_market || "").toLowerCase();
  if (tm && (tm.includes("same") || tm.includes("identical"))) return "direct";
  return "adjacent";
}

function externalHref(url: string): string {
  if (!url) return "";
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
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

// ─── Three-dot row menu — portalled so it escapes overflow:hidden ─────────────

function RowMenu({ onDeleteClick }: { onDeleteClick: () => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
        aria-label="Row actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: pos.top,
              right: pos.right,
              zIndex: 9999,
            }}
            className="min-w-[130px] overflow-hidden rounded-lg border border-border bg-white py-1 shadow-xl"
          >
            <button
              type="button"
              onClick={() => { setOpen(false); onDeleteClick(); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] font-medium text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}

// ─── Delete confirmation modal ────────────────────────────────────────────────

function DeleteModal({
  name,
  deleting,
  onConfirm,
  onCancel,
}: {
  name: string;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-white p-6 shadow-2xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
          <Trash2 className="h-5 w-5 text-red-600" />
        </div>
        <h2 className="mt-3 text-base font-semibold text-foreground">Delete competitor</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Are you sure you want to remove{" "}
          <span className="font-semibold text-foreground">{name}</span> from your
          competitors list? This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="inline-flex h-9 items-center rounded-md border border-border bg-white px-4 text-[13px] font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-red-600 px-4 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />Deleting…</>
            ) : (
              <><Trash2 className="h-3.5 w-3.5" />Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────

export function CompetitorTable({
  competitors,
  yourScore,
  yourName,
  yourUrl,
  locked = false,
  query = "",
  scoreBand = "all",
  confidence = "all",
  slug,
  onDelete,
}: CompetitorTableProps) {
  const [relations, setRelations] = useState<Record<string, Relation>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ key: string; id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const rows = useMemo<BrandRow[]>(() => {
    const list: BrandRow[] = [];
    if (yourUrl) {
      list.push({
        key: "mine",
        id: null,
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
        id: c.id,
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

  async function handleConfirmDelete() {
    if (!deleteTarget || !slug) return;
    setDeleting(true);
    try {
      await deleteCompetitor(slug, deleteTarget.id);
      onDelete?.(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // keep modal open so user can retry
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <TooltipProvider>
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/30">
                <tr className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-3 py-3">Domain</th>
                  <th className="px-3 py-3">Tags</th>
                  <th className="px-3 py-3 text-right">Score</th>
                  <th className="w-56 px-3 py-3">Relation</th>
                  <th className="w-10 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const rel: Relation = r.isMine
                    ? "unknown"
                    : (relations[r.key] ?? r.defaultRelation);
                  const scoreVal = r.score != null ? Math.round(r.score) : null;

                  return (
                    <tr
                      key={r.key}
                      className={cn(
                        "border-b border-border/40 last:border-0 transition-colors hover:bg-muted/30",
                        r.isMine && "bg-primary/5",
                      )}
                    >
                      {/* Brand */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {r.locked ? (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/50 text-muted-foreground">
                              <Globe className="h-4 w-4" aria-hidden />
                            </div>
                          ) : (
                            <SiteLogo url={r.url} />
                          )}
                          <span className="flex items-center gap-1.5 font-semibold text-foreground">
                            {r.name}
                            {!r.locked && !r.isMine && !r.scored && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex h-4 w-4 shrink-0 cursor-default items-center justify-center rounded-full bg-red-100">
                                    <ArrowDownRight className="h-2.5 w-2.5 text-red-400" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={6}>
                                  Low confidence
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Domain */}
                      <td className="px-3 py-3 text-[13px]">
                        {r.locked || !r.url ? (
                          <span className="text-muted-foreground">{r.domain}</span>
                        ) : (
                          <a
                            href={externalHref(r.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {r.domain}
                          </a>
                        )}
                      </td>

                      {/* Tags */}
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-border/80 hover:text-foreground"
                          aria-label="Add tag"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </td>

                      {/* Score */}
                      <td className="px-3 py-3 text-right font-mono text-[13px] tabular-nums">
                        {r.locked ? (
                          <span className="text-muted-foreground">?</span>
                        ) : scoreVal != null ? (
                          <ScoreChip value={scoreVal} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Relation */}
                      <td className="px-3 py-3">
                        {r.isMine ? (
                          <div className="inline-flex h-9 items-center gap-2 rounded-md border border-border/60 bg-background px-3 text-[13px] font-medium text-foreground">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            My brand
                          </div>
                        ) : (
                          <Select
                            value={rel}
                            onValueChange={(v) =>
                              setRelations((s) => ({ ...s, [r.key]: v as Relation }))
                            }
                            disabled={r.locked}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-9 w-full border border-border/80 bg-white text-[13px] font-medium text-foreground shadow-sm focus:ring-0 focus:border-border dark:bg-white dark:text-foreground dark:hover:bg-neutral-50",
                                rel === "unknown" && "text-muted-foreground",
                              )}
                            >
                              <SelectValue placeholder="Select relation" />
                            </SelectTrigger>
                            <SelectContent
                              position="popper"
                              side="bottom"
                              avoidCollisions={false}
                              sideOffset={4}
                            >
                              <SelectItem value="unknown">Select relation</SelectItem>
                              <SelectItem value="direct">Direct competitors</SelectItem>
                              <SelectItem value="indirect">Indirect competitors</SelectItem>
                              <SelectItem value="adjacent">Adjacent brand</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3">
                        {!r.isMine && !r.locked && r.id !== null && slug ? (
                          <RowMenu
                            onDeleteClick={() =>
                              setDeleteTarget({ key: r.key, id: r.id!, name: r.name })
                            }
                          />
                        ) : (
                          <div className="w-7" />
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
      </TooltipProvider>

      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          deleting={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => !deleting && setDeleteTarget(null)}
        />
      )}
    </>
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
