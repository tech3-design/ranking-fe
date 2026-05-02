"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Binary,
  BookOpen,
  Bot,
  Check,
  ChevronDown,
  Eye,
  FileText,
  LayoutGrid,
  LifeBuoy,
  LineChart,
  Link2,
  LogIn,
  Menu,
  Plug,
  Radar,
  Tags,
  Target,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LANDING_PRIMARY_CTA_CLASS } from "@/components/landing/constants";

type MegaKey = "solutions" | "features" | "freeTools" | "resources";

const HOVER_CLOSE_MS = 200;

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
        icon: Eye,
      },
      {
        href: "/recommendations",
        title: "Recommendations",
        desc: "Prioritized fixes ranked by impact on GEO score and citations.",
        icon: Plug,
      },
      {
        href: "/explorer",
        title: "Explorer",
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
        href: "/blog",
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
        className="group flex gap-3 rounded-sm border border-transparent p-2 text-left transition-colors hover:bg-neutral-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1"
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

type ResourceKey = "integ" | "blog" | "pricing" | "login";

const BLOG_POSTS: { title: string; date: string; href: string }[] = [
  {
    title: "The GEO audit checklist",
    date: "Apr 2026",
    href: "/blog/geo-audit-checklist",
  },
  {
    title: "How LLMs pick citations",
    date: "Mar 2026",
    href: "/blog/how-llms-pick-citations",
  },
  {
    title: "Schema AI engines actually read",
    date: "Mar 2026",
    href: "/blog/schema-ai-engines-read",
  },
];

const PRICING_TIERS: {
  name: string;
  price: string;
  note: string;
  highlight?: boolean;
}[] = [
  { name: "Essential", price: "$99", note: "1 site" },
  { name: "Professional", price: "$249", note: "2 sites", highlight: true },
  { name: "Business", price: "$579", note: "5 sites" },
];

const LOGIN_LINKS: { label: string; href: string }[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Workspace settings", href: "/dashboard/settings" },
  { label: "Billing & plan", href: "/dashboard/billing" },
];

// ─── Resources grid ──────────────────────────────────────────────────────────

function ResourcesMegaGrid({ setOpen }: { setOpen: (v: MegaKey | null) => void }) {
  const [integ, blog, pricing, customerLogin] = MENUS.resources.items;
  const [hovered, setHovered] = useState<ResourceKey | null>(null);
  const cellRefs = useRef<(HTMLAnchorElement | null)[]>([null, null, null, null]);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHoverTimer = useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }, []);

  const scheduleActivate = useCallback((key: ResourceKey) => {
    cancelHoverTimer();
    hoverTimer.current = setTimeout(() => setHovered(key), 120);
  }, [cancelHoverTimer]);

  useEffect(() => () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); }, []);

  const cells: { key: ResourceKey; item: MegaMenuItem; pos: string }[] = [
    { key: "integ",   item: integ,         pos: "sm:col-start-1 sm:row-start-1" },
    { key: "blog",    item: blog,          pos: "sm:col-start-2 sm:row-start-1" },
    { key: "pricing", item: pricing,       pos: "sm:col-start-1 sm:row-start-2" },
    { key: "login",   item: customerLogin, pos: "sm:col-start-2 sm:row-start-2" },
  ];

  const navigateCell = useCallback((targetIdx: number) => {
    const clamped = Math.max(0, Math.min(cells.length - 1, targetIdx));
    cellRefs.current[clamped]?.focus();
  }, [cells.length]);

  return (
    <motion.div
      className="grid gap-2 rounded-sm border border-black/6 sm:h-64 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(220px,260px)] sm:grid-rows-2 sm:gap-x-3 sm:gap-y-1 justify-center"
      variants={{ show: { transition: { staggerChildren: 0.035, delayChildren: 0.04 } } }}
      initial="hidden"
      animate="show"
    >
      {cells.map(({ key, item, pos }, index) => (
        <ResourceHoverCell
          key={key}
          item={item}
          className={pos}
          isActive={hovered === key}
          onHover={() => scheduleActivate(key)}
          onActivate={() => setHovered(key)}
          onNavigate={() => setOpen(null)}
          index={index}
          onArrowNav={navigateCell}
          linkRef={(el) => { cellRefs.current[index] = el; }}
        />
      ))}

      <motion.div
        className="min-h-0 self-stretch flex flex-col sm:col-start-3 sm:row-span-2 sm:row-start-1"
        variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onPointerEnter={cancelHoverTimer}
      >
        <ResourcePreviewPanel
          hovered={hovered}
          onNavigate={() => setOpen(null)}
        />
      </motion.div>
    </motion.div>
  );
}

function ResourceHoverCell({
  item,
  className,
  isActive,
  onHover,
  onActivate,
  onNavigate,
  index,
  onArrowNav,
  linkRef,
}: {
  item: MegaMenuItem;
  className?: string;
  isActive: boolean;
  onHover: () => void;
  onActivate: () => void;
  onNavigate: () => void;
  index: number;
  onArrowNav: (idx: number) => void;
  linkRef?: (el: HTMLAnchorElement | null) => void;
}) {
  const Icon = item.icon;
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        ref={linkRef}
        href={item.href}
        className={cn(
          "flex h-full flex-col justify-center rounded-sm border p-2 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1",
          isActive
            ? "border-primary/15 bg-neutral-50"
            : "border-transparent hover:bg-neutral-50/80",
        )}
        onPointerEnter={onHover}
        onFocus={onActivate}
        onClick={onNavigate}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            onArrowNav(index + 1);
          } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            onArrowNav(index - 1);
          }
        }}
      >
        <span className="flex gap-3 text-left">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-black/8 text-primary shadow-sm">
            <Icon className="h-[15px] w-[15px]" strokeWidth={1.75} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-[14px] font-semibold leading-snug tracking-tight text-neutral-900">
              {item.title}
            </span>
            <span className="mt-0.5 block text-xs font-light leading-snug text-accent-foreground">
              {item.desc}
            </span>
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

function ResourcePreviewPanel({
  hovered,
  onNavigate,
}: {
  hovered: ResourceKey | null;
  onNavigate: () => void;
}) {
  const activeKey = hovered ?? "default";
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-sm border border-black/8 bg-neutral-50/80 p-2 shadow-inner">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeKey}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="flex h-full min-h-0 flex-col overflow-hidden"
        >
          {hovered === "integ" ? (
            <IntegrationsPreview onNavigate={onNavigate} />
          ) : hovered === "blog" ? (
            <BlogPreview onNavigate={onNavigate} />
          ) : hovered === "pricing" ? (
            <PricingPreview onNavigate={onNavigate} />
          ) : hovered === "login" ? (
            <LoginPreview onNavigate={onNavigate} />
          ) : (
            <DefaultPreview />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Preview sub-panels ───────────────────────────────────────────────────────

function PreviewHeading({ label }: { label: string }) {
  return (
    <span className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
      {label}
    </span>
  );
}

function IntegrationsPreview({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <PreviewHeading label="Plugins" />
      <ul role="list" className="flex flex-col gap-0.5">
        {INTEGRATION_PLUGINS.map((p) => (
          <li key={p.key}>
            <Link
              href={p.href}
              className="flex flex-col items-center gap-2 rounded-md p-2 text-[13px] font-semibold tracking-tight text-neutral-900 transition-colors hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1"
              onClick={onNavigate}
            >
              <div className="flex w-full items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-black/8 bg-white text-primary shadow-sm">
                  <Image src={p.img} alt={p.label} width={20} height={20} />
                </span>
                {p.label}
              </div>
              <span className="text-xs font-light leading-snug text-accent-foreground">
                {p.desc}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function BlogPreview({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <PreviewHeading label="Latest posts" />
      <ul role="list" className="flex flex-col gap-0.5">
        {BLOG_POSTS.map((post) => (
          <li key={post.href}>
            <Link
              href={post.href}
              className="group flex items-start gap-2 rounded-md p-2 transition-colors hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1"
              onClick={onNavigate}
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-black/8 bg-white text-primary shadow-sm">
                <FileText className="h-3 w-3" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold tracking-tight text-neutral-900">
                  {post.title}
                </span>
                <span className="text-[11px] font-light text-accent-foreground">
                  {post.date}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/blog"
        className="mt-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold tracking-tight text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1"
        onClick={onNavigate}
      >
        Browse all posts
        <ArrowUpRight className="h-3 w-3" strokeWidth={2} aria-hidden />
      </Link>
    </>
  );
}

function PricingPreview({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <PreviewHeading label="Plans" />
      <ul role="list" className="flex flex-col gap-0.5">
        {PRICING_TIERS.map((tier) => (
          <li key={tier.name}>
            <Link
              href="/pricing"
              className={cn(
                "flex items-center justify-between gap-2 rounded-md p-2 transition-colors hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1",
                tier.highlight && "bg-white shadow-sm",
              )}
              onClick={onNavigate}
            >
              <span className="flex min-w-0 flex-col">
                <span className="text-[13px] font-semibold tracking-tight text-neutral-900">
                  {tier.name}
                </span>
                <span className="text-[11px] font-light text-accent-foreground">
                  {tier.note}
                </span>
              </span>
              <span className="text-[13px] font-semibold tracking-tight text-neutral-900">
                {tier.price}
                <span className="ml-0.5 text-[10px] font-light text-accent-foreground">
                  /mo
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/pricing"
        className="mt-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold tracking-tight text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1"
        onClick={onNavigate}
      >
        Compare plans
        <ArrowUpRight className="h-3 w-3" strokeWidth={2} aria-hidden />
      </Link>
    </>
  );
}

function LoginPreview({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <PreviewHeading label="Quick access" />
      <ul role="list" className="flex flex-col gap-0.5">
        {LOGIN_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center gap-2 rounded-md p-2 text-[13px] font-semibold tracking-tight text-neutral-900 transition-colors hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1"
              onClick={onNavigate}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-black/8 bg-white text-primary shadow-sm">
                <Check className="h-3 w-3" strokeWidth={2} aria-hidden />
              </span>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="my-1.5 flex flex-1 flex-col justify-center rounded-md border border-black/6 bg-white p-2.5">
        <p className="text-[11px] font-semibold leading-snug text-neutral-700">Your GEO workspace</p>
        <p className="mt-0.5 text-[11px] font-light leading-snug text-accent-foreground">
          Dashboards, AI visibility reports, and billing all in one place.
        </p>
      </div>
      <Link
        href="/sign-in"
        className="inline-flex items-center justify-center gap-1 rounded-md bg-primary px-2 py-1.5 text-[12px] font-semibold tracking-tight text-primary-foreground shadow-sm transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1"
        onClick={onNavigate}
      >
        <LogIn className="h-3 w-3" strokeWidth={2} aria-hidden />
        Sign in
      </Link>
    </>
  );
}

function DefaultPreview() {
  const hints: { icon: LucideIcon; label: string; hint: string }[] = [
    { icon: BookOpen, label: "Playbooks",   hint: "Step-by-step GEO guides"  },
    { icon: Bell, label: "What's new",  hint: "Latest product updates"   },
    { icon: LifeBuoy, label: "Help center", hint: "Docs and onboarding"      },
  ];
  return (
    <>
      <PreviewHeading label="Resources" />
      <div className="px-1 pb-2">
        <p className="text-[13px] font-semibold leading-snug tracking-tight text-neutral-900">
          Everything about Signalor
        </p>
        <p className="mt-0.5 text-[11px] font-light leading-snug text-accent-foreground">
          Guides, integrations, and product updates for teams shipping GEO.
        </p>
      </div>
      <ul role="list" className="flex flex-col gap-0.5">
        {hints.map(({ icon: Icon, label, hint }) => (
          <li
            key={label}
            className="flex items-start gap-2 rounded-md p-2 text-[12px] font-semibold tracking-tight text-neutral-900"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-black/8 bg-white text-primary shadow-sm">
              <Icon className="h-3 w-3" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-semibold tracking-tight text-neutral-900">
                {label}
              </span>
              <span className="text-[11px] font-light text-accent-foreground">
                {hint}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

// ─── Main nav ─────────────────────────────────────────────────────────────────

export function LandingMegaNav() {
  const [open, setOpen] = useState<MegaKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const uid = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Partial<Record<MegaKey, HTMLButtonElement | null>>>({});
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(null), HOVER_CLOSE_MS);
  }, [cancelClose]);

  // Open immediately on hover — no toggle, just ensures the menu is open
  const openMenu = useCallback((key: MegaKey) => {
    cancelClose();
    setOpen(key);
  }, [cancelClose]);

  const closeMenu = useCallback(() => setOpen(null), []);

  const toggleMenu = useCallback((key: MegaKey) => {
    setOpen((prev) => (prev === key ? null : key));
  }, []);

  useEffect(
    () => () => { if (closeTimer.current) clearTimeout(closeTimer.current); },
    [],
  );

  // Close on click outside the nav container
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  // Close on Tab focus leaving the container
  const handleContainerBlur = useCallback(
    (e: React.FocusEvent) => {
      if (open && !containerRef.current?.contains(e.relatedTarget as Node)) {
        setOpen(null);
      }
    },
    [open],
  );

  // Escape closes whichever menu is open and returns focus to its trigger
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (open) {
        setOpen(null);
        triggerRefs.current[open]?.focus();
      } else if (mobileOpen) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, mobileOpen]);

  return (
    <div className="relative z-20 flex flex-1 items-center justify-end lg:justify-center">
      {/* ── Desktop nav ──────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative hidden flex-1 justify-center lg:flex"
        onMouseLeave={scheduleClose}
        onBlur={handleContainerBlur}
      >
        <nav className="flex items-center gap-0.5 font-sans" aria-label="Primary">
          {(Object.keys(MENUS) as MegaKey[]).map((key) => {
            const isOpen = open === key;
            const triggerId = `${uid}t-${key}`;
            const panelId   = `${uid}p-${key}`;
            return (
              <div key={key} className="relative" onMouseEnter={() => openMenu(key)}>
                <button
                  ref={(el) => { triggerRefs.current[key] = el; }}
                  type="button"
                  id={triggerId}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  aria-controls={isOpen ? panelId : undefined}
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-md px-3 py-2 text-[14px] font-medium tracking-tight transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1",
                    isOpen
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900",
                  )}
                  onClick={() => toggleMenu(key)}
                  onKeyDown={(e) => {
                    // Arrow-down from trigger moves focus into the open panel
                    if (e.key === "ArrowDown" && isOpen) {
                      e.preventDefault();
                      dropdownRef.current
                        ?.querySelector<HTMLElement>("a, button")
                        ?.focus();
                    }
                  }}
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
            className="rounded-md px-3 py-2 text-[14px] font-medium tracking-tight text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1"
          >
            Pricing
          </Link>
        </nav>

        <AnimatePresence>
          {open ? (
            <motion.div
              key={open}
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
            >
              <motion.div
                ref={dropdownRef}
                id={`${uid}p-${open}`}
                role="region"
                aria-label={`${MENUS[open].label} menu`}
                aria-labelledby={`${uid}t-${open}`}
                className="rounded-sm border-2 bg-white p-2 font-sans shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)]"
                initial={{ opacity: 0.92 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.02 }}
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
              >
                {open === "resources" ? (
                  <ResourcesMegaGrid setOpen={setOpen} />
                ) : (
                  <motion.div
                    className="grid gap-2 rounded-sm border border-black/6 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-1"
                    variants={{
                      show: { transition: { staggerChildren: 0.035, delayChildren: 0.04 } },
                    }}
                    initial="hidden"
                    animate="show"
                  >
                    {MENUS[open].items.map((item) => (
                      <MegaMenuLinkCell
                        key={item.title}
                        item={item}
                        onNavigate={closeMenu}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ── Log In / Sign Up ─────────────────────────────────────── */}
      <div className="hidden shrink-0 items-center gap-2 lg:flex">
        <Button asChild variant="link" className="px-4 text-neutral-700 hover:text-neutral-900">
          <Link href="/sign-in">Log In</Link>
        </Button>
        <Button asChild className={cn(LANDING_PRIMARY_CTA_CLASS, "px-4")}>
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>

      {/* ── Mobile hamburger ─────────────────────────────────────── */}
      <div className="lg:hidden">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 border-black/12 bg-white/90"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* ── Mobile slide-down ────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              className="fixed inset-0 z-40 bg-black/25 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-black/10 bg-white p-3 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.22)] lg:hidden"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <nav className="flex flex-col" aria-label="Mobile primary">
                {(Object.keys(MENUS) as MegaKey[]).map((key) => (
                  <details key={key} className="group border-b border-black/8 py-1 last:border-b-0">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50">
                      {MENUS[key].label}
                      <ChevronDown className="h-4 w-4 text-neutral-500 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="flex flex-col gap-1 px-2 pb-2 pt-1">
                      {MENUS[key].items.map((item) => (
                        <Link
                          key={`${key}-${item.title}`}
                          href={item.href}
                          className="rounded-md px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                          onClick={() => setMobileOpen(false)}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </details>
                ))}
                <Link
                  href="/pricing"
                  className="mt-2 rounded-md px-2 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Pricing
                </Link>
              </nav>

              <div className="mt-3 flex flex-col gap-2 border-t border-black/8 pt-3">
                <Button asChild variant="outline" className="w-full justify-center border-black/12 bg-white">
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                    Log In
                  </Link>
                </Button>
                <Button asChild className={cn(LANDING_PRIMARY_CTA_CLASS, "w-full justify-center")}>
                  <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
