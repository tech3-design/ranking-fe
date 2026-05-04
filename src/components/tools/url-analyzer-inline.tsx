"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Lock, Loader2, Sparkles } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import {
  getRunDetail,
  startAnalysis,
  type AnalysisRunDetail,
  type PageScore,
} from "@/lib/api/analyzer";
import {
  getSubscriptionStatus,
  type SubscriptionStatus,
} from "@/lib/api/payments";
import { routes } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RunState =
  | { kind: "idle" }
  | { kind: "running"; runId: number; progress: number }
  | { kind: "done"; detail: AnalysisRunDetail }
  | { kind: "error"; message: string };

const PILLAR_FIELDS: Array<{ key: keyof PageScore; label: string }> = [
  { key: "content_score", label: "Content" },
  { key: "schema_score", label: "Schema" },
  { key: "eeat_score", label: "E-E-A-T" },
  { key: "technical_score", label: "Technical" },
  { key: "entity_score", label: "Entity" },
  { key: "ai_visibility_score", label: "AI visibility" },
];

function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

function scoreBar(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function normalizeUrl(raw: string) {
  const t = raw.trim();
  if (!t) return "";
  return t.startsWith("http://") || t.startsWith("https://") ? t : `https://${t}`;
}

export function UrlAnalyzerToolInline() {
  const { data: session, isPending } = useSession();
  const [url, setUrl] = useState("");
  const [state, setState] = useState<RunState>({ kind: "idle" });
  const [sub, setSub] = useState<SubscriptionStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.email) {
      setSub(null);
      return;
    }
    let alive = true;
    getSubscriptionStatus(session.user.email)
      .then((s) => {
        if (alive) setSub(s);
      })
      .catch(() => {
        if (alive) setSub(null);
      });
    return () => {
      alive = false;
    };
  }, [session?.user?.email]);

  const pollDetail = useCallback(async (runId: number) => {
    try {
      const detail = await getRunDetail(runId);
      if (cancelledRef.current) return;
      if (detail.status === "complete") {
        setState({ kind: "done", detail });
        return;
      }
      if (detail.status === "failed") {
        setState({
          kind: "error",
          message: detail.error_message || "Analysis failed. Try another URL.",
        });
        return;
      }
      setState({ kind: "running", runId, progress: detail.progress ?? 0 });
      pollRef.current = setTimeout(() => void pollDetail(runId), 2200);
    } catch {
      if (cancelledRef.current) return;
      pollRef.current = setTimeout(() => void pollDetail(runId), 2500);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const finalUrl = normalizeUrl(url);
      if (!finalUrl) return;
      setState({ kind: "running", runId: 0, progress: 0 });
      try {
        const run = await startAnalysis({
          url: finalUrl,
          run_type: "single_page",
          country: "United States",
        });
        setState({ kind: "running", runId: run.id, progress: 0 });
        void pollDetail(run.id);
      } catch {
        setState({
          kind: "error",
          message: "Couldn't start the audit. Check the URL and try again.",
        });
      }
    },
    [url, pollDetail],
  );

  const reset = useCallback(() => {
    if (pollRef.current) clearTimeout(pollRef.current);
    setState({ kind: "idle" });
  }, []);

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center gap-2 rounded-sm border border-primary/25 bg-white p-1.5 shadow-sm"
      >
        <Globe className="ml-2 h-4 w-4 text-muted-foreground" aria-hidden />
        <input
          type="text"
          placeholder="Enter your domain (e.g. signalor.ai)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={state.kind === "running"}
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
        />
        <Button
          type="submit"
          disabled={!url.trim() || state.kind === "running"}
          className="shrink-0 rounded-sm bg-primary px-4 text-xs font-semibold text-white hover:brightness-110"
        >
          {state.kind === "running" ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Analyzing
            </>
          ) : (
            <>
              Analyze
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </form>

      {state.kind === "running" && <RunningCard progress={state.progress} />}
      {state.kind === "error" && <ErrorCard message={state.message} onRetry={reset} />}
      {state.kind === "done" && (
        <ResultCards
          detail={state.detail}
          session={session}
          sessionPending={isPending}
          sub={sub}
          onReset={reset}
        />
      )}
    </div>
  );
}

function RunningCard({ progress }: { progress: number }) {
  return (
    <div className="mt-5 rounded-sm border border-black/6 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">
          Running your audit — fetching the page, parsing schema, scoring pillars…
        </p>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.max(6, Math.min(100, progress))}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        This usually takes 20–60 seconds.
      </p>
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mt-5 rounded-sm border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 text-xs font-semibold text-red-700 underline underline-offset-4 hover:brightness-110"
      >
        Try another URL
      </button>
    </div>
  );
}

function ResultCards({
  detail,
  session,
  sessionPending,
  sub,
  onReset,
}: {
  detail: AnalysisRunDetail;
  session: ReturnType<typeof useSession>["data"];
  sessionPending: boolean;
  sub: SubscriptionStatus | null;
  onReset: () => void;
}) {
  const mainPage =
    detail.page_scores?.find((p) => p.url === detail.url) ||
    detail.page_scores?.[0] ||
    null;
  const composite =
    detail.composite_score ?? mainPage?.composite_score ?? 0;
  const topRec = detail.recommendations?.[0];

  return (
    <div className="mt-6 space-y-4">
      {/* Card 1: Composite score + URL summary */}
      <div className="rounded-sm border border-black/6 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              GEO score
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight">
              <span className={scoreTone(composite)}>{Math.round(composite)}</span>
              <span className="text-xl font-semibold text-neutral-400">/100</span>
            </p>
            <p className="mt-1 truncate text-[12px] text-neutral-500">{detail.url}</p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 text-[11px] font-semibold text-muted-foreground underline-offset-4 hover:underline"
          >
            Audit another URL
          </button>
        </div>
      </div>

      {/* Card 2: Pillar breakdown */}
      {mainPage && (
        <div className="rounded-sm border border-black/6 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Pillar breakdown</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PILLAR_FIELDS.map((p) => {
              const v = Math.round(Number(mainPage[p.key]) || 0);
              return (
                <div key={String(p.key)}>
                  <div className="flex items-center justify-between text-[12px] font-medium text-neutral-700">
                    <span>{p.label}</span>
                    <span className={cn("tabular-nums", scoreTone(v))}>{v}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={cn("h-full rounded-full", scoreBar(v))}
                      style={{ width: `${v}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Card 3: Top recommendation teaser */}
      {topRec && (
        <div className="rounded-sm border border-black/6 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Top fix
            </p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                topRec.priority === "critical" && "bg-red-100 text-red-700",
                topRec.priority === "high" && "bg-orange-100 text-orange-700",
                topRec.priority === "medium" && "bg-yellow-100 text-yellow-800",
                topRec.priority === "low" && "bg-neutral-100 text-neutral-700",
              )}
            >
              {topRec.priority}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">{topRec.title}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
            {topRec.description}
          </p>
        </div>
      )}

      {/* Gate CTA card */}
      <GateCard
        detail={detail}
        session={session}
        sessionPending={sessionPending}
        sub={sub}
        recCount={detail.recommendations?.length ?? 0}
      />
    </div>
  );
}

function GateCard({
  detail,
  session,
  sessionPending,
  sub,
  recCount,
}: {
  detail: AnalysisRunDetail;
  session: ReturnType<typeof useSession>["data"];
  sessionPending: boolean;
  sub: SubscriptionStatus | null;
  recCount: number;
}) {
  if (sessionPending) return null;

  const hiddenFixes = Math.max(0, recCount - 1);

  if (!session) {
    return (
      <div className="rounded-sm border border-primary/25 bg-gradient-to-br from-primary/5 via-white to-primary/10 p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-primary" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            Unlock the full audit
          </p>
        </div>
        <p className="mt-2 text-sm font-semibold text-foreground">
          {hiddenFixes > 0
            ? `${hiddenFixes} more fixes, per-engine AI probes, and monitoring are ready — sign up to view them.`
            : "Per-engine AI probes, competitor share, and monitoring are ready — sign up to view them."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`${routes.signUp}?returnTo=${encodeURIComponent(`/analyzer/${detail.id}`)}`}
            className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
          >
            Create a free account
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={routes.signIn}
            className="inline-flex items-center gap-1.5 rounded-sm border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-foreground hover:bg-neutral-50"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (!sub?.is_active) {
    return (
      <div className="rounded-sm border border-primary/25 bg-gradient-to-br from-primary/5 via-white to-primary/10 p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-primary" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            Upgrade to see the full report
          </p>
        </div>
        <p className="mt-2 text-sm font-semibold text-foreground">
          {hiddenFixes > 0
            ? `${hiddenFixes} more fixes, per-engine probes, and monitoring unlock with Pro.`
            : "Unlock per-engine probes, competitor benchmarks, and monitoring with Pro."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
          >
            See plans
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-black/6 bg-neutral-50 p-5">
      <p className="text-sm font-semibold text-foreground">Open your full report</p>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Full pillar details, per-engine AI probes, recommendations, and monitoring.
      </p>
      <Link
        href={routes.analyzerResults(detail.id)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
      >
        Open report
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
