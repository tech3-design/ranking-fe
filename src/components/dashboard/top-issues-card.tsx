"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Recommendation } from "@/lib/api/analyzer";

export function TopIssuesCard({
  slug,
  recommendations,
}: {
  slug: string;
  recommendations: Recommendation[];
}) {
  const topIssues = useMemo(
    () =>
      [...recommendations]
        .filter((r) => r.priority === "critical" || r.priority === "high")
        .slice(0, 3),
    [recommendations],
  );

  return (
    <div className="w-full rounded-xl border border-neutral-100 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)]">
      <div className="mb-2 flex items-center justify-between border-b border-neutral-100 pb-1.5">
        <p className="text-sm font-semibold text-foreground">Top Issues</p>
        <Link
          href={`/dashboard/${slug}/recommendations`}
          className="text-[9px] font-semibold text-primary hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="rounded-lg border border-neutral-100 bg-muted/10 p-2">
        {topIssues.length > 0 ? (
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
            {topIssues.map((issue) => (
              <li key={issue.id} className="rounded-md border border-border/70 bg-white px-1.5 py-1">
                <p className="line-clamp-2 text-[10px] font-medium leading-tight text-foreground">
                  {issue.title}
                </p>
                <p className="mt-0.5 text-[8px] uppercase tracking-wide text-muted-foreground">
                  {issue.priority}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-2 text-center text-[10px] text-muted-foreground">No critical issues</p>
        )}
      </div>
    </div>
  );
}
