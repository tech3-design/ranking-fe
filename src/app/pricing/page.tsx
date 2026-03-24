"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { createCheckoutSession, getSubscriptionStatus } from "@/lib/api/payments";
import { routes } from "@/lib/config";
import { Check, Zap, ArrowLeft } from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";
import Link from "next/link";

export default function PricingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isIndian, setIsIndian] = useState(false);

  useEffect(() => {
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
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#F6F4F1" }}>
        <SignalorLoader size="lg" />
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
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "#F6F4F1" }}>
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href={routes.dashboard}
          className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 transition hover:opacity-70"
          style={{ color: "#00000060" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold mb-4"
            style={{ backgroundColor: "#F95C4B15", color: "#F95C4B" }}
          >
            <Zap className="w-3.5 h-3.5" /> PRO
          </div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "#000000" }}>
            Upgrade to Pro
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#00000060" }}>
            Subscribe to unlock the full dashboard.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-6 md:p-8" style={{ border: "1px solid #E4DED2" }}>
          {/* Price */}
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl md:text-6xl font-bold" style={{ color: "#000000" }}>{price}</span>
              <span className="text-base" style={{ color: "#00000050" }}>{period}</span>
            </div>
            <button
              onClick={() => setIsIndian(!isIndian)}
              className="mt-2 text-xs transition hover:opacity-70"
              style={{ color: "#00000040" }}
            >
              Switch to {isIndian ? "USD ($12/mo)" : "INR (₹1,000/mo)"}
            </button>
          </div>

          {/* Divider */}
          <div className="w-full h-px my-5" style={{ backgroundColor: "#E4DED2" }} />

          {/* Features */}
          <div className="space-y-3.5 mb-8">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#F95C4B15" }}
                >
                  <Check className="h-3 w-3" style={{ color: "#F95C4B" }} />
                </div>
                <span className="text-sm" style={{ color: "#000000CC" }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Subscribe button */}
          {error && (
            <p className="mb-3 text-sm rounded-lg px-3 py-2" style={{ color: "#F95C4B", backgroundColor: "#F95C4B10" }}>
              {error}
            </p>
          )}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#F95C4B" }}
          >
            {loading ? (
              <SignalorLoader size="sm" />
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Subscribe Now
              </>
            )}
          </button>

          <p className="mt-4 text-center text-[11px]" style={{ color: "#00000040" }}>
            Secure payment via Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
