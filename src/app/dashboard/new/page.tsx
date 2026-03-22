"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getOrganizations } from "@/lib/api/organizations";
import { routes } from "@/lib/config";
import { UrlInputForm } from "@/components/analyzer/url-input-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function NewProjectPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [orgId, setOrgId] = useState<number | undefined>();
  const [orgName, setOrgName] = useState<string | undefined>();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.push(routes.signIn);
      return;
    }

    getOrganizations(session.user.email)
      .then((orgs) => {
        if (orgs.length === 0) {
          router.replace(routes.onboardingCompanyInfo);
          return;
        }
        setOrgId(orgs[0].id);
        setOrgName(orgs[0].name);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [isPending, session, router]);

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
            <h1 className="text-lg font-semibold">New Analysis</h1>
            <p className="text-xs text-muted-foreground">
              Analyze a URL for AI visibility and optimization.
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
