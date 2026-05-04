"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { routes } from "@/lib/config";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Profile", href: routes.settingsAccount },
  { label: "Billing", href: routes.settingsBilling },
  { label: "Integrations", href: routes.settingsIntegrations },
  { label: "Notifications", href: routes.settingsNotifications },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  const current = NAV_ITEMS.find((item) => pathname === item.href)?.label ?? "Settings";

  return (
    <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-4 py-2.5">
      <Link
        href={routes.dashboard}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Settings
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
      <nav className="flex items-center gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
