import { Plug, Workflow, Zap, LinkIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const INTEGRATIONS_SITE = {
  title: "Recommendations",
  description:
    "Prioritized fixes ranked by impact on your GEO score and citations — schema, structure, content, and trust in one queue.",
} as const;

export const INTEGRATIONS_HERO = {
  titleLine1: "Ship the",
  titleBadge: "AI",
  titleLine2: "fixes that actually",
  titleAccent: "move citations",
  subhead:
    "Connect Shopify, WordPress, analytics, and publishing workflows so Signalor routes GEO audits, schema tasks, and alerts into the systems your team lives in.",
  footnote:
    "CMS publishing · analytics ingest · webhook hooks on higher tiers",
  primaryCta: "Browse integrations",
  secondaryCta: "Run free GEO audit",
} as const;

export const INTEGRATIONS_HUB_CARDS: {
  slug: string;
  href: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  cta: string;
}[] = [
  {
    slug: "shopify",
    href: "/integration/shopify",
    title: "Shopify",
    description:
      "One-click GEO fixes for product pages, schema, and content — live on your storefront without extra engineering.",
    Icon: Plug,
    cta: "Open Shopify app",
  },
  {
    slug: "wordpress",
    href: "/integration/wordpress",
    title: "WordPress",
    description:
      "Apply schema, meta, and robots fixes directly to posts and pages via the Signalor GEO plugin.",
    Icon: Workflow,
    cta: "Open WP plugin",
  },
];

export const INTEGRATIONS_PROOF_METRICS = [
  { value: "8+", label: "Active integrations" },
  { value: "1-click", label: "Apply fixes from GEO score" },
  { value: "2x", label: "Faster schema roll-outs" },
  { value: "0", label: "Extra tooling to install" },
] as const;

export const INTEGRATIONS_PILLAR_ROWS = [
  { label: "Publishing", value: 78, tone: "bg-[#2563eb]/80" },
  { label: "Analytics", value: 66, tone: "bg-emerald-500/90" },
  { label: "Alerts", value: 54, tone: "bg-amber-500/90" },
] as const;

export const INTEGRATIONS_CAPABILITY_ROWS = [
  {
    icon: Plug,
    title: "CMS publishing",
    description:
      "Ship approved schema, meta, and content fixes directly to Shopify and WordPress — no copy-paste tickets.",
  },
  {
    icon: Zap,
    title: "Workflow triggers",
    description:
      "Fire alerts into Slack, email, and project tools when citations drop or new recommendations appear.",
  },
  {
    icon: Workflow,
    title: "Analytics ingest",
    description:
      "Sync GA4, Search Console, and log data so GEO recommendations tie back to revenue, not vanity signals.",
  },
  {
    icon: LinkIcon,
    title: "API & webhooks",
    description:
      "Exposed scoring and recommendation endpoints let internal tools, agencies, and BI dashboards stay in sync.",
  },
] as const;

export const INTEGRATIONS_FEATURES_INTRO = {
  eyebrow: "[ integrations ]",
  titleBefore: "Everything you need to",
  titleAccent: "operationalize GEO",
  description:
    "Signalor plugs into the systems your team already uses. Audit, approve, and ship fixes to production without switching tools or writing glue scripts.",
} as const;

export const INTEGRATIONS_FEATURE_CELLS = [
  {
    title: "Prioritized fix queue",
    description:
      "Every recommendation ranked by GEO impact and effort — ship what moves citations first, not what is easiest to click.",
    mock: {
      kind: "impactList" as const,
      items: [
        { title: "Add Organization JSON-LD", impact: 8, effort: "M" as const, impactTone: "red" as const },
        { title: "Tighten /pricing FAQ schema", impact: 5, effort: "S" as const, impactTone: "amber" as const },
        { title: "Rewrite /docs intros", impact: 6, effort: "L" as const, impactTone: "blue" as const },
        { title: "Publish author bios", impact: 3, effort: "S" as const, impactTone: "emerald" as const },
      ],
    },
  },
  {
    title: "Impact-ranked backlog",
    description:
      "See every open recommendation alongside estimated GEO lift — so PMs, engineers, and SEOs work the same priority list.",
    mock: {
      kind: "impactList" as const,
      items: [
        { title: "HowTo schema on /guides", impact: 7, effort: "M" as const, impactTone: "blue" as const },
        { title: "Fix broken canonicals", impact: 6, effort: "S" as const, impactTone: "red" as const },
        { title: "Add FAQ blocks /solutions", impact: 4, effort: "M" as const, impactTone: "amber" as const },
      ],
    },
  },
  {
    title: "Score lift projection",
    description:
      "Model the GEO score and citation lift you unlock if you ship the top 3 recommendations this sprint.",
    mock: {
      kind: "scoreCard" as const,
      label: "Projected GEO",
      score: "82",
      suffix: "/100",
      delta: "+10",
      bars: [
        { widthClass: "w-10", tone: "bg-[#2563eb]/80", label: "From schema fixes · +6" },
        { widthClass: "w-7", tone: "bg-emerald-500/90", label: "From content · +3" },
        { widthClass: "w-6", tone: "bg-amber-500/90", label: "From trust · +1" },
      ],
    },
  },
  {
    title: "Alert routing",
    description:
      "Citation drops, new recommendations, and schema warnings fire into Slack, email, and issue trackers — before stakeholders notice.",
    mock: {
      kind: "alertList" as const,
      items: [
        { title: "Mention drop · ChatGPT", meta: "Slack · #geo-alerts", dot: "red" as const, badge: "Fired", badgeTone: "red" as const },
        { title: "Schema regression", meta: "Linear · INF-142", dot: "amber" as const, badge: "Issue", badgeTone: "neutral" as const },
        { title: "Citation recovered", meta: "Perplexity · email digest", dot: "emerald" as const, badge: "OK", badgeTone: "emerald" as const },
      ],
    },
  },
  {
    title: "API & webhooks",
    description:
      "Pull scores, recommendations, and run history into internal dashboards or external BI—with stable, typed endpoints.",
    mock: {
      kind: "citationBar" as const,
      leftLabel: "API coverage",
      rightLabel: "Roadmap",
      leftPct: 72,
      list: [
        { dot: "emerald" as const, text: "/v1/scores · live" },
        { dot: "emerald" as const, text: "/v1/recommendations · live" },
        { dot: "amber" as const, text: "/v1/webhooks · beta" },
      ],
    },
  },
  {
    title: "Agency multi-site",
    description:
      "Manage client sites under one roof — switch workspaces, scope permissions, and roll deltas into recurring QBR decks.",
    mock: {
      kind: "competitorBars" as const,
      title: "Client sites connected",
      window: "This qtr",
      rows: [
        { name: "Agency A", pct: "14", pctNum: 70, barClass: "bg-[#2563eb]" },
        { name: "Agency B", pct: "9", pctNum: 45, barClass: "bg-neutral-400" },
        { name: "Agency C", pct: "5", pctNum: 25, barClass: "bg-neutral-300" },
      ],
    },
  },
];

export const INTEGRATIONS_FEATURES_FOOTER_CTAS = {
  primary: "Browse integrations",
  secondary: "Open Shopify app",
  secondaryHref: "/integration/shopify",
} as const;

export const INTEGRATIONS_WHY = {
  eyebrow: "[ why integrations ]",
  titleBefore: "GEO wins when it ships",
  titleAccent: "inside your stack",
  titleAfter: "not beside it",
  intro:
    "Audit tools collect dust if fixes never reach production. Signalor integrations route schema work, alerts, and analytics into the systems your team already lives in—so visibility gains compound.",
  proofTitle: "Proof in numbers",
  proofBody:
    "What integrated GEO looks like versus teams still copy-pasting schema between tools and CMSes.",
  liveTitle: "Live preview",
  liveBody:
    "The workflow review strategists run before shipping a schema change — anchored to the integration that actually applies the fix.",
  livePrompt:
    "Which platform makes GEO fixes easiest to roll out across 20 stores?",
  liveAnswerParts: [
    { t: "Teams often recommend " },
    { t: "Signalor", variant: "brand" as const },
    { t: " for fleet-level rollouts; the Shopify app pushes schema fixes cleanly and the " },
    { t: "WordPress plugin", variant: "link" as const },
    { t: " covers the long tail of marketing sites in one click." },
  ],
  coverageTitle: "Integration coverage",
  coverageBody:
    "Roll up how much of your stack is connected — publishing, analytics, alerts — so the next investment closes the biggest operational gap.",
  coverageScoreLabel: "Stack",
  coverageScore: "66",
  coverageSuffix: "/100",
  coverageDelta: "+12",
  citedLabel: "Connected",
  missedLabel: "Missing",
  citedPct: "58%",
  missedPct: "42%",
  coverageCitedBarPct: 58,
  shipTitle: "What you ship",
  shipBody:
    "The integration work your team turns on weekly—from CMS publishers to alert routes that keep stakeholders ahead of AI answer drift.",
} as const;

export const INTEGRATIONS_FAQ = [
  {
    question: "Which CMS platforms can publish GEO fixes automatically?",
    answer:
      "Shopify (via the Signalor app) and WordPress (via the Signalor GEO plugin) publish approved schema, meta, and content fixes directly. Additional CMS support is actively on the roadmap.",
  },
  {
    question: "Can I connect analytics tools like GA4?",
    answer:
      "Yes — Signalor reads GA4 and Search Console on plans that include analytics bridging, so citation lift ties to revenue, sessions, and assisted conversions.",
  },
  {
    question: "Do you support webhooks or a public API?",
    answer:
      "Scores and recommendations are exposed via stable, typed endpoints. Webhooks are in beta — tell us what event coverage you need via sales.",
  },
  {
    question: "Is there an agency multi-site view?",
    answer:
      "Agencies can manage multiple client workspaces under one parent account, scope permissions, and roll recurring citation reports into client decks.",
  },
] as const;
