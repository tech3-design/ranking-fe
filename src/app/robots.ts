import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const disallow = [
    "/api/",
    "/auth/",
    "/(auth)/",
    "/sign-in",
    "/sign-up",
    "/dashboard",
    "/dashboard/",
    "/onboarding",
    "/onboarding/",
    "/settings",
    "/settings/",
    "/payments",
    "/payments/",
    "/analyzer/",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow,
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "OAI-SearchBot",
          "PerplexityBot",
          "Perplexity-User",
          "ClaudeBot",
          "Claude-Web",
          "Claude-User",
          "Claude-SearchBot",
          "anthropic-ai",
          "Google-Extended",
          "Googlebot",
          "Bingbot",
          "DuckDuckBot",
          "Applebot",
          "Applebot-Extended",
          "CCBot",
          "Bytespider",
          "MistralAI-User",
          "Meta-ExternalAgent",
          "Amazonbot",
          "YouBot",
          "cohere-ai",
          "FacebookBot",
          "Diffbot",
        ],
        allow: ["/"],
        disallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
