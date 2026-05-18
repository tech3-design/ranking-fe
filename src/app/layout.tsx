import type { Metadata, Viewport } from "next";
import { Inter, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { JsonLd } from "@/components/seo/json-ld";
import { ClarityInit } from "@/components/analytics/clarity";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { ReferralCapture } from "@/components/analytics/referral-capture";
import { AffiliateCapture } from "@/components/analytics/affiliate-capture";
import { Amplitude } from "@/amplitude";
import { CookieConsentBanner } from "@/components/cookies/cookie-consent";
import { QueryProvider } from "@/components/providers/query-provider";
import {
  buildMetadata,
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

// export const metadata: Metadata = {
//   ...buildMetadata({
//     title: undefined,
//     description:
//       "Signalor is the GEO + AEO platform that scores, monitors, and improves how ChatGPT, Claude, Gemini, Perplexity, and Google AI cite your brand.",
//     path: "/",
//   }),
//   title: {
//     default: "Signalor.ai | AI search visibility & GEO platform",
//     template: "%s | Signalor.ai",
//   },
// };

export const metadata: Metadata = {
  title: {
    default: "Signalor.ai | AI search visibility & GEO platform",
    template: "%s | Signalor.ai",
  },

  description:
    "Signalor is the GEO + AEO platform that scores, monitors, and improves how ChatGPT, Claude, Gemini, Perplexity, and Google AI cite your brand.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${fontSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Signalor Blog"
          href="/blog/rss.xml"
        />
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        <JsonLd id="ld-organization" data={organizationJsonLd()} />
        <JsonLd id="ld-website" data={websiteJsonLd()} />
        <JsonLd id="ld-software" data={softwareApplicationJsonLd()} />
      </head>
      <body
        suppressHydrationWarning
        className={`signalor-body ${fontSerif.variable} ${fontMono.variable} overflow-x-hidden antialiased`}
      >
        <Amplitude />
        <ClarityInit />
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <ReferralCapture />
          <AffiliateCapture />
        </Suspense>
        <QueryProvider>{children}</QueryProvider>
        <CookieConsentBanner />
        <Analytics />
        <SpeedInsights />
        <Script
          src="https://guide.signalor.ai/~gitbook/embed/script.js"
          strategy="afterInteractive"
          onLoad={() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const gb = (window as any).GitBook;
            if (typeof gb === "function") {
              gb("configure", {
                button: { label: "Ask AI", icon: "assistant" },
              });
            }
          }}
        />
      </body>
    </html>
  );
}
