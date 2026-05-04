"use client";

import { motion } from "framer-motion";

/**
 * AnalyzingRadar — premium loader for long-running analysis states.
 *
 * Pure SVG + framer-motion (no external deps). Layers:
 *   1. Soft radial glow (ambient)
 *   2. Three concentric orbit rings
 *   3. Orbit dots at different speeds + directions
 *   4. Rotating conic-gradient sweep (radar arm)
 *   5. Pulsing central core with inner highlight
 */
interface AnalyzingRadarProps {
  size?: number;
  color?: string;
  className?: string;
}

export function AnalyzingRadar({
  size = 180,
  color = "#E04D00",
  className,
}: AnalyzingRadarProps) {
  const halo = `${color}22`; // 13% alpha
  const ring = `${color}33`; // 20% alpha
  const dim = `${color}14`; // 8% alpha

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
      role="status"
      aria-label="Analyzing"
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `radial-gradient(circle at center, ${halo} 0%, transparent 65%)`,
          filter: "blur(4px)",
        }}
      />

      {/* Radar sweep — conic gradient rotating */}
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `conic-gradient(from 0deg, transparent 0%, ${halo} 30%, ${color} 50%, transparent 52%)`,
          maskImage: "radial-gradient(circle, black 42%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle, black 42%, transparent 70%)",
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 3.2,
          ease: "linear",
          repeat: Infinity,
        }}
      />

      {/* Concentric rings */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
        <circle cx="50" cy="50" r="46" fill="none" stroke={dim} strokeWidth="0.4" />
        <circle cx="50" cy="50" r="34" fill="none" stroke={ring} strokeWidth="0.5" />
      </svg>

      {/* Orbit dots — ring 1 (slow, counter-clockwise) */}
      <Orbit
        radius={size * 0.46}
        count={3}
        duration={7}
        direction={1}
        dotSize={4}
        color={color}
      />
      {/* Ring 2 (fast, clockwise) */}
      <Orbit
        radius={size * 0.34}
        count={4}
        duration={5}
        direction={-1}
        dotSize={3}
        color={color}
        opacity={0.8}
      />
    </div>
  );
}

function Orbit({
  radius,
  count,
  duration,
  direction,
  dotSize,
  color,
  opacity = 1,
}: {
  radius: number;
  count: number;
  duration: number;
  direction: 1 | -1;
  dotSize: number;
  color: string;
  opacity?: number;
}) {
  return (
    <motion.div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
      animate={{ rotate: 360 * direction }}
      transition={{
        duration,
        ease: "linear",
        repeat: Infinity,
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;
        return (
          <motion.span
            key={i}
            style={{
              position: "absolute",
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              background: color,
              opacity,
              transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`,
              boxShadow: `0 0 ${dotSize * 2}px ${color}80`,
            }}
            animate={{
              opacity: [opacity * 0.5, opacity, opacity * 0.5],
            }}
            transition={{
              duration: 1.6,
              ease: "easeInOut",
              repeat: Infinity,
              delay: (i / count) * 1.6,
            }}
          />
        );
      })}
    </motion.div>
  );
}
