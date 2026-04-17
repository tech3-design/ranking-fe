"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  ListChecks,
  Eye,
  MessageSquare,
  BarChart3,
  User,
  CreditCard,
  PlugZap,
  Bell,
  Search,
  RefreshCw,
  Download,
  Moon,
  Sun,
  LogOut,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const { theme, setTheme } = useTheme();
  const base = slug ? `/dashboard/${slug}` : "/dashboard";

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const go = useCallback((path: string) => {
    router.push(path);
    onClose();
  }, [router, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative flex items-start justify-center pt-[20vh]">
        <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          <Command label="Command palette" className="flex flex-col">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <Command.Input
                placeholder="Search features, pages, actions..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoFocus
              />
              <kbd className="text-[10px] font-mono text-muted-foreground bg-accent border border-border rounded px-1.5 py-0.5">ESC</kbd>
            </div>

            <Command.List className="max-h-[320px] overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                No results found.
              </Command.Empty>

              {/* Navigation */}
              <Command.Group heading={<span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2">Pages</span>}>
                <PaletteItem icon={LayoutDashboard} label="Overview" desc="Dashboard overview" onSelect={() => go(base)} />
                <PaletteItem icon={ListChecks} label="Recommendations" desc="GEO improvement actions" onSelect={() => go(`${base}/recommendations`)} />
                <PaletteItem icon={Eye} label="Visibility" desc="Brand visibility across AI" onSelect={() => go(`${base}/visibility`)} />
                <PaletteItem icon={MessageSquare} label="Prompts" desc="Quick snapshot & walkthrough" onSelect={() => go(`${base}/prompts`)} />
                <PaletteItem icon={MessageSquare} label="Prompts — Actions" desc="Add, recheck, and do the work" onSelect={() => go(`${base}/prompts/actions`)} />
                <PaletteItem icon={MessageSquare} label="Prompts — Recommendations" desc="Rank prompts better + ideas" onSelect={() => go(`${base}/prompts/recommendations`)} />
                <PaletteItem icon={MessageSquare} label="Prompts — History" desc="Track all engines and results" onSelect={() => go(`${base}/prompts/history`)} />
                <PaletteItem icon={BarChart3} label="Analytics" desc="Google Analytics integration" onSelect={() => go(`${base}/analytics`)} />
              </Command.Group>

              {/* Settings */}
              <Command.Group heading={<span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2">Settings</span>}>
                <PaletteItem icon={User} label="Profile" desc="Account & organizations" onSelect={() => go(`${base}/settings/profile`)} />
                <PaletteItem icon={CreditCard} label="Billing" desc="Subscription & payments" onSelect={() => go(`${base}/settings/billing`)} />
                <PaletteItem icon={PlugZap} label="Integrations" desc="Connect services" onSelect={() => go(`${base}/settings/integrations`)} />
                <PaletteItem icon={Bell} label="Notifications" desc="Alert preferences" onSelect={() => go(`${base}/settings/notifications`)} />
              </Command.Group>

              {/* Actions */}
              <Command.Group heading={<span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2">Actions</span>}>
                <PaletteItem icon={RefreshCw} label="Re-analyze" desc="Run a new analysis" onSelect={() => { onClose(); }} />
                <PaletteItem icon={Download} label="Download PDF" desc="Export analysis report" onSelect={() => { onClose(); }} />
                <PaletteItem
                  icon={theme === "dark" ? Sun : Moon}
                  label={theme === "dark" ? "Light Mode" : "Dark Mode"}
                  desc="Toggle theme"
                  onSelect={() => { setTheme(theme === "dark" ? "light" : "dark"); onClose(); }}
                />
                <PaletteItem icon={Sparkles} label="Upgrade to Pro" desc="Unlock all features" onSelect={() => go("/pricing")} />
              </Command.Group>
            </Command.List>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
              <span>Navigate with <kbd className="font-mono bg-accent border border-border rounded px-1 mx-0.5">↑</kbd><kbd className="font-mono bg-accent border border-border rounded px-1 mx-0.5">↓</kbd></span>
              <span>Select with <kbd className="font-mono bg-accent border border-border rounded px-1 mx-0.5">↵</kbd></span>
            </div>
          </Command>
        </div>
      </div>
    </div>
  );
}

function PaletteItem({ icon: Icon, label, desc, onSelect }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={`${label} ${desc}`}
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors data-[selected=true]:bg-accent text-foreground"
    >
      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-data-[selected=true]:opacity-100" />
    </Command.Item>
  );
}
