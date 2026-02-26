"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getGAData,
  syncGAData,
  type GADataSnapshot,
} from "@/lib/api/integrations";
import { TrafficOverviewCard } from "./traffic-overview-card";
import { DailyTrendChart } from "./daily-trend-chart";
import { TrafficSourcesChart } from "./traffic-sources-chart";
import { TopPagesTable } from "./top-pages-table";
import { ScoreTrafficChart } from "./score-traffic-chart";

interface GATrafficTabProps {
  email: string;
  analyzedUrl?: string;
}

export function GATrafficTab({ email, analyzedUrl }: GATrafficTabProps) {
  const [data, setData] = useState<GADataSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;
    loadData();
  }, [email, analyzedUrl]);

  async function loadData() {
    try {
      const snapshot = await getGAData(email, analyzedUrl);
      setData(snapshot);
      setError(null);
    } catch {
      // No data yet
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setError(null);
    try {
      await syncGAData(email);
      // Poll for completion
      const poll = setInterval(async () => {
        try {
          const snapshot = await getGAData(email, analyzedUrl);
          if (snapshot.sync_status === "complete") {
            setData(snapshot);
            setSyncing(false);
            clearInterval(poll);
          } else if (snapshot.sync_status === "failed") {
            setError(snapshot.error_message || "Sync failed.");
            setSyncing(false);
            clearInterval(poll);
          }
        } catch {
          // Still syncing
        }
      }, 3000);

      // Timeout after 60s
      setTimeout(() => {
        clearInterval(poll);
        if (syncing) {
          setSyncing(false);
          setError("Sync timed out. Try again later.");
        }
      }, 60_000);
    } catch {
      setError("Failed to start sync.");
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Loading traffic data...
      </p>
    );
  }

  if (!data) {
    return (
      <div className="py-8 text-center space-y-3">
        <p className="text-muted-foreground">
          No traffic data available yet.
        </p>
        <Button onClick={handleSync} disabled={syncing} size="sm">
          {syncing ? "Syncing..." : "Sync Now"}
        </Button>
      </div>
    );
  }

  const lastUpdated = new Date(data.created_at);
  const ago = getTimeAgo(lastUpdated);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Last updated {ago}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? "Syncing..." : "Refresh Data"}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {analyzedUrl && data.page_match && (
        <div
          className={`rounded-md border p-3 text-sm ${
            data.page_match.found
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
              : !data.page_match.host_match
              ? "border-red-500/30 bg-red-500/10 text-red-600"
              : "border-amber-500/30 bg-amber-500/10 text-amber-600"
          }`}
        >
          {data.page_match.found ? (
            <>
              Exact page match confirmed: <span className="font-mono">{data.page_match.page_path}</span>
              {" "}• Sessions: {data.page_match.sessions}
            </>
          ) : !data.page_match.host_match ? (
            <>
              GA property hostname mismatch. Analyzed host:{" "}
              <span className="font-mono">{data.page_match.analyzed_host || "unknown"}</span>.
              {" "}Select the GA property for this domain.
            </>
          ) : (
            <>
              Exact analyzed page not found in GA data window for <span className="font-mono">{data.page_match.page_path}</span>.
            </>
          )}
        </div>
      )}

      <TrafficOverviewCard data={data} />

      <div className="grid md:grid-cols-2 gap-6">
        <DailyTrendChart data={data} />
        <TrafficSourcesChart data={data} />
      </div>

      <TopPagesTable data={data} />

      <ScoreTrafficChart email={email} />
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
