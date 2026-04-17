"use client";

function getScoreColor(score: number): { text: string; bg: string; border: string } {
  if (score >= 70) return { text: "#22c55e", bg: "#22c55e15", border: "#22c55e30" };
  if (score >= 50) return { text: "#D97706", bg: "#D9770615", border: "#D9770630" };
  if (score >= 30) return { text: "#E04D00", bg: "#E04D0015", border: "#E04D0030" };
  return { text: "#E04D00", bg: "#E04D0015", border: "#E04D0030" };
}

interface PlatformScoreCardProps {
  platform: string;
  icon: React.ReactNode;
  score: number | null;
  subScores?: Record<string, number>;
}

export function PlatformScoreCard({
  platform,
  icon,
  score,
  subScores,
}: PlatformScoreCardProps) {
  const displayScore = score != null ? Math.round(score) : 0;
  const colors = getScoreColor(displayScore);

  return (
    <div className="rounded-2xl bg-card p-5 h-full border border-border">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-base font-semibold text-foreground">{platform}</p>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-sm font-bold"
          style={{ color: colors.text, backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
        >
          {displayScore}
        </span>
      </div>
      {subScores && Object.keys(subScores).length > 0 && (
        <div className="space-y-2 pt-1">
          {Object.entries(subScores).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground capitalize">
                {key.replace(/_/g, " ")}
              </span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all bg-primary"
                    style={{ width: `${Math.min(100, value)}%` }}
                  />
                </div>
                <span className="font-mono text-xs w-8 text-right text-foreground">
                  {Math.round(value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
