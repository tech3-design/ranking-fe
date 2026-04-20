import { AuthSiteShell } from "@/components/auth/auth-site-shell";

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
