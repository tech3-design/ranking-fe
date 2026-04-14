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
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>();

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
      <aside className="w-[220px] flex-shrink-0 flex flex-col h-full bg-card border-r border-border px-3 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 mb-5">
          <LogoComp />
        </div>

        {/* Org Switcher */}
        {organizations.length > 0 && (
          <div className="relative mb-5" ref={orgRef}>
            <button
              onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
              disabled={switchingOrg}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 border border-border bg-background hover:bg-accent transition text-left disabled:opacity-60"
            >
              <div className="w-7 h-7 bg-foreground/[0.04] flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5 text-foreground/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate tracking-[-0.01em]">
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
              <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border shadow-lg z-50 py-1 max-h-48 overflow-y-auto">
                {organizations.map((org) => {
                  const isActive = org.id === activeOrg?.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => handleSwitchOrg(org)}
                      className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors ${
                        isActive ? "bg-accent" : "hover:bg-accent"
                      }`}
                    >
                      <div className="w-6 h-6 bg-foreground/[0.04] flex items-center justify-center shrink-0">
                        <Building2 className="w-3 h-3 text-foreground/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{org.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{org.url || "No URL"}</p>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-foreground shrink-0" />}
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
            className="flex items-center gap-2 px-2 py-2 mb-3 text-[13px] font-medium text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        )}

        {/* Section label */}
        {isSettingsPage ? (
          <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Settings
          </p>
        ) : (
          <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Navigation
          </p>
        )}

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 mb-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={basePath + item.path}
                className={`flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium tracking-[-0.01em] transition ${active
                    ? "text-foreground bg-accent border-l-2 border-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User — expandable upward */}
        <div className="relative mt-auto pt-4 border-t border-border" ref={menuRef}>
          {/* Popover — expands upward */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-card p-2.5 shadow-lg z-50 border border-border">
              {/* Profile info */}
              <div className="flex items-center gap-3 px-1 pb-2.5 mb-2 border-b border-border">
                <UserAvatar src={userImage} initials={userInitials} size={36} />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{userName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="flex flex-col gap-0.5">
                <Link
                  href={basePath + "/settings/profile"}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-2 py-1.5 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </Link>
              </div>
            </div>
          )}

          {/* Trigger button */}
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 px-2 py-2 w-full transition hover:bg-accent"
          >
            <UserAvatar src={userImage} initials={userInitials} size={30} />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-medium text-foreground truncate">{userName}</p>
            </div>
            {userMenuOpen
              ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            }
          </button>
        </div>

        {/* CTA — hidden for Pro users */}
        {!isPro && (
          <div className="mt-3 p-3 border border-border bg-background">
            <p className="text-[13px] font-semibold text-foreground mb-0.5">Boost Your AI Visibility</p>
            <p className="text-[11px] text-muted-foreground mb-2.5">Elevate Your Site&apos;s Authority</p>
            <Link href="/pricing" className="block w-full bg-primary text-white text-[12px] font-semibold py-2 transition hover:opacity-88 text-center">
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
        onClose={() => { setChatOpen(false); setChatInitialMessage(undefined); }}
        initialMessage={chatInitialMessage}
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
