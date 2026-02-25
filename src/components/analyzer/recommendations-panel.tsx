"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Recommendation } from "@/lib/api/analyzer";

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  low: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const PRIORITY_BADGE: Record<string, string> = {
  critical: "bg-red-500 text-white",
  high: "bg-yellow-500 text-black",
  medium: "bg-blue-500 text-white",
  low: "bg-gray-500 text-white",
};

const PILLAR_LABELS: Record<string, string> = {
  content: "Content",
  schema: "Schema",
  eeat: "E-E-A-T",
  technical: "Technical",
  entity: "Entity",
  ai_visibility: "AI Visibility",
};

const POINTS_MAP: Record<string, number> = {
  critical: 50,
  high: 30,
  medium: 20,
  low: 10,
  schema: 40,
  technical: 30,
  eeat: 35,
  entity: 45,
  content: 25,
  ai_visibility: 40,
};

function getPointsForRecommendation(rec: Recommendation): number {
  const priorityPoints = POINTS_MAP[rec.priority] || 10;
  const categoryPoints = POINTS_MAP[rec.category] || 10;
  return Math.max(priorityPoints, categoryPoints);
}

const ACTION_ICONS: Record<string, { icon: string; label: string }> = {
  schema: { icon: "{ }", label: "Copy Code" },
  technical: { icon: "\u2699", label: "Copy Config" },
  entity: { icon: "\u21D7", label: "Open Guide" },
  content: { icon: "\u270E", label: "Copy Template" },
  eeat: { icon: "\u2713", label: "Copy Checklist" },
};

function extractCodeBlocks(text: string): { parts: Array<{ type: "text" | "code"; content: string }> } {
  const lines = text.split("\n");
  const parts: Array<{ type: "text" | "code"; content: string }> = [];
  let currentCode: string[] = [];
  let currentText: string[] = [];

  for (const line of lines) {
    const isCode =
      line.trim().startsWith("<") ||
      line.trim().startsWith("{") ||
      line.trim().startsWith("}") ||
      line.trim().startsWith('"@') ||
      line.trim().startsWith("User-agent:") ||
      line.trim().startsWith("Allow:") ||
      line.trim().startsWith("Disallow:");

    if (isCode) {
      if (currentText.length) {
        parts.push({ type: "text", content: currentText.join("\n") });
        currentText = [];
      }
      currentCode.push(line);
    } else {
      if (currentCode.length) {
        parts.push({ type: "code", content: currentCode.join("\n") });
        currentCode = [];
      }
      currentText.push(line);
    }
  }
  if (currentCode.length) parts.push({ type: "code", content: currentCode.join("\n") });
  if (currentText.length) parts.push({ type: "text", content: currentText.join("\n") });

  return { parts };
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="h-7 text-xs gap-1.5 shrink-0">
      {copied ? "Copied!" : label}
    </Button>
  );
}

function ActionSteps({ action, category }: { action: string; category: string }) {
  const { parts } = extractCodeBlocks(action);
  const hasSteps = action.includes("STEP ") || action.includes("Step ");

  if (category === "entity" && (action.includes("reddit") || action.includes("Reddit") || action.includes("Medium") || action.includes("medium"))) {
    return <CommunityGuide action={action} />;
  }

  return (
    <div className="space-y-3">
      {parts.map((part, i) => {
        if (part.type === "code") {
          return (
            <div key={i} className="relative group">
              <pre className="text-xs bg-background/80 rounded-md p-3 overflow-x-auto border border-border/50 font-mono leading-relaxed">
                {part.content}
              </pre>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton text={part.content} label="Copy" />
              </div>
            </div>
          );
        }
        return (
          <div key={i} className="text-xs whitespace-pre-wrap leading-relaxed">
            {formatActionText(part.content, hasSteps)}
          </div>
        );
      })}
    </div>
  );
}

function formatActionText(text: string, hasSteps: boolean) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;

    if (/^STEP \d/i.test(trimmed)) {
      return (
        <div key={i} className="flex items-center gap-2 mt-3 mb-1 first:mt-0">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
            {trimmed.match(/\d+/)?.[0]}
          </span>
          <span className="font-semibold text-foreground">
            {trimmed.replace(/^STEP \d+ — ?/i, "")}
          </span>
        </div>
      );
    }

    if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
      return (
        <div key={i} className="flex gap-2 ml-7 text-muted-foreground">
          <span className="text-primary/60 shrink-0">{"\u2022"}</span>
          <span>{trimmed.replace(/^[•-]\s*/, "")}</span>
        </div>
      );
    }

    if (trimmed.startsWith("PRO TIP")) {
      return (
        <div key={i} className="mt-3 p-2.5 rounded-md bg-primary/5 border border-primary/10">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Pro Tip</span>
          <p className="text-muted-foreground mt-0.5">{trimmed.replace(/^PRO TIP:?\s*/i, "")}</p>
        </div>
      );
    }

    if (trimmed.startsWith("AVOID:") || trimmed.startsWith("- AVOID:") || trimmed.startsWith("BAD:") || trimmed.startsWith("- BAD:")) {
      return (
        <div key={i} className="flex gap-2 ml-7">
          <span className="text-red-400 shrink-0">{"\u2717"}</span>
          <span className="text-red-400/80">{trimmed.replace(/^-?\s*(AVOID|BAD):?\s*/i, "")}</span>
        </div>
      );
    }
    if (trimmed.startsWith("USE:") || trimmed.startsWith("- USE:") || trimmed.startsWith("GOOD:") || trimmed.startsWith("- GOOD:")) {
      return (
        <div key={i} className="flex gap-2 ml-7">
          <span className="text-green-400 shrink-0">{"\u2713"}</span>
          <span className="text-green-400/80">{trimmed.replace(/^-?\s*(USE|GOOD):?\s*/i, "")}</span>
        </div>
      );
    }

    return <p key={i} className="text-muted-foreground">{trimmed}</p>;
  });
}

function CommunityGuide({ action }: { action: string }) {
  const isReddit = action.toLowerCase().includes("reddit");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{isReddit ? "\uD83D\uDCAC" : "\u270D\uFE0F"}</span>
        <span className="text-xs font-semibold text-foreground">
          {isReddit ? "Reddit Posting Playbook" : "Medium Publishing Playbook"}
        </span>
      </div>
      <div className="text-xs whitespace-pre-wrap leading-relaxed">
        {formatActionText(action, true)}
      </div>
    </div>
  );
}

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!recommendations.length) return null;

  const quickWins = recommendations.filter(
    (r) => r.category === "schema" || r.category === "technical"
  );
  const allCodeSnippets = quickWins
    .map((r) => {
      const { parts } = extractCodeBlocks(r.action);
      return parts.filter((p) => p.type === "code").map((p) => p.content);
    })
    .flat()
    .join("\n\n");

  return (
    <Card className="backdrop-blur-xl bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>What Needs to Be Done</span>
          <span className="text-sm font-normal text-muted-foreground">
            {recommendations.length} tasks
          </span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Click each item to see the action steps. Go to Actions tab to track your progress and earn points.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {recommendations.map((rec, index) => {
          const isExpanded = expandedId === rec.id;
          const actionInfo = ACTION_ICONS[rec.category] || ACTION_ICONS.content;
          const { parts } = extractCodeBlocks(rec.action);
          const hasCode = parts.some((p) => p.type === "code");
          const points = getPointsForRecommendation(rec);

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              className={`rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md ${PRIORITY_STYLES[rec.priority]}`}
              onClick={() => setExpandedId(isExpanded ? null : rec.id)}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${PRIORITY_BADGE[rec.priority]}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-background/50 text-muted-foreground">
                      {PILLAR_LABELS[rec.pillar] || rec.pillar}
                    </span>
                    {hasCode && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        Has Code
                      </span>
                    )}
                    <span className="text-sm font-medium truncate">
                      {rec.title}
                    </span>
                  </div>
                  <p className="text-xs mt-1 opacity-80 line-clamp-2">
                    {rec.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-1">
                  {hasCode && !isExpanded && (
                    <CopyButton
                      text={parts.filter((p) => p.type === "code").map((p) => p.content).join("\n")}
                      label={actionInfo.label}
                    />
                  )}
                  <span className="text-xs w-5 text-center">
                    {isExpanded ? "\u2212" : "+"}
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-current/10 ml-9 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">Action Steps:</span>
                        {hasCode && (
                          <CopyButton
                            text={parts.filter((p) => p.type === "code").map((p) => p.content).join("\n")}
                            label={actionInfo.label}
                          />
                        )}
                      </div>

                      <ActionSteps action={rec.action} category={rec.category} />

                      {rec.impact_estimate && (
                        <div className="flex items-center gap-2 mt-2 p-2 rounded bg-background/40 border border-border/30">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0">
                            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                          </svg>
                          <p className="text-xs italic text-muted-foreground">{rec.impact_estimate}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
