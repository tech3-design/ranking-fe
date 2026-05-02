"use client";

import { useEffect, useState } from "react";
import {
  Copy,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import {
  getBrandKit,
  regenerateBrandKit,
  type BrandKit,
} from "@/lib/api/analyzer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BrandKitCardProps {
  slug: string;
}

interface KitField {
  key: string;
  label: string;
  hint?: string;
  value: string;
  multiline?: boolean;
}

function buildFields(kit: BrandKit): KitField[] {
  return [
    { key: "name", label: "Brand name", value: kit.name },
    { key: "url", label: "Website URL", value: kit.url },
    {
      key: "tagline",
      label: "Tagline",
      hint: "Short headline · ~60 chars",
      value: kit.tagline,
    },
    {
      key: "short_description",
      label: "Short description",
      hint: "One sentence · ~100 chars",
      value: kit.short_description,
    },
    {
      key: "long_description",
      label: "Long description",
      hint: "Two sentences · ~300 chars",
      value: kit.long_description,
      multiline: true,
    },
    {
      key: "categories",
      label: "Categories",
      hint: "Comma-separated",
      value: kit.categories.join(", "),
    },
    {
      key: "keywords",
      label: "Keywords / tags",
      hint: "Comma-separated",
      value: kit.keywords.join(", "),
    },
    { key: "location", label: "Location", value: kit.location },
    { key: "contact_email", label: "Contact email", value: kit.contact_email },
  ];
}

export function BrandKitCard({ slug }: BrandKitCardProps) {
  const [kit, setKit] = useState<BrandKit | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getBrandKit(slug)
      .then((res) => {
        if (cancelled) return;
        setKit(res.kit);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as {
          response?: { data?: { detail?: string } };
          message?: string;
        };
        setError(
          e.response?.data?.detail ?? e.message ?? "Failed to load brand kit",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError(null);
    try {
      const res = await regenerateBrandKit(slug);
      setKit(res.kit);
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      setError(
        e.response?.data?.detail ?? e.message ?? "Failed to regenerate kit",
      );
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopy = async (key: string, value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } catch {
      // clipboard refused — silently ignore
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading brand kit…
        </div>
      </div>
    );
  }

  if (error || !kit) {
    return (
      <div className="px-4 py-5">
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>{error ?? "Brand kit unavailable."}</span>
        </div>
      </div>
    );
  }

  const fields = buildFields(kit);

  return (
    <div className="px-4 py-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-left"
        >
          <Briefcase className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-medium text-foreground">
            Brand Submission Kit
          </h4>
          <span className="text-[10px] text-muted-foreground">
            {expanded ? "Hide" : "Show"}
          </span>
        </button>
        {expanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="h-7 gap-1.5 text-xs"
          >
            <RefreshCw
              className={cn("size-3.5", regenerating && "animate-spin")}
            />
            {regenerating ? "Regenerating…" : "Regenerate"}
          </Button>
        )}
      </div>

      {!expanded ? (
        <p className="text-xs text-muted-foreground">
          Click to reveal pre-filled brand fields. Copy each one into the
          submission form on the sites listed below.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {fields.map((f) => (
            <KitFieldRow
              key={f.key}
              field={f}
              isCopied={copiedKey === f.key}
              onCopy={() => handleCopy(f.key, f.value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function KitFieldRow({
  field,
  isCopied,
  onCopy,
}: {
  field: KitField;
  isCopied: boolean;
  onCopy: () => void;
}) {
  const empty = !field.value;
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-background px-3 py-2",
        field.multiline && "sm:col-span-2",
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-medium text-foreground">
            {field.label}
          </span>
          {field.hint && (
            <span className="text-[10px] text-muted-foreground">
              {field.hint}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onCopy}
          disabled={empty}
          className={cn(
            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
            empty
              ? "cursor-not-allowed text-muted-foreground/40"
              : isCopied
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {isCopied ? (
            <>
              <Check className="size-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <p
        className={cn(
          "text-xs",
          field.multiline ? "leading-relaxed" : "truncate",
          empty ? "text-muted-foreground/50" : "text-foreground",
        )}
      >
        {field.value || "—"}
      </p>
    </div>
  );
}
