"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ScreenHR } from "@/components/ui/intersection-diamonds";
import {
  ArrowRight,
  Check,
  Copy,
  Loader2,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  getCreatorStats,
  type CommissionRow,
  type CreatorStatsResponse,
} from "@/lib/api/partners-program";
import { countryByCode, flagEmoji } from "@/lib/countries";

interface PageParams {
  code: string;
}

function CopyPill({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-black/12 bg-white px-3 py-1.5 text-[12px] font-semibold text-neutral-700 hover:bg-neutral-50"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : label || "Copy"}
    </button>
  );
}

function StatTile({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: "neutral" | "sky" | "amber" | "emerald" | "violet";
}) {
  const toneClass =
    tone === "sky"
      ? "text-sky-700"
      : tone === "amber"
        ? "text-amber-700"
        : tone === "emerald"
          ? "text-emerald-700"
          : tone === "violet"
            ? "text-violet-700"
            : "text-foreground";
  return (
    <div className="rounded-xl border border-black/8 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      <p className={cn("mt-1.5 text-2xl font-semibold tabular-nums", toneClass)}>{value}</p>
      {helper && <p className="mt-0.5 text-[11px] text-neutral-500">{helper}</p>}
    </div>
  );
}

function StatusPill({ bucket }: { bucket: CommissionRow["bucket"] }) {
  const map: Record<
    CommissionRow["bucket"],
    { label: string; classes: string }
  > = {
    pending: {
      label: "Pending",
      classes: "border-amber-200 bg-amber-50 text-amber-700",
    },
    locked: {
      label: "Locked",
      classes: "border-sky-200 bg-sky-50 text-sky-700",
    },
    paid: {
      label: "Paid",
      classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    cancelled: {
      label: "Cancelled",
      classes: "border-neutral-200 bg-neutral-50 text-neutral-500",
    },
  };
  const tone = map[bucket];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        tone.classes,
      )}
    >
      {tone.label}
    </span>
  );
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency || "USD"} ${amount.toFixed(2)}`;
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function NotFoundCard({ code }: { code: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-black/8 bg-white p-8 text-center">
      <h2 className="text-xl font-semibold text-foreground">Code not found</h2>
      <p className="mt-2 text-[13px] text-neutral-600">
        We couldn't find a creator with code{" "}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[12px]">{code}</code>.
        It may have been disabled.
      </p>
      <Link
        href="/creators-program"
        className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-[13px] font-semibold text-background hover:opacity-90"
      >
        Apply to the program
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

export default function CreatorDashboardPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { code } = use(params);
  const [data, setData] = useState<CreatorStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCreatorStats(code)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setNotFound(false);
      })
      .catch((err) => {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) setNotFound(true);
        else setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <LandingMarketingShell>
      <section className="px-6 py-12 sm:py-14 lg:px-12">
        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : notFound || !data ? (
          <NotFoundCard code={code} />
        ) : (
          <DashboardBody data={data} />
        )}
      </section>

      <ScreenHR />
      <LandingFooter />
    </LandingMarketingShell>
  );
}

function DashboardBody({ data }: { data: CreatorStatsResponse }) {
  const country = countryByCode(data.country);
  const lockWindow = data.stats.lock_window_days;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-black/8 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              [ creator dashboard ]
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {data.name || "Creator"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-neutral-600">
              {country && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-base leading-none">{flagEmoji(country.code)}</span>
                  {country.name}
                </span>
              )}
              {data.social_platforms.length > 0 && (
                <>
                  <span className="text-neutral-300">·</span>
                  <span className="truncate">
                    {data.social_platforms.map((s, i) => (
                      <span key={s.platform}>
                        {i > 0 ? " · " : ""}
                        <span className="capitalize">{s.platform}</span>{" "}
                        <span className="text-neutral-500">{s.handle}</span>
                      </span>
                    ))}
                  </span>
                </>
              )}
            </div>
          </div>
          <Link
            href="/creators-program"
            className="text-[12px] font-semibold text-neutral-500 underline-offset-4 hover:underline"
          >
            Apply page →
          </Link>
        </div>

        <div className="mt-5 rounded-xl border border-black/8 bg-neutral-50/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Your share link
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md border border-black/8 bg-white px-3 py-1.5 font-mono text-[12px] text-foreground">
              {data.share_url}
            </code>
            <CopyPill value={data.share_url} label="Copy link" />
            <CopyPill value={data.code} label="Copy code" />
          </div>
          <p className="mt-2 text-[11px] text-neutral-500">
            Visitors get 10% off at checkout; you earn {data.commission_percent}% on every first
            paid subscription.
          </p>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile
          label="Attributions"
          value={String(data.stats.attributions_total)}
          helper={`${data.stats.attributions_active} active`}
          tone="violet"
        />
        <StatTile
          label="Pending"
          value={formatMoney(data.stats.pending.amount, data.recent_commissions[0]?.currency || "USD")}
          helper={`${data.stats.pending.count} in ${lockWindow}-day window`}
          tone="amber"
        />
        <StatTile
          label="Locked"
          value={formatMoney(data.stats.locked.amount, data.recent_commissions[0]?.currency || "USD")}
          helper={`${data.stats.locked.count} payable`}
          tone="sky"
        />
        <StatTile
          label="Paid"
          value={formatMoney(data.stats.paid.amount, data.recent_commissions[0]?.currency || "USD")}
          helper={`${data.stats.paid.count} payouts`}
          tone="emerald"
        />
        <StatTile
          label="Total earned"
          value={formatMoney(
            data.stats.pending.amount + data.stats.locked.amount + data.stats.paid.amount,
            data.recent_commissions[0]?.currency || "USD",
          )}
          helper="all-time"
        />
      </div>

      {/* Recent commissions */}
      <div className="rounded-2xl border border-black/8 bg-white">
        <div className="border-b border-black/6 px-5 py-3.5">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-neutral-500">
            Recent commissions
          </p>
        </div>
        {data.recent_commissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
            <p className="text-sm font-medium text-foreground">No paid signups yet</p>
            <p className="mt-1 max-w-sm text-[12px] text-neutral-500">
              Share your link to start earning. Commissions show up here as soon as someone
              subscribes through it.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-black/6 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  <th className="px-5 py-2.5">Date</th>
                  <th className="px-5 py-2.5">Customer</th>
                  <th className="px-5 py-2.5 text-right">Amount</th>
                  <th className="px-5 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_commissions.map((row, i) => (
                  <tr
                    key={`${row.created_at}-${i}`}
                    className="border-b border-black/6 last:border-0"
                  >
                    <td className="px-5 py-2.5 text-neutral-700">{formatDate(row.created_at)}</td>
                    <td className="px-5 py-2.5 font-mono text-[11px] text-neutral-600">
                      {row.referee_email}
                    </td>
                    <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      {formatMoney(row.commission_amount, row.currency)}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <StatusPill bucket={row.bucket} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-black/8 bg-neutral-50/60 p-5 text-[12px] text-neutral-600">
        <p>
          <strong className="text-foreground">Payouts.</strong> Commissions lock after the{" "}
          {lockWindow}-day refund window. We process payouts monthly to the method you provided at
          signup. To update payout details, re-submit the{" "}
          <Link
            href="/creators-program/apply"
            className="font-semibold text-foreground underline-offset-2 hover:underline"
          >
            apply form
          </Link>{" "}
          with the same email — your code <code className="font-mono">{data.code}</code> stays the
          same.
        </p>
      </div>
    </div>
  );
}
