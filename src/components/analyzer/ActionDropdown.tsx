"use client";

import React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Copy, Ellipsis, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";

type ExternalAction = {
  id: string;
  title: string;
  subtitle: string;
  logoSrc: string;
  url: string;
};

const EXTERNAL_ACTIONS: ExternalAction[] = [
  {
    id: "chatgpt",
    title: "Open in ChatGPT",
    subtitle: "Continue in a new chat",
    logoSrc: "/logos/chatgpt.svg",
    url: "https://chat.openai.com/",
  },
  {
    id: "claude",
    title: "Open in Claude",
    subtitle: "Paste into a new conversation",
    logoSrc: "/logos/claude.svg",
    url: "https://claude.ai/new",
  },
  {
    id: "gemini",
    title: "Open in Gemini",
    subtitle: "Open the Gemini app",
    logoSrc: "/logos/gemini.svg",
    url: "https://gemini.google.com/app",
  },
  {
    id: "perplexity",
    title: "Open in Perplexity",
    subtitle: "Search with your prompt",
    logoSrc: "/logos/perplexity.svg",
    url: "https://www.perplexity.ai/search",
  },
];

function buildUrl(base: string, prompt: string) {
  if (base.includes("chat.openai.com")) {
    return `${base}?q=${encodeURIComponent(prompt)}`;
  }
  if (base.includes("claude.ai")) {
    return `${base}?q=${encodeURIComponent(prompt)}`;
  }
  if (base.includes("gemini.google.com")) {
    return `${base}?prompt=${encodeURIComponent(prompt)}`;
  }
  if (base.includes("perplexity.ai")) {
    return `${base}?q=${encodeURIComponent(prompt)}`;
  }
  return base;
}

export default function ActionsDropdown({ prompt }: { prompt: string }) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 320 });
  const triggerWrapRef = React.useRef<HTMLSpanElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = React.useCallback(() => {
    const trigger = triggerWrapRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(320, Math.max(200, window.innerWidth - 24));
    const gap = 4;
    const menuH = menuRef.current?.offsetHeight ?? 280;
    let top = rect.bottom + gap;
    if (top + menuH > window.innerHeight - 12) {
      top = Math.max(12, rect.top - gap - menuH);
    }
    const left = Math.max(
      12,
      Math.min(rect.right - width, window.innerWidth - width - 12),
    );
    setPos({ top, left, width });
  }, []);

  React.useLayoutEffect(() => {
    if (!open || !mounted) return;
    updatePosition();
    const ro = new ResizeObserver(() => updatePosition());
    if (triggerWrapRef.current) ro.observe(triggerWrapRef.current);
    if (menuRef.current) ro.observe(menuRef.current);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, mounted, updatePosition]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerWrapRef.current?.contains(t) || menuRef.current?.contains(t)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  const openLink = (action: ExternalAction) => {
    window.open(buildUrl(action.url, prompt), "_blank");
    setOpen(false);
  };

  const menu =
    open && mounted ? (
      <div
        ref={menuRef}
        role="menu"
        style={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          width: pos.width,
          zIndex: 300,
        }}
        className="overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/10"
      >
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            void navigator.clipboard.writeText(prompt);
            setOpen(false);
          }}
          className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/70"
        >
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border/80 bg-background">
            <Copy className="size-4 text-muted-foreground" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-sm font-medium text-foreground">
              Copy prompt
            </span>
            <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
              Copy full text to your clipboard
            </span>
          </span>
        </button>

        {EXTERNAL_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            role="menuitem"
            onClick={() => openLink(action)}
            className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/70"
          >
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border/80 bg-background p-1">
              <Image
                src={action.logoSrc}
                alt=""
                width={20}
                height={20}
                unoptimized
                className="size-5 object-contain opacity-90 grayscale contrast-125"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                {action.title}
                <ExternalLink
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                {action.subtitle}
              </span>
            </span>
          </button>
        ))}
      </div>
    ) : null;

  return (
    <>
      <span ref={triggerWrapRef} className="relative z-10 inline-flex shrink-0">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <Ellipsis
            className="size-4 shrink-0 rotate-90 text-muted-foreground"
            aria-hidden
          />
        </Button>
      </span>
      {mounted && menu ? createPortal(menu, document.body) : null}
    </>
  );
}
