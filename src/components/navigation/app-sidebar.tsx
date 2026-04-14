"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  PlugZap,
  ChartNoAxesCombined,
  LayoutDashboard,
  ArrowLeft,
  User,
  LogOut,
} from "lucide-react";
import { Sidebar, SidebarBody } from "@/components/ui/sidebar";
import { routes } from "@/lib/config";
import { cn } from "@/lib/utils";
import { getRunBySlug } from "@/lib/api/analyzer";
import { signOut } from "@/lib/auth-client";

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
  const [signingOut, setSigningOut] = useState(false);

  // Match /dashboard/[slug]/analytics or /dashboard/[slug]/integrations
  const runMatch = pathname.match(
    /^\/dashboard\/([a-zA-Z0-9_-]+)\/(integrations|analytics)$/,
  );
  const slug = runMatch ? runMatch[1] : null;
  const runSubPage = runMatch?.[2] ?? null;
  const isRunScopedSubpage = slug !== null && !!runSubPage;

  useEffect(() => {
    if (!isRunScopedSubpage || !slug) {
      setRunUrl("");
      return;
    }
    getRunBySlug(slug)
      .then((r) => setRunUrl(r.url || ""))
      .catch(() => setRunUrl(""));
  }, [isRunScopedSubpage, slug]);

  const mainItems: LinkItem[] = useMemo(() => {
    const isIntegrationsPage =
      pathname === routes.settingsIntegrations ||
      pathname.startsWith(`${routes.settingsIntegrations}/`);
    const isAccountPage =
      pathname === routes.settingsAccount ||
      pathname.startsWith(`${routes.settingsAccount}/`);

    if (isRunScopedSubpage && slug) {
      return [
        {
          label: "Results",
          href: routes.dashboardProject(slug),
          icon: LayoutDashboard,
          active: false,
        },
        {
          label: "Analytics",
          href: routes.dashboardProjectAnalytics(slug),
          icon: ChartNoAxesCombined,
          active: pathname.endsWith("/analytics"),
        },
        {
          label: "Integrations",
          href: routes.dashboardProjectIntegrations(slug),
          icon: PlugZap,
          active: pathname.endsWith("/integrations"),
        },
        {
          label: "Projects",
          href: routes.dashboard,
          icon: ArrowLeft,
          active: false,
        },
      ];
    }

    return [
      {
        label: "Integrations",
        href: routes.settingsIntegrations,
        icon: PlugZap,
        active: isIntegrationsPage,
      },
      {
        label: "Account",
        href: routes.settingsAccount,
        icon: User,
        active: isAccountPage,
      },
    ];
  }, [isRunScopedSubpage, slug, pathname]);

  async function handleSignOut() {
    try {
      setSigningOut(true);
      await signOut();
      router.push(routes.signIn);
    } finally {
      setSigningOut(false);
    }
  }

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

            {open && isRunScopedSubpage && slug ? (
              <>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">Project</p>
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
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className={cn(
              "flex h-10 w-full items-center rounded-lg border transition-colors",
              open ? "justify-start gap-2.5 px-2.5" : "mx-auto size-10 justify-center px-0",
              "border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/40",
            )}
          >
            <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" />
            {open ? (
              <span className="text-sm text-foreground/85">
                {signingOut ? "Signing Out..." : "Sign Out"}
              </span>
            ) : null}
          </button>

        </div>
      </SidebarBody>
    </Sidebar>
  );
}
