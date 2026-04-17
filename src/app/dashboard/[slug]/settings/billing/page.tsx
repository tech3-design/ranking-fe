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
import { SignalorLoader } from "@/components/ui/signalor-loader";
import { config } from "@/lib/config";

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
    <div className="px-6 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Billing & Usage</h2>
        <p className="text-xs mt-1 text-muted-foreground">
          Manage your subscription and track what you&apos;ve used.
        </p>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <SignalorLoader label="Loading billing..." />
        </div>
      ) : (
        <>
          {/* Subscription status */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    sub?.is_active ? "bg-[#22c55e]/10" : "bg-primary/10"
                  }`}
                >
                  {sub?.is_active ? (
                    <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <PlanIcon className="w-4 h-4 text-primary" />
                    {sub?.is_active
                      ? `${sub.plan_label} Plan — Active`
                      : "No Active Subscription"}
                  </p>
                  <p className="text-xs text-muted-foreground">
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
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#22c55e]/10 text-[#22c55e]">
                  Active
                </span>
              ) : (
                <Link
                  href="/pricing"
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white bg-primary transition hover:opacity-90"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Choose a Plan
                </Link>
              )}
            </div>
          </div>

          {/* Usage */}
          {usage && (
            <div className="bg-card rounded-2xl p-6 border border-border space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Usage this period</p>
                {atAnyLimit && (
                  <span className="text-[11px] font-semibold text-[#E04D00] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
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
                <p className="text-xs text-muted-foreground mb-2 font-medium">AI Engines included</p>
                <div className="flex flex-wrap gap-1.5">
                  {["gemini", "google", "chatgpt", "perplexity", "claude"].map((eng) => {
                    const allowed = usage.limits.engines.includes(eng);
                    return (
                      <span
                        key={eng}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
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

              <div className="pt-1 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
                <span>Runs this month: <strong className="text-foreground">{usage.usage.runs_this_month}</strong></span>
                <span className="capitalize text-foreground font-medium">{sub?.plan_label || "Starter"} plan</span>
              </div>
            </div>
          )}

          {/* Plan features */}
          {sub?.is_active && sub.limits && (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <p className="text-sm font-semibold text-foreground mb-4">
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
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#22c55e]" />
                    <span className="text-xs text-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoice */}
          {sub?.is_active && sub.invoice_available && email && (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <p className="text-sm font-semibold text-foreground mb-1">Invoices</p>
              <p className="text-xs text-muted-foreground mb-4">
                Download the PDF receipt for your latest successful payment.
              </p>
              <a
                href={`${config.apiBaseUrl}/api/payments/invoice/?email=${encodeURIComponent(email)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold border border-border bg-background text-foreground transition hover:bg-muted"
              >
                <FileDown className="w-4 h-4" />
                Download latest invoice
              </a>
            </div>
          )}

          {/* Upgrade prompt */}
          {sub?.is_active && sub.plan !== "business" && (
            <div className="bg-card rounded-2xl p-5 border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {atAnyLimit ? "You've hit your plan limit" : "Need more capacity?"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upgrade for more projects, prompts, and AI engines.
                  </p>
                </div>
              </div>
              <Link
                href="/pricing"
                className="rounded-xl px-4 py-2 text-xs font-semibold text-white bg-primary transition hover:opacity-90"
              >
                Upgrade
              </Link>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground text-center">
            Payments are processed securely by Dodo Payments. Cancel anytime.
          </p>
        </>
      )}
    </div>
  );
}
