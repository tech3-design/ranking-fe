"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { getSubscriptionStatus } from "@/lib/api/payments";
import Link from "next/link";
import { CreditCard, CheckCircle2, XCircle } from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";

export default function BillingSettingsPage() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  const [sub, setSub] = useState<{ is_active: boolean; status: string; current_period_end: string | null; currency: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;
    getSubscriptionStatus(email)
      .then(setSub)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [email]);

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Billing</h2>
        <p className="text-xs mt-1 text-muted-foreground">Manage your subscription and payment.</p>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><SignalorLoader label="Loading billing..." /></div>
      ) : (
        <>
          {/* Subscription status */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sub?.is_active ? "bg-[#22c55e]/10" : "bg-primary/10"}`}>
                  {sub?.is_active ? (
                    <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {sub?.is_active ? "Pro Plan — Active" : "No Active Subscription"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sub?.is_active && sub.current_period_end
                      ? `Renews on ${new Date(sub.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
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
                  Upgrade to Pro
                </Link>
              )}
            </div>
          </div>

          {/* Plan details */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <p className="text-sm font-semibold text-foreground mb-4">Plan Details</p>
            <div className="space-y-3">
              {[
                { label: "Plan", value: sub?.is_active ? "Signalor Pro" : "Free" },
                { label: "Status", value: sub?.status || "none" },
                { label: "Currency", value: (sub?.currency || "usd").toUpperCase() },
                { label: "Email", value: email },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                  <span className="text-xs font-medium text-foreground capitalize">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment note */}
          <p className="text-[11px] text-muted-foreground text-center">
            Payments are processed securely via Stripe. Cancel anytime from your Stripe dashboard.
          </p>
        </>
      )}
    </div>
  );
}
