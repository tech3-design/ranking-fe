"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AIProbe } from "@/lib/api/analyzer";

interface AIVisibilityPanelProps {
  probes: AIProbe[];
}

export function AIVisibilityPanel({ probes }: AIVisibilityPanelProps) {
  if (!probes.length) return null;

  const mentionCount = probes.filter((p) => p.brand_mentioned).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Visibility Probes</span>
          <span className="text-sm font-normal text-muted-foreground">
            {mentionCount}/{probes.length} mentions
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {probes.map((probe) => (
          <div
            key={probe.id}
            className={`rounded-lg border p-3 ${
              probe.brand_mentioned
                ? "border-green-500/30 bg-green-500/5"
                : "border-red-500/30 bg-red-500/5"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{probe.prompt_used}</p>
              <span
                className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                  probe.brand_mentioned
                    ? "bg-green-500/20 text-green-500"
                    : "bg-red-500/20 text-red-500"
                }`}
              >
                {probe.brand_mentioned ? "Mentioned" : "Not Found"}
              </span>
            </div>
            {probe.llm_response && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                {probe.llm_response.slice(0, 300)}
                {probe.llm_response.length > 300 ? "..." : ""}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
