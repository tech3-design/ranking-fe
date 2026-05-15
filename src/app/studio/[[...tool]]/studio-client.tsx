"use client";

import dynamic from "next/dynamic";
import config from "../../../../sanity.config";
import { sanityConfigured, sanityConfigError } from "../../../sanity/env";

// Sanity Studio (and its deps) touch `window` at module evaluation, which
// crashes Next.js' default SSR pass for Client Components. Loading it via
// next/dynamic with ssr:false skips the server-render entirely — the page
// returns a tiny shell from the server and Sanity boots up in the browser.
const NextStudio = dynamic(
  () => import("next-sanity/studio").then((m) => m.NextStudio),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "system-ui, sans-serif",
          color: "#64748b",
        }}
      >
        Loading Sanity Studio…
      </div>
    ),
  },
);

export function StudioClient() {
  if (!sanityConfigured) {
    return (
      <main style={{ padding: 48, fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          Sanity Studio is not configured
        </h1>
        <p style={{ marginBottom: 8, color: "#475569" }}>{sanityConfigError}</p>
        <p style={{ fontSize: 14, color: "#64748b" }}>
          Set the env vars in Vercel project settings and redeploy without build cache.
        </p>
      </main>
    );
  }
  return <NextStudio config={config} />;
}
