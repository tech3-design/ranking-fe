"use client";

import { useCallback, useState } from "react";
import { ArrowRight, CircleCheck, CircleX, Globe, Loader2, MinusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ToolGateCard } from "@/components/tools/tool-gate-card";
import { cn } from "@/lib/utils";

interface LlmsResult {
  domain: string;
  llmsTxt: { present: boolean; sections: number };
  robots: {
    present: boolean;
    aiBots: Array<{ bot: string; allowed: boolean | null }>;
  };
  page: {
    ok: boolean;
    title: string | null;
    description: string | null;
    hasOrganizationSchema: boolean;
    hasOgTags: boolean;
    hasCanonical: boolean;
    sitemapReachable: boolean;
  };
  score: number;
}

type State =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "done"; data: LlmsResult }
  | { kind: "error"; message: string };

export function LlmsCheckInline() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!url.trim()) return;
      setState({ kind: "running" });
      try {
        const res = await fetch("/api/tools/llms-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (!res.ok) {
          setState({ kind: "error", message: data.error ?? "Check failed." });
          return;
        }
        setState({ kind: "done", data: data as LlmsResult });
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
        className="flex w-full items-center gap-2 rounded-lg border border-[#2563eb]/25 bg-white p-1.5 shadow-sm"
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
          className="shrink-0 rounded-md bg-[#2563eb] px-4 text-xs font-semibold text-white hover:brightness-110"
        >
          {state.kind === "running" ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Checking
            </>
          ) : (
            <>
              Check AI
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </form>

      {state.kind === "running" && (
        <div className="mt-5 rounded-lg border border-black/6 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-[#2563eb]" />
            Checking llms.txt, robots.txt, sitemap, and homepage signals…
          </div>
        </div>
      )}

      {state.kind === "error" && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.message}
        </div>
      )}

      {state.kind === "done" && <ResultView data={state.data} onReset={() => setState({ kind: "idle" })} />}
    </div>
  );
}

function scoreTone(v: number) {
  if (v >= 80) return "text-emerald-600";
  if (v >= 60) return "text-yellow-600";
  if (v >= 40) return "text-orange-600";
  return "text-red-600";
}

function BotChip({ bot, allowed }: { bot: string; allowed: boolean | null }) {
  const tone =
    allowed === true
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : allowed === false
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-neutral-200 bg-neutral-50 text-neutral-600";
  return (
    <div className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium", tone)}>
      {allowed === true && <CircleCheck className="h-3 w-3" />}
      {allowed === false && <CircleX className="h-3 w-3" />}
      {allowed === null && <MinusCircle className="h-3 w-3" />}
      <span>{bot}</span>
    </div>
  );
}

function SignalRow({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      {ok ? (
        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      ) : (
        <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-neutral-900">{label}</p>
        {detail && <p className="mt-0.5 text-[12px] text-neutral-500">{detail}</p>}
      </div>
    </li>
  );
}

function ResultView({ data, onReset }: { data: LlmsResult; onReset: () => void }) {
  return (
    <div className="mt-6 space-y-4">
      {/* Score card */}
      <div className="rounded-lg border border-black/6 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              AI readiness
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight">
              <span className={scoreTone(data.score)}>{data.score}</span>
              <span className="text-xl font-semibold text-neutral-400">/100</span>
            </p>
            <p className="mt-1 text-[12px] text-neutral-500">{data.domain}</p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 text-[11px] font-semibold text-muted-foreground underline-offset-4 hover:underline"
          >
            Check another domain
          </button>
        </div>
      </div>

      {/* AI bot access */}
      <div className="rounded-lg border border-black/6 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-foreground">AI crawler access (robots.txt)</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {data.robots.present
            ? "Green = explicitly allowed · Red = disallowed · Gray = no rule (default allow)."
            : "No robots.txt found — bots will crawl by default."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.robots.aiBots.length === 0
            ? <p className="text-[12px] text-muted-foreground">No rules to display.</p>
            : data.robots.aiBots.map((b) => <BotChip key={b.bot} bot={b.bot} allowed={b.allowed} />)}
        </div>
      </div>

      {/* Page signals */}
      <div className="rounded-lg border border-black/6 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-foreground">LLM-readable signals</p>
        <ul className="mt-3 divide-y divide-black/6">
          <SignalRow
            ok={data.llmsTxt.present}
            label="llms.txt manifest"
            detail={
              data.llmsTxt.present
                ? `Present · ${data.llmsTxt.sections} section${data.llmsTxt.sections === 1 ? "" : "s"}`
                : "Not published — LLMs can't read a guided index of your content."
            }
          />
          <SignalRow
            ok={!!data.page.title}
            label="<title> tag"
            detail={data.page.title ?? "Missing — add a descriptive title."}
          />
          <SignalRow
            ok={!!data.page.description}
            label="Meta description"
            detail={data.page.description ?? "Missing — AI models often cite this directly."}
          />
          <SignalRow
            ok={data.page.hasOrganizationSchema}
            label="Organization schema"
            detail={
              data.page.hasOrganizationSchema
                ? "Detected — AI engines can identify your brand."
                : "Missing — add Organization JSON-LD to make the brand identifiable."
            }
          />
          <SignalRow ok={data.page.hasOgTags} label="Open Graph tags" />
          <SignalRow ok={data.page.hasCanonical} label="Canonical link" />
          <SignalRow ok={data.page.sitemapReachable} label="sitemap.xml reachable" />
        </ul>
      </div>

      <ToolGateCard
        theme="blue"
        signedOutMessage="Sign up to run real AI probes across ChatGPT, Claude, Gemini, and Perplexity — see how each engine actually describes your brand."
        upgradeMessage="Upgrade to Pro to run live probes across 4 AI engines, track sentiment over time, and benchmark against competitors."
        signedInActiveMessage="Run AI probes on your connected projects."
        signedInActiveLabel="Open dashboard"
      />
    </div>
  );
}
