"use client";

import { useState, useEffect, useRef } from "react";
import type { Recommendation } from "@/lib/api/analyzer";
import { applyAutoFix, getAutoFixStatus } from "@/lib/api/analyzer";
import {
  Loader2, Wrench, CheckCircle2, XCircle, ChevronDown, ChevronRight,
  AlertTriangle, ArrowUp, Minus, Copy,
} from "lucide-react";

const PILLAR_LABELS: Record<string, string> = {
  content: "Content",
  schema: "Schema",
  eeat: "E-E-A-T",
  technical: "Technical",
  entity: "Entity",
  ai_visibility: "AI Visibility",
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; icon: typeof AlertTriangle }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: AlertTriangle },
  high: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: ArrowUp },
  medium: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Minus },
  low: { color: "text-neutral-400", bg: "bg-neutral-500/10 border-neutral-500/20", icon: Minus },
};

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  slug?: string;
  email?: string;
  orgId?: number;
}

export function RecommendationsPanel({ recommendations, slug, email, orgId }: RecommendationsPanelProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [fixingIds, setFixingIds] = useState<Set<number>>(new Set());
  const [fixResults, setFixResults] = useState<Record<number, { status: string; message: string }>>({});
  const [fixingAll, setFixingAll] = useState(false);
  const [fixProgress, setFixProgress] = useState({ done: 0, total: 0 });
  const loadedRef = useRef(false);

  const fixableRecs = recommendations.filter((r) => r.can_auto_fix);
  const hasFixable = fixableRecs.length > 0 && slug && email;

  useEffect(() => {
    if (!slug || loadedRef.current) return;
    loadedRef.current = true;
    getAutoFixStatus(slug)
      .then((results) => {
        const existing: Record<number, { status: string; message: string }> = {};
        for (const r of results) existing[r.recommendation_id] = { status: r.status, message: r.message };
        setFixResults((prev) => ({ ...existing, ...prev }));
      })
      .catch(() => {});
  }, [slug]);

  async function handleApplyFix(recId: number) {
    if (!slug || !email) return;
    setFixingIds((prev) => new Set(prev).add(recId));
    try {
      const results = await applyAutoFix(slug, [recId], email, orgId);
      if (results[0]) setFixResults((prev) => ({ ...prev, [recId]: results[0] }));
    } catch {
      setFixResults((prev) => ({ ...prev, [recId]: { status: "failed", message: "Request failed" } }));
    } finally {
      setFixingIds((prev) => { const next = new Set(prev); next.delete(recId); return next; });
    }
  }

  async function handleFixAll() {
    if (!slug || !email || !fixableRecs.length) return;
    const unfixed = fixableRecs.filter((r) => !fixResults[r.id] || fixResults[r.id].status === "failed");
    if (!unfixed.length) return;
    setFixingAll(true);
    setFixProgress({ done: 0, total: unfixed.length });

    const promises = unfixed.map(async (rec) => {
      setFixingIds((prev) => new Set(prev).add(rec.id));
      try {
        const results = await applyAutoFix(slug, [rec.id], email, orgId);
        if (results[0]) setFixResults((prev) => ({ ...prev, [rec.id]: results[0] }));
      } catch {
        setFixResults((prev) => ({ ...prev, [rec.id]: { status: "failed", message: "Request failed" } }));
      } finally {
        setFixingIds((prev) => { const next = new Set(prev); next.delete(rec.id); return next; });
        setFixProgress((prev) => ({ ...prev, done: prev.done + 1 }));
      }
    });

    await Promise.all(promises);
    setFixingAll(false);
    setFixProgress({ done: 0, total: 0 });
  }

  const fixedCount = Object.values(fixResults).filter((r) => r.status === "success").length;
  const allFixed = fixableRecs.length > 0 && fixableRecs.every((r) => fixResults[r.id]?.status === "success");

  if (!recommendations.length) return null;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div>
          <h3 className="text-sm font-semibold text-white">Recommendations</h3>
          <p className="text-xs text-neutral-500 mt-0.5">{recommendations.length} items to improve your GEO score</p>
        </div>
        <div className="flex items-center gap-2">
          {hasFixable && (
            allFixed ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                All fixed
              </span>
            ) : (
              <button
                onClick={handleFixAll}
                disabled={fixingAll}
                className="flex items-center gap-1.5 rounded-full bg-[#3ecf8e] px-4 py-1.5 text-xs font-medium text-[#171717] transition hover:bg-[#35b87d] disabled:opacity-60"
              >
                {fixingAll ? (
                  <><Loader2 className="h-3 w-3 animate-spin" /> Fixing {fixProgress.done}/{fixProgress.total}</>
                ) : (
                  <><Wrench className="h-3 w-3" /> {fixedCount > 0 ? `Fix ${fixableRecs.length - fixedCount} Remaining` : `Fix All ${fixableRecs.length}`}</>
                )}
              </button>
            )
          )}
        </div>
      </div>

      {/* Table header */}
      <div className="hidden md:grid grid-cols-[2rem_1fr_5rem_5rem_6rem] gap-3 px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-600 border-b border-white/[0.04]">
        <span>#</span>
        <span>Recommendation</span>
        <span>Priority</span>
        <span>Pillar</span>
        <span className="text-right">Status</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/[0.04]">
        {recommendations.map((rec, index) => {
          const isExpanded = expandedId === rec.id;
          const priority = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.medium;
          const PriorityIcon = priority.icon;
          const fixResult = fixResults[rec.id];
          const isFixing = fixingIds.has(rec.id);

          return (
            <div key={rec.id}>
              {/* Row */}
              <div
                className="grid grid-cols-[1fr_auto] md:grid-cols-[2rem_1fr_5rem_5rem_6rem] gap-2 md:gap-3 px-4 md:px-5 py-3 cursor-pointer transition-colors hover:bg-white/[0.03] items-center"
                onClick={() => setExpandedId(isExpanded ? null : rec.id)}
              >
                <span className="hidden md:block text-xs text-neutral-600 font-mono">{String(index + 1).padStart(2, "0")}</span>

                <div className="min-w-0 flex items-center gap-2">
                  {isExpanded
                    ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                    : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                  }
                  <span className="text-sm text-neutral-200 truncate">{rec.title}</span>
                </div>

                <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${priority.color}`}>
                  <PriorityIcon className="h-3 w-3" />
                  {rec.priority}
                </span>

                <span className="hidden md:block text-[10px] text-neutral-500">{PILLAR_LABELS[rec.pillar] || rec.pillar}</span>

                <div className="text-right">
                  {fixResult ? (
                    fixResult.status === "success" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Fixed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-red-400">
                        <XCircle className="h-3 w-3" /> Failed
                      </span>
                    )
                  ) : isFixing ? (
                    <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-[#3ecf8e]" />
                  ) : rec.can_auto_fix && slug && email ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleApplyFix(rec.id); }}
                      className="inline-flex items-center gap-1 text-[10px] text-[#3ecf8e] hover:underline"
                    >
                      <Wrench className="h-3 w-3" /> Fix
                    </button>
                  ) : (
                    <span className="text-[10px] text-neutral-600">Manual</span>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-4 pt-1">
                  <div className="ml-8 space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    {/* Description */}
                    <p className="text-xs text-neutral-400 leading-relaxed">{rec.description}</p>

                    {/* Action steps */}
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-600 mb-2">Action Steps</p>
                      <ActionContent action={rec.action} />
                    </div>

                    {/* Impact */}
                    {rec.impact_estimate && (
                      <div className="flex items-center gap-2 rounded-lg bg-[#3ecf8e]/5 border border-[#3ecf8e]/10 px-3 py-2">
                        <span className="text-[#3ecf8e] text-xs">⚡</span>
                        <p className="text-xs text-neutral-400">{rec.impact_estimate}</p>
                      </div>
                    )}

                    {/* Fix result detail */}
                    {fixResult && (
                      <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                        fixResult.status === "success"
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : "bg-red-500/10 border border-red-500/20 text-red-400"
                      }`}>
                        {fixResult.status === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {fixResult.message}
                      </div>
                    )}

                    {/* Fix button if not yet fixed */}
                    {!fixResult && rec.can_auto_fix && slug && email && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApplyFix(rec.id); }}
                        disabled={isFixing}
                        className="flex items-center gap-2 rounded-lg bg-[#3ecf8e] px-4 py-2 text-xs font-medium text-[#171717] transition hover:bg-[#35b87d] disabled:opacity-60"
                      >
                        {isFixing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wrench className="h-3.5 w-3.5" />}
                        Apply Fix
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Action Content Renderer ─────────────────────────────────────────── */

function ActionContent({ action }: { action: string }) {
  const [copied, setCopied] = useState(false);
  const lines = action.split("\n");

  // Detect if there's code-like content
  const hasCode = action.includes("<script") || action.includes("<") || action.includes("{\"@");

  return (
    <div className="space-y-1.5 text-xs text-neutral-300 leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Step headers
        if (/^STEP \d/i.test(trimmed)) {
          const num = trimmed.match(/\d+/)?.[0];
          return (
            <div key={i} className="flex items-center gap-2 mt-3 first:mt-0">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3ecf8e]/10 text-[10px] font-bold text-[#3ecf8e]">
                {num}
              </span>
              <span className="font-medium text-neutral-200">{trimmed.replace(/^STEP \d+ — ?/i, "")}</span>
            </div>
          );
        }

        // Bullet points
        if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("–")) {
          return (
            <div key={i} className="flex gap-2 pl-7">
              <span className="text-[#3ecf8e]/60 shrink-0">•</span>
              <span className="text-neutral-400">{trimmed.replace(/^[•\-–]\s*/, "")}</span>
            </div>
          );
        }

        // Code lines
        if (trimmed.startsWith("<") || trimmed.startsWith("{") || trimmed.startsWith("}") || trimmed.startsWith('"@')) {
          return (
            <div key={i} className="relative group">
              <pre className="rounded-lg bg-neutral-900 border border-white/[0.06] px-3 py-2 font-mono text-[11px] text-neutral-300 overflow-x-auto">
                {trimmed}
              </pre>
              <button
                onClick={() => { navigator.clipboard.writeText(trimmed); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="absolute right-2 top-1.5 opacity-0 group-hover:opacity-100 transition text-neutral-500 hover:text-white"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          );
        }

        // PRO TIP
        if (/^PRO TIP/i.test(trimmed)) {
          return (
            <div key={i} className="mt-2 rounded-lg bg-[#3ecf8e]/5 border border-[#3ecf8e]/10 px-3 py-2">
              <span className="text-[9px] font-bold text-[#3ecf8e] uppercase tracking-wider">Pro Tip</span>
              <p className="text-neutral-400 mt-0.5">{trimmed.replace(/^PRO TIP:?\s*/i, "")}</p>
            </div>
          );
        }

        return <p key={i} className="text-neutral-400 pl-7">{trimmed}</p>;
      })}
    </div>
  );
}
