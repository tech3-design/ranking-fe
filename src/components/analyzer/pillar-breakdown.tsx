"use client";

import type { PageScore } from "@/lib/api/analyzer";

interface PillarBreakdownProps {
  pageScore: PageScore;
}

const PILLARS = [
  { key: "content_score", label: "Content", color: "#6c5ce7", weight: "10%" },
  { key: "schema_score", label: "Schema", color: "#00b894", weight: "10%" },
  { key: "eeat_score", label: "E-E-A-T", color: "#fdcb6e", weight: "22%" },
  { key: "technical_score", label: "Technical", color: "#0984e3", weight: "20%" },
  { key: "entity_score", label: "Entity", color: "#e17055", weight: "20%" },
  { key: "ai_visibility_score", label: "AI Visibility", color: "#a29bfe", weight: "18%" },
] as const;

export function PillarBreakdown({ pageScore }: PillarBreakdownProps) {
  const center = 150;
  const radius = 100;
  const angleStep = (2 * Math.PI) / PILLARS.length;
  const startAngle = -Math.PI / 2;

  // Compute polygon points for scores
  const points = PILLARS.map((pillar, i) => {
    const score = (pageScore[pillar.key] as number) / 100;
    const angle = startAngle + i * angleStep;
    const x = center + radius * score * Math.cos(angle);
    const y = center + radius * score * Math.sin(angle);
    return { x, y };
  });

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Grid lines
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={300} height={300} viewBox="0 0 300 300">
        {/* Grid */}
        {gridLevels.map((level) => {
          const gridPoints = PILLARS.map((_, i) => {
            const angle = startAngle + i * angleStep;
            const x = center + radius * level * Math.cos(angle);
            const y = center + radius * level * Math.sin(angle);
            return `${x},${y}`;
          }).join(" ");
          return (
            <polygon
              key={level}
              points={gridPoints}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Axis lines */}
        {PILLARS.map((_, i) => {
          const angle = startAngle + i * angleStep;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="hsl(var(--muted))"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Score polygon */}
        <polygon
          points={polygonPoints}
          fill="hsl(var(--primary) / 0.2)"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />

        {/* Score dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={PILLARS[i].color} />
        ))}

        {/* Labels */}
        {PILLARS.map((pillar, i) => {
          const angle = startAngle + i * angleStep;
          const labelRadius = radius + 25;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          return (
            <text
              key={pillar.key}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="currentColor"
              fontSize="11"
              fontWeight="500"
            >
              {pillar.label}
            </text>
          );
        })}
      </svg>

      {/* Score list with weights */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
        {PILLARS.map((pillar) => (
          <div key={pillar.key} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: pillar.color }}
            />
            <span className="text-xs text-muted-foreground">{pillar.label}</span>
            <span className="text-[10px] text-muted-foreground/60">{pillar.weight}</span>
            <span className="text-xs font-mono ml-auto">
              {Math.round(pageScore[pillar.key] as number)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
