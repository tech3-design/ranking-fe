"use client";

import { motion } from "framer-motion";

interface PlatformBarChartProps {
  google: number;
  reddit: number;
  medium: number;
  web?: number;
}

const PLATFORM_COLORS: Record<string, string> = {
  Google: "#E04D00",
  Reddit: "var(--foreground)",
  Medium: "#A39888",
  "Web Mentions": "#C4BAA8",
};

export function PlatformBarChart({ google, reddit, medium, web }: PlatformBarChartProps) {
  const platforms = [
    { name: "Google", score: google, weight: "40%" },
    { name: "Reddit", score: reddit, weight: "20%" },
    { name: "Medium", score: medium, weight: "10%" },
    { name: "Web Mentions", score: web ?? 0, weight: "30%" },
  ];

  return (
    <div className="bg-card rounded-2xl p-5 border border-border">
      <p className="text-sm font-semibold text-foreground mb-4">Platform Comparison</p>
      <div className="space-y-4">
        {platforms.map((p, i) => (
          <div key={p.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                {p.name}{" "}
                <span className="text-muted-foreground text-xs">({p.weight})</span>
              </span>
              <span className="font-mono font-bold text-foreground">{Math.round(p.score)}</span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: PLATFORM_COLORS[p.name] || "#E04D00" }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, p.score)}%` }}
                transition={{ duration: 0.8, delay: i * 0.15, type: "spring", stiffness: 50 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
