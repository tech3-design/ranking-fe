import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Auth",
  path: "/auth",
  noindex: true,
});

export default function AuthCallbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
