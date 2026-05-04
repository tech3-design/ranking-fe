"use client";

import { History } from "lucide-react";

export default function PromptsHistoryPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <History className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">History</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track everything in one place: per-engine visibility, sentiment, citation trend, and
              every prompt check in time order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
