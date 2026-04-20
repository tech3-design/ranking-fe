import { FileCheck2, Sparkles, Binary, LinkIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const CONTENT_SIGNALS_SITE = {
  title: "AI visibility",
  description:
    "Score how AI engines see, cite, and recommend your brand — across ChatGPT, Claude, Gemini, Perplexity, and more.",
} as const;

export const CONTENT_SIGNALS_HERO = {
  titleLine1: "Score your",
  titleBadge: "AI",
  titleLine2: "visibility across",
  titleAccent: "every answer engine",
  subhead:
    "Audit structure, schema, and trust markers on every page, then prioritize rewrites that move how generative engines summarize and cite you.",
  footnote:
    "Schema diagnostics · trust scoring · content briefs on higher tiers",
  primaryCta: "Score my content",
  secondaryCta: "Run free GEO audit",
} as const;

export const CONTENT_SIGNALS_HUB_CARDS: {
  slug: string;
  href: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  cta: string;
}[] = [
  {
    slug: "schema-coverage",
    href: "/analyzer",
    title: "Schema coverage",
    description:
      "Detect missing or malformed JSON-LD across key templates so models see entities exactly the way you intend.",
    Icon: Binary,
    cta: "Learn more",
  },
  {
    slug: "trust-signals",
    href: "/analyzer",
    title: "Trust signals",
    description:
      "Evaluate authorship, citations, and credibility markers AI systems lean on when choosing whom to recommend.",
    Icon: FileCheck2,
    cta: "Learn more",
  },
];

export const CONTENT_SIGNALS_PROOF_METRICS = [
  { value: "120+", label: "Checks per audit run" },
  { value: "18", label: "Schema types mapped" },
  { value: "3x", label: "Avg. citation lift after fixes" },
  { value: "1:1", label: "Linked to GEO score" },
] as const;

export const CONTENT_SIGNALS_PILLAR_ROWS = [
  { label: "Structure", value: 74, tone: "bg-[#2563eb]/80" },
  { label: "Schema", value: 68, tone: "bg-emerald-500/90" },
  { label: "Trust", value: 61, tone: "bg-amber-500/90" },
] as const;

export const CONTENT_SIGNALS_CAPABILITY_ROWS = [
  {
    icon: Binary,
    title: "Schema diagnostics",
    description:
      "Per-template JSON-LD coverage with prioritized fixes for Organization, Product, FAQ, Article, and more.",
  },
  {
    icon: Sparkles,
    title: "Extractability checks",
    description:
      "Heading hierarchy, list formatting, and answer-mechanism signals that keep models from paraphrasing you wrong.",
  },
  {
    icon: FileCheck2,
    title: "Trust markers",
    description:
      "Author bylines, citation patterns, and credential markup that let models safely recommend your pages.",
  },
  {
    icon: LinkIcon,
    title: "Tied to GEO fixes",
    description:
      "Jump straight from a weak signal into prioritized schema, structure, and copy tasks already ranked by Signalor.",
  },
] as const;

export const CONTENT_SIGNALS_FEATURES_INTRO = {
  eyebrow: "[ content signals ]",
  titleBefore: "Everything you need to",
  titleAccent: "train AI on your content",
  description:
    "Generative engines decide what to cite based on structure, schema, and trust — not just keyword relevance. Content signals keeps those markers healthy across the templates that matter.",
} as const;

export const CONTENT_SIGNALS_FEATURE_CELLS = [
  {
    title: "Engine coverage",
    description:
      "See your brand's visibility across every answer engine at a glance — ChatGPT, Claude, Gemini, Perplexity, and more.",
    mock: {
      kind: "engineGrid" as const,
      engines: [
        { name: "ChatGPT", initial: "C", tone: "bg-emerald-600", coverage: 74, trend: "up" as const },
        { name: "Claude", initial: "A", tone: "bg-amber-600", coverage: 62, trend: "up" as const },
        { name: "Gemini", initial: "G", tone: "bg-[#2563eb]", coverage: 58, trend: "flat" as const },
        { name: "Perplexity", initial: "P", tone: "bg-violet-600", coverage: 45, trend: "down" as const },
        { name: "Copilot", initial: "B", tone: "bg-sky-600", coverage: 51, trend: "up" as const },
        { name: "Google AI", initial: "G", tone: "bg-rose-500", coverage: 67, trend: "up" as const },
      ],
    },
  },
  {
    title: "GEO score breakdown",
    description:
      "One 0-100 read across citability, schema, and content — so every team aligns on what moves AI answers.",
    mock: {
      kind: "scoreCard" as const,
      label: "Overall GEO",
      score: "78",
      suffix: "/100",
      delta: "+12",
      bars: [
        { widthClass: "w-10", tone: "bg-[#2563eb]/80", label: "Citability · 82" },
        { widthClass: "w-7", tone: "bg-emerald-500/90", label: "Schema · 71" },
        { widthClass: "w-6", tone: "bg-amber-500/90", label: "Content · 74" },
      ],
    },
  },
  {
    title: "Share of AI citations",
    description:
      "Benchmark mention share vs. competitors across the prompts that matter — not legacy blue-link rankings.",
    mock: {
      kind: "competitorBars" as const,
      title: "Share of AI mentions",
      window: "30d",
      rows: [
        { name: "You", pct: "42%", pctNum: 42, barClass: "bg-[#2563eb]" },
        { name: "Acme", pct: "34%", pctNum: 34, barClass: "bg-neutral-400" },
        { name: "Northwind", pct: "24%", pctNum: 24, barClass: "bg-neutral-300" },
      ],
    },
  },
  {
    title: "Citation mix",
    description:
      "See which internal URLs models reuse vs. skip, so structure and schema work target the pages that return answers first.",
    mock: {
      kind: "citationBar" as const,
      leftLabel: "Your URLs",
      rightLabel: "Rest",
      leftPct: 42,
      list: [
        { dot: "emerald" as const, text: "/pricing · cited" },
        { dot: "amber" as const, text: "/docs/api · partial" },
        { dot: "neutral" as const, text: "/guides · skipped" },
      ],
    },
  },
  {
    title: "Fix queue",
    description:
      "Prioritized content and schema work, not a laundry list. Each item ties to the GEO score change it is expected to unlock.",
    mock: {
      kind: "alertList" as const,
      items: [
        { title: "Add Organization JSON-LD", meta: "Site-wide · est +4 GEO", dot: "red" as const, badge: "Critical", badgeTone: "red" as const },
        { title: "Tighten /pricing FAQ schema", meta: "Template · est +2 GEO", dot: "amber" as const, badge: "Next", badgeTone: "neutral" as const },
        { title: "Publish author bios /docs", meta: "Shipped · cite lift", dot: "emerald" as const, badge: "Done", badgeTone: "emerald" as const },
      ],
    },
  },
  {
    title: "Competitor lens",
    description:
      "Benchmark your structure and trust signals against rivals—see where their JSON-LD or bylines beat yours inside AI answers.",
    mock: {
      kind: "competitorBars" as const,
      title: "Schema health",
      window: "30d",
      rows: [
        { name: "You", pct: "74", pctNum: 74, barClass: "bg-[#2563eb]" },
        { name: "Acme", pct: "68", pctNum: 68, barClass: "bg-neutral-400" },
        { name: "Northwind", pct: "52", pctNum: 52, barClass: "bg-neutral-300" },
      ],
    },
  },
];

export const CONTENT_SIGNALS_FEATURES_FOOTER_CTAS = {
  primary: "Score my content",
  secondary: "Run free GEO audit",
  secondaryHref: "/analyzer",
} as const;

export const CONTENT_SIGNALS_WHY = {
  eyebrow: "[ why content signals ]",
  titleBefore: "Models read",
  titleAccent: "structure",
  titleAfter: "before they read copy",
  intro:
    "Even great writing gets skipped when structure, schema, and trust markers miss. Content signals surfaces what engines grade first, so every rewrite or schema push moves answers—not just rankings.",
  proofTitle: "Proof in numbers",
  proofBody:
    "Benchmarks teams cite once they move from keyword-only SEO to signals-driven AI visibility programs inside Signalor.",
  liveTitle: "Live preview",
  liveBody:
    "The content review strategists run before shipping copy—anchored to schema, structure, and trust gaps detected automatically on your site.",
  livePrompt:
    "Which ecommerce platform has the best GEO-ready product schema?",
  liveAnswerParts: [
    { t: "Platforms like " },
    { t: "Signalor Commerce", variant: "brand" as const },
    { t: " and " },
    { t: "Acme", variant: "link" as const },
    { t: " ship healthy Product + Review schema by default; stores missing Organization JSON-LD rarely appear in recommendations." },
  ],
  coverageTitle: "Signal coverage",
  coverageBody:
    "Roll up how each template scores on structure, schema, and trust, so content plans target the weakest pillar next—not the loudest stakeholder.",
  coverageScoreLabel: "Signals",
  coverageScore: "71",
  coverageSuffix: "/100",
  coverageDelta: "+7",
  citedLabel: "Healthy",
  missedLabel: "At risk",
  citedPct: "64%",
  missedPct: "36%",
  coverageCitedBarPct: 64,
  shipTitle: "What you ship",
  shipBody:
    "The content signal work your team owns weekly—from schema diagnostics to prioritized rewrites that models reward first.",
} as const;

export const CONTENT_SIGNALS_FAQ = [
  {
    question: "How is this different from a traditional SEO audit?",
    answer:
      "Traditional audits grade you for Google rankings. Content signals grades you for AI answers—scoring structure, schema, and trust markers that generative engines rely on when deciding what to cite.",
  },
  {
    question: "Which schema types are covered?",
    answer:
      "Organization, Product, FAQ, Article, HowTo, BreadcrumbList, and more. Coverage adapts to what your templates actually need—no noise about schemas that don't apply.",
  },
  {
    question: "Does fixing content signals improve my GEO score?",
    answer:
      "Yes—structure, schema, and trust are core inputs into the Signalor GEO score. Every fix maps to the expected score delta so engineering and content teams can prioritize.",
  },
  {
    question: "How often are signals re-scanned?",
    answer:
      "Workspace runs on the cadence your plan sets. Higher tiers enable faster re-scans for priority templates and side-by-side comparisons across launches.",
  },
] as const;
