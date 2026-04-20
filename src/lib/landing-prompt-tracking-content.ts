import { Bell, LayoutGrid, Link2, ListChecks } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Hub + marketing metadata */
export const PROMPT_TRACKING_SITE = {
  title: "Prompt monitoring",
  description:
    "Monitor AI prompts and surfaces where your brand should appear—aligned with Signalor GEO scoring, citations, and prioritized fixes.",
} as const;

export const PROMPT_TRACKING_HERO = {
  titleLine1: "Monitor",
  titleBadge: "AI",
  titleLine2: "prompts like a",
  titleAccent: "product surface",
  subhead:
    "Capture the questions buyers ask models about your category, then tie answers to citations, GEO scores, and the schema and content work your team already prioritizes.",
  footnote:
    "Surface-aware views · saved run history · exports and digests on higher tiers",
  primaryCta: "Start tracking",
  secondaryCta: "Run free GEO audit",
} as const;

export const PROMPT_TRACKING_HUB_CARDS: {
  slug: string;
  href: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  cta: string;
}[] = [
  {
    slug: "ai-surfaces",
    href: "/prompt-tracking/ai-surfaces",
    title: "AI surfaces",
    description:
      "Group prompts by where answers appear—assistants, AI Overviews, answer engines—so PMM and SEO chase the same buyer moments.",
    Icon: LayoutGrid,
    cta: "Learn more",
  },
  {
    slug: "prompt-library",
    href: "/prompt-tracking/prompt-library",
    title: "Prompt library",
    description:
      "Own branded, category, and head-to-head prompts in one list. Snapshot before and after launches to prove GEO work moved the answer.",
    Icon: ListChecks,
    cta: "Learn more",
  },
];

/** “Proof in numbers” — landing-why-signalor pattern */
export const PROMPT_TRACKING_PROOF_METRICS = [
  { value: "50+", label: "Prompts per workspace" },
  { value: "8+", label: "Surfaces & engines" },
  { value: "24h", label: "Typical refresh window" },
  { value: "1:1", label: "Links to GEO score" },
] as const;

export const PROMPT_TRACKING_PILLAR_ROWS = [
  { label: "Branded", value: 72, tone: "bg-[#2563eb]/80" },
  { label: "Category", value: 64, tone: "bg-emerald-500/90" },
  { label: "Competitive", value: 58, tone: "bg-amber-500/90" },
] as const;

export const PROMPT_TRACKING_CAPABILITY_ROWS = [
  {
    icon: LayoutGrid,
    title: "Surface-aware views",
    description:
      "Roll the same prompt family across ChatGPT-style answers, overviews, and assistants your buyers actually use.",
  },
  {
    icon: ListChecks,
    title: "Libraries & tags",
    description:
      "Tag prompts by funnel, region, or campaign so weekly readouts stay legible for execs—not buried in spreadsheets.",
  },
  {
    icon: Bell,
    title: "Drift alerts",
    description:
      "Surface when mentions, citations, or omissions move after a launch—before competitors spot the gap in their own tooling.",
  },
  {
    icon: Link2,
    title: "Tied to GEO fixes",
    description:
      "Jump from a weak answer into prioritized schema, entity, and content tasks already ranked inside Signalor.",
  },
] as const;

export const PROMPT_TRACKING_FEATURES_INTRO = {
  eyebrow: "[ prompt tracking ]",
  titleBefore: "Everything you need to",
  titleAccent: "watch AI answers",
  description:
    "Generative engines summarize, cite, or skip you in full sentences. Prompt tracking keeps your roadmap aligned with those answers—not only with where a blue link ranked last Tuesday.",
} as const;

export type PromptTrackingChatAnswerPart =
  | { t: string }
  | { t: string; variant: "brand" }
  | { t: string; variant: "link" };

export type PromptTrackingFeatureMock =
  | {
      kind: "chat";
      prompt: string;
      answerParts: PromptTrackingChatAnswerPart[];
    }
  | {
      kind: "library";
      rows: { q: string; tag: string; tagLetter: string; tone: string; meta: string }[];
    }
  | {
      kind: "citationBar";
      leftLabel: string;
      rightLabel: string;
      leftPct: number;
      list: { dot: "emerald" | "amber" | "neutral"; text: string }[];
    }
  | {
      kind: "scoreCard";
      label: string;
      score: string;
      suffix: string;
      delta: string;
      bars: { widthClass: string; tone: string; label: string }[];
    }
  | {
      kind: "alertList";
      items: {
        title: string;
        meta: string;
        dot: "red" | "amber" | "emerald";
        badge: string;
        badgeTone: "red" | "neutral" | "emerald";
      }[];
    }
  | {
      kind: "competitorBars";
      title: string;
      window: string;
      rows: { name: string; pct: string; pctNum: number; barClass: string }[];
    }
  | {
      kind: "engineGrid";
      engines: {
        name: string;
        initial: string;
        tone: string;
        coverage: number;
        trend: "up" | "flat" | "down";
      }[];
    }
  | {
      kind: "impactList";
      items: {
        title: string;
        impact: number;
        effort: "S" | "M" | "L";
        impactTone: "red" | "amber" | "emerald" | "blue";
      }[];
    }
  | {
      kind: "trendingList";
      items: {
        prompt: string;
        velocity: string;
        direction: "up" | "new";
        surface: string;
      }[];
    };

export const PROMPT_TRACKING_FEATURE_CELLS: {
  title: string;
  description: string;
  mock: PromptTrackingFeatureMock;
}[] = [
  {
    title: "AI surfaces",
    description:
      "Replay the same prompt across assistants and overviews—see where you are cited, paraphrased, or absent before you rewrite a page.",
    mock: {
      kind: "chat",
      prompt: "Best project management tool for a 40-person product team?",
      answerParts: [
        { t: "Teams often shortlist " },
        { t: "Signalor PM", variant: "brand" },
        { t: " and " },
        { t: "Northwind", variant: "link" },
        {
          t: " for roadmaps—Signalor is cited for integrations and rollout templates; Northwind leads on Gantt-first workflows.",
        },
      ],
    },
  },
  {
    title: "Prompt library",
    description:
      "Curate branded, category, and head-to-head prompts, then compare runs after schema or copy ships—without losing context in side docs.",
    mock: {
      kind: "library",
      rows: [
        { q: "Why Signalor vs …", tag: "Branded", tagLetter: "B", tone: "bg-[#2563eb]", meta: "Last run · 2h ago" },
        { q: "Best CRM for SMB…", tag: "Category", tagLetter: "C", tone: "bg-emerald-600", meta: "Last run · 6h ago" },
        { q: "Acme vs us · pricing", tag: "Comp", tagLetter: "C", tone: "bg-amber-500", meta: "Last run · 1d ago" },
      ],
    },
  },
  {
    title: "Citation mix",
    description:
      "For each prompt set, see how often your URLs are cited versus competitors or skipped—so SEO invests in the URLs models actually reuse.",
    mock: {
      kind: "citationBar",
      leftLabel: "Your domain",
      rightLabel: "Rest",
      leftPct: 46,
      list: [
        { dot: "emerald", text: "/pricing · cited" },
        { dot: "amber", text: "/docs/api · partial" },
        { dot: "neutral", text: "/blog/geo · missing" },
      ],
    },
  },
  {
    title: "Topic rollups",
    description:
      "Stack-rank themes—pricing objections, security questions, integrations—by share of voice inside answers, not just search volume.",
    mock: {
      kind: "scoreCard",
      label: "Coverage",
      score: "68",
      suffix: "/100",
      delta: "+9",
      bars: [
        { widthClass: "w-10", tone: "bg-[#2563eb]/80", label: "Pricing prompts · 34%" },
        { widthClass: "w-7", tone: "bg-emerald-500/90", label: "Security · 28%" },
        { widthClass: "w-6", tone: "bg-amber-500/90", label: "Integrations · 22%" },
      ],
    },
  },
  {
    title: "Alert queue",
    description:
      "Prompt-level deltas surface like a fix queue—so PMM, SEO, and comms triage the same drops and recoveries after every launch.",
    mock: {
      kind: "alertList",
      items: [
        {
          title: 'Dropped on “best CRM”',
          meta: "ChatGPT · since launch",
          dot: "red",
          badge: "New",
          badgeTone: "red",
        },
        {
          title: "Partial cite on /security",
          meta: "Perplexity · 1d",
          dot: "amber",
          badge: "Watch",
          badgeTone: "neutral",
        },
        {
          title: "Brand mention recovered",
          meta: "Gemini · schema shipped",
          dot: "emerald",
          badge: "OK",
          badgeTone: "emerald",
        },
      ],
    },
  },
  {
    title: "Competitor lens",
    description:
      "Compare mention share for the same prompt basket—built for agency QBRs and internal exec reviews, not one-off screenshots.",
    mock: {
      kind: "competitorBars",
      title: "Share of mentions",
      window: "7d",
      rows: [
        { name: "You", pct: "41%", pctNum: 41, barClass: "bg-[#2563eb]" },
        { name: "Acme", pct: "39%", pctNum: 39, barClass: "bg-neutral-400" },
        { name: "Northwind", pct: "20%", pctNum: 20, barClass: "bg-neutral-300" },
      ],
    },
  },
];

export const PROMPT_TRACKING_FEATURES_FOOTER_CTAS = {
  primary: "Start tracking",
  secondary: "Explore AI surfaces",
  secondaryHref: "/prompt-tracking/ai-surfaces",
} as const;

export const PROMPT_TRACKING_WHY = {
  eyebrow: "[ why track prompts ]",
  titleBefore: "Prompts are the new",
  titleAccent: "shelf space",
  titleAfter: "for AI buyers",
  intro:
    "When models cite a competitor—or never name you—traditional rank trackers will not explain why. Signalor links prompts to surfaces, citations, and GEO fixes so growth, product, and SEO react to one signal.",
  proofTitle: "Proof in numbers",
  proofBody:
    "Benchmarks teams cite when they graduate from SERP dashboards to generative visibility programs inside Signalor.",
  liveTitle: "Live preview",
  liveBody:
    "The same answer review strategists run in a doc—before you ship schema, copy, or positioning—now anchored to saved prompts and surfaces.",
  livePrompt:
    "Who is winning GEO citations for enterprise analytics this quarter?",
  liveAnswerParts: [
    { t: "Models frequently cite " },
    { t: "Signalor", variant: "brand" },
    { t: " for implementation playbooks, while " },
    { t: "Acme", variant: "link" },
    {
      t: " still owns generic “what is GEO” answers—tighten Organization JSON-LD on /docs to close the gap.",
    },
  ] satisfies readonly PromptTrackingChatAnswerPart[],
  coverageTitle: "Prompt coverage",
  coverageBody:
    "Roll up visibility across prompt families so you know which themes need content, schema, or entity work next—not only which URL moved.",
  coverageScoreLabel: "Coverage",
  coverageScore: "68",
  coverageSuffix: "/100",
  coverageDelta: "+9",
  citedLabel: "Cited",
  missedLabel: "Missed",
  citedPct: "52%",
  missedPct: "48%",
  /** Width (%) of the “cited” segment in the preview bar */
  coverageCitedBarPct: 52,
  shipTitle: "What you ship",
  shipBody:
    "The surfaces your team touches weekly—from curated prompts to alerts that route straight into GEO execution.",
} as const;

export const PROMPT_TRACKING_HUB_FAQ = [
  {
    question: "How is prompt tracking different from traditional rank tracking?",
    answer:
      "Rank trackers optimize for blue links on a results page. Prompt tracking follows how assistants and AI overviews answer specific questions—whether your brand, URLs, or competitors are named, cited, paraphrased, or skipped entirely.",
  },
  {
    question: "Which AI surfaces can I monitor?",
    answer:
      "Coverage depends on your plan: Starter emphasizes Gemini and Google-style experiences, while Pro and Max add additional engines as sampling methods mature. The workspace always shows which surfaces were used for the latest run.",
  },
  {
    question: "Can I import prompts in bulk?",
    answer:
      "Yes—curate lists and grouped themes inside the workspace. Bulk import and API sync are on the roadmap for teams migrating from spreadsheets or legacy monitoring stacks.",
  },
  {
    question: "Do tracked prompts change my GEO score?",
    answer:
      "GEO scoring still starts from your site signals. Prompt tracking adds an execution layer: it shows whether the story your pages tell actually appears in the answers your tracked prompts trigger.",
  },
  {
    question: "How do alerts reach my team?",
    answer:
      "Workspace notifications highlight deltas on priority prompts. Pair alerts with exports when you need a static snapshot for email or slides.",
  },
] as const;

export const AI_SURFACES_PAGE = {
  title: "AI surfaces",
  headline: "Know which answers matter for your category",
  subhead:
    "Organize prompts by the AI experiences buyers trust—so product marketing, SEO, and comms align on the same surfaces instead of a single SERP snapshot that hides generative results.",
  bullets: [
    "Surface rollups show where you are over-represented, under-represented, or absent across engines on your plan.",
    "Compare how the same prompt behaves where multi-engine coverage is enabled—spot drift before it shows up in revenue.",
    "Pair surface trends with GEO recommendations so the next schema or copy fix targets the answers buyers actually see.",
  ],
} as const;

export const PROMPT_LIBRARY_PAGE = {
  title: "Prompt library",
  headline: "Curate prompts like a product surface",
  subhead:
    "Group branded, category, and competitive prompts in one library. Version lists alongside campaigns and snapshot results after launches to prove GEO work moved the answer.",
  bullets: [
    "Tag prompts by funnel stage, region, or product line so weekly readouts stay legible for executives.",
    "Snapshot before/after major releases to connect citation movement to the schema and content tasks you shipped.",
    "Export-friendly layouts for agencies sharing recurring visibility readouts with clients.",
  ],
} as const;

export const PROMPT_TRACKING_DETAIL_FAQ = [
  {
    question: "Where do I manage prompts after I sign up?",
    answer:
      "Prompt lists, tags, and surface filters live in your Signalor workspace under Prompts. The pages on this site are marketing overviews only.",
  },
  {
    question: "How often are answers refreshed?",
    answer:
      "Refresh cadence follows your plan and workspace settings. Higher tiers prioritize fresher sampling for strategic prompts and competitive baskets.",
  },
  {
    question: "Can I share read-only access with stakeholders?",
    answer:
      "Workspace roles separate who can edit prompts from who can view dashboards. Use exports when you need a static snapshot outside the product.",
  },
] as const;

export const PROMPT_TRACKING_SURFACES_FAQ = [
  ...PROMPT_TRACKING_DETAIL_FAQ,
  {
    question: "Can I weight one surface higher than another?",
    answer:
      "Yes—mark priority surfaces inside the workspace so rollups and alerts emphasize the experiences your buyers rely on most (for example, assistant-style answers vs. overview cards).",
  },
] as const;

export const PROMPT_TRACKING_LIBRARY_FAQ = [
  ...PROMPT_TRACKING_DETAIL_FAQ,
  {
    question: "How do libraries stay in sync with campaigns?",
    answer:
      "Tag prompts with the same campaign IDs or themes you use in project management. When a campaign closes, archive the basket without losing historical snapshots.",
  },
] as const;
