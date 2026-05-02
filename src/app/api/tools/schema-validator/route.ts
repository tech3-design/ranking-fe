import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type SchemaStatus = "ok" | "partial" | "invalid";

interface SchemaFinding {
  type: string;
  status: SchemaStatus;
  fieldCount: number;
  missing: string[];
  note?: string;
}

const REQUIRED_FIELDS: Record<string, string[]> = {
  Organization: ["name", "url"],
  LocalBusiness: ["name", "address", "telephone"],
  Product: ["name", "image", "offers"],
  Article: ["headline", "author", "datePublished"],
  BlogPosting: ["headline", "author", "datePublished"],
  NewsArticle: ["headline", "author", "datePublished"],
  FAQPage: ["mainEntity"],
  HowTo: ["name", "step"],
  BreadcrumbList: ["itemListElement"],
  Recipe: ["name", "recipeIngredient", "recipeInstructions"],
  Event: ["name", "startDate", "location"],
  Person: ["name"],
  WebSite: ["name", "url"],
  WebPage: ["name"],
  VideoObject: ["name", "thumbnailUrl", "uploadDate"],
  Review: ["reviewBody", "author"],
  AggregateRating: ["ratingValue", "reviewCount"],
};

function normalizeUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    const u = new URL(t.startsWith("http") ? t : `https://${t}`);
    return u.toString();
  } catch {
    return null;
  }
}

function extractJsonLdBlocks(html: string): string[] {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    out.push(m[1].trim());
  }
  return out;
}

function typeOfNode(node: unknown): string | null {
  if (!node || typeof node !== "object") return null;
  const t = (node as Record<string, unknown>)["@type"];
  if (typeof t === "string") return t;
  if (Array.isArray(t) && t.length > 0 && typeof t[0] === "string") return t[0];
  return null;
}

function flattenGraph(parsed: unknown): unknown[] {
  if (!parsed) return [];
  if (Array.isArray(parsed)) return parsed.flatMap(flattenGraph);
  if (typeof parsed === "object") {
    const o = parsed as Record<string, unknown>;
    if (Array.isArray(o["@graph"])) return flattenGraph(o["@graph"]);
    return [parsed];
  }
  return [];
}

function analyzeNode(node: unknown): SchemaFinding | null {
  const type = typeOfNode(node);
  if (!type) return null;
  const obj = node as Record<string, unknown>;
  const keys = Object.keys(obj).filter((k) => !k.startsWith("@"));
  const required = REQUIRED_FIELDS[type] ?? [];
  const missing = required.filter((r) => {
    const v = obj[r];
    return v === undefined || v === null || (Array.isArray(v) && v.length === 0) || v === "";
  });
  let status: SchemaStatus = "ok";
  if (required.length === 0) {
    status = keys.length > 0 ? "ok" : "invalid";
  } else if (missing.length > 0) {
    status = missing.length >= required.length ? "invalid" : "partial";
  }
  return { type, status, fieldCount: keys.length, missing };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { url?: string };
    const normalized = normalizeUrl(body.url ?? "");
    if (!normalized) {
      return NextResponse.json({ error: "A valid URL is required." }, { status: 400 });
    }

    let res: Response;
    try {
      res = await fetch(normalized, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; SignalorBot/1.0; +https://signalor.ai)",
          Accept: "text/html,application/xhtml+xml",
        },
        cache: "no-store",
        redirect: "follow",
      });
    } catch {
      return NextResponse.json(
        { error: "Couldn't reach that URL. Check spelling and that it's public." },
        { status: 502 },
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `URL returned ${res.status}. Make sure it's publicly accessible.` },
        { status: 502 },
      );
    }

    const html = await res.text();
    const blocks = extractJsonLdBlocks(html);
    const findings: SchemaFinding[] = [];
    let invalidBlocks = 0;

    for (const raw of blocks) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        invalidBlocks += 1;
        continue;
      }
      const nodes = flattenGraph(parsed);
      for (const n of nodes) {
        const f = analyzeNode(n);
        if (f) findings.push(f);
      }
    }

    const dedupedByType = new Map<string, SchemaFinding>();
    for (const f of findings) {
      const prev = dedupedByType.get(f.type);
      if (!prev) {
        dedupedByType.set(f.type, f);
      } else if (prev.status !== "ok" && f.status === "ok") {
        dedupedByType.set(f.type, f);
      }
    }

    const summary = {
      url: normalized,
      totalBlocks: blocks.length,
      invalidBlocks,
      findings: [...dedupedByType.values()].sort((a, b) => a.type.localeCompare(b.type)),
    };

    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ error: "Validation failed. Try another URL." }, { status: 500 });
  }
}
