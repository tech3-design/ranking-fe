import { BarChart3, FileDown, Presentation, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const REPORTING_SITE = {
  title: "Explorer",
  description:
    "Surface emerging prompts, citations, and competitor gaps — so your GEO roadmap stays ahead of the prompts buyers are starting to ask.",
} as const;

export const REPORTING_HERO = {
  titleLine1: "Discover the",
  titleBadge: "AI",
  titleLine2: "prompts buyers are",
  titleAccent: "about to ask",
  subhead:
    "Convert GEO scores, citation trends, and fix deltas into summaries, decks, and exports your stakeholders and clients actually read—without copy-pasting screenshots.",
  footnote:
    "PDF + CSV exports · branded decks · recurring email digests on higher tiers",
  primaryCta: "Build a report",
  secondaryCta: "Run free GEO audit",
} as const;

export const REPORTING_HUB_CARDS: {
  slug: string;
  href: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  cta: string;
}[] = [
  {
    slug: "exec-summaries",
    href: "/sign-up",
    title: "Executive summaries",
    description:
      "One-page reads highlighting AI visibility, citation share, and shipped fixes—ready to drop into board decks.",
    Icon: Presentation,
    cta: "Learn more",
  },
  {
    slug: "agency-reports",
    href: "/sign-up",
    title: "Agency reports",
    description:
      "Branded, client-ready PDF and CSV exports for recurring visibility reviews—no slide rebuilding required.",
    Icon: FileDown,
    cta: "Learn more",
  },
];

export const REPORTING_PROOF_METRICS = [
  { value: "3x", label: "Faster QBR prep" },
  { value: "5+", label: "Export formats" },
  { value: "100%", label: "White-label ready" },
  { value: "Weekly", label: "Recurring digests" },
] as const;

export const REPORTING_PILLAR_ROWS = [
  { label: "Executive", value: 80, tone: "bg-[#2563eb]/80" },
  { label: "Analyst", value: 68, tone: "bg-emerald-500/90" },
  { label: "Client", value: 74, tone: "bg-amber-500/90" },
] as const;

export const REPORTING_CAPABILITY_ROWS = [
  {
    icon: Presentation,
    title: "Executive summaries",
    description:
      "One-pager AI visibility digests highlighting score moves, citation wins, and shipped fixes—ready for leadership review.",
  },
  {
    icon: FileDown,
    title: "PDF & CSV exports",
    description:
      "Brandable reports, audit snapshots, and row-level data for deeper analysis—downloadable in a click.",
  },
  {
    icon: Users,
    title: "Agency white-label",
    description:
      "Drop client logos onto recurring reports so visibility readouts look native to the agency delivering them.",
  },
  {
    icon: BarChart3,
    title: "Recurring digests",
    description:
      "Schedule weekly or monthly email summaries for stakeholders—citation moves, new fixes, and competitor drift in one read.",
  },
] as const;

export const REPORTING_FEATURES_INTRO = {
  eyebrow: "[ reporting ]",
  titleBefore: "Everything you need to",
  titleAccent: "show the impact",
  description:
    "GEO investment only lands when stakeholders see the wins. Reporting turns scores, citations, and fixes into executive-ready stories—no slide rebuilding.",
} as const;

export const REPORTING_FEATURE_CELLS = [
  {
    title: "Trending prompts",
    description:
      "Spot brand-new buyer prompts the week they start appearing — before competitors notice the shift in their own tooling.",
    mock: {
      kind: "trendingList" as const,
      items: [
        { prompt: "Best AI visibility tools 2026", velocity: "+240% · 7d", direction: "new" as const, surface: "ChatGPT" },
        { prompt: "GEO vs SEO for ecommerce", velocity: "+180% · 7d", direction: "up" as const, surface: "Perplexity" },
        { prompt: "How to rank in AI Overviews", velocity: "+420% · 7d", direction: "new" as const, surface: "Gemini" },
      ],
    },
  },
  {
    title: "Emerging citations",
    description:
      "Catch pages and competitors beginning to earn AI mentions on prompts you care about — flag gaps before they calcify.",
    mock: {
      kind: "trendingList" as const,
      items: [
        { prompt: "New cite: Acme on 'best CRM'", velocity: "First seen · 2d", direction: "new" as const, surface: "ChatGPT" },
        { prompt: "Rising: /pricing on Gemini", velocity: "+6 cites · 7d", direction: "up" as const, surface: "Gemini" },
        { prompt: "Northwind · 'GEO scoring'", velocity: "First seen · 5d", direction: "new" as const, surface: "Claude" },
      ],
    },
  },
  {
    title: "Competitor gaps",
    description:
      "Prompts where rivals are mentioned and you are not — so marketing knows exactly where to invest in content next.",
    mock: {
      kind: "trendingList" as const,
      items: [
        { prompt: "Top ecommerce SEO platforms", velocity: "Acme cited · you missing", direction: "new" as const, surface: "Perplexity" },
        { prompt: "AI audit tools for agencies", velocity: "Northwind cited · 4x", direction: "up" as const, surface: "ChatGPT" },
        { prompt: "Enterprise GEO vendors", velocity: "3 rivals cited", direction: "new" as const, surface: "Gemini" },
      ],
    },
  },
  {
    title: "Fix showcase",
    description:
      "Tell the story of shipped GEO work—fix queue deltas, schema wins, and which launches actually moved citations.",
    mock: {
      kind: "alertList" as const,
      items: [
        { title: "Added Organization JSON-LD", meta: "+4 GEO · 12 AI cites", dot: "emerald" as const, badge: "Win", badgeTone: "emerald" as const },
        { title: "Rewrote /pricing copy", meta: "+3 citability", dot: "amber" as const, badge: "Partial", badgeTone: "neutral" as const },
        { title: "Schema regression · /docs", meta: "Rolled back", dot: "red" as const, badge: "Alert", badgeTone: "red" as const },
      ],
    },
  },
  {
    title: "Competitor benchmark",
    description:
      "Side-by-side share of AI citations across the prompt baskets that matter—ready for board decks and investor updates.",
    mock: {
      kind: "competitorBars" as const,
      title: "Share of AI mentions",
      window: "30d",
      rows: [
        { name: "You", pct: "41%", pctNum: 41, barClass: "bg-[#2563eb]" },
        { name: "Acme", pct: "34%", pctNum: 34, barClass: "bg-neutral-400" },
        { name: "Northwind", pct: "25%", pctNum: 25, barClass: "bg-neutral-300" },
      ],
    },
  },
  {
    title: "Recurring digests",
    description:
      "Schedule weekly or monthly summaries for stakeholders—score moves, new recommendations, and competitor drift delivered automatically.",
    mock: {
      kind: "chat" as const,
      prompt: "Signalor · weekly digest",
      answerParts: [
        { t: "This week: " },
        { t: "+4 GEO score", variant: "brand" as const },
        { t: ", 14 new AI citations on " },
        { t: "/pricing", variant: "link" as const },
        { t: ", and a competitor drift alert on 'best AI visibility tools'. Full report in-app." },
      ],
    },
  },
];

export const REPORTING_FEATURES_FOOTER_CTAS = {
  primary: "Build a report",
  secondary: "Run free GEO audit",
  secondaryHref: "/analyzer",
} as const;

export const REPORTING_WHY = {
  eyebrow: "[ why reporting ]",
  titleBefore: "GEO wins only land",
  titleAccent: "when leadership sees them",
  titleAfter: "",
  intro:
    "The score moved. The citations grew. But none of that matters if it never makes it into an exec review. Reporting turns Signalor runs into stakeholder-ready stories—no slide rebuilding, no copy-paste.",
  proofTitle: "Proof in numbers",
  proofBody:
    "What reporting looks like for teams that ship GEO wins into boardrooms and client reviews on a weekly cadence.",
  liveTitle: "Live preview",
  liveBody:
    "An executive summary your CFO actually reads—three lines on what moved, one on what's next, and a link to the deeper dashboard for analysts.",
  livePrompt:
    "Summarize this month's AI visibility for the leadership review",
  liveAnswerParts: [
    { t: "GEO score moved from 66 → 78 (+12). " },
    { t: "Signalor", variant: "brand" as const },
    { t: " now earns 41% share of AI citations on priority prompts—up 14% after the " },
    { t: "Organization schema", variant: "link" as const },
    { t: " launch. Next sprint: tighten /docs FAQ schema to close the last content gap." },
  ],
  coverageTitle: "Report coverage",
  coverageBody:
    "Roll up which stakeholder groups have live, scheduled, or missing reports—so weekly cadences cover the teams that influence budget and investment.",
  coverageScoreLabel: "Coverage",
  coverageScore: "74",
  coverageSuffix: "/100",
  coverageDelta: "+11",
  citedLabel: "Scheduled",
  missedLabel: "Ad-hoc",
  citedPct: "68%",
  missedPct: "32%",
  coverageCitedBarPct: 68,
  shipTitle: "What you ship",
  shipBody:
    "The reporting work your team turns on weekly—from executive digests to recurring agency deliverables and board-ready benchmarks.",
} as const;

export const REPORTING_FAQ = [
  {
    question: "What formats can I export?",
    answer:
      "PDF for executive summaries and client decks, CSV for row-level data, and PNG snapshots for pasting into slides. Custom formats are on the roadmap for enterprise plans.",
  },
  {
    question: "Can I white-label reports for clients?",
    answer:
      "Agency plans let you add client logos, color, and domain to recurring reports—so deliverables look native to the agency producing them.",
  },
  {
    question: "Are recurring digests included?",
    answer:
      "Weekly and monthly email digests ship on Pro and above. You can scope recipients per workspace and pause digests during client onboarding.",
  },
  {
    question: "Can analysts get raw data alongside summaries?",
    answer:
      "Yes—every report has a row-level CSV companion export. Pair it with the API for custom BI dashboards beyond what built-in reporting covers.",
  },
] as const;
