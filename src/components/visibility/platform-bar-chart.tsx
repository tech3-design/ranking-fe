"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlatformBarChartProps {
  google: number;
  reddit: number;
  medium: number;
  web?: number;
}

function getBarColor(score: number): string {
  if (score >= 70) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  if (score >= 30) return "bg-orange-500";
  return "bg-red-500";
}

export function PlatformBarChart({ google, reddit, medium, web }: PlatformBarChartProps) {
  const platforms = [
    { name: "Google", score: google, weight: "40%" },
    { name: "Reddit", score: reddit, weight: "20%" },
    { name: "Medium", score: medium, weight: "10%" },
    { name: "Web Mentions", score: web ?? 0, weight: "30%" },
  ];

  return (
    <Card className="backdrop-blur-xl bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Platform Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {platforms.map((p, i) => (
            <div key={p.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {p.name}{" "}
                  <span className="text-muted-foreground text-xs">({p.weight})</span>
                </span>
                <span className="font-mono font-bold">{Math.round(p.score)}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getBarColor(p.score)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, p.score)}%` }}
                  transition={{ duration: 0.8, delay: i * 0.15, type: "spring", stiffness: 50 }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
