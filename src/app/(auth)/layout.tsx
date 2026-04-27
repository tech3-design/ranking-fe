import type { Metadata } from "next";

import { AuthSiteShell } from "@/components/auth/auth-site-shell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sign in",
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
