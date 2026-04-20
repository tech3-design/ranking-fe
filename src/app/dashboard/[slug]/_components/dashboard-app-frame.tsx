"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Diamond } from "@/components/ui/intersection-diamonds";
import { cn } from "@/lib/utils";

const DASHBOARD_TOPBAR_H = "h-[60px]";

function DashboardThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className="size-9 shrink-0" aria-hidden />;
  }

  const dark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-9 shrink-0"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}

function ThemeHotkeyBinder() {
  const { resolvedTheme, setTheme } = useTheme();

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== "d") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const el = e.target as HTMLElement | null;

      if (
        el?.closest(
          "input, textarea, select, [contenteditable='true']"
        )
      )
        return;

      e.preventDefault();

      const dark = resolvedTheme === "dark";
      setTheme(dark ? "light" : "dark");
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [resolvedTheme, setTheme]);

  return null;
}

export type DashboardAppSection = {
  title: string;
  hint: string;
};

export function DashboardAppFrame({
  children,
  section,
  sidebarBrand,
  sidebarBelowHeaderRow,
  sidebarNav,
  sidebarBottom,
  topBarActions,
  brandHref = "/dashboard",
}: {
  children: React.ReactNode;
  section: DashboardAppSection;
  sidebarBrand: React.ReactNode;
  sidebarBelowHeaderRow: React.ReactNode;
  sidebarNav: React.ReactNode;
  sidebarBottom: React.ReactNode;
  topBarActions?: React.ReactNode;
  brandHref?: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!mobileOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const topBarShell = cn(
    "shrink-0 border-b border-border/40 bg-white dark:bg-zinc-950",
    DASHBOARD_TOPBAR_H
  );

  const mainHeader = (
    <header
      className={cn(
        "flex min-w-0 flex-1 items-center justify-between gap-4 px-4 backdrop-blur-sm lg:px-6 bg-white",
        DASHBOARD_TOPBAR_H
      )}
    >
      <div className="min-w-0 flex-1 pr-2">
        <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
          {section.title}
        </h2>

        {section.hint ? (
          <p className="truncate text-xs text-muted-foreground">
            {section.hint}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {topBarActions}
      </div>
    </header>
  );

  return (
    <div className="flex min-h-[100dvh] flex-col bg-muted/40 text-foreground dark:bg-background">

      <ThemeHotkeyBinder />

      {/* Mobile Topbar */}

      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border/40 bg-white px-3 shadow-sm backdrop-blur-md dark:bg-zinc-950 md:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          aria-expanded={mobileOpen}
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {section.title}
          </p>

          {section.hint ? (
            <p className="truncate text-[10px] text-muted-foreground">
              {section.hint}
            </p>
          ) : null}
        </div>

        {topBarActions ? (
          <div className="flex shrink-0 items-center gap-1">
            {topBarActions}
          </div>
        ) : null}

        <DashboardThemeToggle />
      </header>

      {/* Desktop Layout — min-h-0 so nested overflow + flex stretch match the viewport */}

      <div className="relative hidden min-h-0 flex-1 flex-col md:flex">

        {/* Topbar */}

        <div className={cn("flex w-full shrink-0 items-stretch", topBarShell)}>

          {/* Sidebar Logo */}

          <div
            className={cn(
              "relative flex w-56 shrink-0 items-center border-r border-border/40 px-3 bg-white",
              DASHBOARD_TOPBAR_H
            )}
          >
            {sidebarBrand}
            <Diamond style={{ bottom: -2.5, right: -2.5 }} />
          </div>

          {mainHeader}

        </div>

        {/* Body */}

        <div className="flex min-h-0 flex-1 overflow-hidden">

          {/* Sidebar */}

          <aside className="flex min-h-0 w-56 shrink-0 flex-col self-stretch overflow-hidden border-r border-border/40 bg-white">

            {sidebarBelowHeaderRow ? (
              <div className="relative shrink-0 border-b border-border/40 px-3 py-2.5">
                {sidebarBelowHeaderRow}
                <Diamond style={{ bottom: -2.5, right: -2.5 }} />
              </div>
            ) : null}

            {/* Nav */}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {sidebarNav}
            </div>

            {/* Bottom User Section */}

            <div className="relative mt-auto shrink-0 border-t border-border/40 px-0.5 pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+0.75rem))] pt-2">
              {sidebarBottom}
              <Diamond style={{ top: -2.5, right: -2.5 }} />
            </div>

          </aside>

          {/* Main */}

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-muted/40 dark:bg-background/80">

            <main className="mx-auto w-full max-w-7xl flex-1 overflow-y-auto px-4 py-8 sm:py-8">
              {children}
            </main>

          </div>

        </div>

      </div>

    </div>
  );
}