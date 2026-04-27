import type { Metadata } from "next";

export const siteConfig = {
  name: "Signalor",
  fullName: "Signalor.ai",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://signalor.ai",
  ogImage: "/Gemini_Generated_Image_89pqln89pqln89pq.png",
  description:
    "AI-powered brand visibility and GEO analysis platform. Score how ChatGPT, Claude, Gemini, and Perplexity see, cite, and recommend your brand.",
  twitter: "@signalorai",
  email: "hello@signalor.ai",
  keywords: [
    "GEO",
    "Generative Engine Optimization",
    "AI visibility",
    "AI search",
    "ChatGPT SEO",
    "Claude SEO",
    "Gemini SEO",
    "Perplexity SEO",
    "LLM SEO",
    "AI citations",
    "brand visibility",
    "answer engine optimization",
    "llms.txt",
  ],
} as const;

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

type BuildMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  keywords?: readonly string[] | string[];
};

export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  noindex = false,
  keywords,
}: BuildMetadataInput = {}): Metadata {
  const url = absoluteUrl(path);
  const desc = description ?? siteConfig.description;
  const ogImage = image ? absoluteUrl(image) : absoluteUrl(siteConfig.ogImage);

  return {
    title,
    description: desc,
    keywords: keywords ? [...keywords] : [...siteConfig.keywords],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: siteConfig.fullName,
      title: title ?? siteConfig.fullName,
      description: desc,
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteConfig.fullName }],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? siteConfig.fullName,
      description: desc,
      images: [ogImage],
      creator: siteConfig.twitter,
      site: siteConfig.twitter,
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
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
  };
}
