"use client";

import { useEffect, useState } from "react";
import {
  ExternalLink,
  Loader2,
  RefreshCw,
  Globe,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  getPromptOpportunities,
  regeneratePromptOpportunities,
  type BacklinkOpportunity,
  type OpportunityCategory,
} from "@/lib/api/analyzer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BacklinkOpportunitiesPanelProps {
  slug: string;
  trackId: number;
}

const CATEGORY_LABEL: Record<OpportunityCategory, string> = {
  directory: "Directory",
  review: "Review",
  press: "Press",
  forum: "Community",
  resource: "Resource",
  other: "Other",
};

const CATEGORY_STYLES: Record<OpportunityCategory, string> = {
  directory:
    "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  review:
    "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  press:
    "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  forum:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  resource:
    "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  other:
    "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
};

const PRIORITY_LABEL: Record<number, string> = {
  1: "High",
  2: "Medium",
  3: "Low",
};

export function BacklinkOpportunitiesPanel({
  slug,
  trackId,
}: BacklinkOpportunitiesPanelProps) {
  const [rows, setRows] = useState<BacklinkOpportunity[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPromptOpportunities(slug, trackId)
      .then((res) => {
        if (cancelled) return;
        setRows(res.rows);
        setHasGenerated(!!res.has_generated);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as {
          response?: { data?: { detail?: string } };
          message?: string;
        };
        setError(
          e.response?.data?.detail ??
            e.message ??
            "Failed to load opportunities",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, trackId]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError(null);
    try {
      const res = await regeneratePromptOpportunities(slug, trackId);
      setRows(res.rows);
      setHasGenerated(true);
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { detail?: string } };
        message?: string;
        code?: string;
      };
      const msg =
        e.code === "ECONNABORTED"
          ? "Generation took too long. Try again, or refresh in a moment."
          : e.response?.data?.detail ?? e.message ?? "Failed to generate";
      setError(msg);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-8">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  const isEmpty = rows.length === 0;
  const showRefresh = !isEmpty || hasGenerated;

  return (
    <div className="px-4 py-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-medium text-foreground">
            Backlink Opportunities
          </h4>
          {rows.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {rows.length}
            </span>
          )}
        </div>
        {showRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="h-7 gap-1.5 text-xs"
          >
            <RefreshCw
              className={cn("size-3.5", regenerating && "animate-spin")}
            />
            {regenerating ? "Regenerating…" : "Refresh"}
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isEmpty ? (
        <div className="rounded-md border border-dashed border-border bg-muted/10 px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">
            No suggestions yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Generate a list of sites where you can earn a backlink relevant to
            this prompt. Takes 10–30 seconds.
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="mt-4 h-8 gap-1.5 text-xs"
          >
            {regenerating ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="size-3.5" />
                Generate suggestions
              </>
            )}
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((opp) => (
            <OpportunityRow key={opp.id} opp={opp} />
          ))}
        </ul>
      )}

      <p className="mt-3 text-[10px] leading-snug text-muted-foreground">
        Suggestions are AI-generated. Verify each link before submitting — sites
        change their listing/contribution policies over time.
      </p>
    </div>
  );
}

function OpportunityRow({ opp }: { opp: BacklinkOpportunity }) {
  return (
    <li className="rounded-md border border-border bg-background px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={opp.submit_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
        >
          {opp.name}
          <ExternalLink className="size-3 text-muted-foreground" />
        </a>
        <span
          className={cn(
            "rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            CATEGORY_STYLES[opp.category],
          )}
        >
          {CATEGORY_LABEL[opp.category]}
        </span>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {PRIORITY_LABEL[opp.priority] ?? "Medium"}
        </span>
      </div>
      {opp.description && (
        <p className="mt-1 text-xs text-muted-foreground">{opp.description}</p>
      )}
      {opp.rationale && (
        <p className="mt-0.5 text-[11px] italic text-muted-foreground/80">
          {opp.rationale}
        </p>
      )}
    </li>
  );
}
