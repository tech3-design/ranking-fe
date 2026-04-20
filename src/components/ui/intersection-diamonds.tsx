export const DIAMOND_COLOR = "rgba(0, 0, 0, 0.098)";
export const DIAMOND_SIZE = 5;
const HALF = DIAMOND_SIZE / 2;

const diamondStyle: React.CSSProperties = {
  width: DIAMOND_SIZE,
  height: DIAMOND_SIZE,
  background: DIAMOND_COLOR,
};

/**
 * Single diamond primitive — absolutely positioned by the caller. Use for
 * arbitrary intersection points that don't fit `CornerDiamonds` / `ScreenHR`
 * (e.g. an auth shell with detached edge lines forming a frame).
 */
export function Diamond({
  style,
  className = "",
}: {
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute z-10 rotate-45 ${className}`}
      style={{ ...diamondStyle, ...style }}
    />
  );
}

/**
 * Place diamond markers at the corners of a `relative` container — meant to
 * punctuate where the container's implicit horizontal (top/bottom) border
 * meets the page's wrapping `max-w-7xl` vertical borders.
 */
export function CornerDiamonds({
  top = false,
  bottom = false,
}: {
  top?: boolean;
  bottom?: boolean;
}) {
  return (
    <>
      {top && (
        <>
          <span aria-hidden className="pointer-events-none absolute z-10 rotate-45" style={{ ...diamondStyle, top: -HALF, left: -HALF }} />
          <span aria-hidden className="pointer-events-none absolute z-10 rotate-45" style={{ ...diamondStyle, top: -HALF, right: -HALF }} />
        </>
      )}
      {bottom && (
        <>
          <span aria-hidden className="pointer-events-none absolute z-10 rotate-45" style={{ ...diamondStyle, bottom: -HALF, left: -HALF }} />
          <span aria-hidden className="pointer-events-none absolute z-10 rotate-45" style={{ ...diamondStyle, bottom: -HALF, right: -HALF }} />
        </>
      )}
    </>
  );
}

/**
 * A horizontal rule that spans the full viewport (`w-screen`) but renders
 * diamond markers at the points where it crosses the page's `max-w-7xl`
 * container's vertical borders. Replaces the bare `w-screen border-t` divs.
 */
export function ScreenHR() {
  return (
    <div aria-hidden className="relative">
      <div className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6" />
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto w-full max-w-7xl">
        <span className="pointer-events-none absolute z-10 rotate-45" style={{ ...diamondStyle, top: -HALF, left: -HALF }} />
        <span className="pointer-events-none absolute z-10 rotate-45" style={{ ...diamondStyle, top: -HALF, right: -HALF }} />
      </div>
    </div>
  );
}

/**
 * Place diamonds at the intersections of a multi-column grid's vertical
 * dividers (`md:divide-x`) with its top and/or bottom border. For a
 * 3-column layout: 2 vertical dividers → 2 diamonds per edge.
 */
export function GridDividerDiamonds({
  columns,
  top = false,
  bottom = false,
}: {
  columns: number;
  top?: boolean;
  bottom?: boolean;
}) {
  const positions = Array.from({ length: columns - 1 }, (_, i) => ((i + 1) / columns) * 100);
  return (
    <>
      {top &&
        positions.map((pct) => (
          <span
            key={`t-${pct}`}
            aria-hidden
            className="pointer-events-none absolute z-10 rotate-45 hidden md:block"
            style={{ ...diamondStyle, top: -HALF, left: `calc(${pct}% - ${HALF}px)` }}
          />
        ))}
      {bottom &&
        positions.map((pct) => (
          <span
            key={`b-${pct}`}
            aria-hidden
            className="pointer-events-none absolute z-10 rotate-45 hidden md:block"
            style={{ ...diamondStyle, bottom: -HALF, left: `calc(${pct}% - ${HALF}px)` }}
          />
        ))}
    </>
  );
}
