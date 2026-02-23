"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { getRunList, type AnalysisRunList } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-500 bg-green-500/10 border-green-500/20";
  if (score >= 50) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
  if (score >= 30) return "text-orange-500 bg-orange-500/10 border-orange-500/20";
  return "text-red-500 bg-red-500/10 border-red-500/20";
}

function getScoreLabel(score: number): string {
  if (score >= 70) return "Good";
  if (score >= 50) return "Average";
  if (score >= 30) return "Needs Work";
  return "Poor";
}

function getStatusBadge(status: string) {
  if (status === "complete") return null;
  if (status === "failed")
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
        Failed
      </span>
    );
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse">
      Running
    </span>
  );
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function extractPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname === "/" ? "" : u.pathname;
  } catch {
    return "";
  }
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
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

  // Group runs by domain
  const grouped = runs.reduce(
    (acc, run) => {
      const domain = extractDomain(run.url);
      if (!acc[domain]) acc[domain] = [];
      acc[domain].push(run);
      return acc;
    },
    {} as Record<string, AnalysisRunList[]>,
  );

  const domains = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold">Analysis History</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {runs.length} {runs.length === 1 ? "analysis" : "analyses"} across {domains.length} {domains.length === 1 ? "site" : "sites"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={routes.analyzer}>
              <Button size="sm">New Analysis</Button>
            </Link>
            <ThemeToggle />
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        ) : runs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No analyses yet</p>
            <Link href={routes.analyzer}>
              <Button>Run Your First Analysis</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {domains.map((domain, domainIdx) => {
              const domainRuns = grouped[domain];
              // Best score for this domain
              const bestScore = Math.max(
                ...domainRuns
                  .filter((r) => r.status === "complete" && r.composite_score != null)
                  .map((r) => r.composite_score ?? 0),
                0,
              );

              return (
                <motion.div
                  key={domain}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: domainIdx * 0.1, duration: 0.4 }}
                  className="rounded-lg border bg-card/50 backdrop-blur-xl"
                >
                  {/* Domain header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold uppercase">
                        {domain.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{domain}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {domainRuns.length} {domainRuns.length === 1 ? "run" : "runs"}
                          {bestScore > 0 && <> &middot; Best: {Math.round(bestScore)}</>}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Runs */}
                  <div className="divide-y divide-border">
                    {domainRuns.map((run, runIdx) => {
                      const score =
                        run.composite_score != null
                          ? Math.round(run.composite_score)
                          : null;
                      const isComplete = run.status === "complete";
                      const date = new Date(run.created_at);
                      const path = extractPath(run.url);
                      const badge = getStatusBadge(run.status);

                      return (
                        <motion.div
                          key={run.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: domainIdx * 0.1 + runIdx * 0.05, duration: 0.3 }}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-muted/40 cursor-pointer transition-colors"
                          onClick={() =>
                            router.push(routes.analyzerResults(run.id))
                          }
                        >
                          {/* Score */}
                          <div
                            className={`flex-shrink-0 w-12 h-12 rounded-lg border flex flex-col items-center justify-center ${
                              isComplete && score != null
                                ? getScoreColor(score)
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            <span className="font-mono text-base font-bold leading-none">
                              {isComplete && score != null ? score : "\u2014"}
                            </span>
                            {isComplete && score != null && (
                              <span className="text-[8px] font-medium mt-0.5 opacity-70">
                                {getScoreLabel(score)}
                              </span>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {path || "/"}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-muted-foreground">
                                {date.toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {date.toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                {run.run_type === "full_site"
                                  ? "Full Site"
                                  : "Single Page"}
                              </span>
                              {badge}
                            </div>
                          </div>

                          {/* Arrow */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-muted-foreground flex-shrink-0"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
