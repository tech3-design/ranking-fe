import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type DDGListSuggestion = [string, string[]];
type DDGSuggestion = { phrase?: string };

function parseDuck(data: unknown): string[] {
  if (!Array.isArray(data)) return [];
  if (data.length > 0 && typeof data[0] === "object" && data[0] !== null && "phrase" in (data[0] as Record<string, unknown>)) {
    return (data as DDGSuggestion[]).map((d) => d.phrase ?? "").filter(Boolean);
  }
  if (typeof data[0] === "string" && Array.isArray(data[1])) {
    return (data as DDGListSuggestion)[1].map((s) => String(s).trim()).filter(Boolean);
  }
  return [];
}

async function fetchDuck(query: string, timeoutMs = 5000): Promise<string[]> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`, {
      signal: ctl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; SignalorBot/1.0)",
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return parseDuck(await res.json());
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

function deriveBrand(input: string): string {
  const t = input.trim().toLowerCase();
  const stripped = t.replace(/^https?:\/\//, "").replace(/^www\./, "");
  const host = stripped.split(/[/?#]/)[0];
  const parts = host.split(".");
  if (parts.length >= 2) return parts[0];
  return host;
}

const STOP = new Set([
  "vs",
  "versus",
  "comparison",
  "review",
  "reviews",
  "pricing",
  "alternative",
  "alternatives",
  "discount",
  "coupon",
  "login",
  "com",
  "net",
  "org",
  "io",
  "ai",
  "app",
  "the",
  "and",
  "or",
  "for",
  "of",
  "to",
  "a",
  "an",
  "best",
  "top",
  "free",
  "what",
  "is",
  "are",
]);

function extractRivals(suggestions: string[], brand: string): Map<string, number> {
  const counts = new Map<string, number>();
  const brandLc = brand.toLowerCase();

  for (const s of suggestions) {
    const lc = s.toLowerCase();
    if (!lc.includes(brandLc)) continue;
    const afterVs = lc.split(/\bvs\.?\b|\bversus\b/);
    if (afterVs.length < 2) continue;
    const chunk = afterVs.slice(1).join(" ");
    const tokens = chunk
      .replace(/[^a-z0-9\s.-]/g, " ")
      .split(/\s+/)
      .map((t) => t.replace(/^[-.]+|[-.]+$/g, ""))
      .filter(Boolean);

    for (const raw of tokens) {
      if (raw.length < 3) continue;
      if (STOP.has(raw)) continue;
      if (raw === brandLc) continue;
      const clean = raw.replace(/\.com$|\.ai$|\.io$|\.net$|\.org$/, "");
      if (!clean || clean.length < 3 || STOP.has(clean)) continue;
      counts.set(clean, (counts.get(clean) ?? 0) + 1);
    }
  }
  return counts;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { url?: string };
    const raw = (body.url ?? "").trim();
    if (!raw) {
      return NextResponse.json({ error: "A domain or brand is required." }, { status: 400 });
    }
    const brand = deriveBrand(raw);
    if (!brand) {
      return NextResponse.json({ error: "Couldn't derive a brand from that input." }, { status: 400 });
    }

    const seeds = [
      `${brand} vs`,
      `${brand} alternatives`,
      `${brand} competitors`,
      `${brand} or`,
      `best alternatives to ${brand}`,
      `${brand} compared to`,
    ];
    const results = await Promise.all(seeds.map((q) => fetchDuck(q)));
    const flat = results.flat();
    const rivalCounts = extractRivals(flat, brand);
    const rivals = [...rivalCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        mentions: count,
      }));

    const totalMentions = rivals.reduce((s, r) => s + r.mentions, 0);
    const yourMentions = flat.filter((s) => s.toLowerCase().includes(brand.toLowerCase())).length;
    const grand = totalMentions + yourMentions;
    const you = {
      name: brand.charAt(0).toUpperCase() + brand.slice(1),
      mentions: yourMentions,
      sharePct: grand > 0 ? Math.round((yourMentions / grand) * 100) : 0,
    };
    const ranked = rivals.map((r) => ({
      ...r,
      sharePct: grand > 0 ? Math.round((r.mentions / grand) * 100) : 0,
    }));

    return NextResponse.json({
      brand,
      you,
      rivals: ranked,
      totalSuggestions: flat.length,
      note:
        ranked.length === 0
          ? "No competitive comparison queries found yet — this often means the brand is young or in a niche category."
          : undefined,
    });
  } catch {
    return NextResponse.json({ error: "Analysis failed. Try another domain." }, { status: 500 });
  }
}
