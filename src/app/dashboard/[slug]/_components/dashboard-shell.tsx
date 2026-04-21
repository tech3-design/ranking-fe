"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { routes } from "@/lib/config";
import {
  LayoutDashboard,
  ListChecks,
  Eye,
  Users,
  MessageSquare,
  BarChart3,
  ChevronDown,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", route: (slug: string) => routes.dashboardProject(slug) },
  { icon: ListChecks, label: "Recommendations", route: (slug: string) => routes.dashboardProjectRecommendations(slug) },
  { icon: Eye, label: "Visibility", route: (slug: string) => routes.dashboardProjectVisibility(slug) },
  { icon: Users, label: "Competitors", route: (slug: string) => routes.dashboardProjectCompetitors(slug) },
  { icon: MessageSquare, label: "Prompts", route: (slug: string) => routes.dashboardProjectPrompts(slug) },
  { icon: BarChart3, label: "Analytics", route: (slug: string) => routes.dashboardProjectAnalytics(slug) },
];

interface DashboardShellProps {
  slug: string;
  activeNav: string;
  children: React.ReactNode;
}

export function DashboardShell({ slug, activeNav, children }: DashboardShellProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const userInitials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen w-full bg-[#f4f2eb] font-sans text-[#2a2b2a] overflow-hidden">
      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside className="w-[220px] flex-shrink-0 flex flex-col h-full bg-white border-r border-gray-100 px-4 py-5">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-emerald-600">Signalor</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 mb-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.label === activeNav;
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.route(slug))}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-gray-500 hover:text-[#2a2b2a] hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="flex items-center gap-2.5 px-2 py-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-emerald-100 overflow-hidden flex items-center justify-center">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${userInitials}&backgroundColor=d1fae5&textColor=059669`}
              alt="avatar"
              className="w-full h-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#2a2b2a] truncate">{userName}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        </div>

        {/* CTA Card */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-4">
          <p className="text-sm font-bold leading-snug text-[#2a2b2a] mb-1">Boost Your<br />AI Visibility</p>
          <p className="text-[11px] text-gray-500 mb-3">Elevate Your Site&apos;s Authority</p>
          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors">
            Get Signalor Pro
          </button>
        </div>

        {/* Social icons */}
        <div className="flex items-center justify-center gap-3 text-gray-400 text-[11px] mt-1">
          <span>f</span><span>X</span><span>in</span><span>o</span><span>yt</span><span>in</span>
        </div>
      </aside>

      {/* ═══ CENTER CONTENT ═══ */}
      <main className="flex-1 h-full overflow-y-auto">
        {children}

        {/* Footer */}
        {/* <footer className="px-6 py-4 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-200/60">
          <p>Copyright &copy; 2026 Signalor Ltd.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy-policy" className="hover:text-gray-600 transition">Privacy Policy</a>
            <a href="/terms-and-conditions" className="hover:text-gray-600 transition">Terms & conditions</a>
            <a href="#" className="hover:text-gray-600 transition">Contact</a>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span>f</span><span>X</span><span>in</span><span>o</span><span>yt</span><span>in</span>
          </div>
        </footer> */}
      </main>
    </div>
  );
}
