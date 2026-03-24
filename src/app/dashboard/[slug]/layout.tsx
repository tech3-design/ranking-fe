"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { getSubscriptionStatus } from "@/lib/api/payments";
import { routes } from "@/lib/config";
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
  Mail,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", path: "" },
  { icon: ListChecks, label: "Recommendations", path: "/recommendations" },
  { icon: Eye, label: "Visibility", path: "/visibility" },
  { icon: MessageSquare, label: "Prompts", path: "/prompts" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
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

  function isActive(navPath: string) {
    if (navPath === "") return pathname === basePath;
    return pathname.startsWith(basePath + navPath);
  }

  return (
    <div className="flex h-screen w-full bg-[#F6F4F1] font-sans text-[#000000] overflow-hidden">
      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside className="w-[220px] flex-shrink-0 flex flex-col h-full bg-white border-r border-[#E4DED2] px-4 py-5">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#F95C4B] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#000000]">Signalor</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 mb-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={basePath + item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-[#F95C4B]/10 text-[#F95C4B]"
                    : "text-[#000000]/50 hover:text-[#000000] hover:bg-[#F6F4F1]"
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
            <div
              className="absolute bottom-full left-0 right-0 mb-1 rounded-xl bg-white p-3 shadow-lg z-50"
              style={{ border: "1px solid #E4DED2" }}
            >
              {/* Profile info */}
              <div className="flex items-center gap-3 px-1 pb-3 mb-2" style={{ borderBottom: "1px solid #E4DED260" }}>
                <div className="w-10 h-10 rounded-full bg-[#E4DED2] overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${userInitials}&backgroundColor=E4DED2&textColor=000000`}
                    alt="avatar"
                    className="w-full h-full"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#000000] truncate">{userName}</p>
                  <p className="text-[11px] text-[#000000]/40 truncate">{userEmail}</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="flex flex-col gap-0.5">
                <Link
                  href="/settings/account"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-[#000000]/70 hover:bg-[#F6F4F1] hover:text-[#000000] transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  href="/settings/integrations"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-[#000000]/70 hover:bg-[#F6F4F1] hover:text-[#000000] transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>

                <div className="my-1" style={{ borderTop: "1px solid #E4DED260" }} />

                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-[#F95C4B] hover:bg-[#F95C4B]/8 transition-colors w-full text-left disabled:opacity-50"
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
            className="flex items-center gap-2.5 px-2 py-2.5 w-full rounded-xl transition-colors hover:bg-[#F6F4F1]"
          >
            <div className="w-9 h-9 rounded-full bg-[#E4DED2] overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${userInitials}&backgroundColor=E4DED2&textColor=000000`}
                alt="avatar"
                className="w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-[#000000] truncate">{userName}</p>
            </div>
            {userMenuOpen
              ? <ChevronUp className="w-4 h-4 text-[#000000]/40 shrink-0" />
              : <ChevronDown className="w-4 h-4 text-[#000000]/40 shrink-0" />
            }
          </button>
        </div>

        {/* CTA Card — hidden for Pro users */}
        {!isPro && (
          <div className="bg-[#F95C4B]/8 border border-[#F95C4B]/15 rounded-2xl p-4 mb-4">
            <p className="text-sm font-bold leading-snug text-[#000000] mb-1">Boost Your<br />AI Visibility</p>
            <p className="text-[11px] text-[#000000]/50 mb-3">Elevate Your Site&apos;s Authority</p>
            <Link href="/pricing" className="block w-full bg-[#F95C4B] hover:bg-[#e8503f] text-white text-xs font-semibold py-2 rounded-xl transition-colors text-center">
              Get Signalor Pro
            </Link>
          </div>
        )}

        {/* Social icons */}
        <div className="flex items-center justify-center gap-3 text-[#000000]/30 text-[11px] mt-1">
          <span>f</span><span>X</span><span>in</span><span>o</span><span>yt</span><span>in</span>
        </div>
      </aside>

      {/* ═══ CENTER CONTENT ═══ */}
      <main className="flex-1 h-full overflow-y-auto">
        {children}

        {/* Footer */}
        <footer className="px-6 py-4 flex items-center justify-between text-[11px] text-[#000000]/40 border-t border-[#E4DED2]">
          <p>Copyright &copy; 2026 Signalor Ltd.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy-policy" className="hover:text-[#000000]/70 transition">Privacy Policy</a>
            <a href="/terms-and-conditions" className="hover:text-[#000000]/70 transition">Terms & conditions</a>
            <a href="#" className="hover:text-[#000000]/70 transition">Contact</a>
          </div>
          <div className="flex items-center gap-2 text-[#000000]/30">
            <span>f</span><span>X</span><span>in</span><span>o</span><span>yt</span><span>in</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
