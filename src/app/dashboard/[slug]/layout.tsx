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
  Sparkles,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import LogoComp from "@/components/LogoComp";
import { AiChat } from "@/components/analyzer/ai-chat";

/* ── Constants ── */
const CORAL = "#F95C4B";

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
  {
    icon: MessageSquare,
    label: "Prompts",
    path: "/prompts",
    children: [
      { label: "Actions", path: "/prompts/actions" },
      { label: "Recommendations", path: "/prompts/recommendations" },
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

function AnalysisGate({ children }: { children: React.ReactNode }) {
  const { run, loading } = useRun();
  const isRunning = !!run && run.status !== "complete" && run.status !== "failed";
  if (!loading && isRunning) return <AnalysisOverlay />;
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

  useEffect(() => {
    function handleOpenChat(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.message) setChatInitialMessage(detail.message);
      setChatOpen(true);
    }
    window.addEventListener("open-ai-chat", handleOpenChat);
    return () => window.removeEventListener("open-ai-chat", handleOpenChat);
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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    if (userMenuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  useEffect(() => {
    if (!userEmail) return;
    getSubscriptionStatus(userEmail).then((s) => setIsPro(s.is_active)).catch(() => {});
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    getOrganizations(userEmail).then((orgs) => setOrganizations(orgs)).catch(() => {});
  }, [userEmail, setOrganizations]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) setOrgDropdownOpen(false);
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
      if (latestRun) router.push(routes.dashboardProject(latestRun.slug));
      else router.push(routes.dashboard);
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
  const isPromptsOverview = pathname === promptsOverviewPath;

  return (
    <RunProvider slug={slug}>
      <AnalysisGate>
        <div className="flex h-screen w-full bg-background font-sans text-foreground overflow-hidden">

          {/* ═══════════════════════════════════════════
               LEFT SIDEBAR — Premium redesign
             ═══════════════════════════════════════════ */}
          <aside className="w-[240px] flex-shrink-0 flex flex-col h-full border-r border-border bg-card">

            {/* ── Logo ── */}
            <div className="flex items-center gap-2.5 px-5 h-16 shrink-0">
              <LogoComp />
            </div>

            <div className="shine-border-h mx-4" />

            {/* ── Org Switcher ── */}
            {organizations.length > 0 && (
              <div className="relative px-4 py-3" ref={orgRef}>
                <button
                  onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                  disabled={switchingOrg}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-accent transition-all text-left disabled:opacity-60"
                >
                  <div className="w-8 h-8 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-foreground/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate">
                      {switchingOrg ? "Switching..." : (activeOrg?.name || organizations[0]?.name || "Select org")}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {activeOrg?.url || organizations[0]?.url || ""}
                    </p>
                  </div>
                  {switchingOrg ? (
                    <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin shrink-0" />
                  ) : (
                    <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  )}
                </button>

                {orgDropdownOpen && (
                  <div className="absolute left-4 right-4 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-50 py-1 max-h-48 overflow-y-auto">
                    {organizations.map((org) => {
                      const active = org.id === activeOrg?.id;
                      return (
                        <button
                          key={org.id}
                          onClick={() => handleSwitchOrg(org)}
                          className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-left transition-colors rounded-lg mx-1 ${
                            active ? "bg-accent" : "hover:bg-accent"
                          }`}
                          style={{ width: "calc(100% - 8px)" }}
                        >
                          <div className="w-7 h-7 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0">
                            <Building2 className="w-3.5 h-3.5 text-foreground/60" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-foreground truncate">{org.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{org.url || "No URL"}</p>
                          </div>
                          {active && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Back to Dashboard (settings) ── */}
            {isSettingsPage && (
              <Link
                href={basePath}
                className="flex items-center gap-2 mx-4 px-3 py-2 mb-1 text-[13px] font-medium text-muted-foreground hover:text-foreground transition rounded-lg hover:bg-accent"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Dashboard
              </Link>
            )}

            {/* ── Section label ── */}
            <p className="px-6 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
              {isSettingsPage ? "Settings" : "Menu"}
            </p>

            {/* ── Navigation ── */}
            <nav className="flex flex-col gap-0.5 px-3 mb-auto">
              {isSettingsPage
                ? SETTINGS_NAV.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={basePath + item.path}
                        className={`nav-item ${active ? "nav-item-active" : "text-muted-foreground"}`}
                      >
                        <Icon className="w-[18px] h-[18px]" />
                        {item.label}
                      </Link>
                    );
                  })
                : MAIN_NAV.map((item) => {
                    const Icon = item.icon;
                    if (item.children && item.children.length > 0) {
                      const groupActive = isActive(item.path);
                      return (
                        <div key={item.label} className="flex flex-col">
                          <Link
                            href={promptsOverviewPath}
                            className={`nav-item ${
                              isPromptsOverview
                                ? "nav-item-active"
                                : groupActive
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                            }`}
                          >
                            <Icon className="w-[18px] h-[18px] shrink-0" />
                            {item.label}
                          </Link>
                          <div className="flex flex-col gap-0.5 ml-5 pl-3 border-l border-border/60 mt-0.5 mb-1">
                            {item.children.map((sub) => {
                              const subActive = isPromptSubActive(sub.path);
                              return (
                                <Link
                                  key={sub.path}
                                  href={basePath + sub.path}
                                  className={`flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium transition-all rounded-lg ${
                                    subActive
                                      ? "text-foreground bg-foreground/[0.04]"
                                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full transition-colors ${subActive ? "bg-primary" : "bg-muted-foreground/30"}`} />
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
                        className={`nav-item ${active ? "nav-item-active" : "text-muted-foreground"}`}
                      >
                        <Icon className="w-[18px] h-[18px]" />
                        {item.label}
                      </Link>
                    );
                  })}
            </nav>

            {/* ── Pro CTA ── */}
            {!isPro && (
              <div className="mx-3 mb-3 p-4 rounded-2xl border border-border bg-gradient-to-br from-background to-accent">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${CORAL}12` }}>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: CORAL }} />
                  </div>
                  <p className="text-[13px] font-bold text-foreground">Go Pro</p>
                </div>
                <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">Unlock advanced insights & priority recommendations</p>
                <Link
                  href="/pricing"
                  className="flex items-center justify-center gap-1.5 w-full rounded-xl py-2 text-[12px] font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: CORAL }}
                >
                  Upgrade <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* ── User menu ── */}
            <div className="relative px-3 pb-3" ref={menuRef}>
              <div className="shine-border-h mb-3" />

              {userMenuOpen && (
                <div className="absolute bottom-full left-3 right-3 mb-1 bg-card rounded-xl p-3 shadow-lg z-50 border border-border animate-enter">
                  <div className="flex items-center gap-3 px-1 pb-3 mb-2 border-b border-border">
                    <UserAvatar src={userImage} initials={userInitials} size={36} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{userName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                    </div>
                  </div>
                  <Link
                    href={basePath + "/settings/profile"}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-2 py-2 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors rounded-lg"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </Link>
                </div>
              )}

              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 px-2.5 py-2.5 w-full transition hover:bg-accent rounded-xl"
              >
                <UserAvatar src={userImage} initials={userInitials} size={32} />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] font-medium text-foreground truncate">{userName}</p>
                </div>
                {userMenuOpen
                  ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                }
              </button>
            </div>
          </aside>

          {/* ═══════════════════════════════════════════
               CENTER CONTENT
             ═══════════════════════════════════════════ */}
          <main className="flex-1 h-full overflow-y-auto flex flex-col bg-background">
            <div className="flex-1 animate-enter">
              {children}
            </div>

            {/* Footer */}
            <footer className="shrink-0 px-8 py-4 flex items-center justify-between text-[11px] text-muted-foreground/70">
              <p>Copyright &copy; 2026 Signalor Ltd.</p>
              <div className="flex items-center gap-5">
                <a href="/privacy-policy" className="hover:text-foreground transition">Privacy Policy</a>
                <a href="/terms-and-conditions" className="hover:text-foreground transition">Terms & conditions</a>
                <a href="#" className="hover:text-foreground transition">Contact</a>
              </div>
            </footer>
          </main>

          {/* ═══════════════════════════════════════════
               RIGHT: AI CHAT
             ═══════════════════════════════════════════ */}
          <AiChat
            slug={slug}
            brandName={activeOrg?.name || organizations[0]?.name}
            open={chatOpen}
            onClose={() => { setChatOpen(false); setChatInitialMessage(undefined); }}
            initialMessage={chatInitialMessage}
          />

          {/* Chat toggle — premium floating pill */}
          {!chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full px-5 py-3 text-white transition-all hover:scale-[1.03] active:scale-[0.98]"
              style={{
                backgroundColor: CORAL,
                boxShadow: `0 4px 20px ${CORAL}40, 0 2px 8px rgba(0,0,0,0.08)`,
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[13px] font-semibold">AI Assistant</span>
            </button>
          )}
        </div>
        <ScoreBump />
      </AnalysisGate>
    </RunProvider>
  );
}
