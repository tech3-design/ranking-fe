import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy policy",
  description:
    "How Signalor handles user, account, and crawl data. Plain-English overview of what we collect, why, and your rights.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
