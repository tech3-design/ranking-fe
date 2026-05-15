"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAiRecommendationSummary, type Engine } from "@/lib/api/analyzer";
import { Sparkles, Quote, ChevronDown } from "@/components/icons";
import { cn } from "@/lib/utils";

const ENGINE_LABEL: Record<Engine, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  google: "Google",
  bing: "Bing",
};

const CORAL = "#e46055";

export function AiRecommendationCard({ slug }: { slug: string }) {
  const [showSamples, setShowSamples] = useState(false);
  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["ai-recommendation-summary", slug],
    queryFn: () => getAiRecommendationSummary(slug),
    enabled: !!slug,
  });

  return (
    <div className="flex h-full min-h-0 w-full flex-col rounded-xl border border-neutral-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)]">
      {/* Header */}
      <div className="mb-3 flex shrink-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Sparkles className="h-3.5 w-3.5" style={{ color: CORAL }} />
            AI Recommendation Rate
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            How often AI responses positively recommend your brand
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 rounded-lg border border-neutral-100 bg-[#f7f7f7] p-3">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-muted-foreground">Loading…</p>
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-muted-foreground">Couldn’t load summary</p>
          </div>
        ) : !data || data.total === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-xs text-muted-foreground">
              No AI responses yet, run the prompt tracker to see recommendation rate.
            </p>
          </div>
        ) : (
          <>
            {/* Headline */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums" style={{ color: CORAL }}>
                {data.recommendation_pct}%
              </span>
              <span className="text-[11px] text-muted-foreground">
                {data.recommended} of {data.total} AI responses recommended you
              </span>
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-2 gap-2">
              <StatChip
                label="Mentioned at all"
                value={`${data.mention_pct}%`}
                sub={`${data.mentioned}/${data.total}`}
              />
              <StatChip
                label="Cited your site"
                value={`${data.citation_pct}%`}
                sub={`${data.cited}/${data.total}`}
              />
            </div>

            {/* Per-engine bars */}
            {data.per_engine.length > 0 && (
              <div className="space-y-1.5">
                {data.per_engine.map((row) => (
                  <EngineRow
                    key={row.engine}
                    label={ENGINE_LABEL[row.engine] ?? row.engine}
                    pct={row.recommendation_pct}
                    sub={`${row.recommended}/${row.total}`}
                  />
                ))}
              </div>
            )}

            {/* Sample quotes drawer */}
            {data.samples.length > 0 && (
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => setShowSamples((v) => !v)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown
                    className={cn("h-3 w-3 transition-transform", showSamples && "rotate-180")}
                  />
                  {showSamples
                    ? "Hide quotes"
                    : `View ${data.samples.length} sample quote${data.samples.length === 1 ? "" : "s"}`}
                </button>
                {showSamples && (
                  <div className="mt-2 space-y-2">
                    {data.samples.map((s, i) => (
                      <div key={i} className="rounded-md border border-neutral-200 bg-white p-2">
                        <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                          <Quote className="h-2.5 w-2.5" />
                          <span>{ENGINE_LABEL[s.engine] ?? s.engine}</span>
                        </div>
                        <p className="text-[11px] leading-snug text-foreground/80">{s.quote}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatChip({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-white px-2.5 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-base font-semibold tabular-nums text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function EngineRow({ label, pct, sub }: { label: string; pct: number; sub: string }) {
  return (
    <div className="grid grid-cols-12 items-center gap-2">
      <span className="col-span-3 truncate text-[11px] text-muted-foreground">{label}</span>
      <div className="col-span-7 h-1.5 overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.max(0, pct))}%`,
            backgroundColor: CORAL,
          }}
        />
      </div>
      <span className="col-span-2 text-right text-[11px] tabular-nums text-foreground">
        {pct}%<span className="ml-1 text-[10px] text-muted-foreground">{sub}</span>
      </span>
    </div>
  );
}
