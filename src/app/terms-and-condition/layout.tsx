import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms and conditions",
  description:
    "The terms of service governing the use of Signalor.ai, including subscription, acceptable use, and liability terms.",
  path: "/terms-and-condition",
});

export default function TermsAltLayout({ children }: { children: React.ReactNode }) {
  return children;
}
