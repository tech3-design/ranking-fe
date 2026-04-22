"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Info,
  Loader2,
  Play,
  Search,
  ShieldCheck,
  Siren,
  Wrench,
  XCircle,
} from "lucide-react";

import {
  getSchemaWatch,
  startSchemaWatch,
  type SchemaPageSeverity,
  type SchemaWatchPage,
  type SchemaWatchResponse,
  type SchemaWatchSummary,
} from "@/lib/api/analyzer";
import { cn } from "@/lib/utils";

type SeverityFilter = SchemaPageSeverity | "";
type KindFilter = "" | "product" | "article" | "page";

export function SchemaWatchPanel({ slug }: { slug: string }) {
  const [data, setData] = useState<SchemaWatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [severity, setSeverity] = useState<SeverityFilter>("");
  const [kind, setKind] = useState<KindFilter>("");
  const [q, setQ] = useState("");
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aliveRef = useRef(true);

  const watch = data?.watch ?? null;
  const isRunning = watch?.status === "running" || watch?.status === "queued";

  const fetchNow = useCallback(async () => {
    try {
      const res = await getSchemaWatch(slug, {
        severity: severity || undefined,
        kind: kind || undefined,
        q: q || undefined,
        page: 1,
        page_size: 100,
      });
      if (!aliveRef.current) return;
      setData(res);
      setError(null);
    } catch {
      if (!aliveRef.current) return;
      setError("Couldn't load the watch. Retry in a moment.");
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, [slug, severity, kind, q]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    void fetchNow();
  }, [fetchNow]);

  useEffect(() => {
    if (!isRunning) return;
    if (pollRef.current) clearTimeout(pollRef.current);
    pollRef.current = setTimeout(() => {
      void fetchNow();
    }, 2500);
  }, [isRunning, data, fetchNow]);

  async function handleStart() {
    if (starting) return;
    setStarting(true);
    try {
      await startSchemaWatch(slug);
      await fetchNow();
    } catch {
      setError("Couldn't start a schema check. Run a Sitemap audit first if you haven't.");
    } finally {
      setStarting(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading Schema Watchtower…
      </div>
    );
  }

  if (!watch) {
    return <EmptyWatch onStart={handleStart} starting={starting} error={error} />;
  }

  return (
    <div className="flex flex-col gap-5">
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
          {error}
        </div>
      ) : null}

      <HeaderBar watch={watch} isRunning={isRunning} starting={starting} onStart={handleStart} />

      <StatTiles watch={watch} />

      <Toolbar
        q={q}
        onQ={setQ}
        severity={severity}
        onSeverity={setSeverity}
        kind={kind}
        onKind={setKind}
      />

      <PagesList pages={data?.pages ?? []} running={isRunning} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty + header
// ---------------------------------------------------------------------------

function EmptyWatch({
  onStart,
  starting,
  error,
}: {
  onStart: () => void;
  starting: boolean;
  error: string | null;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">Schema Watchtower</h3>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
        Validate Product, Article, and FAQ structured data on every page AI assistants cite.
        We pull targets from your most recent Sitemap audit.
      </p>
      <button
        type="button"
        onClick={onStart}
        disabled={starting}
        className={cn(
          "mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90",
          starting ? "opacity-80" : "",
        )}
      >
        {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        Run schema check
      </button>
      {error ? <p className="mt-3 text-[12px] text-destructive">{error}</p> : null}
    </div>
  );
}

function HeaderBar({
  watch,
  isRunning,
  starting,
  onStart,
}: {
  watch: SchemaWatchSummary;
  isRunning: boolean;
  starting: boolean;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Schema Watchtower
          </p>
          <p className="text-[13px] font-semibold text-foreground">
            Watching {watch.total_urls} URL{watch.total_urls === 1 ? "" : "s"} for structured-data drift
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isRunning ? (
          <div className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Checking… {watch.progress}%
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${watch.progress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onStart}
            disabled={starting}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-[12px] font-semibold text-foreground shadow-sm transition hover:bg-muted/40 disabled:opacity-60"
          >
            {starting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Re-check
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

function StatTiles({ watch }: { watch: SchemaWatchSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatTile
        label="Watching"
        value={watch.total_urls}
        icon={<ShieldCheck className="h-3.5 w-3.5" />}
        accent="bg-primary/10 text-primary"
      />
      <StatTile
        label="Healthy"
        value={watch.healthy_count}
        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
        accent="bg-emerald-100 text-emerald-700"
      />
      <StatTile
        label="Drifted"
        value={watch.warn_count}
        icon={<AlertTriangle className="h-3.5 w-3.5" />}
        accent="bg-amber-100 text-amber-700"
      />
      <StatTile
        label="Broken"
        value={watch.broken_count}
        icon={<Siren className="h-3.5 w-3.5" />}
        accent="bg-red-100 text-red-700"
      />
    </div>
  );
}

function StatTile({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full", accent)}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

function Toolbar({
  q,
  onQ,
  severity,
  onSeverity,
  kind,
  onKind,
}: {
  q: string;
  onQ: (v: string) => void;
  severity: SeverityFilter;
  onSeverity: (v: SeverityFilter) => void;
  kind: KindFilter;
  onKind: (v: KindFilter) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative min-w-[220px] flex-1 md:flex-initial md:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search URLs…"
          value={q}
          onChange={(e) => onQ(e.target.value)}
          className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <select
          value={severity}
          onChange={(e) => onSeverity((e.target.value as SeverityFilter) || "")}
          className="rounded-md border border-border bg-background px-2 py-2 text-[12px] font-medium text-foreground focus:border-primary focus:outline-none"
        >
          <option value="">All severities</option>
          <option value="fail">Broken</option>
          <option value="warn">Drifted</option>
          <option value="ok">Healthy</option>
        </select>
        <select
          value={kind}
          onChange={(e) => onKind((e.target.value as KindFilter) || "")}
          className="rounded-md border border-border bg-background px-2 py-2 text-[12px] font-medium text-foreground focus:border-primary focus:outline-none"
        >
          <option value="">All page kinds</option>
          <option value="product">Product</option>
          <option value="article">Article</option>
          <option value="page">Page</option>
        </select>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pages list
// ---------------------------------------------------------------------------

function PagesList({ pages, running }: { pages: SchemaWatchPage[]; running: boolean }) {
  if (pages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 px-5 py-10 text-center text-[13px] text-muted-foreground">
        {running ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Validating pages — results appear here as each URL finishes.
          </span>
        ) : (
          <>Nothing matches those filters.</>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {pages.map((p) => (
        <PageRow key={p.id} page={p} />
      ))}
    </div>
  );
}

function PageRow({ page }: { page: SchemaWatchPage }) {
  const [open, setOpen] = useState(false);
  const broken = page.severity === "fail";
  const warn = page.severity === "warn";
  const accent = broken
    ? "border-red-200 bg-red-50/30"
    : warn
    ? "border-amber-200 bg-amber-50/30"
    : "border-border bg-card";

  return (
    <div className={cn("rounded-xl border transition", accent)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
      >
        <span className="mt-0.5 text-muted-foreground">
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityPill severity={page.severity} />
            <KindPill kind={page.page_kind} />
            {page.schema_types.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600"
              >
                {t}
              </span>
            ))}
            {page.schema_types.length > 4 ? (
              <span className="text-[10px] text-muted-foreground">+{page.schema_types.length - 4}</span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-[13px] font-semibold text-foreground" title={page.url}>
            {page.path || page.url}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{page.url}</p>
          {page.issues.length ? (
            <p className="mt-1 text-[12px] text-muted-foreground">
              <span className="font-medium text-foreground">{page.issues.length}</span>{" "}
              issue{page.issues.length === 1 ? "" : "s"} · top:{" "}
              {page.issues[0]?.label}
            </p>
          ) : (
            <p className="mt-1 text-[12px] text-emerald-700">All checks passed.</p>
          )}
        </div>
      </button>
      {open ? (
        <div className="border-t border-border/60 px-4 py-3">
          <PageDetails page={page} />
        </div>
      ) : null}
    </div>
  );
}

function PageDetails({ page }: { page: SchemaWatchPage }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
      <div className="md:col-span-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Findings
        </p>
        {page.issues.length === 0 ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> No issues detected.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {page.issues.map((iss, i) => (
              <li key={`${iss.code}-${i}`} className="flex items-start gap-2 text-[12px]">
                <SeverityIcon severity={iss.severity} />
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{iss.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {iss.type} · <code className="font-mono">{iss.code}</code>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="md:col-span-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Fix targets
        </p>
        {page.fix_targets.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {page.fix_targets.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-semibold text-foreground"
              >
                <Wrench className="h-3 w-3" />
                {t}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[12px] text-muted-foreground">None.</p>
        )}
        <a
          href={page.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
        >
          Open page <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bits
// ---------------------------------------------------------------------------

function SeverityPill({ severity }: { severity: SchemaPageSeverity }) {
  const cls =
    severity === "fail"
      ? "bg-red-100 text-red-700"
      : severity === "warn"
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";
  const label = severity === "fail" ? "Broken" : severity === "warn" ? "Drifted" : "Healthy";
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", cls)}>
      {label}
    </span>
  );
}

function KindPill({ kind }: { kind: string }) {
  if (!kind) return null;
  return (
    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {kind}
    </span>
  );
}

function SeverityIcon({ severity }: { severity: SchemaPageSeverity | "info" }) {
  if (severity === "fail") return <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />;
  if (severity === "warn") return <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />;
  if (severity === "info") return <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />;
  return <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />;
}
