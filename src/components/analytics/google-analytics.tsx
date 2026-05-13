"use client";

import Script from "next/script";
import { useConsentStore } from "@/lib/stores/consent-store";

const GA_ID = "G-5H7J1Q68TR";

/**
 * Google Analytics, gated behind the user's analytics consent. Only
 * renders the gtag <Script> tags after the user has accepted analytics.
 * Once they reject, GA never loads at all on this page load (a refresh
 * after toggling preferences is enough to unload it).
 */
export function GoogleAnalytics() {
  const analytics = useConsentStore((s) => s.analytics);
  const hydrated = useConsentStore((s) => s.hydrated);

  if (!hydrated || !analytics) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
