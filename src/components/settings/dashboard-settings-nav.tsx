"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_TABS = [
  { label: "Profile", segment: "profile" },
  { label: "Billing", segment: "billing" },
  { label: "Integrations", segment: "integrations" },
  { label: "Notifications", segment: "notifications" },
] as const;

export function DashboardSettingsNav() {
  const { slug } = useParams<{ slug: string }>();
  const pathname = usePathname();

  const base = `/dashboard/${slug}/settings`;

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-black/8 bg-neutral-50/80 px-4 py-2.5 shadow-sm">
      <Link
        href={`/dashboard/${slug}`}
        className="text-[13px] font-semibold tracking-tight text-muted-foreground transition-colors hover:text-foreground"
      >
        Settings
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
      <nav className="flex flex-wrap items-center gap-0.5">
        {NAV_TABS.map((tab) => {
          const href = `${base}/${tab.segment}`;
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={tab.segment}
              href={href}
              className={cn(
                "rounded-md px-3 py-1 text-[13px] font-medium tracking-tight transition-colors",
                isActive
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-white/70 hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
