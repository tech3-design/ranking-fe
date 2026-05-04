"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { RankTrackerPanel, type RankTrackerMode } from "./rank-tracker-panel";

type Tab = RankTrackerMode;

export function RankTrackerShell({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = (searchParams.get("tab") as Tab) === "ai" ? "ai" : "search";
  const [tab, setTab] = useState<Tab>(initial);

  useEffect(() => {
    const qp = (searchParams.get("tab") as Tab) === "ai" ? "ai" : "search";
    if (qp !== tab) setTab(qp);
  }, [searchParams, tab]);

  function switchTab(next: Tab) {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    router.replace(url.pathname + url.search, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-1 border-b border-border">
        <TabButton
          active={tab === "search"}
          onClick={() => switchTab("search")}
          icon={<Search className="h-3.5 w-3.5" />}
          label="Search"
        />
        <TabButton
          active={tab === "ai"}
          onClick={() => switchTab("ai")}
          icon={<Sparkles className="h-3.5 w-3.5" />}
          label="AI Models"
        />
      </div>

      <RankTrackerPanel slug={slug} mode={tab} />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative -mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13px] font-semibold transition-colors",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
      {badge ? (
        <span className="ml-1 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-neutral-500">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
