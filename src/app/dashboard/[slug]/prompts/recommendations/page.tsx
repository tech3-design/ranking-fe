"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { addPromptTrack } from "@/lib/api/analyzer";
import { useRun } from "../../_components/run-context";
import { useSession } from "@/lib/auth-client";
import { apiClient } from "@/lib/api/client";
import {
  getGAData,
  getIntegrationStatus,
  type GADataSnapshot,
} from "@/lib/api/integrations";
import { Lightbulb, Loader2, AlertCircle, Plus, Copy, Check, Search } from "lucide-react";

type SearchInsightsResponse = {
  source: string;
  seeds: string[];
  suggestions: string[];
  topTopics: Array<{ topic: string; count: number }>;
  improvements: string[];
  brandUrl?: string;
};

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const v = String(raw || "").trim();
    if (!v) continue;
    const key = v.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function toReadablePath(path: string): string {
  return path
    .replace(/^\/+/, "")
    .replace(/[/?#].*$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function promptsFromGa(data: GADataSnapshot, brandName: string): string[] {
  const prompts: string[] = [];
  const brand = brandName.trim();

  for (const page of data.top_pages ?? []) {
    const phrase = toReadablePath(page.path);
    if (!phrase || phrase.length < 4) continue;
    prompts.push(`${brand} ${phrase}`);
    prompts.push(`How does ${brand} relate to ${phrase}?`);
    prompts.push(`Best ${phrase} options like ${brand}`);
  }

  for (const source of data.traffic_sources ?? []) {
    const src = `${source.source} ${source.medium}`.trim().toLowerCase();
    if (!src || src.includes("(direct)") || src.includes("none")) continue;
    prompts.push(`${brand} from ${src}`);
    prompts.push(`${brand} ${src} strategy`);
  }

  return dedupe(prompts).slice(0, 16);
}

export default function PromptsRecommendationsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { run } = useRun();
  const { data: session } = useSession();

  const brandName = run?.display_brand_name?.trim() || run?.brand_name?.trim() || "";
  const brandUrl = run?.url?.trim() || "";

  const [insights, setInsights] = useState<SearchInsightsResponse | null>(null);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addingIdx, setAddingIdx] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [sourceSummary, setSourceSummary] = useState<string[]>([]);

  const runSearchEngine = useCallback(async () => {
    if (!brandName) {
      setError("Run an analysis first so we know your brand name.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const sourcesUsed: string[] = [];

      // 1) Internet autocomplete insights (live).
      const insightsPromise = fetch("/api/prompts/search-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, brandUrl }),
      }).then(async (res) => (res.ok ? ((await res.json()) as SearchInsightsResponse) : null));

      // 2) Existing analyzer prompt generator.
      const generatedPromise = apiClient
        .post<{ prompts?: string[] }>("/api/analyzer/generate-prompts/", {
          brand_name: brandName,
          brand_url: brandUrl || undefined,
        })
        .then((r) => (Array.isArray(r.data.prompts) ? r.data.prompts : []))
        .catch(() => [] as string[]);

      // 3) GA-connected signals (if available).
      const gaPromise = (async () => {
        const email = session?.user?.email ?? "";
        if (!email) return [] as string[];
        const integrations = await getIntegrationStatus(email).catch(() => []);
        const gaActive = integrations.some(
          (i) => i.provider === "google_analytics" && i.is_active,
        );
        if (!gaActive) return [] as string[];
        const gaData = await getGAData(email, brandUrl || undefined).catch(() => null);
        if (!gaData) return [] as string[];
        return promptsFromGa(gaData, brandName);
      })();

      const [insightsData, generatedPrompts, gaPrompts] = await Promise.all([
        insightsPromise,
        generatedPromise,
        gaPromise,
      ]);

      if (insightsData) {
        setInsights(insightsData);
        if (insightsData.suggestions.length > 0) {
          sourcesUsed.push(`Internet autocomplete (${insightsData.suggestions.length})`);
        }
      } else {
        setInsights(null);
      }

      const generated = dedupe(generatedPrompts.map((p) => String(p).trim()).filter(Boolean));
      if (generated.length > 0) sourcesUsed.push(`AI generator (${generated.length})`);
      if (gaPrompts.length > 0) sourcesUsed.push(`Google Analytics pages/sources (${gaPrompts.length})`);

      const merged = dedupe([
        ...(insightsData?.suggestions ?? []),
        ...generated,
        ...gaPrompts,
      ]);

      setIdeas(merged.slice(0, 40));
      setSourceSummary(sourcesUsed);

      if (merged.length === 0) {
        setError("No prompt signals found yet. Connect GA or try again with a broader brand query.");
      }
    } catch {
      setError("Could not run search insight engine.");
      setInsights(null);
      setIdeas([]);
      setSourceSummary([]);
    } finally {
      setLoading(false);
    }
  }, [brandName, brandUrl, session?.user?.email]);

  async function handleAddToTracker(text: string, idx: number) {
    if (!slug) return;
    setAddingIdx(idx);
    setError("");
    try {
      await addPromptTrack(slug, text);
      router.push(`/dashboard/${slug}/prompts/actions`);
    } catch {
      setError("Failed to add prompt. It may already exist or hit your plan limit.");
    } finally {
      setAddingIdx(null);
    }
  }

  function handleCopy(text: string, idx: number) {
    void navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground">Recommendations</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              How to rank your prompts so AI engines mention <span className="text-foreground font-medium">{brandName || "your brand"}</span> more often — plus ideas you can drop straight into the tracker.
            </p>
          </div>
        </div>
      </div> */}
       <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Recommendations</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            How to rank your prompts so AI engines mention <span className="text-foreground font-medium">{brandName || "your brand"}</span> more often — plus ideas you can drop straight into the tracker.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-primary shrink-0" />
          <h2 className="text-sm font-semibold text-foreground">Internet search insight engine</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Pulls and merges multiple sources: internet autocomplete, AI generation, and Google Analytics
          signals (if connected) to find more accurate prompts for{" "}
          <span className="text-foreground font-medium">{brandName || "your brand"}</span>.
        </p>
        <button
          type="button"
          onClick={() => void runSearchEngine()}
          disabled={loading || !brandName}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 hover:shadow-lg hover:shadow-primary/15 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? "Analyzing searches..." : "Run search insight engine"}
        </button>
        {!brandName && (
          <p className="text-xs text-muted-foreground mt-3">Complete an analysis run to enable generation.</p>
        )}
      </div>

      {sourceSummary.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Sources used</h3>
          <div className="flex flex-wrap gap-2">
            {sourceSummary.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {insights && (
        <>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Most searched themes</h3>
            {insights.topTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground">No theme data yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {insights.topTopics.map((t) => (
                  <span
                    key={t.topic}
                    className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
                  >
                    {t.topic} <span className="ml-1 text-muted-foreground">({t.count})</span>
                  </span>
                ))}
              </div>
            )}
          </div>

        </>
      )}

      {ideas.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Most searched queries to track</h3>
          {ideas.map((text, idx) => (
            <div
              key={`${idx}-${text.slice(0, 24)}`}
              className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-card"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-muted-foreground/70 bg-muted px-2 py-0.5 rounded-full shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm text-foreground flex-1 min-w-0">{text}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(text, idx)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
                >
                  {copiedIdx === idx ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedIdx === idx ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleAddToTracker(text, idx)}
                  disabled={addingIdx !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 hover:shadow hover:shadow-primary/15 disabled:opacity-50"
                >
                  {addingIdx === idx ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Add to tracker
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
