/**
 * Short brand facts for analysis / loading states — SEO + GEO, Signalor voice.
 */
import { useEffect, useState } from "react";

export const GEO_LOADING_FACTS: readonly string[] = [
  "GEO measures how AI cites your brand—not just traditional blue-link rankings.",
  "Answer engines favor clear entities, schema, and copy models can quote with confidence.",
  "llms.txt is a fast signal for crawlers about what your site is for and where to look.",
  "Structured data turns key pages into sources assistants are more likely to trust.",
  "Technical health—HTTPS, speed, and crawlability—still gates what GPT and Claude can use.",
  "E-E-A-T signals overlap with what generative search uses to judge trust at a glance.",
  "Prompt tracking shows where you show up in AI answers—and where rivals do instead.",
  "Robots.txt and sitemaps still steer which URLs make it into model training and retrieval.",
  "Product pages with specific, factual descriptions win more mentions in shopping chats.",
  "Canonical URLs reduce duplicate noise that can dilute how models summarize your brand.",
  "AI meta and crawler directives help you be deliberate about bot access—not accidental.",
  "Generative visibility rewards authoritative, helpful content over keyword-stuffed pages.",
  "Schema, policies, and contact clarity all feed the same “is this legit?” signal.",
  "Signalor scores how likely major models are to recommend you—then shows what to fix.",
];

export function useRotatingGeoFactIndex(intervalMs = 4200) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % GEO_LOADING_FACTS.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return { index, facts: GEO_LOADING_FACTS };
}
