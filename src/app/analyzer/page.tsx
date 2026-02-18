"use client";

import { useSession } from "@/lib/auth-client";
import { UrlInputForm } from "@/components/analyzer/url-input-form";
import { RunHistoryList } from "@/components/analyzer/run-history-list";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AnalyzerPage() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <UrlInputForm email={email} />
      {email && <RunHistoryList email={email} />}
    </div>
  );
}
