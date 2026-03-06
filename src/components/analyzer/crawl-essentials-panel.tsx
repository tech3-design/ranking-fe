"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Copy, ExternalLink, Loader2, RefreshCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type CrawlEssentialFile,
  type CrawlEssentialsResponse,
  getCrawlEssentialsStatus,
} from "@/lib/api/actions";

interface CrawlEssentialsPanelProps {
  email: string;
  runId: number;
  analyzedUrl: string;
}

function statusStyles(status: CrawlEssentialFile["status"]) {
  if (status === "good") {
    return {
      badge: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600",
      icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      label: "Good",
    };
  }
  if (status === "needs_improvement") {
    return {
      badge: "border-amber-500/25 bg-amber-500/10 text-amber-600",
      icon: <AlertTriangle className="size-4 text-amber-500" />,
      label: "Needs Improvement",
    };
  }
  return {
    badge: "border-red-500/25 bg-red-500/10 text-red-600",
    icon: <AlertTriangle className="size-4 text-red-500" />,
    label: "Missing",
  };
}

function sourceLabel(source: CrawlEssentialsResponse["source"]) {
  if (source === "wordpress") return "WordPress integration";
  if (source === "shopify") return "Shopify integration";
  if (source === "analyzer_run") return "Current analyzer run URL";
  return "Analyzed URL fallback";
}

export function CrawlEssentialsPanel({ email, runId, analyzedUrl }: CrawlEssentialsPanelProps) {
  const [data, setData] = useState<CrawlEssentialsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCrawlEssentialsStatus(email, runId, analyzedUrl);
      setData(res);
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        "Failed to load AI crawl essentials status.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [email, runId, analyzedUrl]);

  useEffect(() => {
    if (!email) return;
    load();
  }, [email, load]);

  const summary = useMemo(() => {
    if (!data) return { good: 0, improve: 0, missing: 0 };
    return data.files.reduce(
      (acc, file) => {
        if (file.status === "good") acc.good += 1;
        else if (file.status === "needs_improvement") acc.improve += 1;
        else acc.missing += 1;
        return acc;
      },
      { good: 0, improve: 0, missing: 0 },
    );
  }, [data]);

  async function handleCopy(file: CrawlEssentialFile) {
    const text = [
      `${file.label} (${file.url})`,
      "",
      "Issues:",
      ...file.issues.map((i) => `- ${i}`),
      "",
      "Recommended improvements:",
      ...file.recommendations.map((r) => `- ${r}`),
      file.excerpt ? `\nCurrent excerpt:\n${file.excerpt}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await navigator.clipboard.writeText(text);
    setCopyState(file.key);
    window.setTimeout(() => setCopyState(null), 1200);
  }

  return (
    <Card className="backdrop-blur-xl border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              AI Crawl Essentials
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Validate `llms.txt`, `robots.txt`, and `sitemap.xml` and get AI-guided improvement actions.
            </p>
            {data && (
              <p className="mt-1 text-xs text-muted-foreground">
                Source: {sourceLabel(data.source)} - {data.site_url}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Checking crawl files...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">AI Readiness Score</p>
                <p className="text-2xl font-semibold">{Math.round(data.overall_score)}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">Good</p>
                <p className="text-2xl font-semibold text-emerald-500">{summary.good}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">Needs Improvement</p>
                <p className="text-2xl font-semibold text-amber-500">{summary.improve}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">Missing</p>
                <p className="text-2xl font-semibold text-red-500">{summary.missing}</p>
              </div>
            </div>

            <div className="space-y-3">
              {data.files.map((file) => {
                const ui = statusStyles(file.status);
                return (
                  <div key={file.key} className="rounded-xl border border-border/70 bg-background/65 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {ui.icon}
                        <h4 className="font-medium">{file.label}</h4>
                        <span className={`rounded-full border px-2 py-0.5 text-xs ${ui.badge}`}>
                          {ui.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Score {file.score}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(file)}
                          className="gap-1.5"
                        >
                          <Copy className="size-3.5" />
                          {copyState === file.key ? "Copied" : "Copy Fix"}
                        </Button>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs hover:bg-muted/60"
                        >
                          <ExternalLink className="size-3.5" />
                          Open
                        </a>
                      </div>
                    </div>

                    {file.issues.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                        {file.issues.map((issue) => (
                          <li key={issue}>- {issue}</li>
                        ))}
                      </ul>
                    )}

                    {file.recommendations.length > 0 && (
                      <div className="mt-3 rounded-lg border border-border/60 bg-background/55 p-3 text-sm">
                        <p className="font-medium">Recommended improvements</p>
                        <ul className="mt-1 space-y-1 text-muted-foreground">
                          {file.recommendations.map((recommendation) => (
                            <li key={recommendation}>- {recommendation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
