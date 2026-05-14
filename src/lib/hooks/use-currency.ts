"use client";

import { useEffect, useRef, useState } from "react";

export type CurrencyCode = "EUR" | "USD" | "INR";

export type Currency = {
  code: CurrencyCode;
  symbol: string;
  /** Multiply the EUR base price by this to get the display amount. */
  rate: number;
  decimals: number;
  locale: string;
};

const CURRENCIES: Record<CurrencyCode, Currency> = {
  EUR: { code: "EUR", symbol: "€", rate: 1, decimals: 2, locale: "en-DE" },
  USD: { code: "USD", symbol: "$", rate: 1.08, decimals: 2, locale: "en-US" },
  INR: { code: "INR", symbol: "₹", rate: 90.5, decimals: 0, locale: "en-IN" },
};

// Eurozone + broader EU countries — all map to EUR
const EUR_COUNTRIES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "CH",
  "NO",
  "IS",
  "AL",
  "BA",
  "ME",
  "MK",
  "RS",
  "MD",
  "UA",
  "BY",
  "LI",
  "AD",
  "MC",
  "SM",
  "VA",
  "GB",
]);

function detectFromTimezone(): CurrencyCode | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "INR";
    if (tz.startsWith("America/")) return "USD";
  } catch {
    // SSR / unavailable
  }
  return null;
}

/**
 * Detects the user's country via ipapi.co and returns the appropriate
 * currency (INR for India, USD for US, EUR for Europe and everywhere else).
 * Falls back to language hint if the API call fails or times out.
 */
export function useCurrency(): {
  currency: Currency;
  ready: boolean;
  country: string | null;
  selectCurrency: (code: CurrencyCode) => void;
} {
  const [currency, setCurrency] = useState<Currency>(CURRENCIES.EUR);
  const [country, setCountry] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const manualOverride = useRef(false);

  useEffect(() => {
    // Apply timezone hint synchronously on the client before the async fetch.
    // This avoids SSR hydration mismatches while still giving instant detection.
    const tzCode = detectFromTimezone();
    if (tzCode && !manualOverride.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrency(CURRENCIES[tzCode]);

      setReady(true);
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    fetch("https://ipapi.co/json/", { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { country_code?: string }) => {
        if (cancelled || manualOverride.current) return;
        const cc = (data.country_code ?? "").toUpperCase();
        if (cc) setCountry(cc);
        let code: CurrencyCode = "EUR";
        if (cc === "IN") code = "INR";
        else if (cc === "US") code = "USD";
        else if (!EUR_COUNTRIES.has(cc)) code = "EUR"; // default rest of world → EUR
        setCurrency(CURRENCIES[code]);
      })
      .catch(() => {
        /* timezone already set initial value */
      })
      .finally(() => {
        clearTimeout(timeout);
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  function selectCurrency(code: CurrencyCode) {
    manualOverride.current = true;
    setCurrency(CURRENCIES[code]);
  }

  return { currency, ready, country, selectCurrency };
}

/** Format a EUR base price into the display currency. */
export function formatPrice(eurPrice: number, currency: Currency): string {
  const amount = eurPrice * currency.rate;
  if (currency.decimals === 0) {
    return Math.round(amount).toLocaleString(currency.locale);
  }
  return amount.toFixed(currency.decimals);
}
