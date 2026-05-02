"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Globe, Link2, Loader2, Trophy, Users } from "lucide-react";

import {
  getCitationSources,
  type CitationSourcesResponse,
} from "@/lib/api/analyzer";
import { cn } from "@/lib/utils";

export function CitationSourcesPanel({ slug }: { slug: string }) {
  const [data, setData] = useState<CitationSourcesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getCitationSources(slug)
      .then((d) => {
        if (alive) setData(d);
      })
      .catch(() => {
        if (alive) setError("Couldn't load citation sources.");
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
        Loading citation sources…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!data) return null;

  if (data.total_citations === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Citation sources</h3>
        </div>
        <p className="mt-2 text-[13px] text-muted-foreground">
          No citations captured yet. Run or recheck any prompt to see which URLs AI engines
          and search results cite.
        </p>
      </div>
    );
  }

  const maxDomainTotal = Math.max(1, ...data.domains.map((d) => d.total));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard
          icon={<Link2 className="h-3.5 w-3.5" />}
          label="Total citations"
          value={data.total_citations}
        />
        <StatCard
          icon={<Trophy className="h-3.5 w-3.5" />}
          label="Your pages cited"
          value={data.brand_citations}
          tone="brand"
        />
        <StatCard
          icon={<Users className="h-3.5 w-3.5" />}
          label="Competitor pages cited"
          value={data.competitor_citations}
          tone="rival"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Top cited domains</h3>
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Which hosts AI engines and search surfaces cite most for your tracked prompts.
          </p>
          <ul className="mt-4 space-y-2.5">
            {data.domains.slice(0, 8).map((d) => {
              const widthPct = Math.max(6, Math.round((d.total / maxDomainTotal) * 100));
              return (
                <li key={d.domain}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate font-semibold text-foreground">{d.domain}</span>
                      {d.is_brand && (
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                          YOU
                        </span>
                      )}
                      {d.is_competitor && (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">
                          RIVAL
                        </span>
                      )}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{d.total}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        d.is_brand ? "bg-emerald-600" : d.is_competitor ? "bg-amber-500" : "bg-muted-foreground/50",
                      )}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

      </div>

      {data.rival_pages.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-foreground">Competitor pages AI cites</h3>
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Rival URLs winning citations for your tracked prompts. These are your content
            briefs.
          </p>
          <ul className="mt-4 space-y-2.5">
            {data.rival_pages.slice(0, 8).map((p) => (
              <li key={p.url} className="group">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start justify-between gap-3 rounded-lg px-2 py-1.5 transition hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-foreground">
                      {p.title || p.url}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {p.domain ? `${p.domain} · ` : ""}
                      {p.url}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-amber-700">
                    <span className="tabular-nums">{p.mentions}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "brand" | "rival";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4",
        tone === "brand" && "bg-emerald-50/40 border-emerald-200/60",
        tone === "rival" && "bg-amber-50/40 border-amber-200/60",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide",
          !tone && "text-muted-foreground",
          tone === "brand" && "text-emerald-700",
          tone === "rival" && "text-amber-700",
        )}
      >
        {icon}
        {label}
      </div>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}
