import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Payments",
  path: "/payments",
  noindex: true,
});

export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
