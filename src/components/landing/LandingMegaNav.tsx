"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BarChart3,
  Binary,
  BookOpen,
  Bot,
  ChevronDown,
  FileText,
  LayoutGrid,
  LineChart,
  Link2,
  LogIn,
  Plug,
  Radar,
  Sparkles,
  Tags,
  Target,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type MegaKey = "solutions" | "features" | "freeTools" | "resources";

const CLOSE_MS = 140;

const INTEGRATION_PLUGINS: {
  key: string;
  label: string;
  href: string;
  img: string;
  desc: string;
}[] = [
  {
    key: "shopify",
    label: "Shopify",
    href: "/integration/shopify",
    img: "/logos/shopify.svg",
    desc: "Connect Shopify to your Signalor account to automatically sync your products and orders.",
  },
  {
    key: "wordpress",
    label: "WordPress",
    href: "/integration/wordpress",
    img: "/logos/wordpress.svg",
    desc: "Connect WordPress to your Signalor account to automatically sync your posts and pages.",
  },
];

const MENUS: Record<
  MegaKey,
  { label: string; items: { href: string; title: string; desc: string; icon: LucideIcon }[] }
> = {
  solutions: {
    label: "Solutions",
    items: [
      {
        href: "/analyzer",
        title: "GEO audit",
        desc: "Paste a URL and get a full citability and technical GEO readout.",
        icon: Radar,
      },
      {
        href: "#features",
        title: "Visibility score",
        desc: "One number that tracks how AI-ready your site is over time.",
        icon: BarChart3,
      },
      {
        href: "#how-it-works",
        title: "Fix playbook",
        desc: "Prioritized actions your team can ship this week.",
        icon: Target,
      },
      {
        href: "#features",
        title: "Competitive lens",
        desc: "See where rivals earn citations you are missing.",
        icon: LineChart,
      },
    ],
  },
  features: {
    label: "Features",
    items: [
      {
        href: "/prompt-tracking",
        title: "Prompt monitoring",
        desc: "Monitor prompts and surfaces where your brand should appear.",
        icon: LayoutGrid,
      },
      {
        href: "/ai-visibility",
        title: "AI visibility",
        desc: "Score how AI engines see, cite, and recommend your brand.",
        icon: Sparkles,
      },
      {
        href: "/recommendations",
        title: "Recommendations",
        desc: "Prioritized fixes ranked by impact on GEO score and citations.",
        icon: Plug,
      },
      {
        href: "/discovery",
        title: "Discovery",
        desc: "Surface emerging prompts, citations, and competitor gaps.",
        icon: BarChart3,
      },
    ],
  },
  freeTools: {
    label: "Free tools",
    items: [
      {
        href: "/tools/url-analyzer",
        title: "URL analyzer",
        desc: "Score any URL for GEO, citability, schema, and content health.",
        icon: Link2,
      },
      {
        href: "/tools/llms-check",
        title: "LLM checker",
        desc: "See how ChatGPT, Claude, Gemini, and Perplexity talk about your brand.",
        icon: Bot,
      },
      {
        href: "/tools/competitors-analysis",
        title: "Competitors analysis",
        desc: "Rank your share of AI citations against up to 5 competitors.",
        icon: Users,
      },
      {
        href: "/tools/schema-validator",
        title: "Schema validator",
        desc: "Check JSON-LD coverage across Organization, Product, FAQ, and more.",
        icon: Binary,
      },
    ],
  },
  resources: {
    label: "Resources",
    items: [
      {
        href: "/integration",
        title: "Integrations",
        desc: "Connect analytics and publishing workflows you already use.",
        icon: Plug,
      },
      {
        href: "#blog",
        title: "Blog",
        desc: "GEO playbooks, research drops, and launch notes.",
        icon: FileText,
      },
      {
        href: "/pricing",
        title: "Pricing",
        desc: "Plans for teams shipping serious AI visibility programs.",
        icon: Tags,
      },
      {
        href: "/sign-in",
        title: "Customer login",
        desc: "Access dashboards, history, and workspace settings.",
        icon: LogIn,
      },
    ],
  },
};

type MegaMenuItem = (typeof MENUS)[MegaKey]["items"][number];

function MegaMenuLinkCell({
  item,
  onNavigate,
  className,
}: {
  item: MegaMenuItem;
  onNavigate: () => void;
  className?: string;
}) {
  const Icon = item.icon;
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 6 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={item.href}
        className="group flex gap-3 rounded-sm border border-transparent p-2 text-left transition-colors hover:bg-neutral-50/80"
        onClick={onNavigate}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-black/8 text-primary shadow-sm">
          <Icon className="h-[15px] w-[15px]" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="text-[14px] font-semibold leading-snug tracking-tight text-neutral-900">
              {item.title}
            </span>
          </span>
          <span className="block text-xs font-light leading-snug text-accent-foreground">
            {item.desc}
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

function ResourcesMegaGrid({ setOpen }: { setOpen: (v: MegaKey | null) => void }) {
  const [integ, blog, pricing, customerLogin] = MENUS.resources.items;
  const IntIcon = integ.icon;

  const [showPluginLinks, setShowPluginLinks] = useState(false);
  const hideLinksTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enterPluginZone = useCallback(() => {
    if (hideLinksTimer.current) {
      clearTimeout(hideLinksTimer.current);
      hideLinksTimer.current = null;
    }
    setShowPluginLinks(true);
  }, []);

  const leavePluginZone = useCallback(() => {
    if (hideLinksTimer.current) clearTimeout(hideLinksTimer.current);
    hideLinksTimer.current = setTimeout(() => {
      setShowPluginLinks(false);
      hideLinksTimer.current = null;
    }, 140);
  }, []);

  useEffect(
    () => () => {
      if (hideLinksTimer.current) clearTimeout(hideLinksTimer.current);
    },
    [],
  );

  return (
    <motion.div
      className="grid gap-2 rounded-sm border border-black/6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(220px,260px)] sm:grid-rows-2 sm:gap-x-3 sm:gap-y-1 justify-center items-center"
      variants={{
        show: { transition: { staggerChildren: 0.035, delayChildren: 0.04 } },
      }}
      initial="hidden"
      animate="show"
    >
      <motion.div
        className="sm:col-start-1 sm:row-start-1"
        variants={{
          hidden: { opacity: 0, y: 6 },
          show: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="rounded-sm border border-transparent p-2 transition-colors hover:bg-neutral-50/80"
          onPointerEnter={enterPluginZone}
          onPointerLeave={leavePluginZone}
        >
          <Link
            href={integ.href}
            className="group flex gap-3 text-left"
            onClick={() => setOpen(null)}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-black/8 text-primary shadow-sm">
              <IntIcon className="h-[15px] w-[15px]" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-[14px] font-semibold leading-snug tracking-tight text-neutral-900">
                {integ.title}
              </span>
              <span className="mt-0.5 block text-xs font-light leading-snug text-accent-foreground">
                {integ.desc}
              </span>
            </span>
          </Link>
        </div>
      </motion.div>

      <MegaMenuLinkCell
        item={blog}
        onNavigate={() => setOpen(null)}
        className="sm:col-start-2 sm:row-start-1"
      />

      <motion.div
        className="min-h-0 sm:col-start-3 sm:row-span-2 sm:row-start-1"
        variants={{
          hidden: { opacity: 0, y: 6 },
          show: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <IntegrationPluginLinksPanel
          visible={showPluginLinks}
          onNavigate={() => setOpen(null)}
          onPointerEnter={enterPluginZone}
          onPointerLeave={leavePluginZone}
        />
      </motion.div>

      <MegaMenuLinkCell
        item={pricing}
        onNavigate={() => setOpen(null)}
        className="sm:col-start-1 sm:row-start-2"
      />

      <MegaMenuLinkCell
        item={customerLogin}
        onNavigate={() => setOpen(null)}
        className="sm:col-start-2 sm:row-start-2"
      />
    </motion.div>
  );
}

function IntegrationPluginLinksPanel({
  visible,
  onNavigate,
  onPointerEnter,
  onPointerLeave,
}: {
  visible: boolean;
  onNavigate: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) {
  return (
    <div
      className="flex min-h-42 flex-col rounded-sm border border-black/8 bg-neutral-50/80  shadow-inner"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <AnimatePresence>
        {visible ? (
          <motion.ul
            key="plugin-links"
            role="list"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-0.5"
          >
            {INTEGRATION_PLUGINS.map((p) => (
              <li key={p.key}>
                <Link
                  href={p.href}
                  className="rounded-md p-2  text-[13px] font-semibold tracking-tight text-neutral-900 transition-colors hover:bg-white hover:shadow-sm flex flex-col items-center gap-2"
                  onClick={onNavigate}
                >
                  <div className="flex items-center gap-2 w-full">
                  <span className="flex h-6 w-6 bg-white shrink-0 items-center justify-center rounded-sm border border-black/8 text-primary shadow-sm">
          <Image src={p.img} alt={p.label} width={20} height={20} />
        </span>
                  {p.label}
                  </div>
                 
                  <span className="text-xs font-light leading-snug text-accent-foreground">{p.desc}</span>
                </Link>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function LandingMegaNav() {
  const [open, setOpen] = useState<MegaKey | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(null), CLOSE_MS);
  }, [cancelClose]);

  const openMenu = useCallback(
    (key: MegaKey) => {
      cancelClose();
      setOpen(key);
    },
    [cancelClose],
  );

  return (
    <div
      className="relative hidden flex-1 justify-center lg:flex z-20"
      onMouseLeave={scheduleClose}
    >
      <nav
        className="flex items-center gap-0.5 font-sans"
        aria-label="Primary"
      >
        {(Object.keys(MENUS) as MegaKey[]).map((key) => {
          const isOpen = open === key;
          return (
            <div
              key={key}
              className="relative"
              onMouseEnter={() => openMenu(key)}
            >
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-3 py-2 text-[14px] font-medium tracking-tight transition-colors",
                  isOpen
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900",
                )}
                aria-expanded={isOpen}
                aria-haspopup="true"
              >
                {MENUS[key].label}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-neutral-400 transition-transform",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
            </div>
          );
        })}
        <Link
          href="/pricing"
          className="rounded-md px-3 py-2 text-[14px] font-medium tracking-tight text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
        >
          Pricing
        </Link>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            key={open}
            role="presentation"
            className={cn(
              "absolute left-1/2 top-full -mt-1 -translate-x-1/2 pt-2",
              open === "resources"
                ? "w-[min(52rem,calc(100vw-1rem))]"
                : "w-[min(40rem,calc(100vw-1rem))]",
            )}
            style={{ transformOrigin: "50% 0" }}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <motion.div
              className="rounded-sm border-2 bg-white p-2 font-sans shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)]"
              initial={{ opacity: 0.92 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.02 }}
            >
              {open === "resources" ? (
                <ResourcesMegaGrid setOpen={setOpen} />
              ) : (
                <motion.div
                  className="grid gap-2 rounded-sm border border-black/6 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-1"
                  variants={{
                    show: {
                      transition: { staggerChildren: 0.035, delayChildren: 0.04 },
                    },
                  }}
                  initial="hidden"
                  animate="show"
                >
                  {MENUS[open].items.map((item) => (
                    <MegaMenuLinkCell key={item.title} item={item} onNavigate={() => setOpen(null)} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
