import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { routes } from "@/lib/config";
import { cn } from "@/lib/utils";

export type DashboardBreadcrumbItem = {
  label: string;
  href: string | null;
};

export function formatDashboardProjectLabel(slug: string): string {
  try {
    const s = decodeURIComponent(slug);
    return s
      .split(/[-_]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  } catch {
    return slug;
  }
}

function settingsBaseHref(basePath: string) {
  return `${basePath}/settings/profile`;
}

/**
 * Builds a trail for `/dashboard/[slug]/...` to mirror sidebar / section labels.
 */
export function getDashboardBreadcrumbs(
  pathname: string,
  basePath: string,
  projectLabel: string,
): DashboardBreadcrumbItem[] {
  const crumbs: DashboardBreadcrumbItem[] = [
    { label: "Dashboard", href: routes.dashboard },
    { label: projectLabel, href: basePath },
  ];

  const rel = pathname === basePath ? "/" : pathname.slice(basePath.length) || "/";

  if (rel === "/" || rel === "") {
    crumbs.push({ label: "Overview", href: null });
    return crumbs;
  }

  if (rel.startsWith("/recommendations")) {
    crumbs.push({ label: "Recommendations", href: null });
    return crumbs;
  }
  if (rel.startsWith("/visibility")) {
    crumbs.push({ label: "Visibility", href: null });
    return crumbs;
  }
  if (rel.startsWith("/analytics")) {
    crumbs.push({ label: "Analytics", href: null });
    return crumbs;
  }
  if (rel.startsWith("/integrations")) {
    crumbs.push({ label: "Integrations", href: null });
    return crumbs;
  }

  if (rel.startsWith("/prompts/actions")) {
    crumbs.push({ label: "Prompts", href: `${basePath}/prompts` });
    crumbs.push({ label: "Actions", href: null });
    return crumbs;
  }
  if (rel.startsWith("/prompts/recommendations")) {
    crumbs.push({ label: "Prompts", href: `${basePath}/prompts` });
    crumbs.push({ label: "Explorer", href: null });
    return crumbs;
  }
  if (rel.startsWith("/prompts/history")) {
    crumbs.push({ label: "Prompts", href: `${basePath}/prompts` });
    crumbs.push({ label: "History", href: null });
    return crumbs;
  }
  if (rel.startsWith("/prompts/engine")) {
    crumbs.push({ label: "Prompts", href: `${basePath}/prompts` });
    crumbs.push({ label: "Engine", href: null });
    return crumbs;
  }
  if (rel.startsWith("/prompts")) {
    crumbs.push({ label: "Prompts", href: null });
    return crumbs;
  }

  if (rel.startsWith("/settings/profile")) {
    crumbs.push({ label: "Settings", href: settingsBaseHref(basePath) });
    crumbs.push({ label: "Profile", href: null });
    return crumbs;
  }
  if (rel.startsWith("/settings/billing")) {
    crumbs.push({ label: "Settings", href: settingsBaseHref(basePath) });
    crumbs.push({ label: "Billing", href: null });
    return crumbs;
  }
  if (rel.startsWith("/settings/integrations")) {
    crumbs.push({ label: "Settings", href: settingsBaseHref(basePath) });
    crumbs.push({ label: "Integrations", href: null });
    return crumbs;
  }
  if (rel.startsWith("/settings/notifications")) {
    crumbs.push({ label: "Settings", href: settingsBaseHref(basePath) });
    crumbs.push({ label: "Notifications", href: null });
    return crumbs;
  }
  if (rel.startsWith("/settings")) {
    crumbs.push({ label: "Settings", href: null });
    return crumbs;
  }

  const tail = rel.replace(/^\//, "").split("/").filter(Boolean).pop();
  const label = tail
    ? tail.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Page";
  crumbs.push({ label, href: null });
  return crumbs;
}

export function DashboardBreadcrumbNav({
  items,
  className,
}: {
  items: DashboardBreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5 text-[11px] text-muted-foreground sm:text-xs">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {i > 0 ? (
                <ChevronRight className="size-3 shrink-0 text-muted-foreground/50" aria-hidden />
              ) : null}
              {item.href ? (
                <Link
                  href={item.href}
                  className="truncate font-medium text-muted-foreground transition hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn("truncate font-medium", isLast ? "text-foreground" : "text-muted-foreground")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
