"use client";

import { useRef, type ReactNode } from "react";
import { motion, useAnimationFrame } from "framer-motion";

interface MovingBorderProps {
  children: ReactNode;
  duration?: number;
  className?: string;
}

export function MovingBorder({
  children,
  duration = 3000,
  className = "",
}: MovingBorderProps) {
  const pathRef = useRef<SVGRectElement>(null);
  const progressRef = useRef(0);
  const circleRef = useRef<SVGCircleElement>(null);

  useAnimationFrame((time) => {
    if (!pathRef.current || !circleRef.current) return;
    progressRef.current = (time % duration) / duration;
    const length = pathRef.current.getTotalLength();
    const point = pathRef.current.getPointAtLength(progressRef.current * length);
    circleRef.current.setAttribute("cx", String(point.x));
    circleRef.current.setAttribute("cy", String(point.y));
  });

  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <rect
          ref={pathRef}
          x="0.5"
          y="0.5"
          width="99"
          height="99"
          rx="8"
          fill="none"
          stroke="none"
        />
        <circle
          ref={circleRef}
          r="5"
          fill="url(#moving-border-gradient)"
          filter="url(#moving-border-blur)"
        />
        <defs>
          <radialGradient id="moving-border-gradient">
            <stop offset="0%" stopColor="oklch(0.7 0.2 260)" />
            <stop offset="100%" stopColor="oklch(0.7 0.2 260)" stopOpacity="0" />
          </radialGradient>
          <filter id="moving-border-blur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
      </svg>
      {children}
    </div>
  );
}
