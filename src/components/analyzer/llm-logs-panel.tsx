"use client";

import { useState } from "react";
import type { LLMLog } from "@/lib/api/analyzer";

interface LLMLogsPanelProps {
  logs: LLMLog[];
}

function RenderedMarkdown({ text }: { text: string }) {
  // Strip markdown code fences if present
  let cleaned = text.replace(/^```[\w]*\n?/gm, "").replace(/```$/gm, "").trim();

  const lines = cleaned.split("\n");

  return (
    <div className="text-sm leading-relaxed space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1.5" />;

        // Numbered list item
        const numberedMatch = trimmed.match(/^(\d+)[.)]\s*(.+)/);
        if (numberedMatch) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-muted-foreground shrink-0 font-mono text-xs mt-0.5">
                {numberedMatch[1]}.
              </span>
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(numberedMatch[2]) }} />
            </div>
          );
        }

        // Bullet list item
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-muted-foreground shrink-0 mt-1.5">&#8226;</span>
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed.slice(2)) }} />
            </div>
          );
        }

        // Heading-like lines
        if (trimmed.startsWith("## ")) {
          return (
            <p key={i} className="font-semibold text-sm mt-2">
              {trimmed.replace(/^##\s*/, "")}
            </p>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <p key={i} className="font-semibold text-sm mt-2">
              {trimmed.replace(/^#\s*/, "")}
            </p>
          );
        }

        // Regular paragraph
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }} />
        );
      })}
    </div>
  );
}

function inlineFormat(text: string): string {
  let result = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  result = result.replace(
    /`(.+?)`/g,
    '<code class="px-1 py-0.5 rounded bg-muted text-xs font-mono">$1</code>',
  );
  return result;
}

function ProviderBadge({ model }: { model: string }) {
  const colorMap: Record<string, string> = {
    "GPT-4o Mini": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    "Claude 3.5 Haiku": "bg-orange-500/15 text-orange-400 border-orange-500/30",
    "Gemini 2.0 Flash": "bg-teal-500/15 text-teal-400 border-teal-500/30",
    "Gemini 2.0 Flash (Direct)": "bg-teal-500/15 text-teal-400 border-teal-500/30",
  };
  const colors = colorMap[model] || "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${colors}`}
    >
      {model}
    </span>
  );
}

// Internal pipeline purposes that return JSON — users don't need to see these
const INTERNAL_PURPOSES = new Set([
  "Knowledge Panel Check",
  "AI Probe Generation",
  "Third-Party Mentions",
  "E-E-A-T Analysis",
  "Competitor Discovery",
]);

export function LLMLogsPanel({ logs }: LLMLogsPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showInternal, setShowInternal] = useState(false);

  if (!logs || logs.length === 0) {
    return null;
  }

  // Split into probe logs (user-facing) and internal logs
  const probeLogs = logs
    .map((log, idx) => ({ ...log, _idx: idx }))
    .filter((l) => !INTERNAL_PURPOSES.has(l.purpose));
  const internalLogs = logs
    .map((log, idx) => ({ ...log, _idx: idx }))
    .filter((l) => INTERNAL_PURPOSES.has(l.purpose));

  const successCount = probeLogs.filter((l) => l.status === "success").length;
  const totalDuration = probeLogs.reduce((sum, l) => sum + l.duration_ms, 0);

  // Group probe logs by the prompt question
  const grouped = probeLogs.reduce(
    (acc, log) => {
      const key = log.prompt.slice(0, 120);
      if (!acc[key]) acc[key] = { prompt: log.prompt, responses: [] };
      acc[key].responses.push(log);
      return acc;
    },
    {} as Record<string, { prompt: string; responses: (LLMLog & { _idx: number })[] }>,
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Search Results</h3>
        <div className="flex gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-muted">
            {Object.keys(grouped).length} probes
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-muted">
            {probeLogs.length} responses
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-400">
            {successCount} success
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-muted">
            {(totalDuration / 1000).toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Probe results — grouped by question */}
      <div className="space-y-4">
        {Object.values(grouped).map((group, groupIdx) => (
          <div key={groupIdx} className="rounded-lg border bg-card overflow-hidden">
            {/* Question / Prompt */}
            <div className="px-4 py-3 border-b bg-teal-500/5">
              <div className="flex items-center gap-2 mb-1.5">
                <svg
                  className="w-4 h-4 text-teal-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                  Prompt Sent
                </span>
              </div>
              <p className="text-sm font-medium">{group.prompt}</p>
            </div>

            {/* Responses from each provider */}
            <div className="divide-y divide-border/50">
              {group.responses.map((log) => {
                const isExpanded = expandedIndex === log._idx;
                return (
                  <div key={log._idx}>
                    <button
                      className="w-full flex items-center justify-between text-left px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedIndex(isExpanded ? null : log._idx)
                      }
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                            log.status === "success"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        <ProviderBadge model={log.model} />
                        <span className="text-xs text-muted-foreground truncate">
                          {log.response.slice(0, 100)}
                          {log.response.length > 100 ? "..." : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="text-xs font-mono text-muted-foreground">
                          {log.duration_ms >= 1000
                            ? `${(log.duration_ms / 1000).toFixed(1)}s`
                            : `${log.duration_ms}ms`}
                        </span>
                        <svg
                          className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-4 h-4 text-green-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-xs font-semibold uppercase tracking-wider text-green-400">
                            Response from {log.model}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {log.duration_ms >= 1000
                              ? `${(log.duration_ms / 1000).toFixed(1)}s`
                              : `${log.duration_ms}ms`}
                          </span>
                        </div>
                        <div
                          className={`rounded-lg p-4 max-h-96 overflow-y-auto ${
                            log.status === "success"
                              ? "bg-green-500/5 border border-green-500/20"
                              : "bg-red-500/5 border border-red-500/20"
                          }`}
                        >
                          {log.status === "success" ? (
                            <RenderedMarkdown
                              text={log.response || "(empty response)"}
                            />
                          ) : (
                            <p className="text-sm text-red-400">
                              {log.response || "(empty response)"}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Internal pipeline logs — collapsed by default */}
      {internalLogs.length > 0 && (
        <div>
          <button
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            onClick={() => setShowInternal(!showInternal)}
          >
            <svg
              className={`w-3 h-3 transition-transform ${showInternal ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            {internalLogs.length} internal pipeline calls
          </button>

          {showInternal && (
            <div className="mt-2 rounded-lg border bg-card overflow-hidden">
              <div className="divide-y divide-border/50">
                {internalLogs.map((log) => (
                  <div
                    key={log._idx}
                    className="px-4 py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                          log.status === "success"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <ProviderBadge model={log.model} />
                      <span className="text-xs text-muted-foreground">
                        {log.purpose}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground shrink-0">
                      {log.duration_ms >= 1000
                        ? `${(log.duration_ms / 1000).toFixed(1)}s`
                        : `${log.duration_ms}ms`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
