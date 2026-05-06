import type { Metadata } from "next";
import { AuthSiteShell } from "@/components/auth/auth-site-shell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sign in",
  description: "Sign in or create your Signalor account.",
  path: "/sign-in",
  noindex: true,
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthSiteShell>{children}</AuthSiteShell>;
}
