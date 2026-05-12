"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Popover as PopoverPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TourMedia = {
  /** Static screenshot/illustration. Ignored when `video` is set. */
  image?: string;
  /** MP4/WebM URL — autoplays muted on loop. */
  video?: string;
  /** Poster shown before the video buffers. Falls back to `image` if absent. */
  videoPoster?: string;
};

export type TourSection =
  | "overview"
  | "visibility"
  | "sitemap"
  | "tasks"
  | "tracker"
  | "competitors"
  | "content"
  | "backlinks";

export type TourStep =
  | ({
      kind: "modal";
      id: string;
      section: TourSection;
      title: string;
      body: React.ReactNode;
      route?: string;
    } & TourMedia)
  | ({
      kind: "spotlight";
      id: string;
      section: TourSection;
      selector: string;
      title: string;
      body: React.ReactNode;
      side?: "top" | "right" | "bottom" | "left";
      align?: "start" | "center" | "end";
      route?: string;
    } & TourMedia);

export function sectionForPathname(
  pathname: string,
  basePath: string,
): TourSection {
  const rel = pathname === basePath ? "/" : pathname.slice(basePath.length) || "/";
  if (rel.startsWith("/visibility")) return "visibility";
  if (rel.startsWith("/sitemap")) return "sitemap";
  if (rel.startsWith("/recommendations")) return "tasks";
  if (rel.startsWith("/prompts")) return "tracker";
  if (rel.startsWith("/competitors")) return "competitors";
  if (rel.startsWith("/optimisation/content")) return "content";
  if (rel.startsWith("/backlinks")) return "backlinks";
  return "overview";
}

type TourContextValue = {
  active: boolean;
  index: number;
  step: TourStep | null;
  total: number;
  start: () => void;
  next: () => void;
  prev: () => void;
  close: () => void;
};

const TourContext = React.createContext<TourContextValue | null>(null);

export function useTour() {
  const ctx = React.useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used inside <TourProvider>");
  return ctx;
}

const sectionKey = (s: TourSection) => `signalor.tour.section.${s}.v1`;

export function TourProvider({
  steps,
  children,
  autoStart = true,
  basePath,
}: {
  steps: TourStep[];
  children: React.ReactNode;
  autoStart?: boolean;
  /** Prefix applied to step.route when navigating (e.g. "/dashboard/abc123"). */
  basePath?: string;
}) {
  const [active, setActive] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const router = useRouter();
  const pathname = usePathname();

  // Detect which section the user is currently in based on pathname.
  const currentSection: TourSection | null = React.useMemo(() => {
    if (!basePath) return null;
    return sectionForPathname(pathname, basePath);
  }, [pathname, basePath]);

  // Steps for the currently visible section only.
  const sectionSteps = React.useMemo(
    () => (currentSection ? steps.filter((s) => s.section === currentSection) : []),
    [steps, currentSection],
  );

  // When user navigates between sections (e.g., clicks a different sidebar
  // item) while a tour is active, end the tour so we don't strand them.
  React.useEffect(() => {
    setActive(false);
    setIndex(0);
  }, [currentSection]);

  // Auto-fire once per section per browser.
  React.useEffect(() => {
    if (!autoStart || typeof window === "undefined") return;
    if (!currentSection || sectionSteps.length === 0) return;
    if (localStorage.getItem(sectionKey(currentSection))) return;
    const t = setTimeout(() => setActive(true), 900);
    return () => clearTimeout(t);
  }, [autoStart, currentSection, sectionSteps.length]);

  // When the active step has a `route`, navigate there before highlighting.
  React.useEffect(() => {
    if (!active) return;
    const step = sectionSteps[index];
    if (!step || !step.route || !basePath) return;
    const target = basePath + step.route;
    if (pathname !== target) {
      router.push(target);
    }
  }, [active, index, sectionSteps, basePath, pathname, router]);

  const markCompleted = React.useCallback(() => {
    if (!currentSection || typeof window === "undefined") return;
    localStorage.setItem(sectionKey(currentSection), new Date().toISOString());
  }, [currentSection]);

  const start = React.useCallback(() => {
    setIndex(0);
    setActive(true);
  }, []);

  const close = React.useCallback(() => {
    setActive(false);
    markCompleted();
  }, [markCompleted]);

  const next = React.useCallback(() => {
    setIndex((i) => {
      if (i + 1 >= sectionSteps.length) {
        setActive(false);
        markCompleted();
        return 0;
      }
      return i + 1;
    });
  }, [sectionSteps.length, markCompleted]);

  const prev = React.useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const value: TourContextValue = React.useMemo(
    () => ({
      active,
      index,
      step: active ? sectionSteps[index] ?? null : null,
      total: sectionSteps.length,
      start,
      next,
      prev,
      close,
    }),
    [active, index, sectionSteps, start, next, prev, close],
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      <TourRenderer />
    </TourContext.Provider>
  );
}

function TourRenderer() {
  const { active, step } = useTour();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {active && step
        ? step.kind === "modal"
          ? <ModalStep key={step.id} step={step} />
          : <SpotlightStep key={step.id} step={step} />
        : null}
    </AnimatePresence>,
    document.body,
  );
}

function ModalStep({ step }: { step: Extract<TourStep, { kind: "modal" }> }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[1000] grid place-items-center bg-black/65 backdrop-blur-sm"
    >
      <TourCard step={step} centered />
    </motion.div>
  );
}

function SpotlightStep({
  step,
}: {
  step: Extract<TourStep, { kind: "spotlight" }>;
}) {
  const [rect, setRect] = React.useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [gaveUp, setGaveUp] = React.useState(false);

  React.useEffect(() => {
    setGaveUp(false);
    setRect(null);

    let raf = 0;
    let cleanup = () => {};
    const PAD = 6;
    const startedAt = Date.now();
    const TIMEOUT_MS = 4000;

    function readRect(el: HTMLElement) {
      const r = el.getBoundingClientRect();
      setRect({
        x: r.left - PAD,
        y: r.top - PAD,
        width: r.width + PAD * 2,
        height: r.height + PAD * 2,
      });
    }

    function tick() {
      const el = document.querySelector<HTMLElement>(step.selector);
      if (!el) {
        if (Date.now() - startedAt > TIMEOUT_MS) {
          setGaveUp(true);
          return;
        }
        raf = window.requestAnimationFrame(tick);
        return;
      }
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      readRect(el);

      const ro = new ResizeObserver(() => readRect(el));
      ro.observe(el);
      const onScroll = () => readRect(el);
      window.addEventListener("resize", onScroll);
      window.addEventListener("scroll", onScroll, true);

      cleanup = () => {
        ro.disconnect();
        window.removeEventListener("resize", onScroll);
        window.removeEventListener("scroll", onScroll, true);
      };
    }

    tick();
    return () => {
      window.cancelAnimationFrame(raf);
      cleanup();
    };
  }, [step.selector]);

  if (gaveUp) {
    // Target missing — fall back to centered modal so the tour keeps moving.
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[1000] grid place-items-center bg-black/65 backdrop-blur-sm"
      >
        <TourCard step={step} centered />
      </motion.div>
    );
  }

  if (!rect) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] bg-black/65"
      />
    );
  }

  return (
    <>
      <SpotlightOverlay rect={rect} />
      <PopoverPrimitive.Root open>
        <PopoverPrimitive.Anchor asChild>
          <div
            style={{
              position: "fixed",
              top: rect.y,
              left: rect.x,
              width: rect.width,
              height: rect.height,
              pointerEvents: "none",
              zIndex: 1001,
            }}
          />
        </PopoverPrimitive.Anchor>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            side={step.side ?? "right"}
            align={step.align ?? "center"}
            sideOffset={18}
            collisionPadding={20}
            className="z-[1002] outline-none"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <TourCard step={step} />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </>
  );
}

function SpotlightOverlay({
  rect,
}: {
  rect: { x: number; y: number; width: number; height: number };
}) {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[999] h-full w-full"
      style={{ pointerEvents: "auto" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask id="signalor-tour-mask">
          <rect width="100%" height="100%" fill="white" />
          <motion.rect
            initial={false}
            animate={{
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
            }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            rx={10}
            ry={10}
            fill="black"
          />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.68)"
        mask="url(#signalor-tour-mask)"
      />
      <motion.rect
        initial={false}
        animate={{
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        rx={10}
        ry={10}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={1.5}
        style={{ pointerEvents: "none" }}
      />
    </motion.svg>
  );
}

function TourMediaPanel({ step }: { step: TourStep }) {
  if (step.video) {
    return (
      <div className="border-b border-border bg-black">
        <video
          key={step.video}
          src={step.video}
          poster={step.videoPoster ?? step.image}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-48 w-full object-cover"
        />
      </div>
    );
  }
  if (step.image) {
    return (
      <div className="border-b border-border bg-muted/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={step.image}
          alt=""
          draggable={false}
          className="h-44 w-full object-cover"
        />
      </div>
    );
  }
  return null;
}

function TourCard({
  step,
  centered = false,
}: {
  step: TourStep;
  centered?: boolean;
}) {
  const { index, total, next, prev, close } = useTour();
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={cn(
        "w-[360px] overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl shadow-black/50 ring-1 ring-white/5",
        centered && "mx-4 w-full max-w-[440px]",
      )}
    >
      <TourMediaPanel step={step} />

      <div className="space-y-2 px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <span className="inline-block size-1.5 rounded-full bg-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Step {index + 1} of {total}
          </span>
        </div>
        <h3 className="text-[15px] font-semibold leading-tight text-foreground">
          {step.title}
        </h3>
        <div className="text-[13px] leading-relaxed text-muted-foreground">
          {step.body}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 px-4 pb-3">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === index ? "w-6 bg-primary" : "w-1.5 bg-border",
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-3 py-2.5">
        <button
          type="button"
          onClick={close}
          className="text-[12px] text-muted-foreground transition hover:text-foreground"
        >
          Skip
        </button>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={prev}
            disabled={isFirst}
            className="h-8 px-3 text-[12px]"
          >
            Back
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={isLast ? close : next}
            className="h-8 px-3 text-[12px]"
          >
            {isLast ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
