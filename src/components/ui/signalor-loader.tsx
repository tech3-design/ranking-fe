"use client";

/**
 * Signalor branded loader — orbital ring animation with pulsing core.
 * Three concentric arcs rotate at different speeds around a breathing dot.
 */

interface SignalorLoaderProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const SIZES = {
  sm: { box: 32, stroke: 2.5, core: 3 },
  md: { box: 48, stroke: 3, core: 4.5 },
  lg: { box: 72, stroke: 3.5, core: 6 },
};

export function SignalorLoader({ size = "md", label }: SignalorLoaderProps) {
  const s = SIZES[size];
  const cx = s.box / 2;
  const r1 = cx - s.stroke - 1;
  const r2 = r1 - s.stroke - 2;
  const r3 = r2 - s.stroke - 2;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div style={{ width: s.box, height: s.box }} className="relative">
        <svg
          width={s.box}
          height={s.box}
          viewBox={`0 0 ${s.box} ${s.box}`}
          className="overflow-visible"
        >
          {/* Outer arc — coral, fast */}
          <circle
            cx={cx} cy={cx} r={r1}
            fill="none"
            stroke="#F95C4B"
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={`${r1 * 1.8} ${r1 * 4.5}`}
            className="origin-center animate-[signalor-spin_1.2s_linear_infinite]"
            style={{ transformOrigin: `${cx}px ${cx}px` }}
          />

          {/* Middle arc — stone, medium speed, reverse */}
          <circle
            cx={cx} cy={cx} r={r2}
            fill="none"
            stroke="#E4DED2"
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={`${r2 * 1.2} ${r2 * 4.5}`}
            className="origin-center animate-[signalor-spin-reverse_1.8s_linear_infinite]"
            style={{ transformOrigin: `${cx}px ${cx}px` }}
          />

          {/* Inner arc — coral faded, slow */}
          {r3 > 2 && (
            <circle
              cx={cx} cy={cx} r={r3}
              fill="none"
              stroke="#F95C4B"
              strokeWidth={s.stroke * 0.7}
              strokeLinecap="round"
              strokeDasharray={`${r3 * 0.9} ${r3 * 4.5}`}
              opacity="0.4"
              className="origin-center animate-[signalor-spin_2.4s_linear_infinite]"
              style={{ transformOrigin: `${cx}px ${cx}px` }}
            />
          )}

          {/* Core dot — breathing pulse */}
          <circle
            cx={cx} cy={cx} r={s.core}
            fill="#F95C4B"
            className="animate-[signalor-pulse_1.4s_ease-in-out_infinite]"
            style={{ transformOrigin: `${cx}px ${cx}px` }}
          />
        </svg>
      </div>

      {label && (
        <p className="text-sm text-[#000000]/50 font-medium animate-[signalor-fade_1.4s_ease-in-out_infinite]">
          {label}
        </p>
      )}
    </div>
  );
}
