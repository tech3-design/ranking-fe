import type { Metadata } from "next";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://signalor.ai"
).replace(/\/$/, "");

export const SITE_NAME = "Signalor";
export const SITE_LEGAL_NAME = "Signalor Ltd.";
export const SITE_BRAND = "Signalor.ai";
export const SITE_TAGLINE =
  "AI search visibility & GEO platform";
export const SITE_DESCRIPTION =
  "Signalor is the Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO) platform that scores, monitors, and improves how ChatGPT, Claude, Gemini, Perplexity, and Google AI cite your brand.";

export const SITE_KEYWORDS = [
  "GEO",
  "Generative Engine Optimization",
  "AEO",
  "Answer Engine Optimization",
  "AI search visibility",
  "LLM SEO",
  "ChatGPT SEO",
  "Perplexity SEO",
  "Gemini SEO",
  "Claude citations",
  "AI citation tracking",
  "schema.org",
  "llms.txt",
  "brand visibility",
  "Signalor",
];

export const SITE_LOCALE = "en_US";
export const SITE_TWITTER = "@signalorai";
export const SITE_OG_IMAGE = `${SITE_URL}/icon.svg`;

export const ORG_SOCIAL = [
  "https://twitter.com/signalorai",
  "https://www.linkedin.com/company/signalor",
  "https://github.com/signalorai",
];

export const DEFAULT_OG = {
  type: "website" as const,
  siteName: SITE_NAME,
  locale: SITE_LOCALE,
  url: SITE_URL,
  images: [
    {
      url: SITE_OG_IMAGE,
      width: 1200,
      height: 630,
      alt: `${SITE_BRAND} — ${SITE_TAGLINE}`,
    },
  ],
};

type BuildMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noindex?: boolean;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
};

export function absoluteUrl(path = "/"): string {
  if (!path.startsWith("/")) return path;
  return `${SITE_URL}${path}`;
}

export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  keywords,
  noindex = false,
  ogImage,
  ogType = "website",
}: BuildMetadataInput = {}): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title ? `${title} | ${SITE_BRAND}` : `${SITE_BRAND} — ${SITE_TAGLINE}`;
  const image = ogImage || SITE_OG_IMAGE;

  return {
    title: title || `${SITE_BRAND} — ${SITE_TAGLINE}`,
    description,
    keywords: keywords ?? SITE_KEYWORDS,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_LEGAL_NAME, url: SITE_URL }],
    creator: SITE_LEGAL_NAME,
    publisher: SITE_LEGAL_NAME,
    category: "technology",
    alternates: { canonical: url },
    robots: noindex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: { index: false, follow: false, noimageindex: true },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      type: ogType,
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_TWITTER,
      creator: SITE_TWITTER,
      title: fullTitle,
      description,
      images: [image],
    },
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      shortcut: "/favicon.svg",
      apple: "/icon.svg",
    },
    manifest: "/manifest.webmanifest",
    metadataBase: new URL(SITE_URL),
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    other: {
      "theme-color": "#0a0a0a",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: SITE_LEGAL_NAME,
    legalName: SITE_LEGAL_NAME,
    alternateName: [SITE_BRAND, SITE_NAME],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon.svg`,
      width: 512,
      height: 512,
    },
    description: SITE_DESCRIPTION,
    sameAs: ORG_SOCIAL,
    foundingDate: "2024",
    knowsAbout: [
      "Generative Engine Optimization",
      "Answer Engine Optimization",
      "AI search visibility",
      "Large Language Model SEO",
      "Schema.org structured data",
      "Content citations in AI",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: SITE_BRAND,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}#organization` },
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}#software`,
    name: SITE_BRAND,
    operatingSystem: "Web",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "SEO",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}#organization` },
    offers: [
      {
        "@type": "Offer",
        name: "Starter",
        price: "19.99",
        priceCurrency: "GBP",
        url: `${SITE_URL}/pricing`,
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "49.99",
        priceCurrency: "GBP",
        url: `${SITE_URL}/pricing`,
      },
      {
        "@type": "Offer",
        name: "Max",
        price: "59.99",
        priceCurrency: "GBP",
        url: `${SITE_URL}/pricing`,
      },
    ],
    featureList: [
      "GEO scoring across six pillars",
      "AI visibility tracking on ChatGPT, Claude, Gemini, Perplexity",
      "Schema.org validation and recommendations",
      "Citation attribution and competitor benchmarking",
      "Prompt tracking and ranking",
      "Shopify and WordPress integrations",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function articleJsonLd(opts: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(opts.path),
    },
    image: opts.image || SITE_OG_IMAGE,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: {
      "@type": opts.author ? "Person" : "Organization",
      name: opts.author || SITE_LEGAL_NAME,
    },
    publisher: { "@id": `${SITE_URL}#organization` },
  };
}
