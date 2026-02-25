"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getWordPressData,
  syncWordPressData,
  type WordPressDataSnapshot,
} from "@/lib/api/integrations";

interface WordPressContentTabProps {
  email: string;
}

export function WordPressContentTab({ email }: WordPressContentTabProps) {
  const [data, setData] = useState<WordPressDataSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;
    loadData();
  }, [email]);

  async function loadData() {
    try {
      const snapshot = await getWordPressData(email);
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
      await syncWordPressData(email);

      const poll = setInterval(async () => {
        try {
          const snapshot = await getWordPressData(email);
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
          // still syncing
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
      <p className="py-8 text-center text-sm text-muted-foreground">
        Loading WordPress data...
      </p>
    );
  }

  if (!data) {
    return (
      <div className="space-y-3 py-8 text-center">
        <p className="text-muted-foreground">No WordPress data available yet.</p>
        <Button size="sm" onClick={handleSync} disabled={syncing}>
          {syncing ? "Syncing..." : "Sync Now"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Last updated {new Date(data.created_at).toLocaleString()}
        </p>
        <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
          {syncing ? "Syncing..." : "Refresh Data"}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Metric title="Total Posts" value={data.total_posts} />
        <Metric title="Total Pages" value={data.total_pages} />
        <Metric title="Published (30d)" value={data.published_posts_30d} />
        <Metric title="Updated (30d)" value={data.updated_posts_30d} />
      </div>

      <div className="rounded-lg border p-3">
        <p className="mb-2 text-sm font-medium">Recent Posts</p>
        {data.top_posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts found.</p>
        ) : (
          <div className="space-y-2">
            {data.top_posts.slice(0, 8).map((post) => (
              <a
                key={post.id}
                href={post.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-md border border-border/70 px-3 py-2 text-sm hover:bg-muted/40"
              >
                {post.title || post.slug || post.url}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
