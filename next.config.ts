import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";

// In dev we need to allow the local backend (http://localhost:8000), the
// ipapi.co geolocation call, and Vercel/Amplitude/Clarity remote config
// endpoints that aren't in the prod allowlist. We also need ws://localhost:*
// for Turbopack HMR.
const devConnectSrc = isDev
  ? [
      "http://localhost:* ws://localhost:* http://127.0.0.1:*",
      "https://ipapi.co",
      "https://va.vercel-scripts.com",
      "https://sr-client-cfg.amplitude.com",
      "https://gs.amplitude.com",
    ]
  : [];

const devScriptSrc = isDev ? ["https://va.vercel-scripts.com", "https://scripts.clarity.ms"] : [];

const CSP = [
  "default-src 'self'",
  // Next.js inline scripts + third-party analytics/tracking
  [
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://cdn.amplitude.com",
    "https://www.clarity.ms",
    "https://c.bing.com",
    ...devScriptSrc,
  ].join(" "),
  // Tailwind inline styles + Google Fonts
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Sanity image CDN, analytics pixels, data URIs
  "img-src 'self' https: data: blob:",
  // Google Fonts files
  "font-src 'self' https://fonts.gstatic.com data:",
  // API calls, analytics endpoints, DuckDuckGo autocomplete (server-proxied)
  [
    "connect-src 'self'",
    "https://api.signalor.ai",
    "https://staging-api.signalor.ai",
    "https://staging.api.signalor.ai",
    "https://staging.signalor.ai",
    "https://cdn.sanity.io",
    "https://bf4vwhx5.api.sanity.io",
    "https://bf4vwhx5.apicdn.sanity.io",
    "https://api.amplitude.com",
    "https://api2.amplitude.com",
    "https://analytics.amplitude.com",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://www.clarity.ms",
    "https://c.bing.com",
    // Local backend in dev
    ...(process.env.NODE_ENV === "development"
      ? ["http://localhost:8000", "http://127.0.0.1:8000"]
      : []),
  ].join(" "),
  // Dodo Payments redirects to their checkout URL; no frames needed from us
  "frame-src https://checkout.dodopayments.com https://app.dodopayments.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // upgrade-insecure-requests forces http→https; never enable in dev (would
  // upgrade http://localhost:8000 and break the local backend connection)
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  // Native addon; do not bundle into the Next.js server graph.
  serverExternalPackages: ["better-sqlite3", "pg"],
  // Compiled next.config can live under .cache, so __dirname is not the app root. Turbopack
  // must resolve `@import "tailwindcss"` from ranking-fe (where package.json + node_modules are).
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [
      // Security headers on every route
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Immutable cache for hashed Next.js static chunks
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Public folder assets (icons, OG images, etc.)
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/:file(favicon.*|robots.txt|sitemap.xml)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
