"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getShopifyData,
  syncShopifyData,
  type ShopifyDataSnapshot,
} from "@/lib/api/integrations";
import { ShopifyOverviewCard } from "./shopify-overview-card";
import { ShopifyOrdersTrendChart } from "./shopify-orders-trend-chart";
import { ShopifyTopProductsTable } from "./shopify-top-products-table";

interface ShopifyEcommerceTabProps {
  email: string;
}

export function ShopifyEcommerceTab({ email }: ShopifyEcommerceTabProps) {
  const [data, setData] = useState<ShopifyDataSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;
    loadData();
  }, [email]);

  async function loadData() {
    try {
      const snapshot = await getShopifyData(email);
      setData(snapshot);
      setError(null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setError(null);
    let finished = false;
    try {
      await syncShopifyData(email);
      // Poll for completion
      const poll = setInterval(async () => {
        try {
          const snapshot = await getShopifyData(email);
          if (snapshot.sync_status === "complete") {
            finished = true;
            setData(snapshot);
            setSyncing(false);
            clearInterval(poll);
          } else if (snapshot.sync_status === "failed") {
            finished = true;
            setError(snapshot.error_message || "Sync failed.");
            setSyncing(false);
            clearInterval(poll);
          }
        } catch {
          // Still syncing
        }
      }, 3000);

      setTimeout(() => {
        clearInterval(poll);
        if (!finished) {
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
        Loading e-commerce data...
      </p>
    );
  }

  if (!data) {
    return (
      <div className="py-8 text-center space-y-3">
        <p className="text-muted-foreground">
          No e-commerce data available yet.
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

      <ShopifyOverviewCard data={data} />
      <ShopifyOrdersTrendChart data={data} />
      <ShopifyTopProductsTable data={data} />
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
