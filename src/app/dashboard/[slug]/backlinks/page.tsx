"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Sparkles, ShoppingBag } from "@/components/icons";
import { cn } from "@/lib/utils";
import { SiteBacklinkOpportunitiesPanel } from "@/components/analyzer/site-backlink-opportunities-panel";
import { SiteBacklinkMarketplacePanel } from "@/components/analyzer/site-backlink-marketplace-panel";

type Tab = "free" | "paid";

export default function BacklinksPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tab, setTab] = useState<Tab>("free");

  return (
    <div className="space-y-4">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Backlinks
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          Earn citations on the open web. Free shows submission targets you can act on yourself;
          Paid lists vetted placement marketplaces.
        </p>
      </div>

      <div
        className="flex flex-wrap items-center gap-1 border-b border-border"
        data-tour-card="backlinks-tabs"
      >
        <TabButton
          active={tab === "free"}
          onClick={() => setTab("free")}
          icon={<Sparkles className="size-3.5" />}
          label="Free suggestions"
        />
        <TabButton
          active={tab === "paid"}
          onClick={() => setTab("paid")}
          icon={<ShoppingBag className="size-3.5" />}
          label="Paid marketplace"
        />
      </div>

      {tab === "free" ? (
        <SiteBacklinkOpportunitiesPanel slug={slug} />
      ) : (
        <SiteBacklinkMarketplacePanel slug={slug} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
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
    </button>
  );
}
