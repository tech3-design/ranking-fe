export const INTEGRATION_HUB_CARDS = [
  {
    slug: "shopify" as const,
    href: "/integration/shopify",
    title: "Shopify",
    description:
      "Sync products, collections, and storefront content so GEO scoring reflects what shoppers actually see.",
    logoSrc: "/logos/shopify.svg",
  },
  {
    slug: "wordpress" as const,
    href: "/integration/wordpress",
    title: "WordPress",
    description:
      "Pull posts, pages, and schema from your CMS to track how AI-ready your editorial footprint is.",
    logoSrc: "/logos/wordpress.svg",
  },
];

export const INTEGRATION_HUB_STATS = [
  { label: "Connectors", value: "2+", detail: "Shopify & WordPress today" },
  { label: "Sync model", value: "Scheduled", detail: "Re-score after content changes" },
  { label: "Data scope", value: "Read-only", detail: "No storefront or DB writes from marketing pages" },
] as const;

export const INTEGRATION_HUB_FAQ = [
  {
    question: "Do I need a paid Signalor plan to connect Shopify or WordPress?",
    answer:
      "You can explore integration docs and marketing pages on any plan. Connecting a live store or site to your workspace follows the same rules as the rest of the product—start free, then upgrade when you need saved runs and team features.",
  },
  {
    question: "What data is pulled from Shopify?",
    answer:
      "Typical syncs include catalog structure, key product fields, and theme-visible content that affects how models describe your brand. Exact fields can evolve; the dashboard always shows what was used in the latest scoring pass.",
  },
  {
    question: "How does WordPress integration handle plugins?",
    answer:
      "We focus on public HTML and structured data your site outputs—SEO plugins that inject JSON-LD, sitemaps, and canonical URLs help. Admin-only or gated content is not fetched unless it is reachable the same way a crawler would see it.",
  },
  {
    question: "Can I disconnect an integration?",
    answer:
      "Yes. From workspace settings you can disconnect Shopify or WordPress at any time. Historical audit runs stay in your history; new syncs stop immediately after disconnect.",
  },
] as const;

export const SHOPIFY_INTEGRATION_PAGE = {
  title: "Shopify",
  headline: "GEO signals from your real storefront",
  subhead:
    "Connect Shopify so Signalor can align audits with products, collections, and the story your theme tells—without replacing your stack.",
  bullets: [
    "Product and collection metadata feed citation and entity signals.",
    "Theme-visible copy helps models ground answers in what shoppers see.",
    "Scheduled syncs keep scores honest after launches and promos.",
  ],
} as const;

export const WORDPRESS_INTEGRATION_PAGE = {
  title: "WordPress",
  headline: "Editorial and schema, wired into GEO",
  subhead:
    "Connect WordPress to roll posts, pages, and plugin-generated schema into the same visibility model you use for the rest of your site.",
  bullets: [
    "Classic and block content both contribute to on-page signals.",
    "Popular SEO plugins’ JSON-LD is reflected in structured-data checks.",
    "Sitemaps and canonical patterns inform crawlability insights.",
  ],
} as const;

export const INTEGRATION_DETAIL_FAQ = [
  {
    question: "Is my admin password shared with Signalor?",
    answer:
      "No. OAuth or app-style tokens are used where the platform supports them; you grant only the scopes required for read-oriented syncs described in settings.",
  },
  {
    question: "How fast does data update after I publish?",
    answer:
      "Updates follow the sync schedule configured for your workspace. For large catalogs or busy blogs, the first sync after connect can take longer than incremental updates.",
  },
  {
    question: "Where do I manage the live connection?",
    answer:
      "Use Integrations inside your Signalor workspace (same surface as analytics connectors). Marketing pages on this site are overview only.",
  },
] as const;
