"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Recommendation, RecommendationStep, FixPreview } from "@/lib/api/analyzer";
import { previewFix, verifyFix, applyAutoFix, approveFix } from "@/lib/api/analyzer";
import { FixPreviewModal } from "./fix-preview-modal";
import {
  Loader2, Eye, ChevronDown, ChevronRight, Copy, Check,
  AlertTriangle, ArrowUp, Minus, ShieldCheck, Clock, Zap,
  Flame, Star, Trophy, XCircle, RefreshCw, ShoppingBag, Globe, MessageSquare,
} from "lucide-react";
import type { PlatformStepInfo } from "@/lib/api/analyzer";

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

/** Shown when API has no `steps` so every card still has a guided flow + circles */
const FALLBACK_GUIDE_STEPS: RecommendationStep[] = [
  {
    n: 1,
    title: "Read the guidance",
    detail: "Review the description and impact below so you know what to change.",
    xp: 0,
  },
  {
    n: 2,
    title: "Apply changes in your CMS or code",
    detail: "Update your site, then publish so the live URL reflects your work.",
    xp: 0,
  },
  {
    n: 3,
    title: "Run the live check",
    detail: "Tap Verify changes — we fetch your live page and confirm the fix.",
    xp: 0,
  },
];

type CircleVisual =
  | "idle"
  | "user_done"
  | "loading"
  /** Muted check: step reached in the scan sequence — not "passed" until the server responds */
  | "pending_queue"
  | "scan_warn"
  | "scan_fail"
  /** Only after the API returns verified */
  | "server_ok";

/** Minimum time for the step sweep + "waiting on live page" before showing the API result */
const VERIFY_UI_TOTAL_MS = 3000;

const STEP_USER_STORAGE = "signalor_rec_step_user_v1";

function loadUserSteps(slug: string): Record<number, Set<number>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STEP_USER_STORAGE);
    if (!raw) return {};
    const o = JSON.parse(raw) as Record<string, Record<string, number[]>>;
    const byRec = o[slug];
    if (!byRec) return {};
    const out: Record<number, Set<number>> = {};
    for (const [k, arr] of Object.entries(byRec)) {
      out[Number(k)] = new Set(Array.isArray(arr) ? arr : []);
    }
    return out;
  } catch {
    return {};
  }
}

function saveUserSteps(slug: string, data: Record<number, Set<number>>) {
  if (typeof window === "undefined") return;
  try {
    const serial: Record<string, number[]> = {};
    for (const [k, v] of Object.entries(data)) {
      serial[k] = Array.from(v);
    }
    const raw = localStorage.getItem(STEP_USER_STORAGE);
    const all: Record<string, Record<string, number[]>> = raw ? JSON.parse(raw) : {};
    all[slug] = serial;
    localStorage.setItem(STEP_USER_STORAGE, JSON.stringify(all));
  } catch { /* ignore */ }
}

function StepStatusCircle({
  state,
  stepNum,
  onToggleUser,
  disableUserToggle,
}: {
  state: CircleVisual;
  stepNum: number;
  onToggleUser: () => void;
  disableUserToggle: boolean;
}) {
  const common =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 mt-0.5";

  if (state === "loading") {
    return (
      <div className={`${common} border-primary/40 bg-primary/10`} aria-hidden>
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }
  if (state === "pending_queue") {
    return (
      <div
        className={`${common} border-muted-foreground/35 bg-muted/60 text-muted-foreground`}
        title="Waiting on live page check — not verified yet"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      </div>
    );
  }
  if (state === "server_ok") {
    return (
      <div className={`${common} border-emerald-500 bg-emerald-500 text-white shadow-sm`} title="Verified on your live page">
        <Check className="h-4 w-4" strokeWidth={3} />
      </div>
    );
  }
  if (state === "scan_warn") {
    return (
      <div
        className={`${common} border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400`}
        title="You may have done this step, but the live site check still failed"
      >
        <Check className="h-4 w-4" strokeWidth={2.5} />
      </div>
    );
  }
  if (state === "scan_fail") {
    return (
      <div
        className={`${common} border-red-500 bg-red-500/15 text-red-500`}
        title="Live page did not pass verification"
      >
        <XCircle className="h-4 w-4" />
      </div>
    );
  }
  if (state === "user_done") {
    return (
      <button
        type="button"
        disabled={disableUserToggle}
        onClick={(e) => {
          e.stopPropagation();
          onToggleUser();
        }}
        className={`${common} border-sky-500/70 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 disabled:opacity-60`}
        title="Marked done on your side — tap to undo"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </button>
    );
  }
  return (
    <button
      type="button"
      disabled={disableUserToggle}
      onClick={(e) => {
        e.stopPropagation();
        onToggleUser();
      }}
      className={`${common} border-muted-foreground/25 bg-background text-[10px] font-bold text-muted-foreground hover:border-primary/50 hover:text-primary disabled:opacity-50`}
      title="Tap when you finish this step on your site"
    >
      {stepNum}
    </button>
  );
}

function circleStateForStep(
  recId: number,
  stepIndex: number,
  totalSteps: number,
  stepNumber: number,
  isServerVerified: boolean,
  verifyFailed: boolean,
  sweep: { recId: number; index: number } | null,
  isFixingThis: boolean,
  userDone: Set<number>,
): CircleVisual {
  if (isServerVerified) return "server_ok";

  const scanning = isFixingThis && sweep && sweep.recId === recId;
  if (scanning) {
    // After the step-by-step sweep, keep the last circle spinning until the API returns
    // (avoid flashing green — emerald only for server_ok after success).
    if (sweep.index >= totalSteps) {
      if (stepIndex === totalSteps - 1) return "loading";
      return "pending_queue";
    }
    if (stepIndex < sweep.index) return "pending_queue";
    if (stepIndex === sweep.index) return "loading";
    if (userDone.has(stepNumber)) return "user_done";
    return "idle";
  }

  if (verifyFailed && totalSteps > 0) {
    if (stepIndex === totalSteps - 1) return "scan_fail";
    return "scan_warn";
  }

  if (userDone.has(stepNumber)) return "user_done";
  return "idle";
}

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  slug?: string;
  email?: string;
  orgId?: number;
  /** "shopify" | "wordpress" | undefined — detected from run URL or integration */
  platform?: "shopify" | "wordpress";
  initialFixResults?: Record<number, { status: string; message: string }>;
  onFixResult?: (recId: number, result: { status: string; message: string }) => void;
}

export function RecommendationsPanel({ recommendations, slug, email, orgId, platform, initialFixResults, onFixResult }: RecommendationsPanelProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [fixingIds, setFixingIds] = useState<Set<number>>(new Set());
  const [fixResults, setFixResults] = useState<Record<number, { status: string; message: string }>>(initialFixResults ?? {});
  const [previewData, setPreviewData] = useState<FixPreview | null>(null);
  const [previewingId, setPreviewingId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  /** User-marked "I did this on my site" per recommendation step number */
  const [userStepsByRec, setUserStepsByRec] = useState<Record<number, Set<number>>>({});
  /** Sequential "scanning" animation during verify */
  const [verifySweep, setVerifySweep] = useState<{ recId: number; index: number } | null>(null);

  useEffect(() => {
    if (initialFixResults) setFixResults((prev) => ({ ...initialFixResults, ...prev }));
  }, [initialFixResults]);

  useEffect(() => {
    if (!slug) return;
    setUserStepsByRec(loadUserSteps(slug));
  }, [slug]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem("signalor_step_progress");
    } catch { /* legacy key */ }
  }, []);

  const toggleUserStep = useCallback(
    (recId: number, stepN: number) => {
      if (!slug) return;
      setUserStepsByRec((prev) => {
        const set = new Set(prev[recId] ?? []);
        if (set.has(stepN)) set.delete(stepN);
        else set.add(stepN);
        const next = { ...prev, [recId]: set };
        saveUserSteps(slug, next);
        return next;
      });
    },
    [slug],
  );

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
    const rec = recommendations.find((r) => r.id === recId);
    const stepList =
      rec?.steps && rec.steps.length > 0 ? rec.steps : FALLBACK_GUIDE_STEPS;

    setFixingIds((prev) => new Set(prev).add(recId));
    setVerifySweep(null);

    const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    try {
      const apiPromise = verifyFix(slug, recId);

      const uiDone = (async () => {
        const n = stepList.length;
        if (n === 0) {
          await delay(VERIFY_UI_TOTAL_MS);
          setVerifySweep({ recId, index: 0 });
          return;
        }
        const perStep = VERIFY_UI_TOTAL_MS / n;
        for (let i = 0; i < n; i++) {
          setVerifySweep({ recId, index: i });
          await delay(perStep);
        }
        setVerifySweep({ recId, index: n });
      })();

      const [result] = await Promise.all([apiPromise, uiDone]);
      const normalized = {
        status: result.status,
        message:
          result.message ||
          (result.status === "verified" ? "Verified." : "Verification failed."),
      };
      setFixResults((prev) => ({ ...prev, [recId]: normalized }));
      onFixResult?.(recId, normalized);

      if (normalized.status === "verified" || normalized.status === "success") {
        setUserStepsByRec((prev) => {
          const next = { ...prev };
          delete next[recId];
          if (slug) saveUserSteps(slug, next);
          return next;
        });
      }
    } catch (err: unknown) {
      let msg = "Could not reach the server. Try again.";
      if (err && typeof err === "object" && "response" in err) {
        const data = (err as { response?: { data?: { error?: string; message?: string } } }).response?.data;
        if (data?.message && typeof data.message === "string") msg = data.message;
        else if (data?.error && typeof data.error === "string") msg = data.error;
      }
      const fail = { status: "failed", message: msg };
      setFixResults((prev) => ({ ...prev, [recId]: fail }));
      onFixResult?.(recId, fail);
    } finally {
      setVerifySweep(null);
      setFixingIds((prev) => {
        const next = new Set(prev);
        next.delete(recId);
        return next;
      });
    }
  }

  async function handleAutoFix(recId: number) {
    if (!slug || !email) return;
    setFixingIds((prev) => new Set(prev).add(recId));
    setPreviewingId(recId);
    try {
      // Step 1: Apply fix via Shopify app / WordPress plugin
      const results = await applyAutoFix(slug, [recId], email, orgId);
      const result = results?.[0];
      if (!result || result.status === "failed") {
        const fail = { status: "failed", message: result?.message || "Auto-fix failed. Check your store connection." };
        setFixResults((prev) => ({ ...prev, [recId]: fail }));
        onFixResult?.(recId, fail);
        return;
      }

      // Manual fixes — show walkthrough, user will click Verify after doing it
      if (result.status === "manual") {
        const manual = {
          status: "manual",
          message: result.message || "Follow the instructions below, then click Verify.",
          generated_content: result.generated_content || null,
        };
        setFixResults((prev) => ({ ...prev, [recId]: manual }));
        onFixResult?.(recId, manual);
        return;
      }

      // Step 2: Auto-fix applied — verify on live page
      try {
        const verify = await verifyFix(slug, recId);
        const normalized = { status: verify.status, message: verify.message || result.message };
        setFixResults((prev) => ({ ...prev, [recId]: normalized }));
        onFixResult?.(recId, normalized);
      } catch {
        // Fix applied but verify failed — still mark as success from plugin
        const partial = { status: result.status, message: `${result.message} (verification pending — changes may take a moment to appear)` };
        setFixResults((prev) => ({ ...prev, [recId]: partial }));
        onFixResult?.(recId, partial);
      }
    } catch (err: unknown) {
      let msg = "Auto-fix failed. Make sure your store is connected.";
      if (err && typeof err === "object" && "response" in err) {
        const data = (err as { response?: { data?: { error?: string; message?: string } } }).response?.data;
        if (data?.message) msg = data.message;
        else if (data?.error) msg = data.error;
      }
      const fail = { status: "failed", message: msg };
      setFixResults((prev) => ({ ...prev, [recId]: fail }));
      onFixResult?.(recId, fail);
    } finally {
      setFixingIds((prev) => { const next = new Set(prev); next.delete(recId); return next; });
      setPreviewingId(null);
    }
  }

  async function handleModalApplyFix() {
    if (!previewData || !slug || !email) return;
    const recId = previewData.recommendation_id;
    setFixingIds((prev) => new Set(prev).add(recId));
    try {
      // Apply the previewed content via plugin
      const result = await approveFix(slug, recId, previewData.full_content || previewData.preview, previewData.fix_type);
      const normalized = { status: result.status, message: result.message || "Fix applied." };
      setFixResults((prev) => ({ ...prev, [recId]: normalized }));
      onFixResult?.(recId, normalized);
    } catch (err: unknown) {
      let msg = "Failed to apply fix.";
      if (err && typeof err === "object" && "response" in err) {
        const data = (err as { response?: { data?: { error?: string; message?: string } } }).response?.data;
        if (data?.message) msg = data.message;
        else if (data?.error) msg = data.error;
      }
      const fail = { status: "failed", message: msg };
      setFixResults((prev) => ({ ...prev, [recId]: fail }));
      onFixResult?.(recId, fail);
    } finally {
      setFixingIds((prev) => { const next = new Set(prev); next.delete(recId); return next; });
    }
    handleModalClose();
  }

  function handleModalClose() {
    setPreviewData(null);
    setPreviewingId(null);
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
          const displaySteps =
            rec.steps && rec.steps.length > 0 ? rec.steps : FALLBACK_GUIDE_STEPS;
          const totalSteps = displaySteps.length;
          const isVerified = fixResult?.status === "success" || fixResult?.status === "verified";
          const verifyFailedWhileIdle =
            fixResult?.status === "failed" && !isFixing;
          const userDone = userStepsByRec[rec.id] ?? new Set<number>();

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
                          {totalSteps} guided step{totalSteps !== 1 ? "s" : ""} · verify on live site
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side: auto-fix button + status + chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isFixing ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[10px] font-medium text-primary">
                        <Loader2 className="h-3 w-3 animate-spin" /> {previewingId === rec.id ? "Applying..." : "Checking..."}
                      </span>
                    ) : fixResult ? (
                      isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-medium text-emerald-500">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </span>
                      ) : fixResult.status === "manual" ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleVerify(rec.id); }}
                          disabled={isFixing}
                          className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[10px] font-medium text-amber-400 hover:bg-amber-500/20 transition"
                        >
                          <ShieldCheck className="h-3 w-3" /> Verify
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAutoFix(rec.id); }}
                          className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-[10px] font-medium text-red-500 hover:bg-red-500/20 transition"
                        >
                          <RefreshCw className="h-3 w-3" /> Retry
                        </button>
                      )
                    ) : rec.can_auto_fix && slug && email ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAutoFix(rec.id); }}
                        disabled={isFixing}
                        className="inline-flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 text-[11px] font-semibold transition hover:opacity-88 disabled:opacity-50"
                      >
                        <Zap className="h-3 w-3" /> Auto Fix
                      </button>
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

                      {/* Auto-fixable: short hint */}
                      {rec.can_auto_fix && (
                        <div className="flex items-center gap-2 bg-muted/50 border border-border px-3 py-2 mb-4 text-xs text-muted-foreground">
                          <Zap className="w-3 h-3 shrink-0" />
                          <span>Click <span className="font-semibold text-foreground">Auto Fix</span> to apply this automatically via your connected store.</span>
                        </div>
                      )}

                      {/* Manual: step-by-step walkthrough */}
                      {!rec.can_auto_fix && rec.steps && rec.steps.length > 0 && (
                        <div className="mb-4">
                          <p className="text-[11px] font-semibold text-foreground uppercase tracking-wide mb-2">How to Fix</p>
                          <div className="space-y-2">
                            {rec.steps.map((step: RecommendationStep, idx: number) => {
                              const platformStep = platform === "shopify" ? step.shopify : platform === "wordpress" ? step.wordpress : null;
                              const stepTitle = step.title;
                              const stepDesc = platformStep?.detail || step.detail;
                              const stepCode = platformStep?.code || step.code;
                              return (
                                <div key={idx} className="bg-muted/50 border border-border p-3">
                                  <div className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 bg-foreground text-background text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[13px] font-medium text-foreground">{stepTitle}</p>
                                      {stepDesc && <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">{stepDesc}</p>}
                                      {stepCode && (
                                        <div className="mt-2 relative group">
                                          <pre className="bg-card border border-border p-2.5 text-[11px] font-mono text-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">{stepCode}</pre>
                                          <button
                                            onClick={(e) => { e.stopPropagation(); copyCode(stepCode, `${rec.id}-${idx}`); }}
                                            className="absolute top-1.5 right-1.5 bg-card border border-border p-1.5 text-muted-foreground hover:text-foreground transition opacity-0 group-hover:opacity-100"
                                          >
                                            {copiedCode === `${rec.id}-${idx}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Manual: no steps data — show generic guidance */}
                      {!rec.can_auto_fix && (!rec.steps || rec.steps.length === 0) && (
                        <div className="mb-4 bg-muted/50 border border-border p-3">
                          <p className="text-[11px] font-semibold text-foreground uppercase tracking-wide mb-2">How to Fix</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Click <span className="font-semibold text-foreground">Verify</span> after you&apos;ve made the changes. Our system will re-crawl your page to confirm the fix is live.
                          </p>
                          {rec.action && (
                            <p className="text-xs text-muted-foreground leading-relaxed mt-2">{rec.action}</p>
                          )}
                        </div>
                      )}

                      {/* Fix result message — hide previous failure while live verify runs so Reason appears only after the step sweep finishes */}
                      {fixResult && !(fixResult.status === "failed" && isFixing) && (
                        <div
                          className={`rounded-lg px-3 py-2 text-xs mb-3 ${
                            isVerified
                              ? "flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                              : fixResult.status === "manual"
                                ? "flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400"
                                : "flex gap-2 bg-red-500/10 border border-red-500/20 text-red-400"
                          }`}
                        >
                          {isVerified ? (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                              <span>{fixResult.message}</span>
                            </>
                          ) : fixResult.status === "manual" ? (
                            <>
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-1" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-500/90 mb-1.5">Manual Fix Required</p>
                                <div className="text-xs leading-relaxed text-amber-300/90 whitespace-pre-line">
                                  {fixResult.message.split("\n").map((line: string, i: number) => {
                                    // Section headers (WHERE TO PASTE, STEPS, etc.)
                                    if (/^(WHERE TO PASTE|STEPS|HOMEPAGE TITLE|META DESCRIPTION|GENERATED SCHEMA|CONTENT TO ADD|FAQ CONTENT|How to|Tip:)/i.test(line.trim())) {
                                      return <p key={i} className="font-semibold text-amber-200 mt-2 mb-0.5">{line}</p>;
                                    }
                                    // Copy-ready content blocks (indented or code-like)
                                    if (line.trim().startsWith("<script") || line.trim().startsWith("{") || line.trim().startsWith("}") || line.trim().startsWith('"@')) {
                                      return <code key={i} className="block bg-black/20 px-2 py-0.5 font-mono text-[11px] text-amber-100 rounded">{line}</code>;
                                    }
                                    // Numbered steps
                                    if (/^\d+\./.test(line.trim())) {
                                      return <p key={i} className="ml-2">{line}</p>;
                                    }
                                    return <p key={i}>{line}</p>;
                                  })}
                                </div>
                                {Boolean((fixResult as Record<string, unknown>).generated_content) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(String((fixResult as Record<string, unknown>).generated_content));
                                    }}
                                    className="mt-2 flex items-center gap-1.5 rounded bg-amber-500/20 px-3 py-1.5 text-[11px] font-medium text-amber-200 hover:bg-amber-500/30 transition"
                                  >
                                    <Copy className="h-3 w-3" /> Copy Generated Content
                                  </button>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-red-400/90 mb-0.5">
                                  Reason
                                </p>
                                <p className="text-xs leading-snug text-red-400">{fixResult.message}</p>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Action buttons */}
                      {(!fixResult || fixResult.status === "failed" || fixResult.status === "manual") && (
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Auto Fix — only for auto-fixable items that haven't returned manual */}
                          {rec.can_auto_fix && slug && email && fixResult?.status !== "manual" && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); handlePreview(rec.id); }}
                                disabled={isFixing}
                                className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-xs font-medium text-foreground transition hover:bg-accent disabled:opacity-60"
                              >
                                {isFixing && previewingId === rec.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                                Preview
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAutoFix(rec.id); }}
                                disabled={isFixing || !slug}
                                className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background transition hover:opacity-88 disabled:opacity-60"
                              >
                                {isFixing && previewingId === rec.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : fixResult?.status === "failed" ? (
                                  <RefreshCw className="h-3.5 w-3.5" />
                                ) : (
                                  <Zap className="h-3.5 w-3.5" />
                                )}
                                {fixResult?.status === "failed" ? "Retry Fix" : "Auto Fix"}
                              </button>
                            </>
                          )}
                          {/* Verify + Ask in Chat — shown for manual results OR non-auto-fixable items */}
                          {(fixResult?.status === "manual" || !rec.can_auto_fix) && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleVerify(rec.id); }}
                                disabled={isFixing || !slug}
                                className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background transition hover:opacity-88 disabled:opacity-60"
                              >
                                {isFixing && previewingId !== rec.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                )}
                                Verify
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.dispatchEvent(new CustomEvent("open-ai-chat", {
                                    detail: { message: `Help me fix: "${rec.title}". ${rec.description?.slice(0, 150) || ""}. Give me step-by-step instructions for Shopify.` },
                                  }));
                                }}
                                className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-xs font-medium text-foreground transition hover:bg-accent"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                Ask in Chat
                              </button>
                            </>
                          )}
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
            onApprove={handleModalApplyFix}
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

/* ── Platform-specific instruction block ───────────────────────────── */

function PlatformBlock({ platform, info, copyKey, copiedCode, onCopy }: {
  platform: "shopify" | "wordpress";
  info: PlatformStepInfo;
  copyKey: string;
  copiedCode: string | null;
  onCopy: (code: string, key: string) => void;
}) {
  const isShopify = platform === "shopify";
  return (
    <div className={`rounded-lg border p-3 ${isShopify ? "border-[#96bf48]/20 bg-[#96bf48]/5" : "border-[#21759b]/20 bg-[#21759b]/5"}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        {isShopify ? <ShoppingBag className="w-3 h-3 text-[#96bf48]" /> : <Globe className="w-3 h-3 text-[#21759b]" />}
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isShopify ? "text-[#96bf48]" : "text-[#21759b]"}`}>
          {isShopify ? "Shopify" : "WordPress"}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{info.detail}</p>
      {info.code && (
        <div className="relative mt-2 group">
          <pre className="rounded-lg bg-card border border-border px-3 py-2 font-mono text-[11px] text-muted-foreground overflow-x-auto whitespace-pre-wrap">{info.code}</pre>
          <button onClick={(e) => { e.stopPropagation(); onCopy(info.code!, copyKey); }} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition p-1 rounded bg-muted hover:bg-accent">
            {copiedCode === copyKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
          </button>
        </div>
      )}
    </div>
  );
}
