"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getOrganizations } from "@/lib/api/organizations";
import { routes } from "@/lib/config";
import { UrlInputForm } from "@/components/analyzer/url-input-form";
import { OrgSwitcher } from "@/components/analyzer/org-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useOrgStore } from "@/lib/stores/org-store";

export default function NewProjectPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const { setOrganizations, activeOrg } = useOrgStore();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.push(routes.signIn);
      return;
    }

    const email = session.user.email;

    getOrganizations(email)
      .then((orgs) => {
        if (orgs.length === 0) {
          router.replace(routes.onboardingCompanyInfo);
          return;
        }
        setOrganizations(orgs);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [isPending, session, router, setOrganizations]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 md:px-8">
        <header className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">New Project</h1>
            <p className="text-xs text-muted-foreground">
              Analyze a new URL for AI visibility and optimization.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <OrgSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center py-4 md:py-12">
          <UrlInputForm
            email={session?.user?.email ?? ""}
            orgId={activeOrg?.id}
            orgName={activeOrg?.name}
          />
        </div>
      </div>
    </div>
  );
}
