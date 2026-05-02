"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  ExternalLink,
  Globe,
  Loader2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  getDomainAnalytics,
  refreshDomainAnalytics,
  type DomainAnalyticsSnapshot,
} from "@/lib/api/analyzer";
import { Button } from "@/components/ui/button";

interface DomainAnalyticsPanelProps {
  slug: string;
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.round(n).toLocaleString();
}

function formatUSD(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export function DomainAnalyticsPanel({ slug }: DomainAnalyticsPanelProps) {
  const [snapshot, setSnapshot] = useState<DomainAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setErrorCode(null);
    getDomainAnalytics(slug)
      .then((res) => {
        if (cancelled) return;
        setSnapshot(res);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as {
          response?: { data?: { detail?: string; code?: string } };
          message?: string;
        };
        setError(
          e.response?.data?.detail ?? e.message ?? "Failed to load domain analytics",
        );
        setErrorCode(e.response?.data?.code ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    setErrorCode(null);
    try {
      const res = await refreshDomainAnalytics(slug);
      setSnapshot(res);
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { detail?: string; code?: string } };
        message?: string;
      };
      setError(
        e.response?.data?.detail ?? e.message ?? "Failed to refresh",
      );
      setErrorCode(e.response?.data?.code ?? null);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading real-world signals…
        </div>
      </div>
    );
  }

  if (errorCode === "dataforseo_not_configured") {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              DataForSEO not configured
            </p>
            <p className="text-xs text-muted-foreground">
              Set <code>DATAFORSEO_LOGIN</code> and <code>DATAFORSEO_PASSWORD</code>{" "}
              in the backend env to enable real-world traffic signals.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Couldn&apos;t load real-world signals
            </p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleRefresh}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!snapshot) return null;

  const overview = snapshot.overview ?? {
    organic_keywords: 0,
    organic_traffic: 0,
    organic_value_usd: 0,
    paid_keywords: 0,
    paid_traffic: 0,
    paid_value_usd: 0,
  };
  const keywords = snapshot.top_keywords ?? [];
  const pages = snapshot.top_pages ?? [];
  const noData =
    overview.organic_traffic === 0 &&
    keywords.length === 0 &&
    pages.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <Activity className="h-4 w-4 text-primary" />
            Real-world signals
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Estimated organic traffic for{" "}
            <span className="font-medium text-foreground">{snapshot.domain}</span> —
            sourced from DataForSEO, no GA connection needed.
            {snapshot.synced_at ? ` · Synced ${relativeTime(snapshot.synced_at)}` : null}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="shrink-0 gap-1.5"
        >
          {refreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-500">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Est. monthly traffic"
          value={formatNumber(overview.organic_traffic)}
          icon={<TrendingUp className="h-3.5 w-3.5" />}
        />
        <StatCard
          label="Ranked keywords"
          value={formatNumber(overview.organic_keywords)}
          icon={<Globe className="h-3.5 w-3.5" />}
        />
        <StatCard
          label="Traffic value (USD)"
          value={formatUSD(overview.organic_value_usd)}
          icon={<Activity className="h-3.5 w-3.5" />}
        />
      </div>

      {noData ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm font-medium text-foreground">
            No public traffic signal yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            DataForSEO has no organic ranking data for this domain. This is normal
            for very new sites or domains that get traffic primarily from social,
            email, or paid channels.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <KeywordsTable keywords={keywords} />
          <PagesTable pages={pages} />
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
    </div>
  );
}

function KeywordsTable({
  keywords,
}: {
  keywords: DomainAnalyticsSnapshot["top_keywords"];
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Top ranking keywords
        </p>
      </div>
      {keywords.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-muted-foreground">
          No ranking keywords found.
        </p>
      ) : (
        <div className="max-h-[320px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left font-medium">Keyword</th>
                <th className="px-2 py-2 text-right font-medium">#</th>
                <th className="px-4 py-2 text-right font-medium">Volume</th>
              </tr>
            </thead>
            <tbody>
              {keywords.slice(0, 15).map((k) => (
                <tr key={`${k.keyword}-${k.position}`} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-2 truncate max-w-[220px] text-foreground">
                    {k.keyword}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                    {k.position || "—"}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                    {formatNumber(k.search_volume)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PagesTable({
  pages,
}: {
  pages: DomainAnalyticsSnapshot["top_pages"];
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Top traffic pages
        </p>
      </div>
      {pages.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-muted-foreground">
          No top pages found.
        </p>
      ) : (
        <div className="max-h-[320px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left font-medium">Page</th>
                <th className="px-4 py-2 text-right font-medium">Traffic</th>
              </tr>
            </thead>
            <tbody>
              {pages.slice(0, 10).map((p) => (
                <tr key={p.url} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-2 max-w-[260px] truncate">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-foreground hover:text-primary"
                    >
                      <span className="truncate">
                        {p.url.replace(/^https?:\/\/(www\.)?/, "")}
                      </span>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                    </a>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                    {formatNumber(p.organic_traffic)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
