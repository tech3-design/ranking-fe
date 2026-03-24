"use client";

function getScoreColor(score: number): { text: string; bg: string; border: string } {
  if (score >= 70) return { text: "#22c55e", bg: "#22c55e15", border: "#22c55e30" };
  if (score >= 50) return { text: "#D97706", bg: "#D9770615", border: "#D9770630" };
  if (score >= 30) return { text: "#F95C4B", bg: "#F95C4B15", border: "#F95C4B30" };
  return { text: "#F95C4B", bg: "#F95C4B15", border: "#F95C4B30" };
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
    <div className="rounded-2xl bg-white p-5 h-full" style={{ border: "1px solid #E4DED240" }}>
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-base font-semibold text-[#000000]">{platform}</p>
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
              <span className="text-[#000000]/50 capitalize">
                {key.replace(/_/g, " ")}
              </span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 rounded-full" style={{ backgroundColor: "#E4DED260" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, value)}%`, backgroundColor: "#F95C4B" }}
                  />
                </div>
                <span className="font-mono text-xs w-8 text-right text-[#000000]">
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
