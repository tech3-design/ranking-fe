"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRunList, type AnalysisRunList } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";

interface RunHistoryListProps {
  email: string;
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
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground text-center">
            Loading history...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!runs.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Previous Analyses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {runs.map((run) => (
            <div
              key={run.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => router.push(routes.analyzerResults(run.id))}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{run.url}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(run.created_at).toLocaleDateString()} —{" "}
                  {run.run_type === "full_site" ? "Full Site" : "Single Page"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {run.status === "complete" && run.composite_score != null ? (
                  <span className="font-mono text-sm font-bold">
                    {Math.round(run.composite_score)}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground capitalize">
                    {run.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
