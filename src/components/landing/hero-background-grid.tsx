"use client";

import React, { useLayoutEffect, useRef, useState } from "react";

/**
 * PromptWatch-style grid: `gap-px` grout + rounded tiles (diamond junctions), one line
 * thickness between cells — no “double” stroke from stacked borders.
 */
export function HeroBackgroundGrid({
  cellSize = 112,
  line = "rgba(0, 0, 0, 0.098)",
  cornerRadius = 6,
  spotlight = true,
  fade = true,
  markers = true,
  markerColor = "rgba(0, 0, 0, 0.22)",
  markerSize = 5,
}: {
  cellSize?: number;
  line?: string;
  cornerRadius?: number;
  spotlight?: boolean;
  fade?: boolean;
  markers?: boolean;
  markerColor?: string;
  markerSize?: number;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ cols: 12, rows: 8 });

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    function measure() {
      const node = measureRef.current;
      if (!node) return;
      const w = node.offsetWidth;
      const h = node.offsetHeight;
      if (!w || !h) return;
      const cols = Math.max(4, Math.ceil(w / cellSize));
      const rows = Math.max(3, Math.ceil(h / cellSize));
      setDims((d) => (d.cols === cols && d.rows === rows ? d : { cols, rows }));
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cellSize]);

  const total = dims.cols * dims.rows;
  const mask =
    "radial-gradient(ellipse 78% 72% at 50% 42%, transparent 0%, transparent 34%, black 100%)";

  const diamondSvg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${cellSize}' height='${cellSize}'>` +
      `<rect x='${-markerSize / 2}' y='${-markerSize / 2}' width='${markerSize}' height='${markerSize}' ` +
      `transform='rotate(45 0 0)' fill='${markerColor}'/>` +
      `</svg>`,
  );

  return (
    <div
      ref={measureRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 select-none bg-background"
    >
      <div
        className="absolute inset-0"
        style={fade ? { WebkitMaskImage: mask, maskImage: mask } : undefined}
      >
        <div
          className="grid h-full min-h-full w-full gap-px"
          style={{
            backgroundColor: line,
            gridTemplateColumns: `repeat(${dims.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${dims.rows}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className="min-h-0 bg-background"
              style={{ borderRadius: cornerRadius }}
            />
          ))}
        </div>
        {markers ? (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml;utf8,${diamondSvg}")`,
              backgroundSize: `${cellSize}px ${cellSize}px`,
              backgroundPosition: "0 0",
            }}
          />
        ) : null}
      </div>
      {spotlight ? (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 82% 72% at 50% 40%, var(--background) 0%, color-mix(in srgb, var(--background) 50%, transparent) 44%, transparent 76%)",
          }}
        />
      ) : null}
    </div>
  );
}
