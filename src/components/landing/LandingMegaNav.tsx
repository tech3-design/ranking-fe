"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  ChevronDown,
  FileText,
  LayoutGrid,
  LineChart,
  LogIn,
  Plug,
  Radar,
  Sparkles,
  Tags,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MegaKey = "solutions" | "features" | "resources";

const CLOSE_MS = 140;

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
        href: "#features",
        title: "Prompt tracking",
        desc: "Monitor prompts and surfaces where your brand should appear.",
        icon: LayoutGrid,
      },
      {
        href: "#features",
        title: "Content signals",
        desc: "Structure, schema, and trust signals tuned for AI answers.",
        icon: Sparkles,
      },
      {
        href: "#features",
        title: "Integrations",
        desc: "Connect analytics and publishing workflows you already use.",
        icon: Plug,
      },
      {
        href: "#features",
        title: "Reporting",
        desc: "Export-ready summaries for stakeholders and agencies.",
        icon: BarChart3,
      },
    ],
  },
  resources: {
    label: "Resources",
    items: [
      {
        href: "#docs",
        title: "Documentation",
        desc: "Product guides, API notes, and implementation checklists.",
        icon: BookOpen,
      },
      {
        href: "#blog",
        title: "Blog",
        desc: "GEO playbooks, research drops, and launch notes.",
        icon: FileText,
      },
      {
        href: "#pricing",
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
          href="#pricing"
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
            className="absolute left-1/2 top-full -mt-1 w-[min(40rem,calc(100vw-1rem))] -translate-x-1/2 pt-2"
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
              <motion.div
                className="grid gap-2 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-1 rounded-sm border border-black/6"
                variants={{
                  show: { transition: { staggerChildren: 0.035, delayChildren: 0.04 } },
                }}
                initial="hidden"
                animate="show"
              >
                {MENUS[open].items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      variants={{
                        hidden: { opacity: 0, y: 6 },
                        show: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={item.href}
                        className="group flex gap-3 rounded-sm border border-transparent p-2 text-left transition-colors hover:bg-neutral-50/80"
                        onClick={() => setOpen(null)}
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
                })}
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
