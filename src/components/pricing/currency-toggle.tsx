"use client";

import { cn } from "@/lib/utils";
import type { CurrencyCode, Currency } from "@/lib/hooks/use-currency";

const OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "INR", label: "₹ INR" },
  { code: "USD", label: "$ USD" },
  { code: "EUR", label: "€ EUR" },
];

export function CurrencyToggle({
  currency,
  onSelect,
  className,
}: {
  currency: Currency;
  onSelect: (code: CurrencyCode) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-black/10 bg-neutral-100/70 p-0.5",
        className,
      )}
      role="group"
      aria-label="Select display currency"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.code}
          type="button"
          onClick={() => onSelect(opt.code)}
          aria-pressed={currency.code === opt.code}
          className={cn(
            "rounded-full px-3.5 py-1 text-[12px] font-semibold transition-all",
            currency.code === opt.code
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
