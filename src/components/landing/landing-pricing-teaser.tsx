"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "@/components/icons";

import { ScreenHR } from "@/components/ui/intersection-diamonds";
import { cn } from "@/lib/utils";
import { useCurrency, formatPrice } from "@/lib/hooks/use-currency";
import { getPlanPrices, type DodoPlanPrice } from "@/lib/api/payments";
import { CurrencyToggle } from "@/components/pricing/currency-toggle";

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

// Plan ids must match the backend keys in /api/payments/plan-prices/.
const TEASER_PLANS = [
  {
    id: "starter",
    label: "Starter",
    price: 19.99,
    tagline: "Solo brands getting started with GEO.",
    features: [
      "2 projects · 25 prompts",
      "Gemini & Google visibility",
      "GEO analysis & scoring",
      "PDF report exports",
    ],
  },
  {
    id: "pro",
    label: "Pro",
    price: 49.99,
    tagline: "Growing teams tracking multiple brands.",
    popular: true,
    features: [
      "3 projects · 75 prompts",
      "ChatGPT, Gemini & Perplexity",
      "Shopify & WordPress integration",
      "Scheduled re-analysis & trends",
    ],
  },
  {
    id: "business",
    label: "Max",
    price: 59.99,
    tagline: "Full power for agencies and operators.",
    features: [
      "6 projects · 200 prompts",
      "All engines, including Claude",
      "Advanced competitor analysis",
      "Priority support",
    ],
  },
];

function formatLiveAmount(amount: number, ccy: string): string {
  if (ccy === "INR" || ccy === "JPY") return Math.round(amount).toLocaleString();
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function localizedPrice(
  live: DodoPlanPrice | null | undefined,
  userCcy: string | null,
): { ccy: string; amount: number; symbol: string; isApprox: boolean } | null {
  if (!live) return null;
  const baseCcy = live.currency.toUpperCase();
  const useLocal =
    !!userCcy && userCcy !== baseCcy && live.prices_by_currency?.[userCcy] !== undefined;
  const ccy = useLocal ? userCcy! : baseCcy;
  const amount = useLocal ? live.prices_by_currency![userCcy!] : live.amount;
  return {
    ccy,
    amount,
    symbol: CURRENCY_SYMBOLS[ccy] ?? `${ccy} `,
    isApprox: useLocal,
  };
}

export function LandingPricingTeaser() {
  const { currency, ready: currencyReady, selectCurrency } = useCurrency();
  const [livePrices, setLivePrices] = useState<Record<string, DodoPlanPrice | null> | null>(null);

  useEffect(() => {
    getPlanPrices()
      .then((res) => {
        if (res.source === "dodo") {
          setLivePrices({ starter: res.starter, pro: res.pro, business: res.business });
        }
      })
      .catch(() => {
        /* graceful: fall back to static EUR-rate display */
      });
  }, []);

  const userCcy = currencyReady ? currency.code : null;
  const starterLive = livePrices?.starter ?? null;
  const starterLocalized = localizedPrice(starterLive, userCcy);

  const starterLabel = starterLocalized
    ? `${starterLocalized.symbol}${formatLiveAmount(starterLocalized.amount, starterLocalized.ccy)}`
    : currencyReady
      ? `${currency.symbol}${formatPrice(19.99, currency)}`
      : "19.99";

  const baseCcy = livePrices
    ? (
        livePrices.starter?.currency ||
        livePrices.pro?.currency ||
        livePrices.business?.currency ||
        "GBP"
      ).toUpperCase()
    : null;

  return (
    <section className="relative bg-background" aria-labelledby="landing-pricing-teaser-heading">
      <ScreenHR />
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-14 lg:px-12 lg:pb-14 lg:pt-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          [ pricing ]
        </p>
        <h2
          id="landing-pricing-teaser-heading"
          className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]"
        >
          Plans from{" "}
          <span className="relative whitespace-nowrap text-primary">
            {starterLabel} / month
            <span
              className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
              aria-hidden
            />
          </span>
        </h2>
        <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
          Cancel anytime. No setup fees, no seats, no surprise usage bills, just one clear monthly
          number
          {baseCcy
            ? userCcy && userCcy !== baseCcy
              ? ` (approx. in ${userCcy}, billed in ${baseCcy})`
              : ` in ${baseCcy}`
            : currency.code !== "EUR"
              ? ` (approx. in ${currency.code})`
              : ""}
          .
        </p>
      </div>

      <ScreenHR />

      <div className="mx-auto max-w-7xl px-6 pt-8 pb-4 lg:px-12">
        <div className="flex items-center gap-3">
          <CurrencyToggle currency={currency} onSelect={selectCurrency} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl bg-black-10">
        <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-3 md:divide-x md:divide-y-0">
          {TEASER_PLANS.map((p) => {
            const live = livePrices?.[p.id] ?? null;
            const localized = localizedPrice(live, userCcy);
            const symbol = localized?.symbol ?? currency.symbol;
            const amountLabel = localized
              ? formatLiveAmount(localized.amount, localized.ccy)
              : currencyReady
                ? formatPrice(p.price, currency)
                : p.price.toFixed(2);

            return (
              <div
                key={p.label}
                className={cn(
                  "relative flex flex-col gap-5 px-6 py-10 md:px-8 md:py-12 lg:px-10",
                  p.popular
                    ? "bg-gradient-to-br from-primary/5 via-white to-primary/10"
                    : "bg-white",
                )}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                    {p.label}
                  </h3>
                  {p.popular ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Most Popular
                    </span>
                  ) : null}
                </div>
                <div className="flex items-start">
                  <span className="mt-1.5 text-base font-semibold text-foreground">{symbol}</span>
                  <span
                    className={cn(
                      "ml-0.5 text-4xl font-bold tabular-nums tracking-tight transition-opacity duration-300",
                      localized || currencyReady
                        ? "text-foreground opacity-100"
                        : "text-foreground opacity-40",
                    )}
                  >
                    {amountLabel}
                  </span>
                  <span className="ml-2 mt-4 text-xs font-medium text-muted-foreground">
                    / month
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{p.tagline}</p>
                <ul className="space-y-2.5">
                  {p.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-[13px] leading-snug text-accent-foreground"
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className="mt-auto inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
                >
                  See full plan
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
