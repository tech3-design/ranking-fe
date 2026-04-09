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
  BarChart3,
  ChevronUp,
  ChevronDown,
  Zap,
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
} from "lucide-react";
import LogoComp from "@/components/LogoComp";
import { AiChat } from "@/components/analyzer/ai-chat";
import { Sparkles } from "lucide-react";

const MAIN_NAV = [
  { icon: LayoutDashboard, label: "Overview", path: "" },
  { icon: ListChecks, label: "Recommendations", path: "/recommendations" },
  { icon: Eye, label: "Visibility", path: "/visibility" },
  { icon: MessageSquare, label: "Prompts", path: "/prompts" },
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
  const navItems = isSettingsPage ? SETTINGS_NAV : MAIN_NAV;

  function isActive(navPath: string) {
    if (navPath === "") return pathname === basePath;
    return pathname.startsWith(basePath + navPath);
  }

  return (
    <RunProvider slug={slug}>
    <AnalysisGate>
    <div className="flex h-screen w-full bg-transparent font-sans text-foreground overflow-hidden">
      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside className="w-[220px] flex-shrink-0 flex flex-col h-full bg-card/95 backdrop-blur-md border-r border-border/80 shadow-[4px_0_32px_-12px_rgba(0,0,0,0.08)] dark:shadow-[4px_0_40px_-16px_rgba(0,0,0,0.45)] px-4 py-5">
        {/* Logo */}
        <div className="flex items-center gap-2.5  mb-6">
          <LogoComp />
        </div>

        {/* Org Switcher */}
        {organizations.length > 0 && (
          <div className="relative mb-4" ref={orgRef}>
            <button
              onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
              disabled={switchingOrg}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl border border-border/80 bg-background/80 hover:bg-accent hover:border-primary/20 hover:shadow-sm transition-all duration-200 text-left disabled:opacity-60"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
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
              <div className="absolute left-0 right-0 top-full mt-1 rounded-xl bg-card/98 backdrop-blur-md border border-border/80 shadow-xl shadow-primary/5 z-50 py-1 max-h-48 overflow-y-auto animate-enter">
                {organizations.map((org) => {
                  const isActive = org.id === activeOrg?.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => handleSwitchOrg(org)}
                      className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors ${
                        isActive ? "bg-primary/8" : "hover:bg-accent"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-3 h-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{org.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{org.url || "No URL"}</p>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Back to Dashboard (when in settings) */}
        {isSettingsPage && (
          <Link
            href={basePath}
            className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        )}

        {/* Section label */}
        {isSettingsPage && (
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Settings
          </p>
        )}

        {/* Nav */}
        <nav className="flex flex-col gap-1 mb-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={basePath + item.path}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/10 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[60%] before:w-0.5 before:rounded-full before:bg-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/80 motion-safe:hover:translate-x-0.5"
                  }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User — expandable upward */}
        <div className="relative mb-4" ref={menuRef}>
          {/* Popover — expands upward */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 rounded-xl bg-card p-3 shadow-lg z-50 border border-border">
              {/* Profile info */}
              <div className="flex items-center gap-3 px-1 pb-3 mb-2 border-b border-border">
                <UserAvatar src={userImage} initials={userInitials} size={40} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="flex flex-col gap-0.5">
                <Link
                  href={basePath + "/settings/profile"}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </div>
            </div>
          )}

          {/* Trigger button */}
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 px-2 py-2.5 w-full rounded-xl transition-colors hover:bg-accent"
          >
            <UserAvatar src={userImage} initials={userInitials} size={36} />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
            </div>
            {userMenuOpen
              ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            }
          </button>
        </div>

        {/* CTA Card — hidden for Pro users */}
        {!isPro && (
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/12 via-primary/6 to-transparent border border-primary/20 rounded-2xl p-4 mb-4 shadow-sm shadow-primary/10 transition-shadow duration-200 hover:shadow-md hover:shadow-primary/15">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/15 blur-2xl pointer-events-none" aria-hidden />
            <p className="text-sm font-bold leading-snug text-foreground mb-1 relative">Boost Your<br />AI Visibility</p>
            <p className="text-[11px] text-muted-foreground mb-3 relative">Elevate Your Site&apos;s Authority</p>
            <Link href="/pricing" className="relative block w-full bg-primary hover:bg-primary/92 text-white text-xs font-semibold py-2.5 rounded-xl transition-all duration-200 text-center shadow-md shadow-primary/25 hover:shadow-lg motion-safe:hover:-translate-y-px">
              Get Signalor Pro
            </Link>
          </div>
        )}
      </aside>

      {/* ═══ CENTER CONTENT ═══ */}
      <main className="flex-1 h-full overflow-y-auto flex flex-col">
        <div className="flex-1 animate-enter">
          {children}
        </div>

        {/* Footer — always at bottom */}
        <footer className="shrink-0 px-6 py-4 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border">
          <p>Copyright &copy; 2026 Signalor Ltd.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy-policy" className="hover:text-foreground transition">Privacy Policy</a>
            <a href="/terms-and-conditions" className="hover:text-foreground transition">Terms & conditions</a>
            <a href="#" className="hover:text-foreground transition">Contact</a>
          </div>
        </footer>
      </main>

      {/* ═══ RIGHT: AI CHAT ═══ */}
      <AiChat
        slug={slug}
        brandName={activeOrg?.name || organizations[0]?.name}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      {/* Chat toggle button — fixed bottom right */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-semibold">AI Assistant</span>
        </button>
      )}
    </div>
    <ScoreBump />
    </AnalysisGate>
    </RunProvider>
  );
}
