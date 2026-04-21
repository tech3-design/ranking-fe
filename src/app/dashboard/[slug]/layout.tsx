"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getSubscriptionStatus } from "@/lib/api/payments";
import { getOrganizations, type Organization } from "@/lib/api/organizations";
import { getRunList } from "@/lib/api/analyzer";
import { useOrgStore } from "@/lib/stores/org-store";
import { routes } from "@/lib/config";
import { UserAvatar } from "@/components/ui/user-avatar";
import { RunProvider, useRun } from "./_components/run-context";
import { AnalysisOverlay } from "./_components/analysis-overlay";
import { ScoreBump } from "./_components/score-bump";
import {
  LayoutDashboard,
  ListChecks,
  Eye,
  Users,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  User,
  Settings,
  CreditCard,
  PlugZap,
  ArrowLeft,
  Bell,
  Building2,
  ChevronsUpDown,
  Check,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import LogoComp from "@/components/LogoComp";
import { AiChat } from "@/components/analyzer/ai-chat";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DashboardAppFrame,
  type DashboardAppSection,
} from "./_components/dashboard-app-frame";
import { CommandPalette } from "@/components/ui/command-palette";
import { DashboardTopBarActions } from "./_components/dashboard-top-bar-actions";

type MainNavItem =
  | { icon: LucideIcon; label: string; path: string; children?: undefined }
  | {
      icon: LucideIcon;
      label: string;
      path: string;
      children: { label: string; path: string }[];
    };

const MAIN_NAV: MainNavItem[] = [
  { icon: LayoutDashboard, label: "Overview", path: "" },
  { icon: ListChecks, label: "Recommendations", path: "/recommendations" },
  { icon: Eye, label: "Visibility", path: "/visibility" },
  { icon: Users, label: "Competitors", path: "/competitors" },
  {
    icon: MessageSquare,
    label: "Prompts",
    path: "/prompts",
    children: [
      { label: "Actions", path: "/prompts/actions" },
      { label: "Explorer", path: "/prompts/recommendations" },
      { label: "History", path: "/prompts/history" },
    ],
  },
];

const SETTINGS_NAV = [
  { icon: User, label: "Profile", path: "/settings/profile" },
  { icon: CreditCard, label: "Billing", path: "/settings/billing" },
  { icon: PlugZap, label: "Integrations", path: "/settings/integrations" },
  { icon: Bell, label: "Notifications", path: "/settings/notifications" },
];

function sectionForDashboardPath(pathname: string, basePath: string): DashboardAppSection {
  const rel = pathname === basePath ? "/" : pathname.slice(basePath.length) || "/";

  if (rel === "/") {
    return {
      title: "Overview",
      hint: "Scores, quick actions, and your latest GEO snapshot.",
    };
  }
  if (rel.startsWith("/recommendations")) {
    return {
      title: "Recommendations",
      hint: "Prioritized fixes to improve AI visibility and citations.",
    };
  }
  if (rel.startsWith("/visibility")) {
    return {
      title: "Visibility",
      hint: "How models and search surfaces see your brand.",
    };
  }
  if (rel.startsWith("/competitors")) {
    return {
      title: "Competitors",
      hint: "Benchmark rival brands across AI surfaces.",
    };
  }
  if (rel.startsWith("/prompts/actions")) {
    return {
      title: "Prompt actions",
      hint: "Tune prompts and automated follow-ups.",
    };
  }
  if (rel.startsWith("/prompts/recommendations")) {
    return {
      title: "Explorer",
      hint: "Explore suggested prompt sets for your properties.",
    };
  }
  if (rel.startsWith("/prompts/history")) {
    return {
      title: "Prompt history",
      hint: "Past runs and responses for this workspace.",
    };
  }
  if (rel.startsWith("/prompts/engine")) {
    return {
      title: "Prompt engine",
      hint: "Engine configuration and routing.",
    };
  }
  if (rel.startsWith("/prompts")) {
    return {
      title: "Prompts",
      hint: "Actions, recommendations, and history for AI prompts.",
    };
  }
  if (rel.startsWith("/analytics")) {
    return {
      title: "Analytics",
      hint: "Traffic, conversions, and visibility trends.",
    };
  }
  if (rel.startsWith("/integrations")) {
    return {
      title: "Integrations",
      hint: "Connect data sources and publishing tools.",
    };
  }
  if (rel.startsWith("/settings/profile")) {
    return {
      title: "Profile",
      hint: "Your name, email, and account basics.",
    };
  }
  if (rel.startsWith("/settings/billing")) {
    return {
      title: "Billing",
      hint: "Plan, invoices, and payment method.",
    };
  }
  if (rel.startsWith("/settings/integrations")) {
    return {
      title: "Integrations",
      hint: "Workspace connections and API access.",
    };
  }
  if (rel.startsWith("/settings/notifications")) {
    return {
      title: "Notifications",
      hint: "Email and in-app alert preferences.",
    };
  }
  if (rel.startsWith("/settings")) {
    return {
      title: "Settings",
      hint: "Manage your workspace and account.",
    };
  }
  return { title: "Dashboard", hint: "" };
}

function AnalysisGate({ children }: { children: React.ReactNode }) {
  const { run, loading } = useRun();
  const isRunning = !!run && run.status !== "complete" && run.status !== "failed";

  if (!loading && isRunning) {
    return <AnalysisOverlay />;
  }

  return <>{children}</>;
  
}


export default function DashboardSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { slug } = useParams<{ slug: string }>();
  const pathname = usePathname();
  const { data: session } = useSession();

  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Listen for "open-ai-chat" events from child components
  useEffect(() => {
    function handleOpenChat(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.message) setChatInitialMessage(detail.message);
      setChatOpen(true);
    }
    window.addEventListener("open-ai-chat", handleOpenChat);
    return () => window.removeEventListener("open-ai-chat", handleOpenChat);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const [isPro, setIsPro] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [switchingOrg, setSwitchingOrg] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);
  const { organizations, activeOrg, setOrganizations, setActiveOrg } = useOrgStore();

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const userEmail = session?.user?.email || "";
  const userInitials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const userImage = (session?.user as Record<string, unknown>)?.image as string | undefined;

  const basePath = `/dashboard/${slug}`;

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  // Check subscription
  useEffect(() => {
    if (!userEmail) return;
    getSubscriptionStatus(userEmail)
      .then((s) => setIsPro(s.is_active))
      .catch(() => { });
  }, [userEmail]);

  // Load orgs
  useEffect(() => {
    if (!userEmail) return;
    getOrganizations(userEmail)
      .then((orgs) => setOrganizations(orgs))
      .catch(() => {});
  }, [userEmail, setOrganizations]);

  // Close org dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) {
        setOrgDropdownOpen(false);
      }
    }
    if (orgDropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [orgDropdownOpen]);

  async function handleSwitchOrg(org: Organization) {
    setOrgDropdownOpen(false);
    if (org.id === activeOrg?.id) return;
    setSwitchingOrg(true);
    setActiveOrg(org);
    try {
      const runs = await getRunList(userEmail, org.id);
      const latestRun = runs.find((r) => r.status !== "failed") ?? runs[0];
      if (latestRun) {
        router.push(routes.dashboardProject(latestRun.slug));
      } else {
        router.push(routes.dashboard);
      }
    } catch {
      router.push(routes.dashboard);
    } finally {
      setSwitchingOrg(false);
    }
  }

  const isSettingsPage = pathname.startsWith(basePath + "/settings");

  function isActive(navPath: string) {
    if (navPath === "") return pathname === basePath;
    return pathname.startsWith(basePath + navPath);
  }

  function isPromptSubActive(subPath: string) {
    return pathname === basePath + subPath || pathname.startsWith(`${basePath + subPath}/`);
  }

  const promptsOverviewPath = `${basePath}/prompts`;
  const section = sectionForDashboardPath(pathname, basePath);

  const sidebarBrand = (
    <LogoComp
      size={22}
      compact
      animated={false}
      className="text-sm font-bold tracking-tight text-foreground"
    />
  );

  const sidebarBelowHeaderRow =
    organizations.length > 0 ? (
      <div className="relative" ref={orgRef}>
        <button
          type="button"
          onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
          disabled={switchingOrg}
          className={cn(
            "flex w-full h-11 items-center gap-2 rounded-md border border-border/60 bg-muted/25 px-2 py-1.5 text-left transition-colors",
            "hover:border-border hover:bg-muted/45",
            "disabled:pointer-events-none disabled:opacity-60",
            "dark:bg-muted/15 dark:hover:bg-muted/30",
          )}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white">
            <Building2 className="size-3.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold leading-tight tracking-tight text-foreground capitalize">
              {switchingOrg ? "Switching…" : activeOrg?.name || organizations[0]?.name || "Select org"}
            </p>
            {/* <p className="truncate text-[10px] leading-tight text-muted-foreground">
              {activeOrg?.url || organizations[0]?.url || ""}
            </p> */}
          </div>
          {switchingOrg ? (
            <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground opacity-70" />
          )}
        </button>

        {orgDropdownOpen ? (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-md border border-border/60 bg-white py-1 shadow-md ring-1 ring-black/5  ">
            {organizations.map((org) => {
              const orgSelected = org.id === activeOrg?.id;
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => handleSwitchOrg(org)}
                  className={cn(
                    "flex w-full items-center gap-2 px-2.5 py-2 text-left transition-colors",
                    orgSelected ? "bg-muted/60 dark:bg-muted/20" : "hover:bg-muted/40 dark:hover:bg-muted/15",
                  )}
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/50 dark:bg-muted/30">
                    <Building2 className="size-3 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-foreground capitalize">{org.name}</p>
                    {/* <p className="truncate text-[10px] text-muted-foreground">{org.url || "No URL"}</p> */}
                  </div>
                  {orgSelected ? <Check className="size-3.5 shrink-0 text-foreground" /> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    ) : null;

  const sidebarNav = (
    <div className="flex flex-col gap-1 p-2">
      {/* {isSettingsPage ? (
        <Link
          href={basePath}
          className="mb-1 flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 shrink-0" />
          Back to Dashboard
        </Link>
      ) : null} */}

      {isSettingsPage ? (
        <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Settings
        </p>
      ) : (
        <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Navigation
        </p>
      )}

      <nav className="flex flex-col gap-0.5">
        {isSettingsPage
          ? SETTINGS_NAV.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={basePath + item.path}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-[18px] shrink-0 opacity-90" aria-hidden />
                  {item.label}
                </Link>
              );
            })
          : MAIN_NAV.map((item) => {
              const Icon = item.icon;
              if (item.children && item.children.length > 0) {
                const parentActive =
                  pathname === promptsOverviewPath || pathname.startsWith(`${promptsOverviewPath}/`);
                return (
                  <div key={item.label} className="flex flex-col gap-0.5">
                    <Link
                      href={promptsOverviewPath}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        parentActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-[18px] shrink-0 opacity-90" aria-hidden />
                      {item.label}
                    </Link>
                    <div className="ml-2 flex flex-col gap-0.5 border-l border-border/60 pl-2">
                      {item.children.map((sub) => {
                        const subActive = isPromptSubActive(sub.path);
                        return (
                          <Link
                            key={sub.path}
                            href={basePath + sub.path}
                            className={cn(
                              "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                              subActive
                                ? "bg-primary/15 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              const active = isActive(item.path);
              return (
                <Link
                  key={item.label}
                  href={basePath + item.path}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-[18px] shrink-0 opacity-90" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
      </nav>
    </div>
  );

  const sidebarBottom = (
    <div className="shrink-0 space-y-3 border-t border-border/40 px-3 pt-3 pb-1">
      <div className="relative" ref={menuRef}>
        {userMenuOpen ? (
          <div className="absolute bottom-full left-0 right-0 z-50 mb-1 border border-border bg-card p-2.5 shadow-lg">
            <div className="mb-2 flex items-center gap-3 border-b border-border px-1 pb-2.5">
              <UserAvatar src={userImage} initials={userInitials} size={36} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-foreground">{userName}</p>
                <p className="truncate text-[11px] text-muted-foreground">{userEmail}</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <Link
                href={basePath + "/settings/profile"}
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Settings className="size-3.5" />
                Settings
              </Link>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 transition hover:bg-muted"
        >
          <UserAvatar src={userImage} initials={userInitials} size={30} />
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-[13px] font-medium text-foreground">{userName}</p>
          </div>
          {userMenuOpen ? (
            <ChevronUp className="size-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          )}
        </button>
      </div>

      {!isPro ? (
        <div className="rounded-md border border-border bg-background p-3">
          <p className="mb-0.5 text-[13px] font-semibold text-foreground">Boost Your AI Visibility</p>
          <p className="mb-2.5 text-[11px] text-muted-foreground">Elevate Your Site&apos;s Authority</p>
          <Link
            href="/pricing"
            className="block w-full bg-primary py-2 text-center text-[12px] font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Get Signalor Pro
          </Link>
        </div>
      ) : null}
    </div>
  );

  const topBarActions = (
    <DashboardTopBarActions onOpenSearch={() => setCommandPaletteOpen(true)} />
  );

  return (
    <RunProvider slug={slug}>
      <AnalysisGate>
        <>
          <DashboardAppFrame
            section={section}
            sidebarBrand={sidebarBrand}
            sidebarBelowHeaderRow={sidebarBelowHeaderRow}
            sidebarNav={sidebarNav}
            sidebarBottom={sidebarBottom}
            topBarActions={topBarActions}
          >
            <div className="animate-enter">{children}</div>
            {/* <footer className="mt-10 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border px-0 py-6 text-[11px] text-muted-foreground">
              <p>Copyright &copy; 2026 Signalor Ltd.</p>
              <div className="flex flex-wrap items-center gap-4">
                <a href="/privacy-policy" className="transition hover:text-foreground">
                  Privacy Policy
                </a>
                <a href="/terms-and-conditions" className="transition hover:text-foreground">
                  Terms & conditions
                </a>
                <a href="#" className="transition hover:text-foreground">
                  Contact
                </a>
              </div>
            </footer> */}
          </DashboardAppFrame>

          {/* <AiChat
            slug={slug}
            brandName={activeOrg?.name || organizations[0]?.name}
            open={chatOpen}
            onClose={() => {
              setChatOpen(false);
              setChatInitialMessage(undefined);
            }}
            initialMessage={chatInitialMessage}
          /> */}

          {!chatOpen ? (
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
            >
              <Sparkles className="size-4" />
              <span className="text-xs font-semibold">AI Assistant</span>
            </button>
          ) : null}

          <CommandPalette
            open={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
          />
        </>
        <ScoreBump />
      </AnalysisGate>
    </RunProvider>
  );
}
