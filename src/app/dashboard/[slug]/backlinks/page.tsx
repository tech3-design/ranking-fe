"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Info, Sparkles, ShoppingBag } from "@/components/icons";
import { cn } from "@/lib/utils";
import { SiteBacklinkOpportunitiesPanel } from "@/components/analyzer/site-backlink-opportunities-panel";
import { SiteBacklinkMarketplacePanel } from "@/components/analyzer/site-backlink-marketplace-panel";

type Tab = "free" | "paid";

export default function BacklinksPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tab, setTab] = useState<Tab>("free");

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Backlinks
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Earn citations on the open web. Free shows submission targets you can
            act on yourself; Paid lists vetted placement marketplaces.
          </p>
        </div>
        <a
          href="https://docs.signalor.ai/backlinks"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View documentation"
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
        >
          <Info className="size-4" />
        </a>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
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
        "flex h-8 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium transition",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
