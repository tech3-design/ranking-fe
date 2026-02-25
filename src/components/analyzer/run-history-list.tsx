"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRunList, type AnalysisRunList } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";

interface RunHistoryListProps {
  email: string;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-500 bg-green-500/10";
  if (score >= 50) return "text-yellow-500 bg-yellow-500/10";
  if (score >= 30) return "text-orange-500 bg-orange-500/10";
  return "text-red-500 bg-red-500/10";
}

function getStatusBadge(status: string) {
  if (status === "complete") return null;
  if (status === "failed") return <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">Failed</span>;
  return <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 animate-pulse">Running</span>;
}

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function RunHistoryList({ email }: RunHistoryListProps) {
  const [runs, setRuns] = useState<AnalysisRunList[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!email) return;
    getRunList(email)
      .then(setRuns)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [email]);

  if (loading) {
    return (
      <div className="w-full max-w-xl text-center py-4">
        <p className="text-sm text-muted-foreground">Loading history...</p>
      </div>
    );
  }

  if (!runs.length) return null;

  // Show all analyses
  const recent = runs;

  return (
    <div className="w-full max-w-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Recent Analyses</h3>
        <span className="text-xs text-muted-foreground">•</span>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden divide-y divide-border">
        {recent.map((run) => {
          const domain = extractDomain(run.url);
          const score = run.composite_score != null ? Math.round(run.composite_score) : null;
          const isComplete = run.status === "complete";
          const date = new Date(run.created_at);
          const badge = getStatusBadge(run.status);

          return (
            <div
              key={run.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => router.push(routes.analyzerResults(run.id))}
            >
              {/* Score circle */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm font-bold ${
                isComplete && score != null ? getScoreColor(score) : "bg-muted text-muted-foreground"
              }`}>
                {isComplete && score != null ? score : "—"}
              </div>

              {/* URL + meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{domain}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {run.run_type === "full_site" ? "Full Site" : "Single Page"}
                  </span>
                  {badge}
                </div>
              </div>

              {/* Arrow */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground flex-shrink-0">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
