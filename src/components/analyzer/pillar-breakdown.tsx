"use client";

import type { PageScore } from "@/lib/api/analyzer";

interface PillarBreakdownProps {
  pageScore: PageScore;
}

const PILLARS = [
  { key: "content_score", label: "Content", color: "oklch(0.72 0.14 186)" },
  { key: "schema_score", label: "Schema", color: "oklch(0.74 0.14 160)" },
  { key: "eeat_score", label: "E-E-A-T", color: "oklch(0.79 0.15 95)" },
  { key: "technical_score", label: "Technical", color: "oklch(0.69 0.12 204)" },
  { key: "entity_score", label: "Entity", color: "oklch(0.68 0.17 48)" },
  { key: "ai_visibility_score", label: "AI Vis", color: "oklch(0.76 0.11 175)" },
] as const;

export function PillarBreakdown({ pageScore }: PillarBreakdownProps) {
  const center = 150;
  const radius = 100;
  const angleStep = (2 * Math.PI) / PILLARS.length;
  const startAngle = -Math.PI / 2;

  const points = PILLARS.map((pillar, i) => {
    const score = (pageScore[pillar.key] as number) / 100;
    const angle = startAngle + i * angleStep;
    const x = center + radius * score * Math.cos(angle);
    const y = center + radius * score * Math.sin(angle);
    return { x, y };
  });
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="w-full max-w-[360px] rounded-xl border border-border/60 bg-card/65 p-4 shadow-lg">
      <svg width={300} height={300} viewBox="0 0 300 300" className="mx-auto">
        {gridLevels.map((level) => {
          const gridPoints = PILLARS.map((_, i) => {
            const angle = startAngle + i * angleStep;
            const x = center + radius * level * Math.cos(angle);
            const y = center + radius * level * Math.sin(angle);
            return `${x},${y}`;
          }).join(" ");
          return (
            <polygon key={level} points={gridPoints} fill="none" stroke="var(--border)" strokeWidth="0.7" />
          );
        })}

        {PILLARS.map((_, i) => {
          const angle = startAngle + i * angleStep;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="var(--border)" strokeWidth="0.7" />;
        })}

        <polygon
          points={polygonPoints}
          fill="oklch(0.68 0.12 186 / 0.18)"
          stroke="oklch(0.68 0.12 186)"
          strokeWidth="2"
        />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={PILLARS[i].color} />
        ))}

        {PILLARS.map((pillar, i) => {
          const angle = startAngle + i * angleStep;
          const labelRadius = radius + 20;
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
              fontSize="10"
              fontWeight="600"
            >
              {pillar.label}
            </text>
          );
        })}
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {PILLARS.map((pillar) => (
          <div key={pillar.key} className="flex items-center gap-2 rounded-md border border-border/40 bg-background/35 px-2 py-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pillar.color }} />
            <span className="text-[11px] text-muted-foreground">{pillar.label}</span>
            <span className="ml-auto text-xs font-mono">{Math.round(pageScore[pillar.key] as number)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
