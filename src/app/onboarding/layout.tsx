import type { Metadata } from "next";
import { AuthSiteShell } from "@/components/auth/auth-site-shell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Onboarding",
  description: "Set up your Signalor workspace.",
  path: "/onboarding",
  noindex: true,
});

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSiteShell contentClassName="max-w-xl" subtleGrid>
      {children}
    </AuthSiteShell>
  );
}
