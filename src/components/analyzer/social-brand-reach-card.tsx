"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export interface SocialPlatformSnapshot {
  url: string | null;
  followers: number | null;
  error?: string | null;
  from_guess?: boolean;
}

export interface SocialPresenceDetails {
  instagram?: SocialPlatformSnapshot;
  facebook?: SocialPlatformSnapshot;
  brand_presence_score?: number;
  market_capture_score?: number;
  method?: string;
  error?: string;
  /** How to read scores (guessed URLs vs real signals) */
  interpretation?: string;
}

export interface AiBrandFactsBlock {
  facts?: string[];
  summary?: string;
  caveat?: string;
  method?: string;
  error?: string;
}

interface SocialBrandReachCardProps {
  slug: string;
  brandName: string;
  details: SocialPresenceDetails | null | undefined;
  /** Grounded LLM notes from brand visibility analysis */
  aiBrandFacts?: AiBrandFactsBlock | null;
  coral: string;
}

export function SocialBrandReachCard({ slug, brandName, details, aiBrandFacts, coral }: SocialBrandReachCardProps) {
  const presence = details && typeof details === "object" ? (details.brand_presence_score ?? 0) : 0;
  const capture = details && typeof details === "object" ? (details.market_capture_score ?? 0) : 0;
  const topError = details && typeof details === "object" ? details.error : undefined;

  const hasSocialPayload = Boolean(
    details &&
      typeof details === "object" &&
      Object.keys(details).length > 0 &&
      ("method" in details || "instagram" in details || "facebook" in details || topError),
  );

  const facts = aiBrandFacts?.facts?.filter(Boolean) ?? [];
  const summary = aiBrandFacts?.summary?.trim() ?? "";
  const caveat = aiBrandFacts?.caveat?.trim() ?? "";
  const aiError = aiBrandFacts?.error;
  const hasAiContent = facts.length > 0 || Boolean(summary);
  const showAiSection = hasAiContent || Boolean(caveat) || Boolean(aiError);

  return (
    <div className="col-span-12 rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Brand visibility — social reach</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Social presence signals for <span className="font-medium text-foreground">{brandName}</span>
            {" · "}
            <Link href={`/dashboard/${slug}/visibility`} className="underline-offset-2 hover:underline" style={{ color: coral }}>
              Full visibility
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-8 text-right lg:pl-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Brand presence</p>
            <p className="text-2xl font-bold tabular-nums text-foreground">{Math.round(presence)}</p>
            <p className="text-[10px] text-muted-foreground">/100</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Market capture</p>
            <p className="text-2xl font-bold tabular-nums text-foreground">{Math.round(capture)}</p>
            <p className="text-[10px] text-muted-foreground">/100</p>
          </div>
        </div>
      </div>

      {/* AI perception — fills the card so the overview isn’t empty */}
      {showAiSection ? (
        <div className="mt-4 rounded-xl border border-border bg-muted/15 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs font-semibold text-foreground">What AI is likely to reflect</p>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">
            From the same visibility signals we analyze (not live browsing). Re-run if this looks empty on older reports.
          </p>
          {facts.length > 0 && (
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground">
              {facts.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          )}
          {summary && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{summary}</p>}
          {caveat && <p className="mt-2 text-[11px] italic text-muted-foreground">{caveat}</p>}
          {aiError && !hasAiContent && (
            <p className="text-xs text-amber-800 dark:text-amber-200">
              {aiError === "no_llm"
                ? "Add LLM credentials in the backend to generate these notes."
                : `Could not load AI notes: ${aiError}`}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/10 p-4">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs font-medium text-foreground">What AI is likely to reflect</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                No AI perception text yet for this run. Run a <span className="font-medium text-foreground">new analysis</span> so we can
                save grounded notes about how chat models may describe your brand from visibility data.
              </p>
            </div>
          </div>
        </div>
      )}

      {!hasSocialPayload && (
        <p className="mt-3 text-xs text-muted-foreground">
          Re-run analysis to refresh social reach scores for this brand.
        </p>
      )}

      {topError && (
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
          Social metrics unavailable: {topError}
        </p>
      )}

      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
        {typeof details?.interpretation === "string" && details.interpretation
          ? details.interpretation
          : "Scores use public social URL checks only (no platform breakdown shown). Low scores usually mean we could not confirm follower counts."}
      </p>
    </div>
  );
}
