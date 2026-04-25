"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface SparklesProps {
  count?: number;
  durationSec?: number;
  color?: string;
  className?: string;
}

/**
 * Sparkles — overlay that emits twinkling stars over its parent.
 * Parent must have position: relative.
 */
export function Sparkles({
  count = 14,
  durationSec = 6,
  color = "#f4a93d",
  className,
}: SparklesProps) {
  const sparkles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 90 + 5,
        left: Math.random() * 90 + 5,
        size: 6 + Math.random() * 10,
        delay: Math.random() * 1.5,
        rotate: Math.random() * 360,
      })),
    [count],
  );

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      style={{ animation: `sparkle-fade ${durationSec}s ease-out forwards` }}
    >
      <style>{`
        @keyframes sparkle-fade {
          0%, 70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
      {sparkles.map((s) => (
        <motion.svg
          key={s.id}
          viewBox="0 0 24 24"
          width={s.size}
          height={s.size}
          style={{
            position: "absolute",
            top: `${s.top}%`,
            left: `${s.left}%`,
            transform: `translate(-50%, -50%) rotate(${s.rotate}deg)`,
            color,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1.4,
            delay: s.delay,
            repeat: Math.floor(durationSec / 2),
            repeatDelay: 0.6,
            ease: "easeInOut",
          }}
        >
          <path
            d="M12 0 L13.5 9 L24 12 L13.5 15 L12 24 L10.5 15 L0 12 L10.5 9 Z"
            fill="currentColor"
          />
        </motion.svg>
      ))}
    </div>
  );
}
