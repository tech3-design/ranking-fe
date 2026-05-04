"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Link2, Loader2, AlertCircle } from "lucide-react";
import {
  getPromptBacklinks,
  type BacklinkRow,
  type PromptBacklinksResponse,
} from "@/lib/api/analyzer";
import { cn } from "@/lib/utils";

interface CitationAuthorityPanelProps {
  slug: string;
  trackId: number;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function CitationAuthorityPanel({
  slug,
  trackId,
}: CitationAuthorityPanelProps) {
  const [data, setData] = useState<PromptBacklinksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setErrorCode(null);

    getPromptBacklinks(slug, trackId)
      .then((res) => {
        if (cancelled) return;
        setData(res);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as {
          response?: { status?: number; data?: { detail?: string; code?: string } };
          message?: string;
        };
        setErrorCode(e.response?.data?.code ?? null);
        setError(
          e.response?.data?.detail ??
            e.message ??
            "Failed to load backlink data",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, trackId]);

  if (loading) {
    return (
      <div className="border-t border-border bg-muted/20 px-4 py-8">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading citation authority…
        </div>
      </div>
    );
  }

  if (error) {
    const isNotConfigured = errorCode === "dataforseo_not_configured";
    return (
      <div className="border-t border-border bg-muted/20 px-4 py-6">
        <div className="rounded-md border border-dashed border-border bg-muted/10 px-4 py-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-medium text-foreground">
                {isNotConfigured
                  ? "Backlink provider not configured"
                  : "Couldn't load backlink data"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isNotConfigured
                  ? "Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in the backend env to enable Citation Authority."
                  : error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.rows.length === 0) {
    return (
      <div className="border-t border-border bg-muted/20 px-4 py-6">
        <div className="rounded-md border border-dashed border-border bg-muted/10 px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">
            No citations yet for this prompt
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Run the prompt across the AI engines first — citation authority is
            measured against the domains they cite.
          </p>
        </div>
      </div>
    );
  }

  const brandRow = data.rows.find((r) => r.is_brand);
  const brandRD = brandRow?.referring_domains ?? 0;

  return (
    <div className="border-t border-border bg-muted/20 px-4 py-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-medium text-foreground">
            Citation Authority
          </h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Backlink strength of every domain cited for this prompt.
        </p>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-background">
        <table className="w-full text-xs">
          <thead className="border-b border-border bg-muted/30">
            <tr className="text-left text-muted-foreground">
              <th className="px-3 py-2 font-medium">Domain</th>
              <th className="px-3 py-2 text-right font-medium">Cited</th>
              <th className="px-3 py-2 text-right font-medium">
                Referring Domains
              </th>
              <th className="px-3 py-2 text-right font-medium">Backlinks</th>
              <th className="px-3 py-2 text-right font-medium">Rank</th>
              <th className="px-3 py-2 text-right font-medium">vs. You</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <BacklinkTableRow
                key={row.domain}
                row={row}
                brandRD={brandRD}
                hasBrandRow={!!brandRow}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
        Data via DataForSEO Backlinks API. Cached 7 days per domain.
        {data.api_error ? (
          <span className="text-amber-600"> · {data.api_error}</span>
        ) : null}
      </p>
    </div>
  );
}

function BacklinkTableRow({
  row,
  brandRD,
  hasBrandRow,
}: {
  row: BacklinkRow;
  brandRD: number;
  hasBrandRow: boolean;
}) {
  const gap = hasBrandRow && !row.is_brand ? row.referring_domains - brandRD : null;

  return (
    <tr
      className={cn(
        "border-b border-border last:border-b-0",
        row.is_brand && "bg-primary/5",
      )}
    >
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <a
            href={`https://${row.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-medium text-foreground hover:underline"
          >
            {row.domain}
            <ExternalLink className="size-3 text-muted-foreground" />
          </a>
          {row.is_brand && (
            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              You
            </span>
          )}
          {row.is_competitor && (
            <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Competitor
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
        {row.citation_count > 0 ? row.citation_count : "—"}
      </td>
      <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
        {row.has_data ? formatNumber(row.referring_domains) : "—"}
      </td>
      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
        {row.has_data ? formatNumber(row.backlinks) : "—"}
      </td>
      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
        {row.has_data ? row.rank : "—"}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {gap === null || !row.has_data ? (
          <span className="text-muted-foreground">—</span>
        ) : gap > 0 ? (
          <span className="font-medium text-amber-600 dark:text-amber-400">
            +{formatNumber(gap)}
          </span>
        ) : gap < 0 ? (
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {formatNumber(gap)}
          </span>
        ) : (
          <span className="text-muted-foreground">±0</span>
        )}
      </td>
    </tr>
  );
}
