import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface LlmsCheckResult {
  domain: string;
  llmsTxt: { present: boolean; sections: number; note?: string };
  robots: {
    present: boolean;
    aiBots: Array<{ bot: string; allowed: boolean | null }>;
  };
  page: {
    ok: boolean;
    title: string | null;
    description: string | null;
    hasOrganizationSchema: boolean;
    hasOgTags: boolean;
    hasCanonical: boolean;
    sitemapReachable: boolean;
  };
  score: number;
}

const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
];

function rootUrl(raw: string): URL | null {
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return new URL(`${u.protocol}//${u.host}`);
  } catch {
    return null;
  }
}

async function fetchText(url: string, timeoutMs = 6000): Promise<{ ok: boolean; status: number; text: string }> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SignalorBot/1.0)",
      },
      cache: "no-store",
      redirect: "follow",
    });
    const text = res.ok ? await res.text() : "";
    return { ok: res.ok, status: res.status, text };
  } catch {
    return { ok: false, status: 0, text: "" };
  } finally {
    clearTimeout(t);
  }
}

function parseAiBotsFromRobots(robots: string): Array<{ bot: string; allowed: boolean | null }> {
  const lines = robots.split(/\r?\n/);
  const result: Array<{ bot: string; allowed: boolean | null }> = [];

  for (const bot of AI_BOTS) {
    let current: string | null = null;
    let matchedGroup = false;
    let disallowedRoot = false;

    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const ua = /^user-agent:\s*(.+)$/i.exec(line);
      if (ua) {
        current = ua[1].trim();
        matchedGroup = current.toLowerCase() === bot.toLowerCase();
        continue;
      }
      if (!matchedGroup) continue;
      const dis = /^disallow:\s*(.*)$/i.exec(line);
      if (dis && (dis[1].trim() === "/" || dis[1].trim() === "")) {
        if (dis[1].trim() === "/") disallowedRoot = true;
      }
    }

    if (!lines.some((l) => new RegExp(`user-agent:\\s*${bot}`, "i").test(l))) {
      result.push({ bot, allowed: null });
    } else {
      result.push({ bot, allowed: !disallowedRoot });
    }
  }
  return result;
}

function extractMeta(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']+)["']`,
    "i",
  );
  const m = re.exec(html);
  if (m) return m[1].trim();
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]*(?:name|property)=["']${name}["']`,
    "i",
  );
  const m2 = re2.exec(html);
  return m2 ? m2[1].trim() : null;
}

function extractTitle(html: string): string | null {
  const m = /<title>([^<]+)<\/title>/i.exec(html);
  return m ? m[1].trim() : null;
}

function hasLink(html: string, rel: string): boolean {
  return new RegExp(`<link[^>]+rel=["']${rel}["']`, "i").test(html);
}

function hasOrganizationSchema(html: string): boolean {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1].trim();
    try {
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      for (const n of arr) {
        if (!n || typeof n !== "object") continue;
        const t = (n as Record<string, unknown>)["@type"];
        if (t === "Organization" || (Array.isArray(t) && t.includes("Organization"))) return true;
        const graph = (n as Record<string, unknown>)["@graph"];
        if (Array.isArray(graph)) {
          for (const g of graph) {
            if (g && typeof g === "object") {
              const gt = (g as Record<string, unknown>)["@type"];
              if (gt === "Organization" || (Array.isArray(gt) && gt.includes("Organization"))) return true;
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }
  return false;
}

function countLlmsSections(text: string): number {
  return text.split(/\r?\n/).filter((l) => /^##?\s+/.test(l.trim())).length;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { url?: string };
    const root = rootUrl(body.url ?? "");
    if (!root) {
      return NextResponse.json({ error: "A valid domain is required." }, { status: 400 });
    }

    const [llmsTxtRes, robotsRes, homeRes, sitemapRes] = await Promise.all([
      fetchText(new URL("/llms.txt", root).toString()),
      fetchText(new URL("/robots.txt", root).toString()),
      fetchText(root.toString()),
      fetchText(new URL("/sitemap.xml", root).toString()),
    ]);

    const llmsTxt = {
      present: llmsTxtRes.ok && llmsTxtRes.text.trim().length > 0,
      sections: llmsTxtRes.ok ? countLlmsSections(llmsTxtRes.text) : 0,
    };

    const aiBots = robotsRes.ok ? parseAiBotsFromRobots(robotsRes.text) : [];
    const page = homeRes.ok
      ? {
          ok: true,
          title: extractTitle(homeRes.text),
          description: extractMeta(homeRes.text, "description"),
          hasOrganizationSchema: hasOrganizationSchema(homeRes.text),
          hasOgTags:
            /<meta[^>]+property=["']og:title["']/i.test(homeRes.text) ||
            /<meta[^>]+property=["']og:description["']/i.test(homeRes.text),
          hasCanonical: hasLink(homeRes.text, "canonical"),
          sitemapReachable: sitemapRes.ok,
        }
      : {
          ok: false,
          title: null,
          description: null,
          hasOrganizationSchema: false,
          hasOgTags: false,
          hasCanonical: false,
          sitemapReachable: sitemapRes.ok,
        };

    let score = 0;
    if (llmsTxt.present) score += 18;
    if (robotsRes.ok) score += 6;
    const allowedBots = aiBots.filter((b) => b.allowed !== false).length;
    score += Math.round((allowedBots / Math.max(1, aiBots.length || 1)) * 18);
    if (page.title) score += 8;
    if (page.description) score += 8;
    if (page.hasOrganizationSchema) score += 18;
    if (page.hasOgTags) score += 8;
    if (page.hasCanonical) score += 6;
    if (page.sitemapReachable) score += 10;

    const result: LlmsCheckResult = {
      domain: root.host,
      llmsTxt,
      robots: { present: robotsRes.ok, aiBots },
      page,
      score: Math.max(0, Math.min(100, score)),
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Check failed. Try another domain." }, { status: 500 });
  }
}
