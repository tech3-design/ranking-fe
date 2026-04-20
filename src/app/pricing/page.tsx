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

      <section className="border-t border-border/60 px-6 py-14 lg:px-12">
        <div className="mx-auto max-w-6xl">
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-5">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const isLoading = loadingPlan === plan.id;
              const priceLabel =
                Math.round(plan.price) === plan.price ? `${plan.price}` : plan.price.toFixed(2);

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-shadow",
                    plan.popular
                      ? "border-2 border-[#e04a3d] shadow-md md:scale-[1.02] md:py-7"
                      : "border-border hover:shadow-md",
                  )}
                >
                  {plan.popular ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#e04a3d] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Most popular
                    </div>
                  ) : null}

                  <div className="mb-5">
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-[#e04a3d]/10 px-3 py-1.5 text-xs font-semibold text-[#e04a3d]">
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                      {plan.label}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight text-foreground">
                        {"\u00A3"}
                        {priceLabel}
                      </span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="mt-2 text-xs font-light leading-relaxed text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-5 h-px w-full bg-border" />

                  <div className="mb-6 flex flex-1 flex-col space-y-3">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#e04a3d]/12">
                          <Check className="h-2.5 w-2.5 text-[#e04a3d]" strokeWidth={2.5} aria-hidden />
                        </span>
                        <span className="text-sm leading-snug text-foreground/90">{f}</span>
                      </div>
                    ))}

                    {plan.comingSoonFeatures && plan.comingSoonFeatures.length > 0 ? (
                      <div className="mt-1 border-t border-border pt-4">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Coming soon
                        </p>
                        <div className="space-y-2.5">
                          {plan.comingSoonFeatures.map((f) => (
                            <div key={f} className="flex items-start gap-2.5">
                              <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-muted">
                                <Clock className="h-2.5 w-2.5 text-muted-foreground" aria-hidden />
                              </span>
                              <span className="text-sm leading-snug text-muted-foreground">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <Button
                    type="button"
                    variant={plan.popular ? "default" : "secondary"}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!loadingPlan}
                    className={cn(
                      "h-11 w-full rounded-lg text-sm font-semibold shadow-sm",
                      plan.popular && "text-white",
                      !plan.popular &&
                        "border-0 bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white",
                    )}
                  >
                    {isLoading ? (
                      <SignalorLoader size="sm" />
                    ) : session ? (
                      <>Get {plan.label}</>
                    ) : (
                      <>Sign in to get {plan.label}</>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          <p className="mt-10 text-center text-[11px] font-medium text-muted-foreground">
            All prices in GBP. Secure payment. Cancel anytime.
          </p>
        </div>
      </section>

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
