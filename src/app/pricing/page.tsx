"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { createCheckoutSession, getSubscriptionStatus } from "@/lib/api/payments";
import { routes } from "@/lib/config";
import { Check, Zap, ArrowLeft, Crown, Rocket } from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";
import Link from "next/link";

interface PlanConfig {
  id: string;
  label: string;
  price: number;
  period: string;
  description: string;
  icon: typeof Zap;
  popular?: boolean;
  features: string[];
}

const PLANS: PlanConfig[] = [
  {
    id: "starter",
    label: "Starter",
    price: 20,
    period: "/month",
    description: "Perfect for solo brands getting started with GEO.",
    icon: Zap,
    features: [
      "1 project",
      "Up to 25 prompts",
      "ChatGPT & Perplexity engines",
      "GEO analysis & scoring",
      "Recommendations & verify",
      "PDF report exports",
    ],
  },
  {
    id: "pro",
    label: "Pro",
    price: 50,
    period: "/month",
    description: "For growing teams tracking multiple brands.",
    icon: Crown,
    popular: true,
    features: [
      "3 projects",
      "Up to 75 prompts",
      "ChatGPT, Gemini & Perplexity",
      "Everything in Starter",
      "Scheduled re-analysis",
      "Score history & trends",
      "Brand visibility tracking",
    ],
  },
  {
    id: "business",
    label: "Business",
    price: 60,
    period: "/month",
    description: "Full power for agencies and serious operators.",
    icon: Rocket,
    features: [
      "4 projects",
      "Up to 200 prompts",
      "All AI engines including Claude",
      "Everything in Pro",
      "Priority support",
      "Advanced competitor analysis",
      "Citation trend tracking",
    ],
  },
];

export default function PricingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

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

  async function handleSubscribe(planId: string) {
    if (!session || loadingPlan) return;
    setLoadingPlan(planId);
    setError("");
    try {
      const { checkout_url } = await createCheckoutSession(session.user.email, planId);
      window.location.href = checkout_url;
    } catch {
      setError("Failed to start checkout. Please try again.");
      setLoadingPlan(null);
    }
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#F6F4F1" }}>
        <SignalorLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-12" style={{ backgroundColor: "#F6F4F1" }}>
      <div className="w-full max-w-5xl">
        {/* Back link */}
        <Link
          href={routes.dashboard}
          className="inline-flex items-center gap-1.5 text-xs font-medium mb-8 transition hover:opacity-70"
          style={{ color: "#00000060" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: "#000000" }}>
            Choose your plan
          </h1>
          <p className="mt-3 text-sm" style={{ color: "#00000060" }}>
            All plans include core GEO analysis. Upgrade for more projects, prompts, and AI engines.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="mb-6 text-sm rounded-lg px-4 py-3 text-center max-w-md mx-auto" style={{ color: "#F95C4B", backgroundColor: "#F95C4B10" }}>
            {error}
          </p>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isLoading = loadingPlan === plan.id;

            return (
              <div
                key={plan.id}
                className="relative rounded-2xl bg-white p-6 flex flex-col"
                style={{
                  border: plan.popular ? "2px solid #F95C4B" : "1px solid #E4DED2",
                }}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: "#F95C4B" }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-5">
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold mb-3"
                    style={{ backgroundColor: "#F95C4B15", color: "#F95C4B" }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {plan.label}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold" style={{ color: "#000000" }}>
                      {"\u00A3"}{plan.price}
                    </span>
                    <span className="text-sm" style={{ color: "#00000050" }}>{plan.period}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: "#00000060" }}>
                    {plan.description}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-full h-px mb-5" style={{ backgroundColor: "#E4DED2" }} />

                {/* Features */}
                <div className="space-y-3 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div
                        className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "#F95C4B15", width: 18, height: 18 }}
                      >
                        <Check className="h-2.5 w-2.5" style={{ color: "#F95C4B" }} />
                      </div>
                      <span className="text-sm" style={{ color: "#000000CC" }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Subscribe button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={!!loadingPlan}
                  className="flex w-full items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                  style={{
                    backgroundColor: plan.popular ? "#F95C4B" : "#000000",
                  }}
                >
                  {isLoading ? (
                    <SignalorLoader size="sm" />
                  ) : (
                    <>Get {plan.label}</>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-[11px]" style={{ color: "#00000040" }}>
          All prices in GBP. Secure payment. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
