"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  getSubscriptionStatus,
  getUsage,
  type SubscriptionStatus,
  type UsageData,
} from "@/lib/api/payments";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  FileDown,
  XCircle,
  Zap,
  Crown,
  Rocket,
  AlertTriangle,
} from "lucide-react";
import { BillingSkeleton } from "@/components/dashboard/skeletons";
import { config } from "@/lib/config";
import { DashboardSettingsNav } from "@/components/settings/dashboard-settings-nav";

const PLAN_ICONS: Record<string, typeof Zap> = {
  starter: Zap,
  pro: Crown,
  business: Rocket,
};

const ENGINE_LABELS: Record<string, string> = {
  gemini: "Gemini",
  google: "Google",
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  claude: "Claude",
};

function UsageBar({
  label,
  used,
  max,
  atLimit,
}: {
  label: string;
  used: number;
  max: number;
  atLimit: boolean;
}) {
  const pct = max > 0 ? Math.min((used / max) * 100, 100) : 0;
  const warn = pct >= 80;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span
          className="font-semibold"
          style={{ color: atLimit ? "#E04D00" : warn ? "#f59e0b" : "inherit" }}
        >
          {used} / {max}
          {atLimit && (
            <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-[#E04D00]">
              <AlertTriangle className="w-3 h-3" /> Limit reached
            </span>
          )}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: atLimit ? "#E04D00" : warn ? "#f59e0b" : "#22c55e",
          }}
        />
      </div>
    </div>
  );
}

export default function BillingSettingsPage() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  const [sub, setSub] = useState<SubscriptionStatus | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;
    Promise.all([
      getSubscriptionStatus(email).catch(() => null),
      getUsage(email).catch(() => null),
    ]).then(([s, u]) => {
      setSub(s);
      setUsage(u);
      setLoading(false);
    });
  }, [email]);

  const PlanIcon = sub ? (PLAN_ICONS[sub.plan] || Zap) : Zap;
  const atAnyLimit = usage?.at_limit.projects || usage?.at_limit.prompts;

  return (
    <div className="px-2 py-2 space-y-6 font-sans">
      <DashboardSettingsNav />
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Billing & Usage</h2>
        <p className="mt-1 text-[13px] font-light leading-relaxed text-accent-foreground">
          Manage your subscription and track what you&apos;ve used.
        </p>
      </div>

      {loading ? (
        <BillingSkeleton />
      ) : (
        <>
          {/* Subscription status */}
          <div className="rounded-sm border border-black/8 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-sm border border-black/8 bg-white shadow-sm ${
                    sub?.is_active ? "text-[#16a34a]" : "text-primary"
                  }`}
                >
                  {sub?.is_active ? (
                    <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
                  ) : (
                    <XCircle className="h-5 w-5" strokeWidth={1.75} />
                  )}
                </div>
                <div>
                  <p className="flex items-center gap-2 text-[14px] font-semibold tracking-tight text-neutral-900">
                    <PlanIcon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    {sub?.is_active
                      ? `${sub.plan_label} Plan — Active`
                      : "No Active Subscription"}
                  </p>
                  <p className="text-[12px] font-light leading-snug text-accent-foreground">
                    {sub?.is_active && sub.current_period_end
                      ? `Renews on ${new Date(sub.current_period_end).toLocaleDateString("en-GB", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}`
                      : "Subscribe to unlock all features"}
                  </p>
                </div>
              </div>
              {sub?.is_active ? (
                <span className="rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-3 py-1.5 text-[11px] font-semibold tracking-tight text-[#16a34a]">
                  Active
                </span>
              ) : (
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-[12px] font-semibold tracking-tight text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  <CreditCard className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Choose a Plan
                </Link>
              )}
            </div>
          </div>

          {/* Usage */}
          {usage && (
            <div className="rounded-sm border border-black/8 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-semibold tracking-tight text-neutral-900">Usage this period</p>
                {atAnyLimit && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold tracking-tight text-[#E04D00]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    At limit — upgrade to continue
                  </span>
                )}
              </div>

              <UsageBar
                label="Projects"
                used={usage.usage.projects}
                max={usage.limits.max_projects}
                atLimit={usage.at_limit.projects}
              />
              <UsageBar
                label="Tracked Prompts"
                used={usage.usage.prompts}
                max={usage.limits.max_prompts}
                atLimit={usage.at_limit.prompts}
              />

              <div className="pt-1">
                <p className="mb-2 text-[12px] font-light leading-snug text-accent-foreground">AI Engines included</p>
                <div className="flex flex-wrap gap-1.5">
                  {["gemini", "google", "chatgpt", "perplexity", "claude"].map((eng) => {
                    const allowed = usage.limits.engines.includes(eng);
                    return (
                      <span
                        key={eng}
                        className="rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-tight"
                        style={{
                          backgroundColor: allowed ? "#22c55e18" : "#00000008",
                          color: allowed ? "#16a34a" : "#00000040",
                          border: `1px solid ${allowed ? "#22c55e30" : "#00000015"}`,
                          textDecoration: allowed ? "none" : "line-through",
                        }}
                      >
                        {ENGINE_LABELS[eng]}
                        {!allowed && " (upgrade)"}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-black/8 pt-3 text-[12px] font-light text-accent-foreground">
                <span>Runs this month: <strong className="font-semibold text-neutral-900">{usage.usage.runs_this_month}</strong></span>
                <span className="capitalize font-semibold text-neutral-900">{sub?.plan_label || "Starter"} plan</span>
              </div>
            </div>
          )}

          {/* Plan features */}
          {sub?.is_active && sub.limits && (
            <div className="rounded-sm border border-black/8 bg-white p-6 shadow-sm">
              <p className="mb-4 text-[14px] font-semibold tracking-tight text-neutral-900">
                What&apos;s included in your plan
              </p>
              <div className="space-y-2.5">
                {[
                  `${sub.limits.max_projects} project${sub.limits.max_projects > 1 ? "s" : ""}`,
                  `Up to ${sub.limits.max_prompts} tracked prompts`,
                  `Engines: ${sub.limits.engines.map((e: string) => ENGINE_LABELS[e] || e).join(", ")}`,
                  ...(sub.limits.features ?? []).filter(
                    (f: string) =>
                      !f.toLowerCase().startsWith("up to") &&
                      !f.toLowerCase().startsWith("1 project") &&
                      !f.toLowerCase().startsWith("3 project") &&
                      !f.toLowerCase().startsWith("4 project") &&
                      !f.toLowerCase().startsWith("engines")
                  ),
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#16a34a]" strokeWidth={2} />
                    <span className="text-[13px] font-light leading-snug text-neutral-900">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoice */}
          {sub?.is_active && sub.invoice_available && email && (
            <div className="rounded-sm border border-black/8 bg-white p-6 shadow-sm">
              <p className="text-[14px] font-semibold tracking-tight text-neutral-900">Invoices</p>
              <p className="mb-4 mt-1 text-[12px] font-light leading-snug text-accent-foreground">
                Download the PDF receipt for your latest successful payment.
              </p>
              <a
                href={`${config.apiBaseUrl}/api/payments/invoice/?email=${encodeURIComponent(email)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-sm border border-black/8 bg-white px-4 py-2.5 text-[12px] font-semibold tracking-tight text-neutral-900 shadow-sm transition hover:bg-neutral-50"
              >
                <FileDown className="h-4 w-4" strokeWidth={1.75} />
                Download latest invoice
              </a>
            </div>
          )}

          {/* Upgrade prompt */}
          {sub?.is_active && sub.plan !== "business" && (
            <div className="flex items-center justify-between rounded-sm border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-black/8 bg-white text-primary shadow-sm">
                  <Rocket className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold tracking-tight text-neutral-900">
                    {atAnyLimit ? "You've hit your plan limit" : "Need more capacity?"}
                  </p>
                  <p className="text-[12px] font-light leading-snug text-accent-foreground">
                    Upgrade for more projects, prompts, and AI engines.
                  </p>
                </div>
              </div>
              <Link
                href="/pricing"
                className="rounded-sm bg-primary px-4 py-2 text-[12px] font-semibold tracking-tight text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Upgrade
              </Link>
            </div>
          )}

          <p className="text-center text-[11px] font-light text-accent-foreground">
            Payments are processed securely by Dodo Payments. Cancel anytime.
          </p>
        </>
      )}
    </div>
  );
}
