// 4-step "how it works" content for the landing page.
// Each step has a number, a short title, a one-line body, and a key for the
// matching mini-illustration inside `landing-how-it-works.tsx`.

export type HowItWorksStep = {
  n: number;
  title: string;
  body: string;
  illo: "connect" | "audit" | "track" | "ship";
};

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    n: 1,
    title: "Connect your site",
    body: "Paste your domain, pick a market, and (optionally) link Shopify or WordPress — no code required.",
    illo: "connect",
  },
  {
    n: 2,
    title: "Run a GEO audit",
    body: "Signalor scores citability, schema, E-E-A-T, technical, entity, and AI visibility in one 0-100 read.",
    illo: "audit",
  },
  {
    n: 3,
    title: "Track prompts & citations",
    body: "We fire your tracked prompts at ChatGPT, Claude, Gemini, and Perplexity weekly and capture every cited URL.",
    illo: "track",
  },
  {
    n: 4,
    title: "Ship the fix queue",
    body: "Prioritized recommendations with auto-fix for schema & meta on Shopify and WordPress — or export for your team.",
    illo: "ship",
  },
];
