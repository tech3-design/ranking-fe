"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getOrganizations } from "@/lib/api/organizations";
import { getRunList, startAnalysis } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";
import { UrlInputForm } from "@/components/analyzer/url-input-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2 } from "lucide-react";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [autoAnalyzing, setAutoAnalyzing] = useState(false);
  const [orgId, setOrgId] = useState<number | undefined>();
  const [orgName, setOrgName] = useState<string | undefined>();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.push(routes.signIn);
      return;
    }

    const email = session.user.email;
    const shopifyStatus = searchParams.get("shopify");

    getOrganizations(email)
      .then(async (orgs) => {
        if (orgs.length === 0) {
          router.replace(routes.onboardingCompanyInfo);
          return;
        }

        const org = orgs[0];
        setOrgId(org.id);
        setOrgName(org.name);

        // If coming back from Shopify OAuth, auto-start analysis
        if (shopifyStatus === "connected" && org.url) {
          setAutoAnalyzing(true);
          try {
            const analysis = await startAnalysis({
              url: org.url,
              run_type: "single_page",
              email,
              brand_name: org.name,
              org_id: org.id,
            });
            router.replace(routes.dashboardProject(analysis.slug));
            return;
          } catch {
            setAutoAnalyzing(false);
          }
        }

        const runs = await getRunList(email, org.id);
        const activeRun = runs.find((r) => r.status !== "failed") ?? runs[0];
        if (activeRun) {
          router.replace(routes.dashboardProject(activeRun.slug));
        } else {
          setReady(true);
        }
      })
      .catch(() => setReady(true));
  }, [isPending, session, router, searchParams]);

  if (autoAnalyzing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Shopify connected! Starting analysis...
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#171717]">
      <BackgroundBeams />
      <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 md:px-8">
        <header className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">GEO Analyzer</h1>
            <p className="text-xs text-muted-foreground">
              Analyze your website for AI visibility and optimization.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center py-4 md:py-12">
          <UrlInputForm
            email={session?.user?.email ?? ""}
            orgId={orgId}
            orgName={orgName}
          />
        </div>
      </div>
    </div>
  );
}
