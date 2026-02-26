"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  PlusCircle,
  History,
  PlugZap,
  ChartNoAxesCombined,
  LayoutDashboard,
  Rows3,
  Eye,
  Bot,
  ListChecks,
} from "lucide-react";
import { Sidebar, SidebarBody } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { routes } from "@/lib/config";
import { cn } from "@/lib/utils";
import { getRunDetail } from "@/lib/api/analyzer";

type LinkItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
};

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [runUrl, setRunUrl] = useState("");

  const runMatch = pathname.match(
    /^\/analyzer\/(\d+)(?:\/(history|integrations|analytics))?$/,
  );
  const runId = runMatch ? Number(runMatch[1]) : null;
  const runSubPage = runMatch?.[2] ?? null;
  const isRunScopedSubpage = runId !== null && !!runSubPage;

  useEffect(() => {
    if (!isRunScopedSubpage || !runId) {
      setRunUrl("");
      return;
    }
    getRunDetail(runId)
      .then((r) => setRunUrl(r.url || ""))
      .catch(() => setRunUrl(""));
  }, [isRunScopedSubpage, runId]);

  const mainItems: LinkItem[] = useMemo(() => {
    if (isRunScopedSubpage && runId) {
      return [
        { label: "Overview", href: `${routes.analyzerResults(runId)}?tab=overview`, icon: LayoutDashboard, active: false },
        { label: "Detailed", href: `${routes.analyzerResults(runId)}?tab=details`, icon: Rows3, active: false },
        { label: "Visibility", href: `${routes.analyzerResults(runId)}?tab=visibility`, icon: Eye, active: false },
        { label: "AI Logs", href: `${routes.analyzerResults(runId)}?tab=ai-logs`, icon: Bot, active: false },
        { label: "Traffic", href: `${routes.analyzerResults(runId)}?tab=traffic`, icon: ChartNoAxesCombined, active: false },
        { label: "Actions", href: `${routes.analyzerResults(runId)}?tab=actions`, icon: ListChecks, active: false },
      ];
    }

    return [
      { label: "New Analysis", href: routes.analyzer, icon: PlusCircle, active: pathname === routes.analyzer },
      { label: "History", href: routes.analyzerHistory, icon: History, active: pathname === routes.analyzerHistory },
      { label: "Integrations", href: routes.settingsIntegrations, icon: PlugZap, active: pathname === routes.settingsIntegrations },
    ];
  }, [isRunScopedSubpage, runId, pathname]);

  const quickItems: LinkItem[] = useMemo(() => {
    if (isRunScopedSubpage && runId) {
      return [
        {
          label: "Analytics",
          href: routes.analyzerAnalytics(runId),
          icon: ChartNoAxesCombined,
          active: pathname === routes.analyzerAnalytics(runId),
        },
        {
          label: "Integrations",
          href: routes.analyzerIntegrations(runId),
          icon: PlugZap,
          active: pathname === routes.analyzerIntegrations(runId),
        },
        {
          label: "History",
          href: routes.analyzerRunHistory(runId),
          icon: History,
          active: pathname === routes.analyzerRunHistory(runId),
        },
        {
          label: "New Analysis",
          href: routes.analyzer,
          icon: PlusCircle,
          active: false,
        },
      ];
    }

    return [];
  }, [isRunScopedSubpage, runId, pathname]);

  return (
    <Sidebar open={open} setOpen={setOpen} hoverExpand={false}>
      <SidebarBody className="justify-between gap-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="mb-3 border-b border-border/50 pb-3">
            <div className={cn("flex items-center", open ? "justify-start gap-2" : "justify-center")}>
              <div className="rounded-md bg-primary/20 p-1.5 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              {open ? <span className="text-sm font-semibold text-foreground">Signalor GEO</span> : null}
            </div>

            {open && isRunScopedSubpage && runId ? (
              <>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">Run #{runId}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{runUrl || "Loading..."}</p>
              </>
            ) : null}
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {mainItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href + item.label}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "flex h-10 w-full items-center rounded-lg border transition-colors",
                    open ? "justify-start gap-2.5 px-2.5" : "mx-auto size-10 justify-center px-0",
                    item.active
                      ? "border-primary/60 bg-primary/25 text-primary shadow-sm shadow-primary/10"
                      : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/40",
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", item.active ? "text-primary" : "text-muted-foreground")} />
                  {open ? (
                    <span className={cn("text-sm", item.active ? "text-primary" : "text-foreground/85")}>
                      {item.label}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 border-t border-border/50 pt-3">
          {quickItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href + item.label}
                type="button"
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex h-10 w-full items-center rounded-lg border transition-colors",
                  open ? "justify-start gap-2.5 px-2.5" : "mx-auto size-10 justify-center px-0",
                  item.active
                    ? "border-primary/60 bg-primary/25 text-primary shadow-sm shadow-primary/10"
                    : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/40",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", item.active ? "text-primary" : "text-muted-foreground")} />
                {open ? (
                  <span className={cn("text-sm", item.active ? "text-primary" : "text-foreground/85")}>
                    {item.label}
                  </span>
                ) : null}
              </button>
            );
          })}

          {open ? (
            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/40 p-2">
              <span className="text-xs text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          ) : (
            <div className="mx-auto flex size-10 items-center justify-center rounded-lg border border-border/50 bg-background/40">
              <ThemeToggle />
            </div>
          )}
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
