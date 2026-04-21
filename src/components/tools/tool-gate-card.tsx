"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { getSubscriptionStatus } from "@/lib/api/payments";
import { routes } from "@/lib/config";
import { cn } from "@/lib/utils";

type GateTheme = "orange" | "blue" | "emerald" | "violet";

const THEME: Record<GateTheme, { border: string; btn: string; eyebrow: string; bg: string }> = {
  orange: {
    border: "border-primary/25",
    btn: "bg-primary",
    eyebrow: "text-primary",
    bg: "bg-gradient-to-br from-primary/5 via-white to-primary/10",
  },
  blue: {
    border: "border-[#2563eb]/25",
    btn: "bg-[#2563eb]",
    eyebrow: "text-[#2563eb]",
    bg: "bg-gradient-to-br from-[#2563eb]/5 via-white to-[#2563eb]/10",
  },
  emerald: {
    border: "border-emerald-700/25",
    btn: "bg-emerald-700",
    eyebrow: "text-emerald-700",
    bg: "bg-gradient-to-br from-emerald-700/5 via-white to-emerald-700/10",
  },
  violet: {
    border: "border-violet-700/25",
    btn: "bg-violet-700",
    eyebrow: "text-violet-700",
    bg: "bg-gradient-to-br from-violet-700/5 via-white to-violet-700/10",
  },
};

export function ToolGateCard({
  theme,
  signedOutMessage,
  upgradeMessage,
  signedInActiveMessage,
  signedInActiveHref = routes.dashboard,
  signedInActiveLabel = "Open dashboard",
}: {
  theme: GateTheme;
  signedOutMessage: string;
  upgradeMessage: string;
  signedInActiveMessage?: string;
  signedInActiveHref?: string;
  signedInActiveLabel?: string;
}) {
  const { data: session, isPending } = useSession();
  const [active, setActive] = useState<boolean | null>(null);
  const t = THEME[theme];

  useEffect(() => {
    if (!session?.user?.email) {
      setActive(null);
      return;
    }
    let alive = true;
    getSubscriptionStatus(session.user.email)
      .then((s) => {
        if (alive) setActive(!!s.is_active);
      })
      .catch(() => {
        if (alive) setActive(false);
      });
    return () => {
      alive = false;
    };
  }, [session?.user?.email]);

  if (isPending) return null;

  if (!session) {
    return (
      <div className={cn("rounded-sm border p-5 shadow-sm", t.border, t.bg)}>
        <div className="flex items-center gap-2">
          <Lock className={cn("h-3.5 w-3.5", t.eyebrow)} />
          <p className={cn("text-[11px] font-semibold uppercase tracking-wide", t.eyebrow)}>
            Unlock the full report
          </p>
        </div>
        <p className="mt-2 text-sm font-semibold text-foreground">{signedOutMessage}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={routes.signUp}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110",
              t.btn,
            )}
          >
            Create a free account
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={routes.signIn}
            className="inline-flex items-center gap-1.5 rounded-sm border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-foreground hover:bg-neutral-50"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (active === false) {
    return (
      <div className={cn("rounded-sm border p-5 shadow-sm", t.border, t.bg)}>
        <div className="flex items-center gap-2">
          <Lock className={cn("h-3.5 w-3.5", t.eyebrow)} />
          <p className={cn("text-[11px] font-semibold uppercase tracking-wide", t.eyebrow)}>
            Upgrade to see the full report
          </p>
        </div>
        <p className="mt-2 text-sm font-semibold text-foreground">{upgradeMessage}</p>
        <div className="mt-3">
          <Link
            href="/pricing"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110",
              t.btn,
            )}
          >
            See plans
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (active === true) {
    return (
      <div className="rounded-sm border border-black/6 bg-neutral-50 p-5">
        <p className="text-sm font-semibold text-foreground">
          {signedInActiveMessage ?? "Run this on your connected projects for site-wide coverage."}
        </p>
        <Link
          href={signedInActiveHref}
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110",
            t.btn,
          )}
        >
          {signedInActiveLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return null;
}
