"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

function getScoreStroke(score: number): string {
  if (score >= 80) return "oklch(0.72 0.16 155)";
  if (score >= 60) return "oklch(0.78 0.16 95)";
  if (score >= 40) return "oklch(0.68 0.18 45)";
  return "oklch(0.64 0.2 28)";
}

function getScoreTone(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Work";
  return "Poor";
}

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    spring.set(value);
    const unsubscribe = display.on("change", (v) => setCurrent(v));
    return unsubscribe;
  }, [value, spring, display]);

  return <>{current}</>;
}

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
}

export function ScoreGauge({ score, size = 200, label }: ScoreGaugeProps) {
  const color = getScoreStroke(score);
  const toneClass = getScoreTone(score);
  const scoreLabel = getScoreLabel(score);
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const targetOffset = circumference - (score / 100) * circumference * 0.75;
  const center = size / 2;

  return (
    <div className="mx-auto flex w-full max-w-[360px] flex-col items-center rounded-xl border border-border/60 bg-card/60 p-4">
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.75}`} className="overflow-visible">
        {/* Background arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={circumference * 0.25}
          transform={`rotate(135 ${center} ${center})`}
        />
        {/* Score arc */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          transform={`rotate(135 ${center} ${center})`}
        />
        {/* Score text */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          fill="currentColor"
          className="text-foreground"
          fontSize="36"
          fontWeight="bold"
        >
          <AnimatedNumber value={Math.round(score)} />
        </text>
        <text
          x={center}
          y={center + 18}
          textAnchor="middle"
          fill="currentColor"
          className={toneClass}
          fontSize="14"
          fontWeight="600"
        >
          {scoreLabel}
        </text>
      </svg>

      <div className="mt-1 w-full px-2">
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>0</span>
          <span>Meter</span>
          <span>100</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className={`h-full rounded-full ${toneClass.replace("text-", "bg-")}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, Math.min(100, score))}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </div>
      </div>

      {label && (
        <p className="mt-3 text-center text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  );
}
