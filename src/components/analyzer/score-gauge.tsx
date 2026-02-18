"use client";

function getScoreColor(score: number): string {
  if (score >= 80) return "#00b894";
  if (score >= 60) return "#fdcb6e";
  if (score >= 40) return "#e17055";
  return "#d63031";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Work";
  return "Poor";
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
  const strokeDashoffset = circumference - (score / 100) * circumference * 0.75;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.75}`}>
        {/* Background arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={circumference * 0.25}
          transform={`rotate(135 ${center} ${center})`}
        />
        {/* Score arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(135 ${center} ${center})`}
          className="transition-all duration-1000 ease-out"
        />
        {/* Score text */}
        <text
          x={center}
          y={center - 5}
          textAnchor="middle"
          fill="currentColor"
          className="text-3xl font-bold"
          fontSize="36"
          fontWeight="bold"
        >
          {Math.round(score)}
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
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      )}
    </div>
  );
}
