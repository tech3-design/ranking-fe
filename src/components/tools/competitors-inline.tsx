"use client";

import { useCallback, useState } from "react";
import { ArrowRight, Globe, Loader2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ToolGateCard } from "@/components/tools/tool-gate-card";

interface Rival {
  name: string;
  mentions: number;
  sharePct: number;
}

interface CompetitorsResult {
  brand: string;
  you: Rival;
  rivals: Rival[];
  totalSuggestions: number;
  note?: string;
}

type State =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "done"; data: CompetitorsResult }
  | { kind: "error"; message: string };

export function CompetitorsInline() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!url.trim()) return;
      setState({ kind: "running" });
      try {
        const res = await fetch("/api/tools/competitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (!res.ok) {
          setState({ kind: "error", message: data.error ?? "Analysis failed." });
          return;
        }
        setState({ kind: "done", data: data as CompetitorsResult });
      } catch {
        setState({ kind: "error", message: "Couldn't reach the server. Try again." });
      }
    },
    [url],
  );

  return (
    <div className="w-full">
      <form
        onSubmit={submit}
        className="flex w-full items-center gap-2 rounded-2xl border border-emerald-700/25 bg-white p-1.5 shadow-sm"
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
          className="shrink-0 rounded-xl bg-emerald-700 px-4 text-xs font-semibold text-white hover:brightness-110"
        >
          {state.kind === "running" ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Comparing
            </>
          ) : (
            <>
              Compare
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </form>

      {state.kind === "running" && (
        <div className="mt-5 rounded-2xl border border-black/6 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-700" />
            Pulling competitive comparison queries from real search autocomplete…
          </div>
        </div>
      )}

      {state.kind === "error" && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.message}
        </div>
      )}

      {state.kind === "done" && <ResultView data={state.data} onReset={() => setState({ kind: "idle" })} />}
    </div>
  );
}

function ResultView({ data, onReset }: { data: CompetitorsResult; onReset: () => void }) {
  const allRows = [data.you, ...data.rivals];
  const max = Math.max(1, ...allRows.map((r) => r.mentions));

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border border-black/6 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Share of comparison queries
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-foreground">{data.brand}</p>
            <p className="mt-1 text-[12px] text-neutral-500">
              {data.totalSuggestions} real search-autocomplete queries scanned
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 text-[11px] font-semibold text-muted-foreground underline-offset-4 hover:underline"
          >
            Try another domain
          </button>
        </div>
      </div>

      {data.rivals.length > 0 ? (
        <div className="rounded-2xl border border-black/6 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-700" />
            <p className="text-sm font-semibold text-foreground">Ranked by co-mention</p>
          </div>
          <div className="space-y-3">
            {allRows.slice(0, 6).map((r, i) => {
              const isYou = r.name.toLowerCase() === data.you.name.toLowerCase() && i === 0;
              const widthPct = Math.max(6, Math.round((r.mentions / max) * 100));
              return (
                <div key={r.name + i}>
                  <div className="flex justify-between text-[12px] font-semibold text-neutral-800">
                    <span>{isYou ? `${r.name} (you)` : r.name}</span>
                    <span className={`tabular-nums ${isYou ? "text-emerald-700" : "text-neutral-600"}`}>
                      {r.sharePct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className={`h-full rounded-full ${isYou ? "bg-emerald-700" : "bg-neutral-400"}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-black/6 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground">No comparison queries detected</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {data.note ??
              "Usually means the brand is early-stage or in a niche category. Run the full AI-citation benchmark below to find true competitors from live AI responses."}
          </p>
        </div>
      )}

      <ToolGateCard
        theme="emerald"
        signedOutMessage="Sign up to benchmark AI citation share across ChatGPT, Claude, Gemini, and Perplexity — live, per prompt, per engine."
        upgradeMessage="Upgrade to Pro to unlock live AI citation benchmarks across 4 engines, prompt-level gaps, and a shareable report."
        signedInActiveMessage="Run live AI citation benchmarks on your connected projects."
        signedInActiveLabel="Open dashboard"
      />
    </div>
  );
}
