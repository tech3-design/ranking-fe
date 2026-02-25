"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { UrlInputForm } from "@/components/analyzer/url-input-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { routes } from "@/lib/config";

export default function AnalyzerPage() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  return (
    <div className="relative min-h-screen">
      <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 md:px-8">
        <header className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">GEO Analyzer</h1>
            <p className="text-xs text-muted-foreground">
              Start a fresh scan and track optimization progress.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={routes.analyzerHistory}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              History
            </Link>
            <Link
              href={routes.settingsIntegrations}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Integrations
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center py-4 md:py-12">
          <UrlInputForm email={email} />
        </div>
      </div>
    </div>
  );
}
