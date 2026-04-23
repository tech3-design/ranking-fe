"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
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
import { Check, Clock, Crown, Rocket, Zap } from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { ScreenHR } from "@/components/ui/intersection-diamonds";
import { PricingHero } from "@/components/pricing/pricing-hero";
import { PricingStatsSection } from "@/components/pricing/pricing-stats-section";
import { PRICING_FAQ_ITEMS } from "@/lib/pricing-marketing-content";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlanConfig {
  id: string;
  label: string;
  price: number;
  period: string;
  description: string;
  icon: typeof Zap;
  popular?: boolean;
  features: string[];
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

function PricingPageFallback() {
  return (
    <LandingMarketingShell>
      <div className="flex min-h-[50vh] items-center justify-center px-6 py-24">
        <SignalorLoader size="lg" />
      </div>
    </LandingMarketingShell>
  );
}

function PricingPageInner() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeInternalReturnPath(searchParams.get("returnTo"));
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [checkoutDodoMode, setCheckoutDodoMode] = useState<DodoMode | null>(null);

  useEffect(() => {
    if (isPending || !session) return;
    getSubscriptionStatus(session.user.email)
      .then((s) => {
        if (s.is_active) {
          router.replace(returnTo || routes.dashboard);
        }
      })
      .catch(() => {});
  }, [isPending, session, router, returnTo]);

  const handleSubscribe = useCallback(
    async (planId: string) => {
      if (loadingPlan) return;
      if (!session) {
        router.push(`${routes.signIn}?returnTo=${encodeURIComponent("/pricing")}`);
        return;
      }
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
    },
    [session, loadingPlan, router, returnTo],
  );

  if (isPending) {
    return <PricingPageFallback />;
  }

  const showBackLink = !!(returnTo || session);
  const backHref = returnTo || routes.dashboard;
  const backLabel = returnTo ? "Back to setup" : "Back to dashboard";

  return (
    <LandingMarketingShell>
      <PricingHero
        showBackLink={showBackLink}
        backHref={backHref}
        backLabel={backLabel}
        onboardingBanner={returnTo === routes.onboardingCompanyInfo}
      />

      <ScreenHR />
      <section className="relative bg-background px-6 py-14 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
            [ plans ]
          </p>
          <h2 className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]">
            Pick the plan that{" "}
            <span className="relative whitespace-nowrap text-primary">
              matches your team
              <span
                className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
                aria-hidden
              />
            </span>
          </h2>
          <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
            Start free, upgrade when your GEO program outgrows the Starter slots—cancel any time.
          </p>

          <div className="mt-10">
          {error ? (
            <div className="mb-10 max-w-lg mx-auto space-y-2">
              <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive">
                {error}
              </p>
              {checkoutDodoMode === "test" && (
                <p className="text-center text-xs leading-relaxed text-muted-foreground px-2">
                  Test mode: in <code className="text-[11px]">ranking-be/.env</code> use{" "}
                  <code className="text-[11px]">DODO_LIVE_MODE=false</code>, a secret key from the Dodo
                  dashboard <strong>Test</strong> tab, and a product id created in Test (live product ids will
                  not work).
                </p>
              )}
              {checkoutDodoMode === "live" && (
                <p className="text-center text-xs leading-relaxed text-muted-foreground px-2">
                  Live mode: use <code className="text-[11px]">DODO_LIVE_MODE=true</code>, a{" "}
                  <strong>Live</strong> secret key, and a Live product id in{" "}
                  <code className="text-[11px]">DODO_PRODUCT_ID_STARTER</code>.
                </p>
              )}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
            {PLANS.map((plan) => {
              const isLoading = loadingPlan === plan.id;
              const priceLabel =
                Math.round(plan.price) === plan.price ? `${plan.price}` : plan.price.toFixed(2);

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col px-8 py-10 md:px-10 md:py-12 border border-black/6",
                    plan.popular
                      ? "bg-gradient-to-br from-primary/5 via-white to-primary/10 md:z-10 md:-my-2 md:shadow-[0_12px_40px_-12px_rgba(224,74,61,0.25)]"
                      : "bg-neutral-50/50",
                  )}
                >
                  <div className="mb-1 flex items-center gap-2.5">
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">{plan.label}</h3>
                    {plan.popular ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                        Most Popular
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 max-w-[260px] text-[13px] font-light leading-relaxed text-muted-foreground">
                    {plan.description}
                  </p>

                  <div className="mt-8 flex items-start">
                    <span className="mt-2 text-xl font-semibold text-foreground">{"\u00A3"}</span>
                    <span className="ml-0.5 text-5xl font-bold tracking-tight text-foreground tabular-nums">
                      {priceLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Per month</p>

                  <div className="mt-8 flex flex-1 flex-col gap-3">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" strokeWidth={2.25} aria-hidden />
                        <span className="text-[13px] leading-snug text-foreground/90">{f}</span>
                      </div>
                    ))}

                    {plan.comingSoonFeatures && plan.comingSoonFeatures.length > 0 ? (
                      <div className="mt-2 space-y-2.5">
                        {plan.comingSoonFeatures.map((f) => (
                          <div key={f} className="flex items-start gap-2.5">
                            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                            <span className="text-[13px] leading-snug text-muted-foreground">{f}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-10">
                    <Button
                      type="button"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={!!loadingPlan}
                      className={cn(
                        "h-12 w-full rounded-lg text-sm font-semibold shadow-sm",
                        plan.popular
                          ? "bg-primary text-white hover:brightness-110"
                          : "border border-black/10 bg-white text-foreground hover:bg-neutral-50",
                      )}
                    >
                      {isLoading ? (
                        <SignalorLoader size="sm" />
                      ) : session ? (
                        <>Start 7-day free trial</>
                      ) : (
                        <>Start 7-day free trial</>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-10 text-center text-[11px] font-medium text-muted-foreground">
            All prices in GBP. Secure payment. Cancel anytime.
          </p>
          </div>
        </div>
      </section>

      <ScreenHR />
      <PricingStatsSection />

      <LandingFaq
        sectionId="pricing-faq"
        headingId="pricing-faq-heading"
        heading="Pricing FAQs"
        description="Plans, billing, and what happens after you subscribe."
        items={[...PRICING_FAQ_ITEMS]}
      />

      <LandingFooter />
    </LandingMarketingShell>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<PricingPageFallback />}>
      <PricingPageInner />
    </Suspense>
  );
}
