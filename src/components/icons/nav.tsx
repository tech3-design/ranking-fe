import * as React from "react";

/**
 * Custom sidebar nav icon set for Signalor's dashboard navigation.
 *
 * Style rules — keep these consistent so the set reads as a designed family:
 *   - 24×24 viewBox, fill=none, currentColor stroke
 *   - 2px stroke, round caps and joins (matches lucide's visual weight so
 *     these can sit alongside other lucide icons in the same UI)
 *   - Each icon has a single small filled accent dot positioned where it
 *     reinforces the meaning (the "signal" motif tying the family together)
 *
 * Each component accepts the same `SVGProps<SVGSVGElement>` shape lucide does,
 * so they're a drop-in replacement in the existing layout.tsx nav config.
 */

type IconProps = React.SVGProps<SVGSVGElement>;

function svgBase(props: IconProps) {
  return {
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

// Overview — 2×2 dashboard panel, top-left tile gets the accent.
export function OverviewIcon(props: IconProps) {
  return (
    <svg {...svgBase(props)}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.2" />
      <circle cx="6.75" cy="6.75" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Visibility — eye outline with a centered AI-pupil dot.
export function VisibilityIcon(props: IconProps) {
  return (
    <svg {...svgBase(props)}>
      <path d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7z" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Sitemap — root page connected to three child pages.
export function SitemapIcon(props: IconProps) {
  return (
    <svg {...svgBase(props)}>
      <rect x="8" y="2.5" width="8" height="5" rx="1" />
      <rect x="2" y="16" width="6" height="5" rx="1" />
      <rect x="9" y="16" width="6" height="5" rx="1" />
      <rect x="16" y="16" width="6" height="5" rx="1" />
      <path d="M12 7.5v4.5" />
      <path d="M5 16v-3.5h14V16" />
      <circle cx="12" cy="5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Tasks — two checklist rows, one checked, with a "pulse" accent dot.
export function TasksIcon(props: IconProps) {
  return (
    <svg {...svgBase(props)}>
      <rect x="3" y="4.5" width="5" height="5" rx="1" />
      <path d="M4.3 7.1 5.2 8 6.8 6.3" />
      <path d="M10 7h11" />
      <rect x="3" y="14.5" width="5" height="5" rx="1" />
      <path d="M10 17h11" />
      <circle cx="20.5" cy="20.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Tracker — speech/prompt bubble centered on a citation target dot.
export function TrackerIcon(props: IconProps) {
  return (
    <svg {...svgBase(props)}>
      <path d="M21 11.5c0 4.4-4 8-9 8a9.5 9.5 0 0 1-3.7-.8L3 20.5l1.3-4.3A8 8 0 0 1 3 11.5c0-4.4 4-8 9-8s9 3.6 9 8z" />
      <circle cx="12" cy="11.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Competitors — primary brand avatar foregrounded, rival avatar behind.
export function CompetitorsIcon(props: IconProps) {
  return (
    <svg {...svgBase(props)}>
      <circle cx="9.5" cy="8.5" r="3.5" />
      <path d="M3 19.5c0-3 2.9-5.5 6.5-5.5s6.5 2.5 6.5 5.5" />
      <circle cx="17.5" cy="9" r="2.3" />
      <path d="M14.5 19.5c0-2 1.4-3.5 3-3.5s3 1.5 3 3.5" />
      <circle cx="9.5" cy="8.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Content — document outline with text lines and a "signal" accent.
export function ContentIcon(props: IconProps) {
  return (
    <svg {...svgBase(props)}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
      <circle cx="17.2" cy="6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Backlinks — two interlocked rings (clearer than a chain glyph at small sizes).
export function BacklinksIcon(props: IconProps) {
  return (
    <svg {...svgBase(props)}>
      <circle cx="8.5" cy="12" r="5" />
      <circle cx="15.5" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// BlogAgent — pen nib writing onto a page, accent dot at the nib tip.
export function BlogAgentIcon(props: IconProps) {
  return (
    <svg {...svgBase(props)}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
      <path d="M8 13h8M8 17h5" />
      <path d="M15.5 13.5 17 12l1.5 1.5-1.5 1.5z" fill="currentColor" stroke="none" />
      <circle cx="17" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
