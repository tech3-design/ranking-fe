"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  CheckoutSessionError,
  createCheckoutSession,
  getSubscriptionStatus,
  type DodoMode,
} from "@/lib/api/payments";
import {
  POST_CHECKOUT_REDIRECT_KEY,
  safeInternalReturnPath,
} from "@/lib/internal-nav";
import { routes } from "@/lib/config";
import { Check, Clock, Zap, Crown, Rocket, ArrowLeft } from "lucide-react";
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
  /** Shown below live features — not included in checkout yet */
  comingSoonFeatures?: string[];
}

const PLANS: PlanConfig[] = [
  {
    id: "starter",
    label: "Starter",
    price: 19.99,
    period: "/month",
    description: "Perfect for solo brands getting started with GEO.",
    icon: Zap,
    features: [
      "1 project",
      "Up to 25 prompts",
      "Gemini & Google prompt visibility",
      "GEO analysis & scoring",
      "Recommendations & verify",
      "PDF report exports",
    ],
  },
  {
    id: "pro",
    label: "Pro",
    price: 49.99,
    period: "/month",
    description: "For growing teams tracking multiple brands.",
    icon: Crown,
    popular: true,
    features: [
      "3 projects",
      "Up to 75 prompts",
      "ChatGPT, Gemini & Perplexity",
      "Everything in Starter",
      "Shopify & WordPress integration",
      "Scheduled re-analysis",
      "Score history & trends",
      "Brand visibility tracking",
    ],
  },
  {
    id: "business",
    label: "Max",
    price: 59.99,
    period: "/month",
    description: "Full power for agencies and serious operators.",
    icon: Rocket,
    features: [
      "6 projects",
      "Up to 200 prompts",
      "All AI engines including Claude",
      "Everything in Pro",
      "Priority support",
      "Advanced competitor analysis",
      "Citation trend tracking",
    ],
  },
];

function PricingPageInner() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeInternalReturnPath(searchParams.get("returnTo"));
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");
  /** Set when checkout fails so we can show mode-specific setup hints */
  const [checkoutDodoMode, setCheckoutDodoMode] = useState<DodoMode | null>(null);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace(routes.signIn);
      return;
    }
    getSubscriptionStatus(session.user.email)
      .then((s) => {
        if (s.is_active) {
          router.replace(returnTo || routes.dashboard);
        }
      })
      .catch(() => {});
  }, [isPending, session, router, returnTo]);

  async function handleSubscribe(planId: string) {
    if (!session || loadingPlan) return;
    setLoadingPlan(planId);
    setError("");
    setCheckoutDodoMode(null);
    try {
      if (returnTo) {
        try {
          sessionStorage.setItem(POST_CHECKOUT_REDIRECT_KEY, returnTo);
        } catch {
          /* ignore */
        }
      }
      const { checkout_url } = await createCheckoutSession(session.user.email, planId);
      window.location.href = checkout_url;
    } catch (e) {
      if (e instanceof CheckoutSessionError) {
        setError(e.message);
        setCheckoutDodoMode(e.dodoMode ?? null);
      } else {
        setError(e instanceof Error ? e.message : "Failed to start checkout. Please try again.");
        setCheckoutDodoMode(null);
      }
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
          href={returnTo || routes.dashboard}
          className="group inline-flex items-center gap-2 mb-8 text-[12px] font-semibold text-gray-400 hover:text-gray-700 transition-all"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-black/[0.05] group-hover:bg-black/[0.09] transition-colors">
            <ArrowLeft className="w-3 h-3" />
          </span>
          {returnTo ? "Setup" : "Dashboard"}
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: "#000000" }}>
            Choose your plan
          </h1>
          <p className="mt-3 text-sm" style={{ color: "#00000060" }}>
            All plans include core GEO analysis. Upgrade for more projects, prompts, and AI engines.
          </p>
          {returnTo === routes.onboardingCompanyInfo && (
            <p
              className="mt-4 text-sm rounded-lg px-4 py-3 max-w-lg mx-auto"
              style={{ color: "#0A251C", backgroundColor: "#EAF5F0" }}
            >
              You&apos;ve finished setup — subscribe to launch your GEO analysis from the final step.
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 max-w-md mx-auto space-y-2">
            <p
              className="text-sm rounded-lg px-4 py-3 text-center"
              style={{ color: "#E04D00", backgroundColor: "#E04D0010" }}
            >
              {error}
            </p>
            {checkoutDodoMode === "test" && (
              <p className="text-xs leading-relaxed text-center px-2" style={{ color: "#00000070" }}>
                Test mode: in <code className="text-[11px]">ranking-be/.env</code> use{" "}
                <code className="text-[11px]">DODO_LIVE_MODE=false</code>, a secret key from the Dodo
                dashboard <strong>Test</strong> tab, and a product id created in Test (live product ids
                will not work).
              </p>
            )}
            {checkoutDodoMode === "live" && (
              <p className="text-xs leading-relaxed text-center px-2" style={{ color: "#00000070" }}>
                Live mode: use <code className="text-[11px]">DODO_LIVE_MODE=true</code>, a{" "}
                <strong>Live</strong> secret key, and a Live product id in{" "}
                <code className="text-[11px]">DODO_PRODUCT_ID_STARTER</code>.
              </p>
            )}
          </div>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isLoading = loadingPlan === plan.id;
            const priceLabel =
              Math.round(plan.price) === plan.price
                ? `${plan.price}`
                : plan.price.toFixed(2);

            return (
              <div
                key={plan.id}
                className="relative rounded-2xl bg-white p-6 flex flex-col"
                style={{
                  border: plan.popular ? "2px solid #E04D00" : "1px solid #E4DED2",
                }}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: "#E04D00" }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-5">
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold mb-3"
                    style={{ backgroundColor: "#E04D0015", color: "#E04D00" }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {plan.label}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold" style={{ color: "#000000" }}>
                      {"\u00A3"}{priceLabel}
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
                        style={{ backgroundColor: "#E04D0015", width: 18, height: 18 }}
                      >
                        <Check className="h-2.5 w-2.5" style={{ color: "#E04D00" }} />
                      </div>
                      <span className="text-sm" style={{ color: "#000000CC" }}>{f}</span>
                    </div>
                  ))}

                  {plan.comingSoonFeatures && plan.comingSoonFeatures.length > 0 && (
                    <div className="pt-4 mt-1 border-t" style={{ borderColor: "#E4DED2" }}>
                      <p
                        className="text-[10px] font-bold uppercase tracking-wider mb-3"
                        style={{ color: "#00000045" }}
                      >
                        Coming Soon
                      </p>
                      <div className="space-y-2.5">
                        {plan.comingSoonFeatures.map((f) => (
                          <div key={f} className="flex items-start gap-2.5">
                            <div
                              className="mt-0.5 rounded-full flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: "#00000008",
                                width: 18,
                                height: 18,
                              }}
                            >
                              <Clock className="h-2.5 w-2.5" style={{ color: "#00000045" }} />
                            </div>
                            <span className="text-sm leading-snug" style={{ color: "#00000055" }}>
                              {f}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Subscribe button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={!!loadingPlan}
                  className="flex w-full items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                  style={{
                    backgroundColor: plan.popular ? "#E04D00" : "#000000",
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

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ backgroundColor: "#F6F4F1" }}
        >
          <SignalorLoader size="lg" />
        </div>
      }
    >
      <PricingPageInner />
    </Suspense>
  );
}
