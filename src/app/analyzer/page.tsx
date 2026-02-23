"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { UrlInputForm } from "@/components/analyzer/url-input-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { routes } from "@/lib/config";

export default function AnalyzerPage() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center gap-6 p-4 dot-grid">
      <BackgroundBeams className="z-0" />
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Link
          href={routes.settingsIntegrations}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-border hover:bg-accent"
        >
          Integrations
        </Link>
        <Link
          href={routes.analyzerHistory}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-border hover:bg-accent"
        >
          History
        </Link>
        <ThemeToggle />
      </div>
      <div className="relative z-10">
        <UrlInputForm email={email} />
      </div>
    </div>
  );
}
