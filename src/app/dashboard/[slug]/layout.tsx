"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { getSubscriptionStatus } from "@/lib/api/payments";
import { routes } from "@/lib/config";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  ListChecks,
  Eye,
  MessageSquare,
  BarChart3,
  ChevronUp,
  ChevronDown,
  Zap,
  LogOut,
  User,
  Settings,
  CreditCard,
  PlugZap,
  ArrowLeft,
  Bell,
} from "lucide-react";

const MAIN_NAV = [
  { icon: LayoutDashboard, label: "Overview", path: "" },
  { icon: ListChecks, label: "Recommendations", path: "/recommendations" },
  { icon: Eye, label: "Visibility", path: "/visibility" },
  { icon: MessageSquare, label: "Prompts", path: "/prompts" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

const SETTINGS_NAV = [
  { icon: User, label: "Profile", path: "/settings/profile" },
  { icon: CreditCard, label: "Billing", path: "/settings/billing" },
  { icon: PlugZap, label: "Integrations", path: "/settings/integrations" },
  { icon: Bell, label: "Notifications", path: "/settings/notifications" },
];

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
  const [signingOut, setSigningOut] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const userEmail = session?.user?.email || "";
  const userInitials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

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
      .catch(() => {});
  }, [userEmail]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.push(routes.signIn);
    } finally {
      setSigningOut(false);
    }
  }

  const isSettingsPage = pathname.startsWith(basePath + "/settings");
  const navItems = isSettingsPage ? SETTINGS_NAV : MAIN_NAV;

  function isActive(navPath: string) {
    if (navPath === "") return pathname === basePath;
    return pathname.startsWith(basePath + navPath);
  }

  return (
    <div className="flex h-screen w-full bg-background font-sans text-foreground overflow-hidden">
      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside className="w-[220px] flex-shrink-0 flex flex-col h-full bg-card border-r border-border px-4 py-5">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">Signalor</span>
        </div>

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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Theme toggle */}
        <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-xl bg-accent">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>

        {/* User — expandable upward */}
        <div className="relative mb-4" ref={menuRef}>
          {/* Popover — expands upward */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 rounded-xl bg-card p-3 shadow-lg z-50 border border-border">
              {/* Profile info */}
              <div className="flex items-center gap-3 px-1 pb-3 mb-2 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${userInitials}&backgroundColor=E4DED2&textColor=000000`}
                    alt="avatar"
                    className="w-full h-full"
                  />
                </div>
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

                <div className="my-1 border-t border-border" />

                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-primary hover:bg-primary/8 transition-colors w-full text-left disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {signingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          )}

          {/* Trigger button */}
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 px-2 py-2.5 w-full rounded-xl transition-colors hover:bg-accent"
          >
            <div className="w-9 h-9 rounded-full bg-secondary overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${userInitials}&backgroundColor=E4DED2&textColor=000000`}
                alt="avatar"
                className="w-full h-full"
              />
            </div>
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
          <div className="bg-primary/8 border border-primary/15 rounded-2xl p-4 mb-4">
            <p className="text-sm font-bold leading-snug text-foreground mb-1">Boost Your<br />AI Visibility</p>
            <p className="text-[11px] text-muted-foreground mb-3">Elevate Your Site&apos;s Authority</p>
            <Link href="/pricing" className="block w-full bg-primary hover:bg-primary/90 text-white text-xs font-semibold py-2 rounded-xl transition-colors text-center">
              Get Signalor Pro
            </Link>
          </div>
        )}
      </aside>

      {/* ═══ CENTER CONTENT ═══ */}
      <main className="flex-1 h-full overflow-y-auto">
        {children}

        {/* Footer */}
        <footer className="px-6 py-4 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border">
          <p>Copyright &copy; 2026 Signalor Ltd.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy-policy" className="hover:text-foreground transition">Privacy Policy</a>
            <a href="/terms-and-conditions" className="hover:text-foreground transition">Terms & conditions</a>
            <a href="#" className="hover:text-foreground transition">Contact</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
