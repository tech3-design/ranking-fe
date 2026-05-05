import * as React from "react";

/**
 * Signalor custom icon library.
 *
 * Drop-in replacement for `lucide-react` — every icon name imported from
 * `lucide-react` anywhere in this codebase is re-exported from here so
 * `import { Foo } from "@/components/icons"` works unchanged.
 *
 * Style rules (kept consistent so the set reads as a designed family):
 *   - 24×24 viewBox
 *   - fill=none, stroke=currentColor, 2px, round caps + joins
 *   - One small filled accent dot per icon (the "signal" motif), placed
 *     where it reinforces meaning. Variants of the same shape (e.g. Check
 *     vs CheckIcon) share geometry so renames are safe.
 */

export type LucideIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;
type IconProps = React.SVGProps<SVGSVGElement>;

function base(props: IconProps): React.SVGProps<SVGSVGElement> & { xmlns: string } {
  return {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    xmlns: "http://www.w3.org/2000/svg",
    ...props,
  };
}

/** Filled accent dot — the "Signalor signature" tying the family together. */
function dot(cx: number, cy: number, r = 1) {
  return <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />;
}

// ─── Re-export the existing nav icons under their original names ──────────
export {
  OverviewIcon,
  VisibilityIcon,
  SitemapIcon,
  TasksIcon,
  TrackerIcon,
  WikipediaIcon,
  CompetitorsIcon,
  ContentIcon,
  BacklinksIcon,
} from "./nav";

/* ─── Activity / status ─────────────────────────────────────────────── */

export const Activity: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M22 12h-4l-3 9L9 3l-3 9H2" />{dot(22, 12, 1)}</svg>
);

export const AlertCircle: LucideIcon = (p) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="10" /><path d="M12 8v4" />{dot(12, 16)}</svg>
);
export const CircleAlert = AlertCircle;

export const AlertTriangle: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4" />{dot(12, 17)}</svg>
);

/* ─── Arrows ────────────────────────────────────────────────────────── */

export const ArrowDown: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M12 5v14" /><path d="m19 12-7 7-7-7" />{dot(12, 5)}</svg>
);
export const ArrowUp: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M12 19V5" /><path d="m5 12 7-7 7 7" />{dot(12, 19)}</svg>
);
export const ArrowLeft: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M19 12H5" /><path d="m12 19-7-7 7-7" />{dot(19, 12)}</svg>
);
export const ArrowRight: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" />{dot(5, 12)}</svg>
);
export const ArrowUpRight: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M7 17 17 7" /><path d="M7 7h10v10" />{dot(7, 17)}</svg>
);
export const ArrowDownRight: LucideIcon = (p) => (
  <svg {...base(p)}><path d="m7 7 10 10" /><path d="M17 7v10H7" />{dot(7, 7)}</svg>
);

/* ─── Charts ────────────────────────────────────────────────────────── */

export const BarChart2: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />{dot(6, 14)}</svg>
);
export const BarChart3: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />{dot(8, 14)}</svg>
);
export const ChartNoAxesCombined: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M12 16v5" /><path d="M16 14v7" /><path d="M20 10v11" /><path d="M8 18v3" /><path d="M4 22V2" /><path d="m4 9 4-3 4 3 4-5 4 4" />{dot(20, 6)}</svg>
);
export const LineChart: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M3 3v18h18" /><path d="m7 14 4-4 4 4 5-5" />{dot(20, 9)}</svg>
);
export const TrendingUp: LucideIcon = (p) => (
  <svg {...base(p)}><path d="m22 7-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" />{dot(22, 7)}</svg>
);
export const TrendingDown: LucideIcon = (p) => (
  <svg {...base(p)}><path d="m22 17-8.5-8.5-5 5L2 7" /><path d="M16 17h6v-6" />{dot(22, 17)}</svg>
);

/* ─── Bells, books, building ────────────────────────────────────────── */

export const Bell: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />{dot(18, 5)}</svg>
);
export const Binary: LucideIcon = (p) => (
  <svg {...base(p)}><rect x="14" y="14" width="4" height="6" rx="2" /><rect x="6" y="4" width="4" height="6" rx="2" /><path d="M6 20h4" /><path d="M14 10h4" /><path d="M6 14h2v6" /><path d="M14 4h2v6" />{dot(20, 12)}</svg>
);
export const BookOpen: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />{dot(12, 5)}</svg>
);
export const Bot: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />{dot(12, 4)}</svg>
);
export const Briefcase: LucideIcon = (p) => (
  <svg {...base(p)}><rect width="20" height="14" x="2" y="7" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />{dot(12, 14)}</svg>
);
export const Building2: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />{dot(12, 22)}</svg>
);

/* ─── Calendar / time ───────────────────────────────────────────────── */

export const Calendar: LucideIcon = (p) => (
  <svg {...base(p)}><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />{dot(8, 15)}</svg>
);
export const CalendarClock: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h5" /><path d="M17.5 17.5 16 16.25V14" /><circle cx="16" cy="16" r="6" />{dot(16, 16)}</svg>
);
export const CalendarDays: LucideIcon = (p) => (
  <svg {...base(p)}><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" />{dot(8, 14)}</svg>
);
export const Clock: LucideIcon = (p) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />{dot(12, 12)}</svg>
);
export const Timer: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M10 2h4" /><path d="M12 14v-4" /><circle cx="12" cy="14" r="8" />{dot(12, 14)}</svg>
);
export const History: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" />{dot(12, 12)}</svg>
);

/* ─── Misc objects ──────────────────────────────────────────────────── */

export const Camera: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />{dot(12, 13)}</svg>
);
export const Cloud: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M17.5 19a4.5 4.5 0 1 0-1.41-8.775 5.5 5.5 0 0 0-10.595 2.626A4.5 4.5 0 0 0 6.5 19z" />{dot(12, 14)}</svg>
);
export const Code2: LucideIcon = (p) => (
  <svg {...base(p)}><path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" />{dot(12, 12)}</svg>
);
export const Compass: LucideIcon = (p) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="10" /><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z" />{dot(12, 12)}</svg>
);
export const Copy: LucideIcon = (p) => (
  <svg {...base(p)}><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />{dot(8, 8)}</svg>
);
export const CreditCard: LucideIcon = (p) => (
  <svg {...base(p)}><rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" />{dot(6, 16)}</svg>
);
export const Crown: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.45 5.43A1 1 0 0 1 23 6.353V16a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6.353a1 1 0 0 1 1.55-.923l4.543 3.733a1 1 0 0 0 1.516-.295z" /><path d="M5 21h14" />{dot(12, 12)}</svg>
);

/* ─── Checks / minus / plus / x ─────────────────────────────────────── */

export const Check: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M20 6 9 17l-5-5" />{dot(20, 6)}</svg>
);
export const CheckIcon = Check;
export const CheckCircle2: LucideIcon = (p) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />{dot(15, 10)}</svg>
);
export const CircleCheck = CheckCircle2;

export const X: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M18 6 6 18" /><path d="m6 6 12 12" />{dot(6, 6)}</svg>
);
export const XIcon = X;
export const XCircle: LucideIcon = (p) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />{dot(12, 12)}</svg>
);
export const CircleX = XCircle;

export const Minus: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M5 12h14" />{dot(5, 12)}</svg>
);
export const MinusIcon = Minus;
export const MinusCircle: LucideIcon = (p) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="10" /><path d="M8 12h8" />{dot(12, 12)}</svg>
);

export const Plus: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M5 12h14" /><path d="M12 5v14" />{dot(12, 12)}</svg>
);

/* ─── Chevrons ──────────────────────────────────────────────────────── */

export const ChevronDown: LucideIcon = (p) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" />{dot(12, 15)}</svg>
);
export const ChevronDownIcon = ChevronDown;
export const ChevronUp: LucideIcon = (p) => (
  <svg {...base(p)}><path d="m18 15-6-6-6 6" />{dot(12, 9)}</svg>
);
export const ChevronUpIcon = ChevronUp;
export const ChevronLeft: LucideIcon = (p) => (
  <svg {...base(p)}><path d="m15 18-6-6 6-6" />{dot(9, 12)}</svg>
);
export const ChevronRight: LucideIcon = (p) => (
  <svg {...base(p)}><path d="m9 18 6-6-6-6" />{dot(15, 12)}</svg>
);
export const ChevronsUpDown: LucideIcon = (p) => (
  <svg {...base(p)}><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" />{dot(12, 12)}</svg>
);

/* ─── Editing / files ───────────────────────────────────────────────── */

export const Download: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />{dot(12, 3)}</svg>
);
export const FileDown: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M12 18v-6" /><path d="m9 15 3 3 3-3" />{dot(17, 5)}</svg>
);
export const FileText: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />{dot(17, 5)}</svg>
);
export const FileCheck2: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" /><path d="M14 2v6h6" /><path d="m3 15 2 2 4-4" />{dot(7, 17)}</svg>
);

export const Edit3: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />{dot(20, 4)}</svg>
);
export const Pencil: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" />{dot(19, 5)}</svg>
);
export const PenSquare: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />{dot(20, 5)}</svg>
);
export const Save: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" />{dot(12, 17)}</svg>
);

/* ─── Eye / viewing ─────────────────────────────────────────────────── */

export const Eye: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" />{dot(12, 12)}</svg>
);
export const Feather: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" /><path d="M16 8 2 22" /><path d="M17.5 15H9" />{dot(20, 4)}</svg>
);
export const Gauge: LucideIcon = (p) => (
  <svg {...base(p)}><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" />{dot(16, 10)}</svg>
);

/* ─── Brand & external ──────────────────────────────────────────────── */

export const GitFork: LucideIcon = (p) => (
  <svg {...base(p)}><circle cx="12" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" /><path d="M12 12v3" />{dot(12, 18)}</svg>
);
export const Github: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.42 9 18v4" /><path d="M9 18c-4.51 2-5-2-7-2" />{dot(12, 4)}</svg>
);
export const Globe: LucideIcon = (p) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />{dot(12, 12)}</svg>
);
export const Globe2: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M21.54 15H17a2 2 0 0 0-2 2v4.54" /><path d="M7 3.34V5a3 3 0 0 0 3 3v0a2 2 0 0 1 2 2v0c0 1.1.9 2 2 2v0a2 2 0 0 0 2-2v0c0-1.1.9-2 2-2h3.17" /><path d="M11 21.95V18a2 2 0 0 0-2-2v0a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05" /><circle cx="12" cy="12" r="10" />{dot(12, 12)}</svg>
);
export const Linkedin: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />{dot(4, 4)}</svg>
);
export const Slack: LucideIcon = (p) => (
  <svg {...base(p)}><rect width="3" height="8" x="13" y="2" rx="1.5" /><path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5" /><rect width="3" height="8" x="8" y="14" rx="1.5" /><path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5" /><rect width="8" height="3" x="14" y="13" rx="1.5" /><path d="M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5" /><rect width="8" height="3" x="2" y="8" rx="1.5" /><path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5" />{dot(12, 12)}</svg>
);
export const Twitter: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />{dot(15, 9)}</svg>
);
export const Youtube: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" />{dot(15, 12)}</svg>
);
export const ExternalLink: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />{dot(21, 3)}</svg>
);
export const Link2: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 1 1 0 10h-2" /><line x1="8" x2="16" y1="12" y2="12" />{dot(12, 12)}</svg>
);
export const LinkIcon = Link2;

/* ─── Layout / structure ────────────────────────────────────────────── */

export const Hash: LucideIcon = (p) => (
  <svg {...base(p)}><line x1="4" x2="20" y1="9" y2="9" /><line x1="4" x2="20" y1="15" y2="15" /><line x1="10" x2="8" y1="3" y2="21" /><line x1="16" x2="14" y1="3" y2="21" />{dot(12, 12)}</svg>
);
export const Home: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M3 9.5 12 2l9 7.5V21a2 2 0 0 1-2 2h-4a1 1 0 0 1-1-1v-6a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2z" />{dot(12, 14)}</svg>
);
export const Layers: LucideIcon = (p) => (
  <svg {...base(p)}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.91a1 1 0 0 0 0-1.83Z" /><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />{dot(12, 7)}</svg>
);
export const LayoutDashboard: LucideIcon = (p) => (
  <svg {...base(p)}><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />{dot(6, 6)}</svg>
);
export const LayoutGrid: LucideIcon = (p) => (
  <svg {...base(p)}><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />{dot(6, 6)}</svg>
);
export const Workflow: LucideIcon = (p) => (
  <svg {...base(p)}><rect width="8" height="8" x="3" y="3" rx="2" /><path d="M7 11v4a2 2 0 0 0 2 2h4" /><rect width="8" height="8" x="13" y="13" rx="2" />{dot(7, 7)}</svg>
);

/* ─── Chat / messaging ──────────────────────────────────────────────── */

export const MessageCircle: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />{dot(12, 12)}</svg>
);
export const MessageSquare: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />{dot(12, 11)}</svg>
);
export const Mail: LucideIcon = (p) => (
  <svg {...base(p)}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />{dot(12, 13)}</svg>
);
export const Send: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" />{dot(20, 4)}</svg>
);
export const Quote: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" /><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />{dot(12, 12)}</svg>
);

/* ─── Lightbulb / lifebuoy / lightning ──────────────────────────────── */

export const LifeBuoy: LucideIcon = (p) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="10" /><path d="m4.93 4.93 4.24 4.24" /><path d="m14.83 9.17 4.24-4.24" /><path d="m14.83 14.83 4.24 4.24" /><path d="m9.17 14.83-4.24 4.24" /><circle cx="12" cy="12" r="4" />{dot(12, 12)}</svg>
);
export const Lightbulb: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" />{dot(12, 4)}</svg>
);
export const Zap: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />{dot(13, 10)}</svg>
);
export const Sparkle: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M12 3a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4z" /><path d="M19 13v3" /><path d="M21 14.5h-4" />{dot(12, 7)}</svg>
);
export const Sparkles: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" />{dot(12, 12)}</svg>
);

/* ─── Lock / log / shield ───────────────────────────────────────────── */

export const Lock: LucideIcon = (p) => (
  <svg {...base(p)}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />{dot(12, 16)}</svg>
);
export const LogIn: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="m10 17 5-5-5-5" /><path d="M15 12H3" />{dot(15, 12)}</svg>
);
export const LogOut: LucideIcon = (p) => (
  <svg {...base(p)}><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />{dot(21, 12)}</svg>
);
export const Shield: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />{dot(12, 12)}</svg>
);
export const ShieldCheck: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" />{dot(15, 10)}</svg>
);
export const ShieldX: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m14.5 9.5-5 5" /><path d="m9.5 9.5 5 5" />{dot(12, 12)}</svg>
);

/* ─── Map / location / network ──────────────────────────────────────── */

export const Map: LucideIcon = (p) => (
  <svg {...base(p)}><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15" /><path d="M15 6v15" />{dot(12, 12)}</svg>
);
export const MapPin: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" />{dot(12, 10)}</svg>
);
export const Plug: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M12 22v-5" /><path d="M9 8V2" /><path d="M15 8V2" /><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z" />{dot(12, 14)}</svg>
);
export const PlugZap: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z" /><path d="m2 22 3-3" /><path d="M7.5 13.5 10 11" /><path d="M10.5 16.5 13 14" /><path d="m18 3-4 4h6l-4 4" />{dot(18, 3)}</svg>
);
export const Unplug: LucideIcon = (p) => (
  <svg {...base(p)}><path d="m19 5 3-3" /><path d="m2 22 3-3" /><path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z" /><path d="M7.5 13.5 10 11" /><path d="M10.5 16.5 13 14" /><path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z" />{dot(19, 5)}</svg>
);
export const Radar: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" /><path d="M4 6h.01" /><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" /><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67" /><path d="M12 18h.01" /><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67" /><circle cx="12" cy="12" r="2" />{dot(12, 12)}</svg>
);
export const Radio: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" /><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" /><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />{dot(12, 12)}</svg>
);

/* ─── Loading / refresh / rotate ────────────────────────────────────── */

export const Loader2: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M21 12a9 9 0 1 1-6.219-8.56" />{dot(21, 12)}</svg>
);
export const RefreshCw: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />{dot(21, 8)}</svg>
);
export const RefreshCcw: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" />{dot(3, 8)}</svg>
);
export const RotateCw: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />{dot(21, 8)}</svg>
);

/* ─── Misc ──────────────────────────────────────────────────────────── */

export const Ellipsis: LucideIcon = (p) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />{dot(12, 12)}</svg>
);
export const MoreHorizontal = Ellipsis;
export const Menu: LucideIcon = (p) => (
  <svg {...base(p)}><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />{dot(12, 12)}</svg>
);
export const Newspaper: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8z" />{dot(14, 8)}</svg>
);
export const Play: LucideIcon = (p) => (
  <svg {...base(p)}><polygon points="6 3 20 12 6 21 6 3" />{dot(12, 12)}</svg>
);
export const Presentation: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M2 3h20" /><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" /><path d="m7 21 5-5 5 5" />{dot(12, 11)}</svg>
);
export const Rocket: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />{dot(15, 9)}</svg>
);
export const Search: LucideIcon = (p) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />{dot(11, 11)}</svg>
);
export const Settings: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />{dot(12, 12)}</svg>
);
export const ShoppingBag: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />{dot(12, 10)}</svg>
);
export const Star: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />{dot(12, 12)}</svg>
);
export const Sun: LucideIcon = (p) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />{dot(12, 12)}</svg>
);
export const Moon: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />{dot(15, 9)}</svg>
);
export const Tag: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" />{dot(7.5, 7.5)}</svg>
);
export const Tags: LucideIcon = (p) => (
  <svg {...base(p)}><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19" /><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="6.5" cy="9.5" r=".5" />{dot(6.5, 9.5)}</svg>
);
export const Target: LucideIcon = (p) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />{dot(12, 12)}</svg>
);
export const Trash2: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />{dot(12, 6)}</svg>
);
export const Trophy: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0z" />{dot(12, 5)}</svg>
);
export const Triangle: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M13.73 4a2 2 0 0 0-3.46 0L2.32 18a2 2 0 0 0 1.73 3h15.9a2 2 0 0 0 1.73-3L13.73 4z" />{dot(12, 14)}</svg>
);

/* ─── Users / accounts ──────────────────────────────────────────────── */

export const User: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />{dot(12, 7)}</svg>
);
export const Users: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />{dot(9, 7)}</svg>
);
export const Wrench: LucideIcon = (p) => (
  <svg {...base(p)}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z" />{dot(12, 12)}</svg>
);

export const ListChecks: LucideIcon = (p) => (
  <svg {...base(p)}><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /><path d="M13 6h8" /><path d="M13 12h8" /><path d="M13 18h8" />{dot(13, 12)}</svg>
);
