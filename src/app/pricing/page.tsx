"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  CheckoutSessionError,
  createCheckoutSession,
  getPlanPrices,
  getSubscriptionStatus,
  type DodoMode,
  type DodoPlanPrice,
} from "@/lib/api/payments";
import { POST_CHECKOUT_REDIRECT_KEY, safeInternalReturnPath } from "@/lib/internal-nav";
import { routes } from "@/lib/config";
import { Check, Clock, Crown, Rocket, Zap } from "@/components/icons";
import { useCurrency, formatPrice } from "@/lib/hooks/use-currency";
import { SignalorLoader } from "@/components/ui/signalor-loader";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { ScreenHR } from "@/components/ui/intersection-diamonds";
import { PricingHero } from "@/components/pricing/pricing-hero";
import { PricingStatsSection } from "@/components/pricing/pricing-stats-section";
import { CurrencyToggle } from "@/components/pricing/currency-toggle";
import { PRICING_FAQ_ITEMS } from "@/lib/pricing-marketing-content";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  AUD: "A$",
  CAD: "C$",
  JPY: "¥",
  SGD: "S$",
  AED: "AED ",
  BRL: "R$",
  MXN: "MX$",
  ZAR: "R",
};

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
      "2 projects",
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
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [livePrices, setLivePrices] = useState<Record<string, DodoPlanPrice | null> | null>(null);
  const {
    currency,
    ready: currencyReady,
    country: detectedCountry,
    selectCurrency,
  } = useCurrency();

  useEffect(() => {
    getPlanPrices()
      .then((res) => {
        if (res.source === "dodo") {
          setLivePrices({ starter: res.starter, pro: res.pro, business: res.business });
        }
      })
      .catch(() => {
        /* graceful: keep static fallback */
      });
  }, []);

  useEffect(() => {
    if (isPending || !session) {
      setCurrentPlanId(null);
      return;
    }
    getSubscriptionStatus(session.user.email)
      .then((s) => {
        if (s.is_active) {
          setCurrentPlanId(s.plan);
          // Preserve onboarding/setup flows: if the user landed here with a
          // returnTo, send them onward. Otherwise let them browse pricing.
          if (returnTo) {
            router.replace(returnTo);
          }
        } else {
          setCurrentPlanId(null);
        }
      })
      .catch(() => setCurrentPlanId(null));
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
        const { checkout_url } = await createCheckoutSession(session.user.email, planId, {
          country: detectedCountry ?? undefined,
          currency: currency.code,
        });
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
    [session, loadingPlan, router, returnTo, detectedCountry, currency.code],
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
            Start free, upgrade when your GEO program outgrows the Starter slots — cancel any time.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every Signalor plan includes GEO scoring across six content pillars, citation monitoring
            across ChatGPT, Claude, Gemini, and Perplexity, schema validation, and one-click fix
            recommendations. The Starter plan covers solo brands with two projects and up to
            twenty-five tracked prompts. Pro scales to ten projects and one hundred prompts for
            growing teams. Max removes prompt limits and adds white-label PDF exports for agencies
            managing multiple client brands.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <CurrencyToggle currency={currency} onSelect={selectCurrency} />
          </div>

          <div className="mt-8">
            {error ? (
              <div className="mb-10 max-w-lg mx-auto space-y-2">
                <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive">
                  {error}
                </p>
                {checkoutDodoMode === "test" && (
                  <p className="text-center text-xs leading-relaxed text-muted-foreground px-2">
                    Test mode: in <code className="text-[11px]">ranking-be/.env</code> use{" "}
                    <code className="text-[11px]">DODO_LIVE_MODE=false</code>, a secret key from the
                    Dodo dashboard <strong>Test</strong> tab, and a product id created in Test (live
                    product ids will not work).
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

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {PLANS.map((plan) => {
                const isLoading = loadingPlan === plan.id;
                const isCurrent = currentPlanId === plan.id;

                const live = livePrices?.[plan.id] ?? null;
                let displaySymbol: string;
                let displayCurrencyCode: string | null;
                let priceLabel: string;
                let numericAmount: number;
                let isApprox: boolean;

                if (live) {
                  const userCcy = currencyReady ? currency.code : null;
                  const localized =
                    userCcy && live.prices_by_currency
                      ? live.prices_by_currency[userCcy]
                      : undefined;
                  const useLocal =
                    localized !== undefined && userCcy && userCcy !== live.currency.toUpperCase();
                  const ccy = useLocal ? userCcy! : live.currency.toUpperCase();
                  const amount = useLocal ? localized! : live.amount;
                  numericAmount = amount;
                  displaySymbol = CURRENCY_SYMBOLS[ccy] ?? ccy + " ";
                  displayCurrencyCode = ccy;
                  priceLabel =
                    ccy === "INR" || ccy === "JPY"
                      ? Math.round(amount).toLocaleString()
                      : amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        });
                  isApprox = !!useLocal;
                } else {
                  displaySymbol = currency.symbol;
                  displayCurrencyCode = currency.code;
                  numericAmount = plan.price * currency.rate;
                  priceLabel = currencyReady
                    ? formatPrice(plan.price, currency)
                    : plan.price.toFixed(2);
                  isApprox = currencyReady && currency.code !== "EUR";
                }

                const priceDecimals =
                  displayCurrencyCode === "INR" || displayCurrencyCode === "JPY" ? 0 : 2;

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative flex flex-col rounded-2xl border p-8",
                      isCurrent
                        ? "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 ring-2 ring-emerald-500/50 shadow-[0_12px_40px_-12px_rgba(16,185,129,0.2)]"
                        : plan.popular
                          ? "border-primary/20 bg-gradient-to-br from-primary/5 via-white to-primary/5 ring-2 ring-primary/40 shadow-[0_12px_40px_-12px_rgba(224,74,61,0.2)]"
                          : "border-neutral-200 bg-white",
                    )}
                  >
                    {/* Plan name + badge */}
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-3xl font-semibold tracking-tight text-foreground">
                        {plan.label}
                      </h3>
                      {isCurrent ? (
                        <span className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white">
                          Current Plan
                        </span>
                      ) : plan.popular ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                          Most Popular
                        </span>
                      ) : null}
                    </div>

                    {/* Price */}
                    <div className="mb-1 flex items-baseline gap-0.5">
                      <span className="text-2xl font-semibold text-foreground">
                        {displaySymbol}
                      </span>
                      <NumberFlow
                        value={numericAmount}
                        format={{
                          minimumFractionDigits: priceDecimals,
                          maximumFractionDigits: priceDecimals,
                        }}
                        className={cn(
                          "text-5xl font-bold tabular-nums tracking-tight",
                          live || currencyReady ? "text-foreground" : "text-foreground/40",
                        )}
                      />
                    </div>
                    <p className="mb-6 text-sm text-muted-foreground">
                      /month
                      {live && isApprox
                        ? ` \u00B7 approx. \u2014 billed in ${live.currency.toUpperCase()}`
                        : isApprox && displayCurrencyCode
                          ? ` \u00B7 approx. in ${displayCurrencyCode}`
                          : ""}
                    </p>

                    {/* Description */}
                    <p className="mb-6 text-[13px] font-light leading-relaxed text-muted-foreground">
                      {plan.description}
                    </p>

                    {/* CTA button */}
                    <button
                      type="button"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={!!loadingPlan || isCurrent}
                      className={cn(
                        "mb-6 w-full rounded-xl py-4 text-base font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-70",
                        isCurrent
                          ? "border border-emerald-600 bg-gradient-to-t from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                          : plan.popular
                            ? "border border-primary/50 bg-gradient-to-t from-primary to-primary/80 text-white shadow-lg shadow-primary/30"
                            : "border border-neutral-700 bg-gradient-to-t from-neutral-900 to-neutral-700 text-white shadow-lg shadow-neutral-900/20",
                      )}
                    >
                      {isLoading ? (
                        <SignalorLoader size="sm" />
                      ) : isCurrent ? (
                        "Current Plan"
                      ) : session ? (
                        "Subscribe now"
                      ) : (
                        "Get started"
                      )}
                    </button>

                    {/* Features */}
                    <div className="space-y-2.5 border-t border-neutral-200 pt-5">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-center gap-3">
                          <span
                            className={cn(
                              "grid h-5 w-5 shrink-0 place-content-center rounded-full border bg-white",
                              isCurrent
                                ? "border-emerald-500"
                                : plan.popular
                                  ? "border-primary"
                                  : "border-neutral-400",
                            )}
                          >
                            <Check
                              className={cn(
                                "h-3 w-3",
                                isCurrent
                                  ? "text-emerald-600"
                                  : plan.popular
                                    ? "text-primary"
                                    : "text-neutral-600",
                              )}
                              strokeWidth={2.5}
                              aria-hidden
                            />
                          </span>
                          <span className="text-sm text-foreground/80">{f}</span>
                        </div>
                      ))}

                      {plan.comingSoonFeatures && plan.comingSoonFeatures.length > 0 && (
                        <div className="mt-2 space-y-2.5">
                          {plan.comingSoonFeatures.map((f) => (
                            <div key={f} className="flex items-center gap-3">
                              <span className="grid h-5 w-5 shrink-0 place-content-center rounded-full border border-neutral-200 bg-white">
                                <Clock className="h-3 w-3 text-muted-foreground" aria-hidden />
                              </span>
                              <span className="text-sm text-muted-foreground">{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-10 text-center text-[11px] font-medium text-muted-foreground">
              {currency.code === "EUR"
                ? "All prices in EUR. Secure payment. Cancel anytime."
                : `Prices shown in ${currency.code}, indicative only. Charged in EUR at checkout. Cancel anytime.`}
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
