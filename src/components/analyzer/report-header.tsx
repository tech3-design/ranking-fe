"use client";

import type { AnalysisRunDetail } from "@/lib/api/analyzer";

interface ReportHeaderProps {
  run: AnalysisRunDetail;
}

export function ReportHeader({ run }: ReportHeaderProps) {
  return (
    <div className="text-center space-y-2 py-8">
      <h1 className="text-3xl font-bold">GEO Analysis Report</h1>
      <p className="text-lg text-muted-foreground">{run.url}</p>
      <p className="text-sm text-muted-foreground">
        Generated {new Date(run.updated_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        {" — "}
        {run.run_type === "full_site" ? "Full Site Audit" : "Single Page Analysis"}
      </p>
    </div>
  );
}
