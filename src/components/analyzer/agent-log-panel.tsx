"use client";

import { useEffect, useState } from "react";
import { Cloud, Loader2, Radio, Triangle } from "lucide-react";

import { getAgentLog, type AgentLogResponse } from "@/lib/api/analyzer";
import { cn } from "@/lib/utils";

export function AgentLogPanel({ slug }: { slug: string }) {
  const [data, setData] = useState<AgentLogResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getAgentLog(slug)
      .then((d) => {
        if (alive) setData(d);
      })
      .catch(() => {
        // Stub endpoint; ignore transient errors
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  const integrations = data?.integrations ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Radio className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">AI crawler activity</h3>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
          See which AI bots (GPTBot, ClaudeBot, PerplexityBot, and more) are actually reading
          your pages — and when they first cite your content. Connect your CDN to stream
          request logs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {integrations.map((it) => (
          <IntegrationCard
            key={it.key}
            name={it.name}
            kind={it.key}
            connected={it.connected}
            status={it.status}
          />
        ))}
      </div>
    </div>
  );
}

function IntegrationCard({
  name,
  kind,
  connected,
  status,
}: {
  name: string;
  kind: "cloudflare" | "vercel";
  connected: boolean;
  status: "coming_soon" | "ready" | "error";
}) {
  const Icon = kind === "cloudflare" ? Cloud : Triangle;
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground">{name}</p>
          <p className="text-[11px] text-muted-foreground">
            {kind === "cloudflare"
              ? "Stream Logpush events to Signalor"
              : "Forward Edge Request logs"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status === "coming_soon" ? (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            Coming soon
          </span>
        ) : connected ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            Live
          </span>
        ) : null}
        <button
          type="button"
          disabled
          className={cn(
            "inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-[12px] font-semibold text-muted-foreground",
            "cursor-not-allowed opacity-60",
          )}
        >
          Connect
        </button>
      </div>
    </div>
  );
}
