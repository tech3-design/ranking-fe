"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { checkOrganizationExists } from "@/lib/api/organizations";
import { routes } from "@/lib/config";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.push(routes.signIn);
      return;
    }

    checkOrganizationExists(session.user.email)
      .then((exists) => {
        if (exists) setVerified(true);
        else router.replace(routes.onboardingCompanyInfo);
      })
      .catch(() => setVerified(true));
  }, [isPending, session, router]);

  if (isPending || !session || !verified) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  async function handleSignOut() {
    await signOut();
    router.push(routes.signIn);
  }

  const actions = [
    {
      title: "Run New Analysis",
      description: "Start a fresh GEO scan for a page or domain.",
      href: routes.analyzer,
      cta: "Open Analyzer",
    },
    {
      title: "Review History",
      description: "Track score improvements and previous runs.",
      href: routes.analyzerHistory,
      cta: "View History",
    },
    {
      title: "Connect Integrations",
      description: "Sync GA4 and Shopify to align score with outcomes.",
      href: routes.settingsIntegrations,
      cta: "Manage Integrations",
    },
  ];

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Dashboard
            </p>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {actions.map((item) => (
            <Card key={item.title} className="glass-card border-border/70">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={item.href}>{item.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
