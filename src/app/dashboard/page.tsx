"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getOrganizations } from "@/lib/api/organizations";
import { getRunList, startAnalysis } from "@/lib/api/analyzer";
import { getSubscriptionStatus } from "@/lib/api/payments";
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
 * - No subscription → /pricing
 * - No org → /onboarding/company-info (brand → platform → connect → analyze)
 * - Has org + runs → /dashboard/[slug]
 * - Has org, no runs → /onboarding/company-info
 */
function DashboardRedirect() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace(routes.signIn); return; }

    const email = session.user.email;

    getSubscriptionStatus(email)
      .then((sub) => {
        if (!sub.is_active) { router.replace("/pricing"); return; }
        return getOrganizations(email);
      })
      .then(async (orgs) => {
        if (!orgs) return;

        if (orgs.length === 0) {
          router.replace(routes.onboardingCompanyInfo);
          return;
        }

        const org = orgs[0];
        const runs = await getRunList(email, org.id);
        const activeRun = runs.find((r) => r.status !== "failed") ?? runs[0];

        if (activeRun) {
          router.replace(routes.dashboardProject(activeRun.slug));
        } else if (org.url) {
          // Has org + URL (from Shopify/WordPress connect) but no runs → auto-start analysis
          try {
            const analysis = await startAnalysis({
              url: org.url,
              run_type: "single_page",
              email,
              brand_name: org.name,
              org_id: org.id,
            });
            router.replace(routes.dashboardProject(analysis.slug));
          } catch {
            router.replace(routes.onboardingCompanyInfo);
          }
        } else {
          router.replace(routes.onboardingCompanyInfo);
        }
      })
      .catch(() => {
        router.replace(routes.onboardingCompanyInfo);
      });
  }, [isPending, session, router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignalorLoader size="lg" label="Loading..." />
    </div>
  );
}
