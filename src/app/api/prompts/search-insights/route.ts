import { NextRequest, NextResponse } from "next/server";

type DDGSuggestion = { phrase?: string };
type DDGListSuggestion = [string, string[]];

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "to",
  "for",
  "of",
  "in",
  "on",
  "with",
  "and",
  "or",
  "is",
  "are",
  "how",
  "what",
  "when",
  "where",
  "why",
  "who",
  "from",
  "by",
  "about",
  "near",
  "best",
]);

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const item = raw.trim();
    if (!item) continue;
    const key = normalize(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function scoreTopics(suggestions: string[], brandName: string): Array<{ topic: string; count: number }> {
  const brand = normalize(brandName);
  const counts = new Map<string, number>();

  for (const suggestion of suggestions) {
    const cleaned = normalize(suggestion)
      .replace(brand, " ")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleaned) continue;
    for (const token of cleaned.split(" ")) {
      if (token.length < 3 || STOP_WORDS.has(token)) continue;
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([topic, count]) => ({ topic, count }));
}

function buildImprovementTips(topics: Array<{ topic: string; count: number }>, brandName: string): string[] {
  const tips: string[] = [];
  const topicWords = topics.map((t) => t.topic);

  for (const topic of topicWords) {
    if (topic.includes("price") || topic.includes("pricing") || topic.includes("cost")) {
      tips.push(`Create a clear ${brandName} pricing page with tier comparison, FAQs, and transparent limits.`);
      continue;
    }
    if (topic.includes("review") || topic.includes("rating") || topic.includes("trustpilot")) {
      tips.push(`Publish proof-focused review content and customer outcomes so ${brandName} appears stronger for trust queries.`);
      continue;
    }
    if (topic.includes("alternative") || topic.includes("vs") || topic.includes("compare")) {
      tips.push(`Build comparison pages: "${brandName} vs competitors" with honest differences and use-case fit.`);
      continue;
    }
    if (topic.includes("login") || topic.includes("support") || topic.includes("contact")) {
      tips.push(`Improve support and help-center SEO for ${brandName} with fast-answer pages and structured FAQs.`);
      continue;
    }
    tips.push(`Create dedicated content around "${topic}" tied to ${brandName} with direct answers and schema markup.`);
  }

  return dedupe(tips).slice(0, 6);
}

function parseDuckSuggestions(data: unknown): string[] {
  if (!Array.isArray(data)) return [];

  // Shape A: [{ phrase: "..." }, ...]
  if (data.length > 0 && typeof data[0] === "object" && data[0] !== null && "phrase" in (data[0] as Record<string, unknown>)) {
    return (data as DDGSuggestion[]).map((d) => d.phrase ?? "").filter(Boolean);
  }

  // Shape B: ["query", ["s1", "s2", ...]]
  if (typeof data[0] === "string" && Array.isArray(data[1])) {
    return (data as DDGListSuggestion)[1].map((s) => String(s).trim()).filter(Boolean);
  }

  return [];
}

async function fetchDuckDuckGoSuggestions(query: string): Promise<string[]> {
  const res = await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; SignalorBot/1.0)",
    },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as unknown;
  return parseDuckSuggestions(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { brandName?: string; brandUrl?: string };
    const brandName = (body.brandName ?? "").trim();
    if (!brandName) {
      return NextResponse.json({ error: "brandName is required" }, { status: 400 });
    }

    const seeds = [
      brandName,
      `${brandName} pricing`,
      `${brandName} reviews`,
      `${brandName} alternatives`,
      `${brandName} vs`,
      `${brandName} features`,
      `${brandName} problems`,
      `${brandName} benefits`,
    ];

    const all = await Promise.all(seeds.map((q) => fetchDuckDuckGoSuggestions(q)));
    const suggestions = dedupe(all.flat()).slice(0, 24);
    const safeSuggestions =
      suggestions.length > 0
        ? suggestions
        : dedupe([
            `${brandName} pricing`,
            `${brandName} reviews`,
            `${brandName} alternatives`,
            `${brandName} vs competitors`,
            `${brandName} features`,
            `${brandName} support`,
          ]);
    const topTopics = scoreTopics(safeSuggestions, brandName);
    const improvements = buildImprovementTips(topTopics, brandName);

    return NextResponse.json({
      source: "duckduckgo-autocomplete",
      seeds,
      suggestions: safeSuggestions,
      topTopics,
      improvements,
      brandUrl: body.brandUrl ?? "",
    });
  } catch {
    return NextResponse.json({ error: "Failed to load search insights" }, { status: 500 });
  }
}

