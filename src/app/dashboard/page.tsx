"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getOrganizations } from "@/lib/api/organizations";
import { getRunList } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";
import { SignalorLoader } from "@/components/ui/signalor-loader";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <SignalorLoader size="lg" />
        </div>
      }
    >
      <DashboardRedirect />
    </Suspense>
  );
}

/**
 * This page is just a router:
 * - No session → /sign-in
 * - No org → /onboarding/company-info
 * - Has org + runs → /dashboard/[slug]
 * - Has org, no runs → /onboarding/company-info
 * Pricing is gated only when the user clicks Launch on onboarding (not here).
 */
function DashboardRedirect() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace(routes.signIn); return; }

    const email = session.user.email;

    getOrganizations(email)
      .then(async (orgs) => {
        if (orgs.length === 0) {
          router.replace(routes.onboardingCompanyInfo);
          return;
        }

        const org = orgs[0];
        const runs = await getRunList(email, org.id);

        if (runs.length > 0) {
          // Pick the best run: prefer complete/in-progress over failed
          const bestRun =
            runs.find((r) => r.status === "complete") ??
            runs.find((r) => r.status !== "failed") ??
            runs[0];
          router.replace(routes.dashboardProject(bestRun.slug));
        } else {
          router.replace(routes.onboardingCompanyInfo);
        }
      })
      .catch(() => {
        router.replace(routes.onboardingCompanyInfo);
      });
  }, [isPending, session, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignalorLoader size="lg" label="Loading..." />
    </div>
  );
}
