"use client";

import { motion } from "framer-motion";

interface PlatformBarChartProps {
  google: number;
  reddit: number;
  medium: number;
  web?: number;
}

const PLATFORM_COLORS: Record<string, string> = {
  Google: "#F95C4B",
  Reddit: "#000000",
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
    <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E4DED240" }}>
      <p className="text-sm font-semibold text-[#000000] mb-4">Platform Comparison</p>
      <div className="space-y-4">
        {platforms.map((p, i) => (
          <div key={p.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[#000000]">
                {p.name}{" "}
                <span className="text-[#000000]/40 text-xs">({p.weight})</span>
              </span>
              <span className="font-mono font-bold text-[#000000]">{Math.round(p.score)}</span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "#E4DED260" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: PLATFORM_COLORS[p.name] || "#F95C4B" }}
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
