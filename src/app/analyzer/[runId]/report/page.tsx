"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getRunDetail, type AnalysisRunDetail } from "@/lib/api/analyzer";
import { ReportHeader } from "@/components/analyzer/report-header";
import { ScoreGauge } from "@/components/analyzer/score-gauge";
import { PillarBreakdown } from "@/components/analyzer/pillar-breakdown";

export default function ReportPage() {
  const params = useParams();
  const runId = Number(params.runId);
  const [results, setResults] = useState<AnalysisRunDetail | null>(null);

  useEffect(() => {
    if (!runId) return;
    getRunDetail(runId).then(setResults).catch(() => {});
  }, [runId]);

  if (!results) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading report...</p>
      </div>
    );
  }

  const mainPage = results.page_scores.find((p) => p.url === results.url) || results.page_scores[0];

  return (
    <div className="max-w-4xl mx-auto p-8 print:p-4">
      <ReportHeader run={results} />

      {/* Composite Score */}
      <div className="flex justify-center my-8">
        <ScoreGauge score={results.composite_score ?? 0} size={200} />
      </div>

      {/* Pillar Breakdown */}
      {mainPage && (
        <div className="my-8">
          <h2 className="text-xl font-bold mb-4">Pillar Breakdown</h2>
          {/* <div className="flex justify-center">
            <PillarBreakdown pageScore={mainPage} />
          </div> */}
        </div>
      )}

      {/* Pillar Scores Table */}
      {mainPage && (
        <div className="my-8">
          <h2 className="text-xl font-bold mb-4">Scores</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Pillar</th>
                <th className="text-right py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="py-2">Content Structure</td><td className="text-right font-mono">{Math.round(mainPage.content_score)}</td></tr>
              <tr className="border-b"><td className="py-2">Schema Markup</td><td className="text-right font-mono">{Math.round(mainPage.schema_score)}</td></tr>
              <tr className="border-b"><td className="py-2">E-E-A-T Signals</td><td className="text-right font-mono">{Math.round(mainPage.eeat_score)}</td></tr>
              <tr className="border-b"><td className="py-2">Technical GEO</td><td className="text-right font-mono">{Math.round(mainPage.technical_score)}</td></tr>
              <tr className="border-b"><td className="py-2">Entity Authority</td><td className="text-right font-mono">{Math.round(mainPage.entity_score)}</td></tr>
              <tr className="border-b"><td className="py-2">AI Visibility</td><td className="text-right font-mono">{Math.round(mainPage.ai_visibility_score)}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Recommendations */}
      {results.recommendations.length > 0 && (
        <div className="my-8">
          <h2 className="text-xl font-bold mb-4">Recommendations</h2>
          <div className="space-y-3">
            {results.recommendations.map((rec) => (
              <div key={rec.id} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase px-1.5 py-0.5 rounded bg-muted">
                    {rec.priority}
                  </span>
                  <span className="font-medium text-sm">{rec.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{rec.description}</p>
                <p className="text-xs mt-1 italic">{rec.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitors */}
      {results.competitors.length > 0 && (
        <div className="my-8">
          <h2 className="text-xl font-bold mb-4">Competitor Comparison</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Competitor</th>
                <th className="text-left py-2">URL</th>
                <th className="text-right py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {results.competitors.map((comp) => (
                <tr key={comp.id} className="border-b">
                  <td className="py-2">{comp.name}{!comp.scored ? " (Low confidence)" : ""}</td>
                  <td className="py-2 text-muted-foreground">{comp.url}</td>
                  <td className="text-right font-mono">
                    {comp.composite_score != null ? Math.round(comp.composite_score) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-4 border-t text-center text-xs text-muted-foreground">
        <p>Generated by GEO Analyzer — Signalor.ai</p>
      </div>
    </div>
  );
}
