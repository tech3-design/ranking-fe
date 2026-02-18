"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SchemaDetailsPanelProps {
  details: Record<string, unknown>;
  score: number;
}

export function SchemaDetailsPanel({ details, score }: SchemaDetailsPanelProps) {
  const checks = (details?.checks ?? {}) as Record<string, unknown>;
  const typesFound = (details?.types_found ?? []) as string[];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>Schema Markup</span>
          <span className="font-mono">{Math.round(score)}/100</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {typesFound.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Schema types found:</p>
            <div className="flex flex-wrap gap-1.5">
              {typesFound.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {Object.entries(checks)
            .filter(([, value]) => value !== null && typeof value !== "object")
            .map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {key.replace(/_/g, " ").replace(/^has /, "")}
              </span>
              <span className={`font-mono text-sm ${
                typeof value === "boolean"
                  ? value ? "text-green-500" : "text-red-500"
                  : ""
              }`}>
                {typeof value === "boolean"
                  ? value ? "Pass" : "Fail"
                  : String(value ?? "—")}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
