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
  LogOut,
  type LucideIcon,
} from "lucide-react";
import LogoComp from "@/components/LogoComp";
import { AiChat } from "@/components/analyzer/ai-chat";
import { Sparkles } from "lucide-react";

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

  const orgName = activeOrg?.name || organizations[0]?.name || "My Workspace";

  return (
    <RunProvider slug={slug}>
    <AnalysisGate>
    <div className="flex h-screen w-full bg-[#F2F3F5] font-sans text-foreground overflow-hidden">

      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside className="w-[230px] shrink-0 flex flex-col h-full bg-white shadow-[1px_0_0_0_#E5E7EB]">

        {/* Logo + brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#F0F0F0]">
          <LogoComp />
        </div>

        {/* Org block */}
        {organizations.length > 0 && (
          <div className="relative px-4 pt-4 pb-2" ref={orgRef}>
            <button
              onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
              disabled={switchingOrg}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl bg-[#F8F8F8] hover:bg-[#F0F0F0] transition text-left disabled:opacity-60 border border-[#EBEBEB]"
            >
              <div className="w-7 h-7 rounded-lg bg-[#F95C4B]/10 flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5 text-[#F95C4B]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-gray-800 truncate">
                  {switchingOrg ? "Switching…" : orgName}
                </p>
                <p className="text-[10px] text-gray-400 truncate">{isPro ? "Pro Plan" : "Free Plan"}</p>
              </div>
              {switchingOrg
                ? <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin shrink-0" />
                : <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
            </button>

            {orgDropdownOpen && (
              <div className="absolute left-4 right-4 top-full mt-1 bg-white rounded-xl border border-[#EBEBEB] shadow-lg z-50 py-1 max-h-48 overflow-y-auto">
                {organizations.map((org) => {
                  const active = org.id === activeOrg?.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => handleSwitchOrg(org)}
                      className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors rounded-lg mx-1 ${active ? "bg-[#F95C4B]/08" : "hover:bg-[#F8F8F8]"}`}
                      style={{ width: "calc(100% - 8px)" }}
                    >
                      <div className="w-6 h-6 rounded-md bg-[#F95C4B]/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-3 h-3 text-[#F95C4B]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-gray-800 truncate">{org.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{org.url || "No URL"}</p>
                      </div>
                      {active && <Check className="w-3.5 h-3.5 text-[#F95C4B] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Back to Dashboard in settings */}
        {isSettingsPage && (
          <div className="px-4 pt-2">
            <Link
              href={basePath}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium text-gray-500 hover:text-gray-800 hover:bg-[#F5F5F5] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Link>
          </div>
        )}

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
          {/* Section label */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">
            {isSettingsPage ? "Settings" : "Main Menu"}
          </p>

          <nav className="flex flex-col gap-0.5">
            {isSettingsPage
              ? SETTINGS_NAV.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={basePath + item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                        active
                          ? "bg-[#F95C4B] text-white shadow-sm shadow-[#F95C4B]/20"
                          : "text-gray-500 hover:bg-[#F5F5F5] hover:text-gray-800"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })
              : MAIN_NAV.map((item) => {
                  const Icon = item.icon;

                  if (item.children && item.children.length > 0) {
                    const groupActive = isActive(item.path);
                    return (
                      <div key={item.label} className="flex flex-col gap-0.5">
                        <Link
                          href={promptsOverviewPath}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                            isPromptsOverview
                              ? "bg-[#F95C4B] text-white shadow-sm shadow-[#F95C4B]/20"
                              : groupActive
                              ? "text-gray-800 bg-[#F5F5F5]"
                              : "text-gray-500 hover:bg-[#F5F5F5] hover:text-gray-800"
                          }`}
                        >
<Icon className="w-4 h-4 shrink-0" />
                          {item.label}
                        </Link>
                        <div className="flex flex-col gap-0.5 ml-4 pl-3 border-l-2 border-[#F0F0F0] mt-0.5 mb-1">
                          {item.children.map((sub) => {
                            const subActive = isPromptSubActive(sub.path);
                            return (
                              <Link
                                key={sub.path}
                                href={basePath + sub.path}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                                  subActive
                                    ? "bg-[#F95C4B]/10 text-[#F95C4B]"
                                    : "text-gray-400 hover:text-gray-700 hover:bg-[#F5F5F5]"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${subActive ? "bg-[#F95C4B]" : "bg-gray-300"}`} />
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
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                        active
                          ? "bg-[#F95C4B] text-white shadow-sm shadow-[#F95C4B]/20"
                          : "text-gray-500 hover:bg-[#F5F5F5] hover:text-gray-800"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
          </nav>

          {/* Account section */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-5 mb-2 px-1">Account</p>
          <nav className="flex flex-col gap-0.5">
            <Link
              href={basePath + "/settings/profile"}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                isActive("/settings/profile")
                  ? "bg-[#F95C4B] text-white"
                  : "text-gray-500 hover:bg-[#F5F5F5] hover:text-gray-800"
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              Settings
            </Link>
            {!isPro && (
              <Link
                href="/pricing"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-500 hover:bg-[#F5F5F5] hover:text-gray-800 transition-all"
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                Upgrade Plan
              </Link>
            )}
          </nav>
        </div>

        {/* User profile at bottom */}
        <div className="border-t border-[#F0F0F0] px-4 py-3" ref={menuRef}>
          {userMenuOpen && (
            <div className="absolute bottom-[72px] left-4 right-4 mb-1 bg-white rounded-xl shadow-lg border border-[#EBEBEB] p-2 z-50">
              <div className="flex items-center gap-2.5 px-2 py-2 mb-1 border-b border-[#F5F5F5]">
                <UserAvatar src={userImage} initials={userInitials} size={32} />
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-gray-800 truncate">{userName}</p>
                  <p className="text-[10px] text-gray-400 truncate">{userEmail}</p>
                </div>
              </div>
              <Link
                href={basePath + "/settings/profile"}
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] text-gray-500 hover:bg-[#F5F5F5] hover:text-gray-800 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" /> Settings
              </Link>
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] text-gray-500 hover:bg-[#F5F5F5] hover:text-gray-800 transition-colors w-full text-left">
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          )}

          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 w-full rounded-xl px-2 py-2 hover:bg-[#F5F5F5] transition"
          >
            <UserAvatar src={userImage} initials={userInitials} size={32} />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[12px] font-semibold text-gray-800 truncate">{userName}</p>
              <p className="text-[10px] text-gray-400 truncate">{isPro ? "Pro Plan" : "Free Plan"}</p>
            </div>
            {userMenuOpen
              ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              : <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
          </button>
        </div>
      </aside>

      {/* ═══ CENTER CONTENT ═══ */}
      <main className="flex-1 h-full overflow-y-auto flex flex-col">
        <div className="flex-1 animate-enter">
          {children}
        </div>

        {/* Footer */}
        <footer className="shrink-0 px-6 py-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-[#E8E8E8] bg-white">
          <p>© {new Date().getFullYear()} Signalor Ltd.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy-policy" className="hover:text-gray-600 transition">Privacy Policy</a>
            <a href="/terms-and-conditions" className="hover:text-gray-600 transition">Terms</a>
          </div>
        </footer>
      </main>

      {/* ═══ AI CHAT ═══ */}
      <AiChat
        slug={slug}
        brandName={activeOrg?.name || organizations[0]?.name}
        open={chatOpen}
        onClose={() => { setChatOpen(false); setChatInitialMessage(undefined); }}
        initialMessage={chatInitialMessage}
      />

      {/* Chat toggle */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#F95C4B] px-4 py-3 text-white shadow-lg shadow-[#F95C4B]/25 hover:shadow-xl hover:scale-105 transition-all"
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
