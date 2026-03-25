"use client";

import { useEffect, useState, useRef } from "react";
import { useAnalyzerStore } from "@/lib/stores/analyzer-store";
import { Globe, Search, Brain, BarChart3, CheckCircle2, XCircle } from "lucide-react";
import { fireConfetti } from "@/lib/confetti";

const STEPS = [
  { key: "pending", label: "Queuing analysis", icon: Globe },
  { key: "crawling", label: "Crawling your website", icon: Search },
  { key: "analyzing", label: "AI analyzing content", icon: Brain },
  { key: "scoring", label: "Computing GEO scores", icon: BarChart3 },
  { key: "complete", label: "Analysis complete!", icon: CheckCircle2 },
];

const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  crawling: 1,
  analyzing: 2,
  scoring: 3,
  complete: 4,
  failed: -1,
};

// Animated dots component
function PulsingDots() {
  return (
    <span className="inline-flex gap-[3px] ml-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-[#F95C4B] animate-[signalor-bounce_1.4s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  );
}

export function AnalysisProgress() {
  const { status, progress, error, currentRunId, startPolling, isPolling } =
    useAnalyzerStore();
  const [elapsed, setElapsed] = useState(0);

  const prevStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (currentRunId && !isPolling && status !== "complete" && status !== "failed") {
      startPolling();
    }
  }, [currentRunId, isPolling, status, startPolling]);

  // Fire confetti on completion
  useEffect(() => {
    const prev = prevStatusRef.current;
    if (prev && prev !== "complete" && status === "complete") {
      fireConfetti();
    }
    prevStatusRef.current = status;
  }, [status]);

  // Timer
  useEffect(() => {
    if (status === "complete" || status === "failed") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const currentIdx = STATUS_INDEX[status] ?? 0;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="rounded-2xl bg-white p-6 md:p-8" style={{ border: "1px solid #E4DED2" }}>
        {/* Header animation */}
        <div className="flex flex-col items-center mb-8">
          {/* Orbital loader */}
          <div className="relative w-20 h-20 mb-4">
            <svg width={80} height={80} viewBox="0 0 80 80" className="overflow-visible">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#E4DED2" strokeWidth="3" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke="#F95C4B" strokeWidth="3" strokeLinecap="round"
                strokeDasharray="50 150"
                className="animate-[signalor-spin_1.2s_linear_infinite]"
                style={{ transformOrigin: "40px 40px" }}
              />
              <circle
                cx="40" cy="40" r="24" fill="none"
                stroke="#E4DED2" strokeWidth="2"
              />
              <circle
                cx="40" cy="40" r="24" fill="none"
                stroke="#F95C4B" strokeWidth="2" strokeLinecap="round"
                strokeDasharray="30 120" opacity="0.5"
                className="animate-[signalor-spin-reverse_1.8s_linear_infinite]"
                style={{ transformOrigin: "40px 40px" }}
              />
              {/* Center percentage */}
              <text
                x="40" y="42" textAnchor="middle" dominantBaseline="middle"
                fill="#000000" fontSize="16" fontWeight="700"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {progress}%
              </text>
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-[#000000]">Analyzing your site</h2>
          <p className="text-xs text-[#000000]/40 mt-1">
            {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`} elapsed
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: "#E4DED2" }}>
            <div
              className="h-full rounded-full transition-all duration-700 relative"
              style={{ width: `${progress}%`, backgroundColor: "#F95C4B" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer" />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-1">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isDone = currentIdx > i;
            const isCurrent = currentIdx === i && status !== "failed";
            const isPending = currentIdx < i;

            return (
              <div
                key={step.key}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                style={{
                  backgroundColor: isCurrent ? "#F95C4B08" : "transparent",
                }}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                  style={{
                    backgroundColor: isDone ? "#F95C4B" : isCurrent ? "#F95C4B20" : "#F6F4F1",
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <Icon
                      className="w-4 h-4"
                      style={{ color: isCurrent ? "#F95C4B" : "#00000030" }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className="text-sm font-medium flex items-center"
                  style={{
                    color: isDone ? "#000000" : isCurrent ? "#F95C4B" : "#00000030",
                  }}
                >
                  {step.label}
                  {isCurrent && <PulsingDots />}
                </span>
              </div>
            );
          })}
        </div>

        {/* Error */}
        {(status === "failed" || error) && (
          <div className="mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#F95C4B10", color: "#F95C4B" }}>
            <XCircle className="w-4 h-4 shrink-0" />
            {error || "Analysis failed. Please try again."}
          </div>
        )}
      </div>
    </div>
  );
}
