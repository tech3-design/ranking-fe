"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { getReferralMe } from "@/lib/api/referrals";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Check, Copy, Gift, Sparkles, AlertCircle } from "@/components/icons";
import { DashboardSettingsNav } from "@/components/settings/dashboard-settings-nav";
import { cn } from "@/lib/utils";

const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://signalor.ai";

export default function ReferralsSettingsPage() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  const [copied, setCopied] = useState(false);

  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["referral-me", email],
    queryFn: () => getReferralMe(email),
    enabled: !!email,
  });

  const shareUrl = useMemo(() => {
    if (!data?.code) return "";
    return `${SITE_BASE}/?ref=${data.code}`;
  }, [data?.code]);

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6 px-2 py-2">
      <DashboardSettingsNav label="Referrals" />

      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Refer & earn</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          Share your referral link. When someone subscribes through it,{" "}
          <strong className="text-foreground">they get 10%</strong> off their first payment and{" "}
          <strong className="text-foreground">you get 20%</strong> off your next billing cycle.
        </p>
      </header>

      {loading && !data ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : error ? (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error instanceof Error ? error.message : "Failed to load referrals"}</span>
        </div>
      ) : data ? (
        <>
          {/* Share card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="mb-3 flex items-center gap-2">
              <Gift className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Your referral link</h3>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="flex-1 overflow-x-auto whitespace-nowrap rounded-md border border-border bg-muted/40 px-3 py-2 text-[13px] text-foreground">
                {shareUrl}
              </code>
              <Button
                type="button"
                variant={copied ? "outline" : "default"}
                size="sm"
                onClick={handleCopy}
                className="shrink-0 gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" /> Copy link
                  </>
                )}
              </Button>
            </div>

            <p className="mt-3 text-[11px] text-muted-foreground">
              Code: <span className="font-mono font-semibold text-foreground">{data.code}</span>
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Total" value={data.stats.total} />
            <StatTile label="Pending" value={data.stats.pending} tone="muted" />
            <StatTile label="Subscribed" value={data.stats.paid} tone="positive" />
            <StatTile label="Discounts earned" value={data.stats.rewards_applied} tone="primary" />
          </div>

          {/* Pending reward */}
          {data.stats.pending_reward ? (
            <div className="flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-[13px] text-primary">
              <Sparkles className="size-4 shrink-0" />
              <span>
                You have <strong>{data.stats.pending_reward.percent_off}% off</strong> staged for
                your next billing cycle.
              </span>
            </div>
          ) : null}

          {/* Referrals list */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Referrals</h3>
            </div>
            {data.referrals.length === 0 ? (
              <div className="px-4 py-10 text-center text-[13px] text-muted-foreground">
                No referrals yet. Share your link to get started.
              </div>
            ) : (
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-border bg-muted/30 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Joined</th>
                    <th className="px-4 py-2">Subscribed</th>
                  </tr>
                </thead>
                <tbody>
                  {data.referrals.map((r) => (
                    <tr key={r.referee_email} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-2.5 font-medium text-foreground">{r.referee_email}</td>
                      <td className="px-4 py-2.5">
                        <StatusPill status={r.status} />
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {r.paid_at ? new Date(r.paid_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "muted" | "positive" | "primary";
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums",
          tone === "positive" && "text-emerald-600",
          tone === "primary" && "text-primary",
          tone === "muted" && "text-muted-foreground",
          tone === "default" && "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function StatusPill({ status }: { status: "pending" | "paid" | "cancelled" }) {
  const styles =
    status === "paid"
      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : status === "cancelled"
        ? "border-destructive/25 bg-destructive/5 text-destructive"
        : "border-border bg-muted/40 text-muted-foreground";
  const label = status === "paid" ? "Subscribed" : status === "cancelled" ? "Cancelled" : "Pending";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        styles,
      )}
    >
      {label}
    </span>
  );
}
