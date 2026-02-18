"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Recommendation } from "@/lib/api/analyzer";

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  low: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const PILLAR_LABELS: Record<string, string> = {
  content: "Content",
  schema: "Schema",
  eeat: "E-E-A-T",
  technical: "Technical",
  entity: "Entity",
  ai_visibility: "AI Visibility",
};

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!recommendations.length) return null;

  // Group by priority
  const grouped = recommendations.reduce(
    (acc, rec) => {
      const priority = rec.priority;
      if (!acc[priority]) acc[priority] = [];
      acc[priority].push(rec);
      return acc;
    },
    {} as Record<string, Recommendation[]>,
  );

  const priorityOrder = ["critical", "high", "medium", "low"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recommendations</span>
          <span className="text-sm font-normal text-muted-foreground">
            {recommendations.length} items
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {priorityOrder.map((priority) => {
          const recs = grouped[priority];
          if (!recs?.length) return null;

          return (
            <div key={priority}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {priority} Priority ({recs.length})
              </h4>
              <div className="space-y-2">
                {recs.map((rec) => (
                  <div
                    key={rec.id}
                    className={`rounded-lg border p-3 cursor-pointer transition-colors ${PRIORITY_STYLES[rec.priority]}`}
                    onClick={() =>
                      setExpandedId(expandedId === rec.id ? null : rec.id)
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-background/50">
                            {PILLAR_LABELS[rec.pillar] || rec.pillar}
                          </span>
                          <span className="text-sm font-medium">
                            {rec.title}
                          </span>
                        </div>
                        <p className="text-xs mt-1 opacity-80">
                          {rec.description}
                        </p>
                      </div>
                      <span className="text-xs ml-2">
                        {expandedId === rec.id ? "−" : "+"}
                      </span>
                    </div>

                    {expandedId === rec.id && (
                      <div className="mt-3 pt-3 border-t border-current/10 space-y-2">
                        <div>
                          <p className="text-xs font-semibold">How to fix:</p>
                          <p className="text-xs mt-1 whitespace-pre-wrap">
                            {rec.action}
                          </p>
                        </div>
                        {rec.impact_estimate && (
                          <p className="text-xs italic opacity-70">
                            {rec.impact_estimate}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
