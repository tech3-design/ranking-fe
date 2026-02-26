"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EEATDetailsPanelProps {
  details: Record<string, unknown>;
  score: number;
}

const CHECK_LABELS: Record<string, string> = {
  scoring_mode: "Scoring mode",
  structural_score: "Structural signals score",
  content_eeat_score: "Content E-E-A-T score",
  experience_score: "Experience (0-10)",
  expertise_score: "Expertise (0-10)",
  authoritativeness_score: "Authoritativeness (0-10)",
  trustworthiness_score: "Trustworthiness (0-10)",
  assessment: "AI assessment",
  // Structural details
  external_citation_count: "External citation count",
  trust_link_count: "Trust link count",
  source_diversity: "Unique external domains",
  publish_date: "Publish date present",
  updated_date: "Last updated date",
  has_about_page: "About page linked",
  has_contact_page: "Contact page linked",
  has_privacy_policy: "Privacy policy linked",
  has_terms: "Terms page linked",
  // Static fallback details
  author_found: "Author found",
  author_name: "Author name",
  author_bio: "Author bio present",
  experience_signals: "Experience language signals",
  expertise_depth_signals: "Expertise depth signals",
  has_disclosure: "Disclosure/editorial policy",
  has_org_info: "Organization info",
  source_mentions: "Source mentions in text",
};

export function EEATDetailsPanel({ details, score }: EEATDetailsPanelProps) {
  const checks = (details?.checks ?? {}) as Record<string, unknown>;
  const structuralScore = checks.structural_score;
  const contentScore = checks.content_eeat_score;
  const scoringMode = checks.scoring_mode;

  // Flatten: show top-level non-object values + structural sub-object values
  const structural = (checks.structural ?? {}) as Record<string, unknown>;
  const staticAnalysis = (checks.static_analysis ?? {}) as Record<string, unknown>;

  return (
    <Card className="border-border/60 bg-card/65 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>E-E-A-T Signals</span>
          <span className="font-mono">{Math.round(score)}/100</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary scores */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Structural signals</span>
            <span className="font-mono">{String(structuralScore ?? "—")}/40</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Content E-E-A-T</span>
            <span className="font-mono">{String(contentScore ?? "—")}/60</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Scoring mode</span>
            <span className="font-mono text-xs">
              {scoringMode === "gemini" ? "Gemini deep analysis" : "Static fallback"}
            </span>
          </div>
        </div>

        {/* Gemini dimension scores */}
        {scoringMode === "gemini" && (
          <div className="border-t pt-3">
            <h4 className="text-sm font-semibold mb-2">Gemini E-E-A-T Analysis</h4>
            <div className="space-y-1.5">
              {["experience_score", "expertise_score", "authoritativeness_score", "trustworthiness_score"].map((key) => {
                const val = checks[key] as number | undefined;
                const color = val != null ? (val >= 7 ? "text-green-500" : val >= 4 ? "text-yellow-500" : "text-red-500") : "";
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{CHECK_LABELS[key] || key}</span>
                    <span className={`font-mono ${color}`}>{val != null ? val : "—"}</span>
                  </div>
                );
              })}
              {typeof checks.assessment === "string" && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {checks.assessment}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Structural details */}
        {Object.keys(structural).length > 0 && (
          <div className="border-t pt-3">
            <h4 className="text-sm font-semibold mb-2">Structural Signals</h4>
            <div className="space-y-1.5">
              {Object.entries(structural)
                .filter(([k]) => !k.startsWith("_"))
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {CHECK_LABELS[key] || key.replace(/_/g, " ")}
                    </span>
                    <span className={`font-mono text-sm ${
                      typeof value === "boolean" ? (value ? "text-green-500" : "text-red-500") : ""
                    }`}>
                      {typeof value === "boolean" ? (value ? "Pass" : "Fail") : String(value ?? "—")}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Static fallback details */}
        {Object.keys(staticAnalysis).length > 0 && (
          <div className="border-t pt-3">
            <h4 className="text-sm font-semibold mb-2">Content Analysis</h4>
            <div className="space-y-1.5">
              {Object.entries(staticAnalysis)
                .filter(([k]) => !k.startsWith("_"))
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {CHECK_LABELS[key] || key.replace(/_/g, " ")}
                    </span>
                    <span className={`font-mono text-sm ${
                      typeof value === "boolean" ? (value ? "text-green-500" : "text-red-500") : ""
                    }`}>
                      {typeof value === "boolean" ? (value ? "Pass" : "Fail") : String(value ?? "—")}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
