"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Calendar, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startAnalysis } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";
import { useRun } from "./run-context";

export function DashboardTopBarActions({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { run, loading } = useRun();
  const [scheduling, setScheduling] = useState(false);

  const email = session?.user?.email ?? "";
  const basePath = `/dashboard/${slug}`;

  async function handleScheduleAnalysis() {
    if (!email) return;
    if (!run) {
      router.push(basePath);
      return;
    }
    setScheduling(true);
    try {
      const newRun = await startAnalysis({
        url: run.url,
        run_type: "single_page",
        email,
        brand_name: run.brand_name,
      });
      router.push(routes.dashboardProject(newRun.slug));
    } catch {
      /* ignore — overview page can show errors if needed */
    } finally {
      setScheduling(false);
    }
  }

  const busy = scheduling || loading;
  const canStartNewRun = !!run && !!email;
  const canOpenOverview = !run && !loading;
  const scheduleDisabled =
    busy || (!canStartNewRun && !canOpenOverview) || (!!run && !email);

  return (
    <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onOpenSearch}
        className="hidden h-9 w-52 shrink-0 justify-start gap-2 border-neutral-200/90 bg-card px-3 text-[13px] font-normal text-muted-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-accent md:inline-flex"
      >
        <Search className="size-4 shrink-0 opacity-80" aria-hidden />
        <span className="flex-1 truncate text-left text-xs">Search…</span>
        <kbd className="pointer-events-none rounded border border-border bg-muted/80 px-1.5 py-px font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onOpenSearch}
        className="size-9 shrink-0 border-neutral-200/90 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:hidden"
        aria-label="Open search"
      >
        <Search className="size-4" />
      </Button>

      <Button
        type="button"
        variant="default"
        size="sm"
        disabled={scheduleDisabled}
        title={
          !email && !!run
            ? "Sign in to schedule a new analysis"
            : canOpenOverview
              ? "Open overview — set up or pick an analysis for this workspace"
              : "Start a new analysis run for this site"
        }
        className="hidden h-9 shrink-0 gap-2 bg-primary px-3 text-primary-foreground hover:bg-primary/90 md:inline-flex"
        onClick={() => void handleScheduleAnalysis()}
      >
        {scheduling ? (
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
        ) : (
          <Calendar className="size-4 shrink-0" aria-hidden />
        )}
        <span className="text-xs font-semibold">Schedule analysis</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={scheduleDisabled}
        className="inline-flex h-9 shrink-0 gap-1.5 border-neutral-200/90 bg-card px-2.5 text-xs font-medium text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:hidden"
        onClick={() => void handleScheduleAnalysis()}
      >
        {scheduling ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
        ) : (
          <Calendar className="size-3.5 shrink-0" aria-hidden />
        )}
        Schedule
      </Button>
    </div>
  );
}
