import { NextRequest, NextResponse } from "next/server";

// ──────────────────────────────────────────────────────────────────────────
// Real-search autocomplete signal — ranked by popularity
//
// Google Suggest + DuckDuckGo Instant Answer both return suggestions in
// roughly popularity order. We preserve that order via position-weighted
// scoring so the top of our list reflects queries users actually search.
// ──────────────────────────────────────────────────────────────────────────

type DDGSuggestion = { phrase?: string };
type DDGListSuggestion = [string, string[]];

type Source = "google" | "duckduckgo";

interface ScoredSuggestion {
  text: string;
  score: number; // 0..100 — higher = more likely searched
  sources: Source[];
  tier: "high" | "medium" | "low";
}

const STOP_WORDS = new Set([
  "the", "a", "an", "to", "for", "of", "in", "on", "with", "and", "or", "is",
  "are", "how", "what", "when", "where", "why", "who", "from", "by", "about",
  "near", "best",
]);

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

function scoreTopics(
  suggestions: string[],
  brandName: string,
): Array<{ topic: string; count: number }> {
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

function buildImprovementTips(
  topics: Array<{ topic: string; count: number }>,
  brandName: string,
): string[] {
  const tips: string[] = [];
  for (const { topic } of topics) {
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
  // Dedupe
  const seen = new Set<string>();
  return tips.filter((t) => {
    const k = normalize(t);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 6);
}

function parseDuckSuggestions(data: unknown): string[] {
  if (!Array.isArray(data)) return [];
  if (data.length > 0 && typeof data[0] === "object" && data[0] !== null && "phrase" in (data[0] as Record<string, unknown>)) {
    return (data as DDGSuggestion[]).map((d) => d.phrase ?? "").filter(Boolean);
  }
  if (typeof data[0] === "string" && Array.isArray(data[1])) {
    return (data as DDGListSuggestion)[1].map((s) => String(s).trim()).filter(Boolean);
  }
  return [];
}

async function fetchDuckDuckGoSuggestions(query: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; SignalorBot/1.0)",
        },
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    return parseDuckSuggestions(data);
  } catch {
    return [];
  }
}

async function fetchGoogleSuggestions(query: string): Promise<string[]> {
  // Google Suggest's firefox client returns: ["query", ["s1","s2",...]]
  // Suggestions are returned in rough popularity order — we preserve that.
  try {
    const res = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    if (Array.isArray(data) && Array.isArray(data[1])) {
      return (data[1] as unknown[]).map((s) => String(s).trim()).filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
}

function tierFromScore(score: number): "high" | "medium" | "low" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

/**
 * Merge suggestions from multiple seeds and sources into a ranked list.
 * Scoring: each suggestion starts with a source-weighted base (Google > DDG),
 * gets a position bonus inversely proportional to its index in the source
 * list (earlier = more popular), and a cross-source bonus when the same text
 * shows up in both providers.
 */
function buildRankedSuggestions(
  perSeedGoogle: string[][],
  perSeedDdg: string[][],
): ScoredSuggestion[] {
  const bag = new Map<
    string,
    { text: string; rawScore: number; sources: Set<Source> }
  >();

  const bump = (
    rawList: string[],
    source: Source,
    sourceWeight: number,
  ) => {
    rawList.forEach((text, idx) => {
      const clean = text.trim();
      if (!clean) return;
      const key = normalize(clean);
      // Position bonus — Google/DDG roughly order by popularity.
      // idx=0 contributes ~1.0, idx=9 contributes ~0.1.
      const positionWeight = Math.max(0.1, 1 - idx / 12);
      const existing = bag.get(key);
      const add = sourceWeight * positionWeight;
      if (existing) {
        existing.rawScore += add;
        existing.sources.add(source);
      } else {
        bag.set(key, {
          text: clean,
          rawScore: add,
          sources: new Set([source]),
        });
      }
    });
  };

  // Google gets a slightly higher weight — stronger popularity signal.
  perSeedGoogle.forEach((list) => bump(list, "google", 1.2));
  perSeedDdg.forEach((list) => bump(list, "duckduckgo", 1.0));

  const rows = [...bag.values()];
  if (rows.length === 0) return [];

  // Cross-source bonus — appearing in BOTH providers is a strong signal
  for (const r of rows) {
    if (r.sources.has("google") && r.sources.has("duckduckgo")) {
      r.rawScore *= 1.25;
    }
  }

  // Normalize to 0..100 by max raw score
  const maxRaw = Math.max(...rows.map((r) => r.rawScore));
  const scored: ScoredSuggestion[] = rows.map((r) => {
    const score = Math.round((r.rawScore / maxRaw) * 100);
    return {
      text: r.text,
      score,
      sources: [...r.sources].sort(),
      tier: tierFromScore(score),
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { brandName?: string; brandUrl?: string };
    const brandName = (body.brandName ?? "").trim();
    if (!brandName) {
      return NextResponse.json({ error: "brandName is required" }, { status: 400 });
    }

    // Intent-rich seeds that most real buyers actually search.
    const seeds = [
      brandName,
      `${brandName} pricing`,
      `${brandName} reviews`,
      `${brandName} alternatives`,
      `${brandName} vs`,
      `${brandName} features`,
      `${brandName} problems`,
      `${brandName} login`,
      `is ${brandName}`,
      `${brandName} worth it`,
    ];

    const [googleLists, ddgLists] = await Promise.all([
      Promise.all(seeds.map(fetchGoogleSuggestions)),
      Promise.all(seeds.map(fetchDuckDuckGoSuggestions)),
    ]);

    const ranked = buildRankedSuggestions(googleLists, ddgLists).slice(0, 32);

    // Fallback when both providers returned nothing (rate-limited, etc.)
    const fallback = ranked.length === 0
      ? [
          `${brandName} pricing`,
          `${brandName} reviews`,
          `${brandName} alternatives`,
          `${brandName} vs competitors`,
          `${brandName} features`,
          `${brandName} support`,
        ].map((text, idx) => ({
          text,
          score: Math.max(10, 60 - idx * 8),
          sources: [] as Source[],
          tier: tierFromScore(Math.max(10, 60 - idx * 8)),
        }))
      : ranked;

    const plainTextList = fallback.map((r) => r.text);
    const topTopics = scoreTopics(plainTextList, brandName);
    const improvements = buildImprovementTips(topTopics, brandName);

    return NextResponse.json({
      source: "google+duckduckgo-autocomplete",
      seeds,
      // Legacy field — kept for backwards compat (plain strings, already ranked).
      suggestions: plainTextList,
      // New: each suggestion + its score (0..100) + source provenance.
      rankedSuggestions: fallback,
      topTopics,
      improvements,
      brandUrl: body.brandUrl ?? "",
    });
  } catch {
    return NextResponse.json({ error: "Failed to load search insights" }, { status: 500 });
  }
}
