import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Settings",
  path: "/settings",
  noindex: true,
});

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
