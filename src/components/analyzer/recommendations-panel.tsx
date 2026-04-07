"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Recommendation, RecommendationStep, FixPreview } from "@/lib/api/analyzer";
import { previewFix, verifyFix } from "@/lib/api/analyzer";
import { FixPreviewModal } from "./fix-preview-modal";
import {
  Loader2, Eye, ChevronDown, ChevronRight, Copy, Check,
  AlertTriangle, ArrowUp, Minus, ShieldCheck, Clock, Zap,
  Flame, Star, Trophy, XCircle,
} from "lucide-react";

const PILLAR_LABELS: Record<string, string> = {
  content: "Content",
  schema: "Schema",
  eeat: "E-E-A-T",
  technical: "Technical",
  entity: "Entity",
  ai_visibility: "AI Visibility",
};

const PILLAR_COLORS: Record<string, string> = {
  content: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  schema: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  eeat: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  technical: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  entity: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  ai_visibility: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; icon: typeof AlertTriangle }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: AlertTriangle },
  high: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: ArrowUp },
  medium: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Minus },
  low: { color: "text-muted-foreground", bg: "bg-neutral-500/10 border-neutral-500/20", icon: Minus },
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; icon: typeof Star }> = {
  easy: { label: "Easy", color: "text-emerald-400", icon: Star },
  medium: { label: "Medium", color: "text-amber-400", icon: Flame },
  hard: { label: "Hard", color: "text-red-400", icon: Trophy },
};

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  slug?: string;
  email?: string;
  orgId?: number;
  initialFixResults?: Record<number, { status: string; message: string }>;
  onFixResult?: (recId: number, result: { status: string; message: string }) => void;
}

export function RecommendationsPanel({ recommendations, slug, email, orgId, initialFixResults, onFixResult }: RecommendationsPanelProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [fixingIds, setFixingIds] = useState<Set<number>>(new Set());
  const [fixResults, setFixResults] = useState<Record<number, { status: string; message: string }>>(initialFixResults ?? {});
  const [previewData, setPreviewData] = useState<FixPreview | null>(null);
  const [previewingId, setPreviewingId] = useState<number | null>(null);
  // Track completed steps per recommendation: { recId: Set<stepN> }
  const [completedSteps, setCompletedSteps] = useState<Record<number, Set<number>>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (initialFixResults) setFixResults((prev) => ({ ...initialFixResults, ...prev }));
  }, [initialFixResults]);

  // Load step completion from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("signalor_step_progress");
      if (saved) {
        const parsed = JSON.parse(saved);
        const restored: Record<number, Set<number>> = {};
        for (const [k, v] of Object.entries(parsed)) {
          restored[Number(k)] = new Set(v as number[]);
        }
        setCompletedSteps(restored);
      }
    } catch { /* ignore */ }
  }, []);

  const saveStepProgress = useCallback((updated: Record<number, Set<number>>) => {
    if (typeof window === "undefined") return;
    const serializable: Record<number, number[]> = {};
    for (const [k, v] of Object.entries(updated)) {
      serializable[Number(k)] = Array.from(v);
    }
    localStorage.setItem("signalor_step_progress", JSON.stringify(serializable));
  }, []);

  function toggleStep(recId: number, stepN: number) {
    setCompletedSteps((prev) => {
      const set = new Set(prev[recId] || []);
      if (set.has(stepN)) set.delete(stepN);
      else set.add(stepN);
      const updated = { ...prev, [recId]: set };
      saveStepProgress(updated);
      return updated;
    });
  }

  async function copyCode(code: string, key: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(key);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch { /* ignore */ }
  }

  async function handlePreview(recId: number) {
    if (!slug || !email) return;
    setPreviewingId(recId);
    setFixingIds((prev) => new Set(prev).add(recId));
    try {
      const preview = await previewFix(slug, recId, email);
      if (preview.status === "preview") {
        setPreviewData(preview);
      } else if (preview.status === "manual") {
        const manual = { status: "manual", message: preview.message || "This requires manual action. Follow the steps above." };
        setFixResults((prev) => ({ ...prev, [recId]: manual }));
        onFixResult?.(recId, manual);
      } else {
        const fail = { status: "failed", message: preview.message || "Preview failed" };
        setFixResults((prev) => ({ ...prev, [recId]: fail }));
        onFixResult?.(recId, fail);
      }
    } catch {
      const fail = { status: "failed", message: "Failed to generate preview" };
      setFixResults((prev) => ({ ...prev, [recId]: fail }));
      onFixResult?.(recId, fail);
    } finally {
      setFixingIds((prev) => { const next = new Set(prev); next.delete(recId); return next; });
    }
  }

  async function handleVerify(recId: number) {
    if (!slug) return;
    setFixingIds((prev) => new Set(prev).add(recId));
    try {
      const result = await verifyFix(slug, recId);
      setFixResults((prev) => ({ ...prev, [recId]: result }));
      onFixResult?.(recId, result);
    } catch {
      const fail = { status: "failed", message: "Verification failed" };
      setFixResults((prev) => ({ ...prev, [recId]: fail }));
      onFixResult?.(recId, fail);
    } finally {
      setFixingIds((prev) => { const next = new Set(prev); next.delete(recId); return next; });
    }
  }

  function handleModalClose() {
    setPreviewData(null);
    setPreviewingId(null);
  }

  async function handleModalVerify() {
    if (!previewData || !slug) return;
    await handleVerify(previewData.recommendation_id);
    handleModalClose();
  }

  if (!recommendations.length) return null;

  const totalXP = recommendations.reduce((s, r) => s + (r.xp_reward || 0), 0);
  const earnedXP = recommendations.reduce((s, r) => {
    const result = fixResults[r.id];
    if (result?.status === "success" || result?.status === "verified") return s + (r.xp_reward || 0);
    return s;
  }, 0);

  return (
    <div className="space-y-4">
      {/* Header with XP summary */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Action Plan</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {recommendations.length} quests to improve your GEO score
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
              <Zap className="w-3.5 h-3.5" />
              {earnedXP} / {totalXP} XP
            </div>
          </div>
        </div>
        {/* XP progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: totalXP > 0 ? `${(earnedXP / totalXP) * 100}%` : "0%" }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      {/* Quest cards */}
      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const isExpanded = expandedId === rec.id;
          const priority = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.medium;
          const difficulty = DIFFICULTY_CONFIG[rec.difficulty] || DIFFICULTY_CONFIG.medium;
          const DiffIcon = difficulty.icon;
          const fixResult = fixResults[rec.id];
          const isFixing = fixingIds.has(rec.id);
          const stepsComplete = completedSteps[rec.id] || new Set();
          const totalSteps = rec.steps?.length || 0;
          const stepsProgress = totalSteps > 0 ? (stepsComplete.size / totalSteps) * 100 : 0;
          const isVerified = fixResult?.status === "success" || fixResult?.status === "verified";

          return (
            <div
              key={rec.id}
              className={`rounded-xl border bg-card overflow-hidden transition-all ${
                isVerified ? "border-emerald-500/30 bg-emerald-500/5" : "border-border"
              }`}
            >
              {/* Card header — clickable */}
              <div
                className="px-4 py-3.5 cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : rec.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Number badge */}
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    {isVerified ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${priority.bg} ${priority.color}`}>
                        {rec.priority}
                      </span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${PILLAR_COLORS[rec.pillar] || "bg-muted text-muted-foreground border-border"}`}>
                        {PILLAR_LABELS[rec.pillar] || rec.pillar}
                      </span>
                      <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${difficulty.color}`}>
                        <DiffIcon className="w-2.5 h-2.5" />
                        {difficulty.label}
                      </span>
                    </div>

                    <h4 className="text-sm font-medium text-foreground leading-snug">{rec.title}</h4>

                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400">
                        <Zap className="w-2.5 h-2.5" /> +{rec.xp_reward} XP
                      </span>
                      {rec.estimated_minutes > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="w-2.5 h-2.5" /> ~{rec.estimated_minutes} min
                        </span>
                      )}
                      {totalSteps > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          {stepsComplete.size}/{totalSteps} steps
                        </span>
                      )}
                    </div>

                    {/* Step mini progress */}
                    {totalSteps > 0 && (
                      <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden w-full max-w-[200px]">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                          style={{ width: `${stepsProgress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Right side: actions + chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    {fixResult ? (
                      isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-medium text-emerald-500">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </span>
                      ) : fixResult.status === "manual" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[10px] font-medium text-amber-400">
                          Manual
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-[10px] font-medium text-red-500">
                          <XCircle className="h-3 w-3" /> Failed
                        </span>
                      )
                    ) : isFixing ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[10px] font-medium text-primary">
                        <Loader2 className="h-3 w-3 animate-spin" /> {previewingId === rec.id ? "Generating..." : "Verifying..."}
                      </span>
                    ) : null}

                    {isExpanded
                      ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    }
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 border-t border-border">
                      {/* Description */}
                      <p className="text-xs text-muted-foreground leading-relaxed mt-3 mb-4">{rec.description}</p>

                      {/* Impact estimate */}
                      {rec.impact_estimate && (
                        <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2 mb-4">
                          <Zap className="w-3 h-3 text-primary shrink-0" />
                          <p className="text-xs text-muted-foreground">{rec.impact_estimate}</p>
                        </div>
                      )}

                      {/* Step-by-step guide */}
                      {rec.steps && rec.steps.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Step-by-Step Guide</p>
                          {rec.steps.map((step) => {
                            const isDone = stepsComplete.has(step.n);
                            return (
                              <div
                                key={step.n}
                                className={`rounded-lg border p-3 transition-all ${
                                  isDone
                                    ? "border-emerald-500/20 bg-emerald-500/5"
                                    : "border-border bg-accent/30"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Step checkbox */}
                                  <button
                                    onClick={() => toggleStep(rec.id, step.n)}
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                      isDone
                                        ? "bg-emerald-500 border-emerald-500"
                                        : "border-muted-foreground/30 hover:border-primary"
                                    }`}
                                  >
                                    {isDone && <Check className="w-3 h-3 text-white" />}
                                  </button>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className={`text-xs font-semibold ${isDone ? "text-emerald-400 line-through" : "text-foreground"}`}>
                                        Step {step.n}: {step.title}
                                      </span>
                                      <span className="text-[9px] font-bold text-amber-400/80">+{step.xp} XP</span>
                                    </div>
                                    <p className={`text-xs leading-relaxed ${isDone ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
                                      {step.detail}
                                    </p>

                                    {/* Code block */}
                                    {step.code && (
                                      <div className="relative mt-2 group">
                                        <pre className="rounded-lg bg-card border border-border px-3 py-2 font-mono text-[11px] text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                                          {step.code}
                                        </pre>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); copyCode(step.code!, `${rec.id}-${step.n}`); }}
                                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition p-1 rounded bg-muted hover:bg-accent"
                                        >
                                          {copiedCode === `${rec.id}-${step.n}` ? (
                                            <Check className="w-3 h-3 text-emerald-400" />
                                          ) : (
                                            <Copy className="w-3 h-3 text-muted-foreground" />
                                          )}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* Fallback: plain text action */
                        <div className="mb-4">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">How to Fix</p>
                          <ActionContent action={rec.action} />
                        </div>
                      )}

                      {/* Fix result message */}
                      {fixResult && (
                        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs mb-3 ${
                          isVerified
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : fixResult.status === "manual"
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                            : "bg-red-500/10 border border-red-500/20 text-red-400"
                        }`}>
                          {isVerified ? <ShieldCheck className="h-3.5 w-3.5" /> : fixResult.status === "manual" ? <AlertTriangle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                          {fixResult.message}
                        </div>
                      )}

                      {/* Action buttons */}
                      {!fixResult && (
                        <div className="flex items-center gap-2">
                          {rec.can_auto_fix && slug && email && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handlePreview(rec.id); }}
                              disabled={isFixing}
                              className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-xs font-medium text-foreground transition hover:bg-accent disabled:opacity-60"
                            >
                              {isFixing && previewingId === rec.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                              Preview
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleVerify(rec.id); }}
                            disabled={isFixing || !slug}
                            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:opacity-60"
                          >
                            {isFixing && previewingId !== rec.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                            Mark as Done
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewData && (
          <FixPreviewModal
            key="fix-preview"
            preview={previewData}
            onApprove={handleModalVerify}
            onCancel={handleModalClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Fallback Action Content Renderer ───────────────────────────────── */

function ActionContent({ action }: { action: string }) {
  const [copied, setCopied] = useState(false);
  const lines = action.split("\n");

  return (
    <div className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        if (/^STEP \d/i.test(trimmed)) {
          const num = trimmed.match(/\d+/)?.[0];
          return (
            <div key={i} className="flex items-center gap-2 mt-3 first:mt-0">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {num}
              </span>
              <span className="font-medium text-foreground">{trimmed.replace(/^STEP \d+ — ?/i, "")}</span>
            </div>
          );
        }

        if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("–")) {
          return (
            <div key={i} className="flex gap-2 pl-7">
              <span className="text-primary/60 shrink-0">•</span>
              <span className="text-muted-foreground">{trimmed.replace(/^[•\-–]\s*/, "")}</span>
            </div>
          );
        }

        if (trimmed.startsWith("<") || trimmed.startsWith("{") || trimmed.startsWith("}") || trimmed.startsWith('"@')) {
          return (
            <div key={i} className="relative group">
              <pre className="rounded-lg bg-card border border-border px-3 py-2 font-mono text-[11px] text-muted-foreground overflow-x-auto">
                {trimmed}
              </pre>
              <button
                onClick={() => { navigator.clipboard.writeText(trimmed); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="absolute right-2 top-1.5 opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          );
        }

        if (/^PRO TIP/i.test(trimmed)) {
          return (
            <div key={i} className="mt-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
              <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Pro Tip</span>
              <p className="text-muted-foreground mt-0.5">{trimmed.replace(/^PRO TIP:?\s*/i, "")}</p>
            </div>
          );
        }

        return <p key={i} className="text-muted-foreground pl-7">{trimmed}</p>;
      })}
    </div>
  );
}
