"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

function getScoreColor(score: number): string {
  if (score >= 80) return "var(--brand-success)";
  if (score >= 60) return "var(--brand-warning)";
  if (score >= 40) return "var(--brand-danger)";
  return "var(--brand-danger)";
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
  const color = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const targetOffset = circumference - (score / 100) * circumference * 0.75;
  const center = size / 2;

  return (
    <div className="score-gauge">
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.75}`}>
        {/* Background arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--neutral-200)"
          strokeWidth="10"
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
          strokeWidth="10"
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
          y={center - 5}
          textAnchor="middle"
          fill="currentColor"
          className="score-gauge__score"
          fontSize="36"
          fontWeight="bold"
        >
          <AnimatedNumber value={Math.round(score)} />
        </text>
        <text
          x={center}
          y={center + 20}
          textAnchor="middle"
          fill={color}
          fontSize="14"
          fontWeight="500"
        >
          {scoreLabel}
        </text>
      </svg>
      {label && (
        <p className="score-gauge__label">{label}</p>
      )}
    </div>
  );
}
