"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { createCheckoutSession, getSubscriptionStatus } from "@/lib/api/payments";
import { routes } from "@/lib/config";
import { Loader2, Check, Zap } from "lucide-react";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function PricingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isIndian, setIsIndian] = useState(false);

  useEffect(() => {
    // Detect Indian locale
    const lang = navigator.language || "";
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    setIsIndian(lang.includes("IN") || lang.includes("hi") || tz.includes("Kolkata") || tz.includes("Calcutta"));
  }, []);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace(routes.signIn);
      return;
    }
    // If already subscribed, go to dashboard
    getSubscriptionStatus(session.user.email)
      .then((s) => {
        if (s.is_active) router.replace(routes.dashboard);
      })
      .catch(() => {});
  }, [isPending, session, router]);

  async function handleSubscribe() {
    if (!session || loading) return;
    setLoading(true);
    setError("");
    try {
      const currency = isIndian ? "inr" : "usd";
      const { checkout_url } = await createCheckoutSession(session.user.email, currency);
      window.location.href = checkout_url;
    } catch {
      setError("Failed to start checkout. Please try again.");
      setLoading(false);
    }
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
      </div>
    );
  }

  const price = isIndian ? "₹1,000" : "$12";
  const period = "/month";

  const features = [
    "Unlimited GEO analysis runs",
    "AI-powered auto-fix for your store",
    "Shopify & WordPress integration",
    "Brand visibility tracking across 4 AI engines",
    "Prompt tracking & citation trends",
    "Scheduled re-analysis with email digests",
    "PDF report exports",
    "Score history & trend tracking",
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <BackgroundBeams />
      <div className="relative z-10 w-full max-w-sm md:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Upgrade to Pro</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Your store is connected. Subscribe to unlock the full dashboard.
          </p>
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-5 md:p-8">
          {/* Price */}
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl md:text-5xl font-bold text-white">{price}</span>
              <span className="text-neutral-400">{period}</span>
            </div>
            {/* Currency toggle */}
            <button
              onClick={() => setIsIndian(!isIndian)}
              className="mt-2 text-xs text-neutral-500 hover:text-neutral-300 transition"
            >
              Switch to {isIndian ? "USD ($12/mo)" : "INR (₹1,000/mo)"}
            </button>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-neutral-300">{f}</span>
              </div>
            ))}
          </div>

          {/* Subscribe button */}
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {loading ? "Redirecting to Stripe..." : "Subscribe Now"}
          </button>

          <p className="mt-4 text-center text-[10px] text-neutral-600">
            Secure payment via Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
