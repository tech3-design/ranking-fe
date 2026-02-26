"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContentDetailsPanelProps {
  details: Record<string, unknown>;
  score: number;
}

const STRUCTURE_LABELS: Record<string, string> = {
  h1_singular: "Single H1 tag",
  heading_hierarchy: "Proper heading hierarchy",
  faq_section: "FAQ section present",
  lists_present: "Lists (ul/ol) found",
  list_count: "Number of lists",
  tables_present: "Tables found",
  answer_first_format: "Answer-first format",
  internal_link_count: "Internal links",
};

const GEO_LABELS: Record<string, string> = {
  citation_count: "Citations & references",
  statistic_count: "Statistics & data points",
  quote_count: "Expert quotes",
  authority_signals: "Authoritative tone signals",
  hedging_signals: "Hedging/uncertain language",
  fk_grade: "Flesch-Kincaid grade",
  flesch_ease: "Flesch reading ease",
  technical_term_count: "Technical terms",
  acronym_definitions: "Defined acronyms",
  vocabulary_ttr: "Vocabulary diversity (TTR)",
  unique_word_count: "Unique words",
  word_count: "Total word count",
  avg_paragraph_words: "Avg paragraph words",
  paragraph_count: "Paragraph count",
  transition_word_count: "Transition words",
  keyword_stuffing_detected: "Keyword stuffing",
  top_bigram: "Most repeated phrase",
};

const EFFECTIVENESS: Record<string, string> = {
  citation_count: "+40% visibility",
  statistic_count: "+37% visibility",
  quote_count: "+30% visibility",
  authority_signals: "+25% visibility",
  fk_grade: "+20% visibility",
  technical_term_count: "+18% visibility",
  vocabulary_ttr: "+15% visibility",
  word_count: "+15-30% visibility",
  keyword_stuffing_detected: "-10% penalty",
};

function renderValue(key: string, value: unknown) {
  if (typeof value === "boolean") {
    return (
      <span className={value ? "text-green-500" : "text-red-500"}>
        {value ? "Pass" : "Fail"}
      </span>
    );
  }
  if (key === "keyword_stuffing_detected") {
    if (value === true) return <span className="text-red-500 font-semibold">Detected!</span>;
    if (value === "mild") return <span className="text-yellow-500">Mild</span>;
    return <span className="text-green-500">None</span>;
  }
  return <span>{String(value ?? "—")}</span>;
}

export function ContentDetailsPanel({ details, score }: ContentDetailsPanelProps) {
  const checks = (details?.checks ?? {}) as Record<string, unknown>;
  const structure = (checks.structure ?? {}) as Record<string, unknown>;
  const geoQuality = (checks.geo_quality ?? {}) as Record<string, unknown>;
  const structureScore = checks.structure_score;
  const geoScore = checks.geo_quality_score;

  // Fallback for old data format (pre-research rewrite)
  const isNewFormat = !!checks.structure;

  return (
    <Card className="border-border/60 bg-card/65 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>Content &amp; GEO Quality</span>
          <span className="font-mono">{Math.round(score)}/100</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isNewFormat ? (
          <>
            {/* Structure Section */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex justify-between">
                <span>Structure Signals</span>
                <span className="font-mono text-muted-foreground">{String(structureScore ?? "—")}/35</span>
              </h4>
              <div className="space-y-1.5">
                {Object.entries(structure)
                  .filter(([k]) => !k.startsWith("_"))
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {STRUCTURE_LABELS[key] || key.replace(/_/g, " ")}
                      </span>
                      <span className="font-mono text-sm">
                        {renderValue(key, value)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* GEO Quality Section */}
            <div className="border-t pt-3">
              <h4 className="text-sm font-semibold mb-1 flex justify-between">
                <span>GEO Content Quality</span>
                <span className="font-mono text-muted-foreground">{String(geoScore ?? "—")}/65</span>
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Based on Princeton GEO research (9 optimization methods)
              </p>
              <div className="space-y-1.5">
                {Object.entries(geoQuality)
                  .filter(([k]) => !k.startsWith("_"))
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {GEO_LABELS[key] || key.replace(/_/g, " ")}
                        {EFFECTIVENESS[key] && (
                          <span className="text-xs ml-1 text-teal-400">({EFFECTIVENESS[key]})</span>
                        )}
                      </span>
                      <span className="font-mono text-sm">
                        {renderValue(key, value)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          /* Fallback for old data */
          <div className="space-y-2">
            {Object.entries(checks).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="font-mono text-sm">
                  {renderValue(key, value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
