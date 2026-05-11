export type BlogCategory =
  | "Playbooks"
  | "AI visibility"
  | "Product"
  | "Research"
  | "Guides";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  readingMinutes: number;
  publishedAt: string;
  author: string;
  authorRole: string;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  "Playbooks",
  "AI visibility",
  "Product",
  "Research",
  "Guides",
];

export const BLOG_FEATURED: BlogPost = {
  slug: "citation-source-attribution-playbook",
  title: "How to turn AI citation gaps into your next content sprint",
  excerpt:
    "A step-by-step playbook for reading the citation source attribution roll-up, picking the rival URLs worth beating, and shipping the page that wins the citation back — without guessing.",
  category: "Playbooks",
  readingMinutes: 9,
  publishedAt: "2026-04-18",
  author: "Arkit K",
  authorRole: "Signalor Studio",
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "what-gpt-actually-cites",
    title: "What ChatGPT actually cites — a 500-prompt study",
    excerpt:
      "We fired 500 buyer-intent prompts at ChatGPT with web search and measured which domains it cited. The answer is nothing like Google's top 10.",
    category: "Research",
    readingMinutes: 12,
    publishedAt: "2026-04-14",
    author: "Signalor Research",
    authorRole: "Data team",
    },
  {
    slug: "llms-txt-what-it-is",
    title: "llms.txt: what it is, who honors it, and what to publish",
    excerpt:
      "The llms.txt proposal has gone from niche to near-standard in six months. Here's an honest read on which engines actually respect it and what your file should contain.",
    category: "Guides",
    readingMinutes: 7,
    publishedAt: "2026-04-10",
    author: "Arkit K",
    authorRole: "Signalor Studio",
    },
  {
    slug: "five-factor-ai-visibility",
    title: "The 5-factor AI visibility framework, explained",
    excerpt:
      "Authority, content quality, structural extractability, semantic alignment, third-party validation — why these five factors beat legacy SEO rank signals for AI search.",
    category: "AI visibility",
    readingMinutes: 10,
    publishedAt: "2026-04-06",
    author: "Signalor Research",
    authorRole: "Data team",
    },
  {
    slug: "schema-that-moves-the-needle",
    title: "The 4 JSON-LD schemas that actually move the GEO needle",
    excerpt:
      "Most schema guides list 20+ types. We audited 3,400 AI-cited pages and found four do 80% of the work. Skip the rest until you ship these.",
    category: "Playbooks",
    readingMinutes: 6,
    publishedAt: "2026-04-03",
    author: "Arkit K",
    authorRole: "Signalor Studio",
    },
  {
    slug: "citation-source-attribution-shipped",
    title: "New: Citation source attribution (Phase 1 + 2 shipped)",
    excerpt:
      "Every Signalor project now captures which URLs AI engines cite — your pages, rival pages, and the domain roll-up. Pairs with auto-fix to close the content loop.",
    category: "Product",
    readingMinutes: 4,
    publishedAt: "2026-04-21",
    author: "Arkit K",
    authorRole: "Signalor Studio",
    },
  {
    slug: "perplexity-vs-chatgpt-visibility",
    title: "Perplexity vs ChatGPT: why your visibility split is wider than you think",
    excerpt:
      "The two engines rarely agree on who to cite. We walk through 6 real categories where the gap is 40+ points — and what to ship to close it on the engine you're losing.",
    category: "AI visibility",
    readingMinutes: 8,
    publishedAt: "2026-03-30",
    author: "Signalor Research",
    authorRole: "Data team",
    },
];

export const BLOG_STATS = [
  { label: "Posts published", value: "42", detail: "across Playbooks, Research, and Guides" },
  { label: "Avg read time", value: "7 min", detail: "concrete, shippable takeaways" },
  { label: "Newsletter", value: "12k+", detail: "GEO operators and agency leads" },
];

export const BLOG_NEWSLETTER = {
  title: "New GEO tactics every Thursday",
  description:
    "One email, one tactic, zero fluff — a short essay on a real citation win, a prompt trend, or a schema fix you can ship the same day.",
  cta: "Subscribe",
};
